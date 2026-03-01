export default function Alert({ message, type }) {
  if (!message) return null;
  const isError = type === "error";

  return (
    <div
      className="px-4 py-3 rounded-xl mb-5 text-xs"
      style={{
        fontFamily: "'Space Mono', monospace",
        background: isError ? "rgba(255,80,80,0.1)" : "rgba(99,230,226,0.1)",
        border: `1px solid ${isError ? "rgba(255,80,80,0.3)" : "rgba(99,230,226,0.3)"}`,
        color: isError ? "rgba(255,150,150,0.95)" : "rgba(99,230,226,0.95)",
      }}
    >
      {isError ? "✗  " : "✓  "}{message}
    </div>
  );
}