import { useState } from "react";

export default function GlowButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
  type = "button",
}) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === "primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full py-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      style={{
        fontFamily: "'Space Mono', monospace",
        color: "rgba(99,230,226,0.95)",
        background: isPrimary
          ? hovered
            ? "rgba(99,230,226,0.22)"
            : "rgba(99,230,226,0.12)"
          : "transparent",
        border: isPrimary
          ? "1px solid rgba(99,230,226,0.4)"
          : "1px solid rgba(99,230,226,0.2)",
        boxShadow: isPrimary && hovered ? "0 0 30px rgba(99,230,226,0.2)" : "none",
      }}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}