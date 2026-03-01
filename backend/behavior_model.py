import json
import math
from datetime import datetime
from database import get_connection

# Max possible distance across 5 normalized [0,1] dimensions is √5 ≈ 2.23
# 1.0 is a comfortable threshold — tight enough to catch imposters,
# loose enough to not lock out real users with slightly varied behavior
THRESHOLD = 0.35

# How many logins before we start enforcing behavior verification
# During this warmup period the profile builds a real baseline
WARMUP_LOGINS = 3

# How strongly the old mean is preserved vs pulled toward new behavior
# 0.9 = slow adaptation (profile changes gradually over many logins)
# Lower = faster adaptation but less stable
ALPHA = 0.9


def store_initial_behavior(user_id, behavior_vector):
    """
    Called once at registration.
    Stores the initial behavior vector as the starting mean profile.
    login_count starts at 0 — verify_behavior will skip enforcement
    until WARMUP_LOGINS is reached.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO behavior_profiles
        (user_id, mean_vector, variance_vector, login_count, last_updated)
        VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        json.dumps(behavior_vector),
        json.dumps([0.1] * len(behavior_vector)),  # loose starting variance
        0,                                          # no real logins yet
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()


def verify_behavior(user_id, current_vector):
    """
    Called on every login attempt.

    During warmup (login_count < WARMUP_LOGINS):
      - Always returns True so the user isn't locked out while
        the profile is still forming from fallback-heavy vectors.

    After warmup:
      - Computes Euclidean distance between the incoming vector
        and the stored mean profile.
      - Returns True only if distance < THRESHOLD.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mean_vector, login_count
        FROM behavior_profiles
        WHERE user_id = ?
    """, (user_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        # No profile found — first time, let it through
        return True

    login_count = row["login_count"]

    # Warmup period: skip enforcement, let the profile build
    if login_count < WARMUP_LOGINS:
        return True

    mean_vector = json.loads(row["mean_vector"])

    distance = math.sqrt(sum(
        (c - m) ** 2
        for c, m in zip(current_vector, mean_vector)
    ))

    return distance < THRESHOLD


def update_behavior(user_id, current_vector):
    """
    Called after every successful OTP verification.
    Does two things:
      1. Increments login_count so the warmup period advances
      2. Slowly shifts the stored mean toward the latest behavior
         using exponential moving average (EMA):
         new_mean = ALPHA * old_mean + (1 - ALPHA) * current
         
         With ALPHA = 0.9 the profile adapts slowly and stays stable.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mean_vector, login_count
        FROM behavior_profiles
        WHERE user_id = ?
    """, (user_id,))

    row = cursor.fetchone()

    if not row:
        conn.close()
        return

    old_mean = json.loads(row["mean_vector"])
    old_count = row["login_count"]

    # EMA update — gradually pulls the profile toward current behavior
    new_mean = [
        ALPHA * old + (1 - ALPHA) * curr
        for old, curr in zip(old_mean, current_vector)
    ]

    cursor.execute("""
        UPDATE behavior_profiles
        SET mean_vector   = ?,
            login_count   = ?,
            last_updated  = ?
        WHERE user_id = ?
    """, (
        json.dumps(new_mean),
        old_count + 1,
        datetime.utcnow().isoformat(),
        user_id
    ))

    conn.commit()
    conn.close()