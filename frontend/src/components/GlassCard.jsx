export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: "rgba(10, 20, 35, 0.55)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(99,230,226,0.18)",
        boxShadow: "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(99,230,226,0.12)",
      }}
    >
      {children}
    </div>
  );
}