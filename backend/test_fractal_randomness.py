"""
test_fractal_randomness.py
──────────────────────────
Produces 3 charts validating the Fractal OTP pipeline:

  Chart 1 — Avalanche Effect
            How much does the OTP change when we make tiny input changes?
            X-axis: number of hex characters flipped in seed
            Y-axis: average % of OTP bits that changed

  Chart 2 — OTP Distribution Uniformity
            Are all 6-digit OTP values equally likely?
            Histogram of 10,000 generated OTPs across 50 buckets
            vs the flat expected line

  Chart 3 — False Acceptance / Rejection Rate
            How does the behavior threshold affect who gets in?
            Bar chart showing FAR and FRR at 5 different threshold values

Run from backend/ directory:
    python test_fractal_randomness.py

Output: fractal_test_charts.png
"""

import math
import hashlib
import random
import os
from collections import Counter
from datetime import datetime

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from fractal_engine import generate_fractal_otp, generate_random_order


# ── Config ────────────────────────────────────────────────────────────────────

AVALANCHE_TRIALS  = 500     # trials per flip-count level
MAX_FLIPS         = 8       # max number of hex chars to flip
OTP_SAMPLE_SIZE   = 10_000  # OTPs generated for uniformity test
FAR_FRR_TRIALS    = 300     # behavior vector pairs per threshold

DUMMY_HASH    = hashlib.sha256(b"test_password_fractal_auth").hexdigest()
DUMMY_VECTOR  = [0.312, 0.671, 0.440, 0.120, 0.289]

# ── Palette ───────────────────────────────────────────────────────────────────
BG      = "#0a1420"
PANEL   = "#0e1c2a"
TEAL    = "#63e6e2"
TEAL2   = "#2ab8b4"
AMBER   = "#f6c744"
GREEN   = "#4ade80"
RED     = "#f87171"
MUTED   = "#3a5468"
TEXT    = "#dce8ff"
SUB     = "#6a8a9a"


# ── Helpers ───────────────────────────────────────────────────────────────────

def bits(otp: str, width=20) -> str:
    return format(int(otp), f"0{width}b")

def hamming(b1: str, b2: str) -> int:
    return sum(x != y for x, y in zip(b1, b2))

def flip_n_chars(h: str, n: int) -> str:
    """Flip exactly n distinct hex characters in the hash."""
    indices = random.sample(range(len(h)), n)
    chars = list(h)
    for i in indices:
        pool = [c for c in "0123456789abcdef" if c != chars[i]]
        chars[i] = random.choice(pool)
    return "".join(chars)

def euclidean(v1, v2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))

def random_vector():
    return [random.uniform(0, 1) for _ in range(5)]

def noisy_vector(base, noise):
    """Add Gaussian noise to base vector and clamp to [0,1]."""
    return [max(0.0, min(1.0, v + random.gauss(0, noise))) for v in base]

