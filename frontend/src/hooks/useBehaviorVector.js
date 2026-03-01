import { useEffect, useRef, useCallback } from "react";

/**
 * useBehaviorVector
 *
 * Passively captures user interaction signals and returns a
 * getBehaviorVector() function that produces a normalized
 * list[float] of length 5 — ready to send straight to the backend.
 *
 * Vector layout:
 *  [0] typingSpeed    – avg ms between keystrokes      (lower = faster)
 *  [1] typingRhythm   – consistency of keystroke gaps  (lower = more consistent)
 *  [2] mouseSpeed     – avg mouse movement speed px/ms (higher = faster)
 *  [3] pauseRatio     – fraction of long pauses while typing
 *  [4] clickPressure  – avg mouse button hold time ms  (higher = longer press)
 */
export function useBehaviorVector() {
  const keystrokeTimestamps = useRef([]);   // timestamps of each keydown
  const keystrokeGaps       = useRef([]);   // ms between consecutive keys
  const mousePositions      = useRef([]);   // { x, y, t } snapshots
  const clickDurations      = useRef([]);   // ms held per click
  const mouseDownTime       = useRef(null); // timestamp of last mousedown

  // ── Keystroke listener ───────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    // Only track printable keys + backspace, ignore modifier-only presses
    if (e.key.length > 1 && e.key !== "Backspace") return;

    const now = performance.now();
    const prev = keystrokeTimestamps.current.at(-1);

    if (prev !== undefined) {
      const gap = now - prev;
      // Ignore gaps > 5 s — user probably looked away
      if (gap < 5000) {
        keystrokeGaps.current.push(gap);
      }
    }

    keystrokeTimestamps.current.push(now);

    // Keep arrays bounded so memory doesn't grow unbounded across a session
    if (keystrokeGaps.current.length > 200) keystrokeGaps.current.shift();
    if (keystrokeTimestamps.current.length > 200) keystrokeTimestamps.current.shift();
  }, []);

  // ── Mouse movement listener ──────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    mousePositions.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (mousePositions.current.length > 300) mousePositions.current.shift();
  }, []);

  // ── Click pressure listeners ─────────────────────────────────────────────
  const handleMouseDown = useCallback(() => {
    mouseDownTime.current = performance.now();
  }, []);

  const handleMouseUp = useCallback(() => {
    if (mouseDownTime.current !== null) {
      const duration = performance.now() - mouseDownTime.current;
      if (duration < 2000) { // ignore accidental long holds
        clickDurations.current.push(duration);
        if (clickDurations.current.length > 50) clickDurations.current.shift();
      }
      mouseDownTime.current = null;
    }
  }, []);

  // ── Attach / detach listeners ────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener("keydown",   handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("keydown",   handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, [handleKeyDown, handleMouseMove, handleMouseDown, handleMouseUp]);

  // ── Helper: mean of an array ─────────────────────────────────────────────
  const mean = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

  // ── Helper: standard deviation ───────────────────────────────────────────
  const stdDev = (arr) => {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length);
  };

  // ── Helper: clamp + normalize a value into [0, 1] ────────────────────────
  const normalize = (value, min, max) => {
    if (max === min) return 0.5; // avoid division by zero
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  };

  // ── Build the vector ─────────────────────────────────────────────────────
  const getBehaviorVector = useCallback(() => {
    const gaps = keystrokeGaps.current;
    const positions = mousePositions.current;
    const clicks = clickDurations.current;

    // [0] typingSpeed — avg gap in ms, normalized (50ms–800ms range)
    const avgGap = mean(gaps);
    const typingSpeed = normalize(avgGap, 50, 800);

    // [1] typingRhythm — stddev of gaps, normalized (0–300ms range)
    //     Low stddev = very consistent rhythm (like a bot or touch typist)
    //     High stddev = irregular (hunt-and-peck, distracted)
    const rhythm = stdDev(gaps);
    const typingRhythm = normalize(rhythm, 0, 300);

    // [2] mouseSpeed — avg px/ms between consecutive mouse positions
    let speeds = [];
    for (let i = 1; i < positions.length; i++) {
      const dx = positions[i].x - positions[i - 1].x;
      const dy = positions[i].y - positions[i - 1].y;
      const dt = positions[i].t - positions[i - 1].t;
      if (dt > 0 && dt < 200) { // ignore teleport jumps
        speeds.push(Math.sqrt(dx * dx + dy * dy) / dt);
      }
    }
    const mouseSpeed = normalize(mean(speeds), 0, 3); // 0–3 px/ms range

    // [3] pauseRatio — fraction of gaps > 500ms (long pauses)
    const pauseRatio = gaps.length === 0
      ? 0.5
      : gaps.filter((g) => g > 500).length / gaps.length;

    // [4] clickPressure — avg click hold time, normalized (50ms–400ms)
    const avgClick = mean(clicks);
    const clickPressure = normalize(avgClick, 50, 400);

    // If we have very little data, fill gaps with 0.5 (neutral)
    // so the backend doesn't reject the vector
    const withFallback = (val, hasData) => (hasData ? parseFloat(val.toFixed(4)) : 0.5);

    return [
      withFallback(typingSpeed,   gaps.length >= 3),
      withFallback(typingRhythm,  gaps.length >= 3),
      withFallback(mouseSpeed,    speeds.length >= 5),
      withFallback(pauseRatio,    gaps.length >= 3),
      withFallback(clickPressure, clicks.length >= 2),
    ];
  }, []);

  // ── Reset collected data (call after a successful auth) ──────────────────
  const resetBehavior = useCallback(() => {
    keystrokeTimestamps.current = [];
    keystrokeGaps.current       = [];
    mousePositions.current      = [];
    clickDurations.current      = [];
    mouseDownTime.current       = null;
  }, []);

  return { getBehaviorVector, resetBehavior };
}