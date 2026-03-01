import hashlib
import time
import random


# ── Seed generation ──────────────────────────────────────────────────────────

def generate_seed(password_hash, behavior_vector, timestamp=None):
    if timestamp is None:
        timestamp = str(int(time.time()) // 30)
    else:
        timestamp = str(timestamp)
    seed_input = password_hash + str(behavior_vector) + timestamp
    seed_hash = hashlib.sha256(seed_input.encode()).hexdigest()
    return seed_hash


def hash_to_float(seed_hash, offset=0):
    """
    Convert a slice of the seed hash into a float in (0, 1).
    offset lets us extract different floats from the same hash
    by reading different byte positions.
    """
    start = (offset * 16) % (len(seed_hash) - 16)
    slice_val = seed_hash[start: start + 16]
    integer_value = int(slice_val, 16)
    return (integer_value % 10**12) / 10**12


# ── Fractal functions ────────────────────────────────────────────────────────

def logistic_map(x0, r=3.99, iterations=200):
    """
    Classic chaotic logistic map.
    x_{n+1} = r * x_n * (1 - x_n)
    Output stays in (0, 1) for r <= 4.
    """
    x = x0
    for _ in range(iterations):
        x = r * x * (1 - x)
    return x


def mandelbrot_chaos(x0, iterations=200):
    """
    Mandelbrot-inspired real iteration.
    x_{n+1} = x_n^2 + c  where c is derived from x0.
    Escaping values folded back into (0, 1).
    """
    c = x0 - 0.5
    x = x0
    for _ in range(iterations):
        x = x * x + c
        if abs(x) > 2:
            x = abs(x) % 1.0
    return abs(x) % 1.0


def julia_chaos(x0, iterations=200):
    """
    Julia-set-inspired real iteration.
    Uses fixed constant c = -0.7 + 0.27i projected onto real axis.
    x_{n+1} = x_n^2 + Re(c) + Im(c) * sin(x_n)
    """
    import math
    c_real = -0.7
    c_imag =  0.27
    x = x0
    for _ in range(iterations):
        x = x * x + c_real + c_imag * math.sin(x)
        if abs(x) > 2:
            x = abs(x) % 1.0
    return abs(x) % 1.0


# ── Fractal registry ─────────────────────────────────────────────────────────

FRACTALS      = [logistic_map, mandelbrot_chaos, julia_chaos]
FRACTAL_NAMES = ["logistic", "mandelbrot", "julia"]


# ── Order generation ─────────────────────────────────────────────────────────

def generate_random_order() -> list[int]:
    """
    Generate a truly random permutation of [0, 1, 2] using
    Python's cryptographically seeded random module.
    Returns something like [2, 0, 1] meaning julia → logistic → mandelbrot.
    This is called once at login time and stored server-side only.
    """
    order = [0, 1, 2]
    random.shuffle(order)
    return order


# ── Fractal pipeline ─────────────────────────────────────────────────────────

def apply_fractal_pipeline(x0: float, order: list[int]) -> float:
    """
    Chain all three fractals in the given order.
    Output of each fractal becomes the input of the next.
    Returns the final chaotic float in (0, 1).

    order is always explicitly passed in — never derived internally —
    so the same order can be used for both generation and verification.
    """
    x = x0
    for fractal_index in order:
        x = FRACTALS[fractal_index](x)
    return x


# ── OTP generation ───────────────────────────────────────────────────────────

def generate_fractal_otp(
    password_hash: str,
    behavior_vector: list,
    order: list[int],
    timestamp=None
) -> str:
    """
    Full pipeline:
      1. Generate seed from password_hash + behavior_vector + time window
      2. Convert seed to float x0
      3. Apply fractal pipeline in the given order (passed in, not derived)
      4. Convert final chaotic value to a stable 6-digit OTP

    order must be passed explicitly — it is generated randomly at login
    and stored server-side so verification can reuse the exact same order.
    """
    seed_hash = generate_seed(password_hash, behavior_vector, timestamp)
    x0 = hash_to_float(seed_hash, offset=0)
    chaotic_value = apply_fractal_pipeline(x0, order)
    otp_int = int(chaotic_value * 1_000_000) % 1_000_000
    return f"{otp_int:06d}"


# ── OTP verification ─────────────────────────────────────────────────────────

def verify_otp_value(
    password_hash: str,
    behavior_vector: list,
    order: list[int],
    submitted_otp: str
) -> bool:
    """
    Verify the submitted OTP against the current and previous
    30-second windows using the stored fractal order.
    Returns True if either window matches, False otherwise.
    """
    current_window = int(time.time()) // 30
    for window in [current_window, current_window - 1]:
        expected_otp = generate_fractal_otp(
            password_hash, behavior_vector, order, timestamp=window
        )
        if submitted_otp == expected_otp:
            return True
    return False