def style(ax, title, xlabel, ylabel):
    ax.set_facecolor(PANEL)
    ax.set_title(title, color=TEXT, fontsize=13, fontweight="bold",
                 fontfamily="monospace", pad=14)
    ax.set_xlabel(xlabel, color=SUB, fontsize=10, fontfamily="monospace")
    ax.set_ylabel(ylabel, color=SUB, fontsize=10, fontfamily="monospace")
    ax.tick_params(colors=SUB, labelsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor(MUTED)
        spine.set_linewidth(0.7)


# ── Chart 1 — Avalanche Effect ────────────────────────────────────────────────

def compute_avalanche():
    """
    For each flip count 1..MAX_FLIPS:
      - Run AVALANCHE_TRIALS trials
      - Each trial: generate OTP with original hash, flip N chars, generate again
      - Record average % of bits that changed
    Returns two lists: flip_counts, avg_bit_change_pct
    """
    print("  [Chart 1] Computing avalanche effect across flip levels...")
    flip_counts = list(range(1, MAX_FLIPS + 1))
    avg_changes = []
    std_changes = []

    for n_flips in flip_counts:
        ratios = []
        for i in range(AVALANCHE_TRIALS):
            order = generate_random_order()
            ts = i % 300

            otp1 = generate_fractal_otp(DUMMY_HASH, DUMMY_VECTOR, order, timestamp=ts)
            otp2 = generate_fractal_otp(flip_n_chars(DUMMY_HASH, n_flips), DUMMY_VECTOR, order, timestamp=ts)

            b1, b2 = bits(otp1), bits(otp2)
            ratios.append(hamming(b1, b2) / len(b1) * 100)

        avg_changes.append(np.mean(ratios))
        std_changes.append(np.std(ratios))
        print(f"    Flips={n_flips}  avg={avg_changes[-1]:.2f}%  std={std_changes[-1]:.2f}%")

    return flip_counts, avg_changes, std_changes


def plot_avalanche(ax, flip_counts, avg_changes, std_changes):
    x = np.array(flip_counts)
    y = np.array(avg_changes)
    e = np.array(std_changes)

    # Shaded std band
    ax.fill_between(x, y - e, y + e, color=TEAL, alpha=0.15, label="±1 std dev")

    # Line + markers
    ax.plot(x, y, color=TEAL, linewidth=2.5, marker="o", markersize=8,
            markerfacecolor=BG, markeredgecolor=TEAL, markeredgewidth=2, zorder=5)

    # Ideal 50% line
    ax.axhline(50, color=AMBER, linewidth=1.8, linestyle="--", alpha=0.85,
               label="Ideal avalanche = 50%")

    # Green band 40–60%
    ax.axhspan(40, 60, color=GREEN, alpha=0.07, label="Acceptable range (40–60%)")

    # Annotate each point
    for xi, yi in zip(x, y):
        ax.annotate(f"{yi:.1f}%", xy=(xi, yi), xytext=(0, 12),
                    textcoords="offset points", ha="center",
                    color=TEXT, fontsize=9, fontfamily="monospace")

    ax.set_xlim(0.5, MAX_FLIPS + 0.5)
    ax.set_ylim(0, 100)
    ax.set_xticks(x)
    ax.set_xticklabels([f"{n}" for n in x])
    style(ax,
          "Chart 1 — Avalanche Effect\nSmall Input Change vs OTP Bit Difference %",
          "Number of Hex Characters Flipped in Seed Hash",
          "Average Bits Changed in OTP (%)")

    legend = ax.legend(fontsize=9, facecolor=PANEL, edgecolor=MUTED, labelcolor=TEXT,
                       loc="lower right")


# ── Chart 2 — OTP Distribution Uniformity ─────────────────────────────────────

def compute_uniformity():
    """
    Generate OTP_SAMPLE_SIZE OTPs and bucket them into 50 equal bins
    across [000000, 999999]. Returns bin edges and counts.
    """
    print(f"  [Chart 2] Generating {OTP_SAMPLE_SIZE:,} OTPs for uniformity analysis...")
    values = []
    for i in range(OTP_SAMPLE_SIZE):
        order = generate_random_order()
        otp = generate_fractal_otp(DUMMY_HASH, DUMMY_VECTOR, order, timestamp=i)
        values.append(int(otp))
    return values


def plot_uniformity(ax, values):
    n_bins = 50
    expected_per_bin = OTP_SAMPLE_SIZE / n_bins

    counts, edges = np.histogram(values, bins=n_bins, range=(0, 1_000_000))

    # Colour bars by deviation from expected
    bar_colors = []
    for c in counts:
        dev = abs(c - expected_per_bin) / expected_per_bin
        if dev < 0.10:
            bar_colors.append(GREEN)
        elif dev < 0.25:
            bar_colors.append(TEAL2)
        else:
            bar_colors.append(AMBER)

    centers = (edges[:-1] + edges[1:]) / 2
    widths  = edges[1:] - edges[:-1]

    ax.bar(centers, counts, width=widths * 0.92, color=bar_colors,
           edgecolor=BG, linewidth=0.4, zorder=3)

    # Expected flat line
    ax.axhline(expected_per_bin, color=AMBER, linewidth=2.0, linestyle="--",
               label=f"Expected uniform count = {int(expected_per_bin)}")

    # ±10% band
    ax.axhspan(expected_per_bin * 0.90, expected_per_bin * 1.10,
               color=AMBER, alpha=0.08, label="±10% tolerance band")

    # Compute chi-square
    chi_sq = sum((c - expected_per_bin) ** 2 / expected_per_bin for c in counts)
    df = n_bins - 1  # degrees of freedom
    # Critical value for df=49 at p=0.05 is ~66.34
    threshold = 66.34
    verdict = "PASS ✓" if chi_sq < threshold else "FAIL ✗"
    verdict_color = GREEN if chi_sq < threshold else RED

    ax.text(0.98, 0.95,
            f"χ²  = {chi_sq:.1f}\ndf  = {df}\nα   = 0.05\nThreshold = {threshold}\n\n{verdict}",
            transform=ax.transAxes, ha="right", va="top",
            color=verdict_color, fontsize=10, fontfamily="monospace",
            bbox=dict(facecolor=PANEL, edgecolor=verdict_color,
                      alpha=0.9, boxstyle="round,pad=0.5"))

    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{int(x):,}"))
    style(ax,
          "Chart 2 — OTP Distribution Uniformity\nHistogram of 10,000 Generated OTP Values",
          "OTP Value (000000 → 999999)",
          "Count per Bin")
    legend = ax.legend(fontsize=9, facecolor=PANEL, edgecolor=MUTED,
                       labelcolor=TEXT, loc="upper left")

    # Colour legend for bars
    extra_patches = [
        mpatches.Patch(color=GREEN, label="<10% deviation from expected"),
        mpatches.Patch(color=TEAL2, label="10–25% deviation"),
        mpatches.Patch(color=AMBER, label=">25% deviation"),
    ]
    ax.legend(handles=extra_patches, fontsize=9, facecolor=PANEL, edgecolor=MUTED,
              labelcolor=TEXT, loc="upper left")


# ── Chart 3 — False Acceptance / Rejection Rate ───────────────────────────────

def compute_far_frr():
    """
    For 5 different threshold values:
      FAR (False Acceptance Rate):
        - Generate FAR_FRR_TRIALS pairs of completely random vectors
        - Count how many are accepted (distance < threshold)
        - FAR = accepted / total * 100

      FRR (False Rejection Rate):
        - Generate FAR_FRR_TRIALS noisy versions of the genuine vector
          (Gaussian noise std = 0.15, simulating same user on a different day)
        - Count how many are rejected (distance >= threshold)
        - FRR = rejected / total * 100
    """
    print("  [Chart 3] Computing FAR/FRR across threshold values...")

    thresholds = [0.35, 0.60, 1.00, 1.40, 1.80]
    far_values = []
    frr_values = []

    # Pre-generate all random impostor vectors and all genuine noisy vectors
    impostor_distances = [
        euclidean(DUMMY_VECTOR, random_vector())
        for _ in range(FAR_FRR_TRIALS)
    ]
    genuine_distances = [
        euclidean(DUMMY_VECTOR, noisy_vector(DUMMY_VECTOR, noise=0.15))
        for _ in range(FAR_FRR_TRIALS)
    ]

    for thresh in thresholds:
        # FAR: how many impostors pass
        fa = sum(1 for d in impostor_distances if d < thresh)
        far_values.append(fa / FAR_FRR_TRIALS * 100)

        # FRR: how many genuine users are rejected
        fr = sum(1 for d in genuine_distances if d >= thresh)
        frr_values.append(fr / FAR_FRR_TRIALS * 100)

        print(f"    Threshold={thresh:.2f}  FAR={far_values[-1]:.1f}%  FRR={frr_values[-1]:.1f}%")

    return thresholds, far_values, frr_values


def plot_far_frr(ax, thresholds, far_values, frr_values):
    x      = np.arange(len(thresholds))
    width  = 0.32
    labels = [f"T={t}" for t in thresholds]

    bars_far = ax.bar(x - width / 2, far_values, width, color=RED,
                      edgecolor=BG, linewidth=0.6, label="FAR — Impostor Accepted (%)",
                      zorder=3)
    bars_frr = ax.bar(x + width / 2, frr_values, width, color=AMBER,
                      edgecolor=BG, linewidth=0.6, label="FRR — Genuine Rejected (%)",
                      zorder=3)

    # Value labels on bars
    for bar in bars_far:
        h = bar.get_height()
        if h > 0.5:
            ax.text(bar.get_x() + bar.get_width() / 2, h + 0.5,
                    f"{h:.1f}%", ha="center", va="bottom",
                    color=RED, fontsize=9, fontfamily="monospace", fontweight="bold")

    for bar in bars_frr:
        h = bar.get_height()
        if h > 0.5:
            ax.text(bar.get_x() + bar.get_width() / 2, h + 0.5,
                    f"{h:.1f}%", ha="center", va="bottom",
                    color=AMBER, fontsize=9, fontfamily="monospace", fontweight="bold")

    # Highlight current system threshold
    current_thresh_idx = thresholds.index(1.00)
    ax.axvspan(current_thresh_idx - 0.5, current_thresh_idx + 0.5,
               color=TEAL, alpha=0.07, zorder=1)
    ax.text(current_thresh_idx, ax.get_ylim()[1] if ax.get_ylim()[1] > 0 else 100,
            "← Current\n   System", ha="center", va="top",
            color=TEAL, fontsize=9, fontfamily="monospace")

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontfamily="monospace")
    ax.set_ylim(0, max(max(far_values), max(frr_values)) * 1.35)

    # Annotation explaining the tradeoff
    ax.text(0.01, 0.96,
            "Lower threshold → fewer impostors accepted (↓FAR)\n"
            "                     but more genuine users rejected (↑FRR)\n"
            "Threshold = 1.0 balances both for real-world use",
            transform=ax.transAxes, ha="left", va="top",
            color=SUB, fontsize=9, fontfamily="monospace",
            bbox=dict(facecolor=PANEL, edgecolor=MUTED, alpha=0.8,
                      boxstyle="round,pad=0.4"))

    style(ax,
          "Chart 3 — False Acceptance & Rejection Rate\nBehavior Threshold Comparison",
          "Behavior Verification Threshold (Euclidean Distance)",
          "Rate (%)")
    legend = ax.legend(fontsize=10, facecolor=PANEL, edgecolor=MUTED,
                       labelcolor=TEXT, loc="upper right")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print()
    print("=" * 60)
    print("  FRACTAL OTP — GRAPHICAL RANDOMNESS TEST SUITE")
    print("=" * 60)
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    # Collect data
    flip_counts, avg_changes, std_changes = compute_avalanche()
    print()
    otp_values = compute_uniformity()
    print()
    thresholds, far_values, frr_values = compute_far_frr()
    print()

    # Build figure
    print("  Building charts...")
    fig, axes = plt.subplots(3, 1, figsize=(14, 24), facecolor=BG)
    fig.suptitle(
        "Fractal OTP Authentication — Statistical Validation",
        fontsize=20, fontweight="bold", color=TEXT,
        fontfamily="monospace", y=0.99
    )
    fig.text(
        0.5, 0.975,
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}   |   "
        f"Engine: Logistic + Mandelbrot + Julia (randomly ordered, server-side)",
        ha="center", fontsize=10, color=SUB, fontfamily="monospace"
    )

    plt.subplots_adjust(hspace=0.48, top=0.96, bottom=0.05,
                        left=0.09, right=0.97)

    plot_avalanche(axes[0], flip_counts, avg_changes, std_changes)
    plot_uniformity(axes[1], otp_values)
    plot_far_frr(axes[2], thresholds, far_values, frr_values)

    # Save
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd(), "fractal_test_charts.png")
    fig.savefig(out_path, dpi=150, bbox_inches="tight", facecolor=BG)
    plt.close(fig)

    print(f"  Charts saved → {out_path}")
    print()
    print("  Summary:")
    print(f"    Avalanche at 1 flip  : {avg_changes[0]:.2f}% (target ~50%)")
    print(f"    Avalanche at 8 flips : {avg_changes[-1]:.2f}% (target ~50%)")
    print(f"    Unique OTPs / 10,000 : {len(set(otp_values)):,}")
    print(f"    FAR at T=1.0         : {far_values[thresholds.index(1.00)]:.1f}%")
    print(f"    FRR at T=1.0         : {frr_values[thresholds.index(1.00)]:.1f}%")
    print()
    print("=" * 60)


if __name__ == "__main__":
    main()