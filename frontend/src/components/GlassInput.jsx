import { useState } from "react";

export default function GlassInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-5">
      <label
        className="block text-xs uppercase tracking-widest mb-2 transition-colors duration-200"
        style={{
          color: focused ? "rgba(99,230,226,0.9)" : "rgba(99,230,226,0.5)",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "rgba(99,230,226,0.04)",
          border: `1px solid ${focused ? "rgba(99,230,226,0.6)" : "rgba(99,230,226,0.15)"}`,
          color: "rgba(220,240,255,0.95)",
          fontFamily: "'Space Mono', monospace",
          boxShadow: focused ? "0 0 20px rgba(99,230,226,0.12)" : "none",
        }}
      />
    </div>
  );
}