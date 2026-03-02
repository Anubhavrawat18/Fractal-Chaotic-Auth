import hashlib
import time
import random
import math


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
    Convert a slice of the seed hash into a float strictly inside (0.05, 0.95).
    We keep away from 0 and 1 because the logistic map degenerates at those
    boundaries — x=0 and x=1 are both fixed points for any r.
    """
    start = (offset * 16) % (len(seed_hash) - 16)
    slice_val = seed_hash[start: start + 16]
    integer_value = int(slice_val, 16)
    raw = (integer_value % 10**12) / 10**12
    # Clamp to (0.05, 0.95) to stay in the fully chaotic regime
    return 0.05 + raw * 0.90


# ── Fractal functions ────────────────────────────────────────────────────────

def logistic_map(x0, r=3.99, iterations=200):
    """
    Classic chaotic logistic map.
    x_{n+1} = r * x_n * (1 - x_n)
    Fully chaotic for r = 3.99. Output stays in (0, 1).
    We burn in 50 iterations to discard transient behaviour.
    """
    x = x0
    for _ in range(50):
        x = r * x * (1 - x)
    for _ in range(150):
        x = r * x * (1 - x)
    return x


def mandelbrot_chaos(x0, iterations=200):
    """
    Bounded Mandelbrot-inspired iteration using sin(x^2 + c).
    sin() keeps the output naturally bounded in [-1, 1].
    c is derived from x0 to ensure different inputs diverge.
    Output mapped to (0, 1).
    """
    c = (x0 * 4.0) - 2.0   # map (0,1) to (-2, 2) — Mandelbrot-relevant range
    x = x0 * 2.0 - 1.0      # map (0,1) to (-1, 1) as starting point
    for _ in range(iterations):
        x = math.sin(x * x + c)
    return (x + 1.0) / 2.0


def julia_chaos(x0, iterations=200):
    """
    Bounded Julia-inspired iteration.
    x_{n+1} = sin(c_real * x) * cos(c_imag * x) + c_real * sin(x)
    Naturally bounded by sin/cos. c = -0.7 + 0.27i (classic Julia constant).
    Output mapped to (0, 1).
    """
    c_real = -0.7
    c_imag =  0.27
    x = x0 * 2.0 - 1.0
    for _ in range(iterations):
        x = math.sin(c_real * x) * math.cos(c_imag * x) + c_real * math.sin(x)
    return (x + 1.0) / 2.0


# ── Fractal registry ─────────────────────────────────────────────────────────

FRACTALS      = [logistic_map, mandelbrot_chaos, julia_chaos]
FRACTAL_NAMES = ["logistic", "mandelbrot", "julia"]


# ── Random order generation ──────────────────────────────────────────────────

def generate_random_order() -> list:
    """
    Generate a truly random permutation of [0, 1, 2].
    Called once at login, stored server-side only.
    """
    order = [0, 1, 2]
    random.shuffle(order)
    return order


# ── Fractal pipeline ─────────────────────────────────────────────────────────

def apply_fractal_pipeline(x0: float, order: list) -> float:
    """
    Chain all three fractals in the given order.
    Re-clamps to (0.05, 0.95) between each step so every fractal
    receives an input in its fully chaotic regime.
    """
    x = x0
    for fractal_index in order:
        x = FRACTALS[fractal_index](x)
        x = 0.05 + (x * 0.90)
        x = max(0.001, min(0.999, x))
    return x


# ── OTP generation ───────────────────────────────────────────────────────────

def generate_fractal_otp(
    password_hash: str,
    behavior_vector: list,
    order: list,
    timestamp=None
) -> str:
    """
    Full pipeline:
      1. Generate seed from password_hash + behavior_vector + time window
      2. Convert seed to float x0 clamped to (0.05, 0.95)
      3. Apply three chained fractals in the given order
      4. Re-hash the chaotic float with the seed hash for extra diffusion
      5. Convert to a stable 6-digit OTP
    """
    seed_hash = generate_seed(password_hash, behavior_vector, timestamp)
    x0 = hash_to_float(seed_hash, offset=0)
    chaotic_value = apply_fractal_pipeline(x0, order)

    # Extra diffusion: mix chaotic float back with seed for maximum avalanche
    mixed_input = f"{seed_hash}{chaotic_value:.15f}"
    final_hash = hashlib.sha256(mixed_input.encode()).hexdigest()

    otp_int = int(final_hash[:12], 16) % 1_000_000
    return f"{otp_int:06d}"


# ── OTP verification ─────────────────────────────────────────────────────────

def verify_otp_value(
    password_hash: str,
    behavior_vector: list,
    order: list,
    submitted_otp: str
) -> bool:
    """
    Verify submitted OTP against current and previous 30-second windows.
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