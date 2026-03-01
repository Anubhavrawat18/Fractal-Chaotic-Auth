export default function FractalLogo({ size = 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ filter: "drop-shadow(0 0 12px rgba(99,230,226,0.7))" }}
    >
      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(99,230,226,0.15)" strokeWidth="1" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(99,230,226,0.25)" strokeWidth="1" />
      <circle cx="32" cy="32" r="8"  fill="none" stroke="rgba(99,230,226,0.5)"  strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={32 + 18 * Math.cos(rad)}
            cy={32 + 18 * Math.sin(rad)}
            r="2.5"
            fill="rgba(99,230,226,0.9)"
          />
        );
      })}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={32 + 28 * Math.cos(rad)}
            cy={32 + 28 * Math.sin(rad)}
            r="1.5"
            fill="rgba(99,230,226,0.4)"
          />
        );
      })}
      <circle cx="32" cy="32" r="4" fill="rgba(99,230,226,1)" />
      <circle cx="32" cy="32" r="2" fill="white" />
    </svg>
  );
}