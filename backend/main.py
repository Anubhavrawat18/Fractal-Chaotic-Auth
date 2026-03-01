import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

from database import create_tables, get_connection
from behavior_model import store_initial_behavior, verify_behavior, update_behavior
from fractal_engine import generate_fractal_otp, verify_otp_value, generate_random_order
from mailer import send_otp_email

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ── Server-side OTP session store ────────────────────────────────────────────
# Stores the random fractal order used for each pending OTP verification.
# Structure: { user_id: { "order": [int, int, int], "expires_at": float } }
# Never exposed to the client — deleted immediately after verification.
# For production, replace with Redis.

otp_sessions: dict = {}

OTP_SESSION_TTL = 90  # seconds — enough for two 30-second windows


def store_otp_session(user_id: int, order: list):
    otp_sessions[user_id] = {
        "order":      order,
        "expires_at": time.time() + OTP_SESSION_TTL,
    }


def get_otp_session(user_id: int):
    session = otp_sessions.get(user_id)
    if not session:
        return None
    if time.time() > session["expires_at"]:
        del otp_sessions[user_id]
        return None
    return session["order"]


def delete_otp_session(user_id: int):
    otp_sessions.pop(user_id, None)


# ── Request models ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    behavior_vector: list[float]


class LoginRequest(BaseModel):
    username: str
    password: str
    behavior_vector: list[float]


class OTPRequest(BaseModel):
    user_id: int
    otp: str
    behavior_vector: list[float]
    # fractal_order is NOT here — it lives server-side only


# ── Utility functions ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Fractal Authentication Backend Running"}


@app.post("/register")
def register(data: RegisterRequest):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE username = ?", (data.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        cursor.execute("SELECT * FROM users WHERE email = ?", (data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = hash_password(data.password)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (data.username, data.email, hashed_pw)
        )
        conn.commit()
        user_id = cursor.lastrowid
        store_initial_behavior(user_id, data.behavior_vector)
        return {"message": "User registered successfully"}
    finally:
        conn.close()


@app.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (data.username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.password, user["password_hash"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid password")

    if not verify_behavior(user["id"], data.behavior_vector):
        conn.close()
        raise HTTPException(status_code=403, detail="Behavior mismatch")

    conn.close()

    # Generate a truly random fractal order for this login session
    order = generate_random_order()

    # Store it server-side — never sent to the client
    store_otp_session(user["id"], order)

    # Generate OTP using the random order
    otp = generate_fractal_otp(user["password_hash"], data.behavior_vector, order)

    # Send OTP to registered email
    try:
        send_otp_email(
            to_email=user["email"],
            username=user["username"],
            otp=otp
        )
    except Exception as e:
        delete_otp_session(user["id"])
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")

    return {
        "message": "OTP sent to your registered email",
        "user_id": user["id"],
        # fractal order intentionally NOT returned here
    }


@app.post("/verify-otp")
def verify_otp(data: OTPRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (data.user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Retrieve the stored fractal order for this pending OTP session
    order = get_otp_session(data.user_id)
    if not order:
        raise HTTPException(
            status_code=400,
            detail="OTP session expired or not found. Please login again."
        )

    # Verify using the stored order
    if not verify_otp_value(user["password_hash"], data.behavior_vector, order, data.otp):
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Delete session immediately — one-time use only
    delete_otp_session(data.user_id)

    update_behavior(data.user_id, data.behavior_vector)
    return {"message": "Multi-Level Authentication Successful"}
