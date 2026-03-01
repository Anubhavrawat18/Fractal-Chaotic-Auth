import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ParticleField from "../components/ParticleField";
import FractalLogo from "../components/FractalLogo";

// ── Reusable section card ────────────────────────────────────────────────────
function SectionCard({ children, delay = 0, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "rgba(10, 20, 35, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(99,230,226,0.12)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(99,230,226,0.08)",
        animation: `fadeUp 0.6s ease ${delay}s both`,
      }}
    >
      {children}
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <h2
        className="text-sm uppercase tracking-widest"
        style={{ color: "rgba(99,230,226,0.7)", fontFamily: "'Space Mono', monospace" }}
      >
        {title}
      </h2>
      <div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, rgba(99,230,226,0.2), transparent)" }}
      />
    </div>
  );
}

// ── Pill badge ───────────────────────────────────────────────────────────────
function Pill({ label, accent = false }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs mr-2 mb-2"
      style={{
        fontFamily: "'Space Mono', monospace",
        background: accent ? "rgba(99,230,226,0.12)" : "rgba(99,230,226,0.05)",
        border: `1px solid ${accent ? "rgba(99,230,226,0.4)" : "rgba(99,230,226,0.15)"}`,
        color: accent ? "rgba(99,230,226,0.95)" : "rgba(99,230,226,0.55)",
      }}
    >
      {label}
    </span>
  );
}

// ── Flow step ────────────────────────────────────────────────────────────────
function FlowStep({ number, title, description, last = false }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: "rgba(99,230,226,0.1)",
            border: "1px solid rgba(99,230,226,0.4)",
            color: "rgba(99,230,226,1)",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {number}
        </div>
        {!last && (
          <div
            className="w-px flex-1 mt-2"
            style={{ background: "rgba(99,230,226,0.1)", minHeight: "24px" }}
          />
        )}
      </div>
      <div className="pb-5">
        <p
          className="text-sm font-semibold mb-1"
          style={{ color: "rgba(220,240,255,0.9)", fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: "rgba(150,180,220,0.6)", fontFamily: "'Space Mono', monospace" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, delay }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: "rgba(99,230,226,0.04)",
        border: "1px solid rgba(99,230,226,0.1)",
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-1"
        style={{ color: "rgba(99,230,226,0.4)", fontFamily: "'Space Mono', monospace" }}
      >
        {label}
      </p>
      <p
        className="text-sm"
        style={{ color: "rgba(99,230,226,0.95)", fontFamily: "'Space Mono', monospace" }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Fractal visualizer (animated SVG) ───────────────────────────────────────
function FractalVisualizer() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const orders = [
    ["Logistic", "Mandelbrot", "Julia"],
    ["Julia", "Logistic", "Mandelbrot"],
    ["Mandelbrot", "Julia", "Logistic"],
    ["Logistic", "Julia", "Mandelbrot"],
    ["Mandelbrot", "Logistic", "Julia"],
    ["Julia", "Mandelbrot", "Logistic"],
  ];
  const current = orders[tick % orders.length];

  return (
    <div
      className="rounded-xl p-4 mt-4"
      style={{
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(99,230,226,0.1)",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <p className="text-xs mb-3" style={{ color: "rgba(99,230,226,0.4)" }}>
        Live permutation preview — new order each login
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {current.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-lg text-xs"
              style={{
                background: "rgba(99,230,226,0.1)",
                border: "1px solid rgba(99,230,226,0.3)",
                color: "rgba(99,230,226,1)",
                animation: "fadeUp 0.3s ease both",
              }}
            >
              {name}
            </span>
            {i < 2 && (
              <span style={{ color: "rgba(99,230,226,0.3)", fontSize: "12px" }}>→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Success / Dashboard page ────────────────────────────────────────────
export default function Success() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "#020c18" }}
    >
      {/* Background layers */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(15,40,80,0.9) 0%, #020c18 60%)",
        }}
      />
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,230,226,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,230,226,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <ParticleField />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">

        {/* ── Hero section ── */}
        <div className="text-center mb-12" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute rounded-full" style={{ inset: "-20px", border: "1px solid rgba(99,230,226,0.2)", animation: "pingRing 2.5s ease-out infinite" }} />
            <div className="absolute rounded-full" style={{ inset: "-38px", border: "1px solid rgba(99,230,226,0.1)", animation: "pingRing 2.5s ease-out 0.7s infinite" }} />
            <FractalLogo size={72} />
          </div>

          <div
            className="inline-block px-4 py-1 rounded-full text-xs mb-4"
            style={{
              fontFamily: "'Space Mono', monospace",
              background: "rgba(99,230,226,0.08)",
              border: "1px solid rgba(99,230,226,0.25)",
              color: "rgba(99,230,226,0.8)",
              letterSpacing: "0.15em",
            }}
          >
            ✓ &nbsp; ACCESS GRANTED
          </div>

          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: "rgba(220,240,255,0.95)", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
          >
            Fractal Auth System
          </h1>
          <p
            className="text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(150,180,220,0.6)", fontFamily: "'Space Mono', monospace" }}
          >
            A multi-layer authentication system combining chaos theory,
            behavioral biometrics, and fractal mathematics.
          </p>
        </div>

        {/* ── Session metrics ── */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          <MetricCard label="Auth Layers"    value="3 Active"       delay={0.1} />
          <MetricCard label="OTP Type"       value="Fractal Chaos"  delay={0.15} />
          <MetricCard label="Entropy"        value="SHA-256"        delay={0.2} />
          <MetricCard label="Session"        value="Verified"       delay={0.25} />
        </div>

        {/* ── Tech Stack ── */}
        <SectionCard delay={0.2} className="mb-6">
          <SectionHeading icon="⚙️" title="Tech Stack" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs mb-2" style={{ color: "rgba(99,230,226,0.4)", fontFamily: "'Space Mono', monospace" }}>BACKEND</p>
              <div>
                <Pill label="Python 3.12"    accent />
                <Pill label="FastAPI"        accent />
                <Pill label="SQLite"         accent />
                <Pill label="Argon2"         accent />
                <Pill label="passlib" />
                <Pill label="python-dotenv" />
                <Pill label="smtplib" />
                <Pill label="pydantic" />
              </div>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: "rgba(99,230,226,0.4)", fontFamily: "'Space Mono', monospace" }}>FRONTEND</p>
              <div>
                <Pill label="React 18"      accent />
                <Pill label="Vite"          accent />
                <Pill label="Tailwind CSS"  accent />
                <Pill label="React Router"  accent />
                <Pill label="Axios" />
                <Pill label="Canvas API" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Authentication Flow ── */}
        <SectionCard delay={0.3} className="mb-6">
          <SectionHeading icon="🔄" title="Authentication Flow" />
          <FlowStep
            number="1"
            title="Registration"
            description="User provides username, email, password and behavior vector. Password is hashed with Argon2. Behavior vector (captured from mouse, keyboard, click dynamics) is stored as the baseline profile in the DB."
          />
          <FlowStep
            number="2"
            title="Login — Credential Verification"
            description="Username and password are verified. If credentials match, the system proceeds to behavioral analysis."
          />
          <FlowStep
            number="3"
            title="Login — Behavior Verification"
            description="The incoming behavior vector is compared against the stored baseline using Euclidean distance. Users get 3 warmup logins before enforcement kicks in, allowing the profile to stabilize."
          />
          <FlowStep
            number="4"
            title="Fractal OTP Generation"
            description="A truly random permutation of the three fractal functions is generated server-side and stored in memory. The OTP is derived by chaining all three fractals using SHA-256 seeded chaos. The fractal order never leaves the server."
          />
          <FlowStep
            number="5"
            title="OTP Delivery"
            description="The 6-digit OTP is sent to the user's registered Gmail address via SMTP. The OTP is valid for one 30-second window. The server-side session expires in 90 seconds."
          />
          <FlowStep
            number="6"
            title="OTP Verification & Profile Update"
            description="User submits the OTP. Server retrieves the stored fractal order, regenerates the OTP, and compares. On success the session is deleted (one-time use), and the behavior profile is updated using exponential moving average."
            last
          />
        </SectionCard>

        {/* ── Fractal Engine ── */}
        <SectionCard delay={0.4} className="mb-6">
          <SectionHeading icon="🌀" title="Fractal OTP Engine" />
          <p
            className="text-xs leading-relaxed mb-4"
            style={{ color: "rgba(150,180,220,0.65)", fontFamily: "'Space Mono', monospace" }}
          >
            The OTP is generated by chaining three chaotic mathematical systems.
            Each system's output feeds into the next as input, compounding
            unpredictability across all three layers.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
            {[
              { name: "Logistic Map",     formula: "xₙ₊₁ = r·xₙ·(1−xₙ)",         desc: "Classic chaos. r=3.99 keeps the system in full chaotic regime." },
              { name: "Mandelbrot",       formula: "xₙ₊₁ = xₙ² + c",              desc: "Real-valued Mandelbrot iteration. c derived from x₀, escapes folded back into (0,1)." },
              { name: "Julia Set",        formula: "xₙ₊₁ = xₙ² + Re(c) + Im(c)·sin(xₙ)", desc: "Julia-inspired with fixed c = −0.7 + 0.27i projected onto real axis." },
            ].map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(99,230,226,0.04)",
                  border: "1px solid rgba(99,230,226,0.1)",
                }}
              >
                <p className="text-xs font-bold mb-2" style={{ color: "rgba(220,240,255,0.85)", fontFamily: "'Syne', sans-serif" }}>{f.name}</p>
                <p className="text-xs mb-2" style={{ color: "rgba(99,230,226,0.7)", fontFamily: "'Space Mono', monospace" }}>{f.formula}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(150,180,220,0.5)", fontFamily: "'Space Mono', monospace" }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <FractalVisualizer />
        </SectionCard>

        {/* ── Behavior Vector ── */}
        <SectionCard delay={0.5} className="mb-6">
          <SectionHeading icon="🧠" title="Behavioral Biometrics" />
          <p
            className="text-xs leading-relaxed mb-4"
            style={{ color: "rgba(150,180,220,0.65)", fontFamily: "'Space Mono', monospace" }}
          >
            The behavior vector is a silent biometric fingerprint captured passively
            from how you interact with the page. It is normalized to 5 floats in [0, 1].
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { index: "[0]", label: "Typing Speed",    desc: "Average ms between keystrokes" },
              { index: "[1]", label: "Typing Rhythm",   desc: "Std deviation of keystroke gaps" },
              { index: "[2]", label: "Mouse Speed",     desc: "Average cursor velocity in px/ms" },
              { index: "[3]", label: "Pause Ratio",     desc: "Fraction of typing gaps > 500ms" },
              { index: "[4]", label: "Click Pressure",  desc: "Average mouse button hold duration" },
            ].map((v, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span
                  className="text-xs flex-shrink-0 mt-0.5"
                  style={{ color: "rgba(99,230,226,0.5)", fontFamily: "'Space Mono', monospace" }}
                >
                  {v.index}
                </span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "rgba(220,240,255,0.8)", fontFamily: "'Syne', sans-serif" }}>{v.label}</p>
                  <p className="text-xs" style={{ color: "rgba(150,180,220,0.5)", fontFamily: "'Space Mono', monospace" }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 p-3 rounded-lg text-xs"
            style={{
              background: "rgba(255,200,80,0.05)",
              border: "1px solid rgba(255,200,80,0.15)",
              color: "rgba(255,220,100,0.65)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            ⚠ First 3 logins are warmup — behavior enforcement begins on login 4.
            Profile adapts over time using exponential moving average (α = 0.9).
          </div>
        </SectionCard>

        {/* ── Security Properties ── */}
        <SectionCard delay={0.6} className="mb-10">
          <SectionHeading icon="🔐" title="Security Properties" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: "Password Hashing",       body: "Argon2id — memory-hard, resistant to GPU and ASIC brute force attacks." },
              { title: "OTP Entropy",             body: "Seed is SHA-256 of password_hash + behavior_vector + time window. Unique per user, per session, per 30s." },
              { title: "Fractal Order Secrecy",   body: "The random fractal permutation is stored server-side only. Never transmitted to the client." },
              { title: "One-Time Sessions",       body: "OTP session is deleted immediately after verification. Replay attacks are impossible." },
              { title: "Behavior Verification",   body: "Euclidean distance check against stored behavioral baseline. Threshold = 0.35 across 5 normalized dimensions." },
              { title: "Time-Bounded OTP",        body: "OTP valid for one 30-second window. Server session expires in 90 seconds. Stale attempts are rejected." },
            ].map((s, i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(99,230,226,0.03)",
                  border: "1px solid rgba(99,230,226,0.08)",
                }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: "rgba(220,240,255,0.85)", fontFamily: "'Syne', sans-serif" }}>{s.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(150,180,220,0.55)", fontFamily: "'Space Mono', monospace" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Sign out ── */}
        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-200"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: "rgba(99,230,226,0.8)",
              background: "rgba(99,230,226,0.06)",
              border: "1px solid rgba(99,230,226,0.2)",
            }}
            onMouseEnter={e => {
              e.target.style.background = "rgba(99,230,226,0.12)";
              e.target.style.borderColor = "rgba(99,230,226,0.4)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "rgba(99,230,226,0.06)";
              e.target.style.borderColor = "rgba(99,230,226,0.2)";
            }}
          >
            Sign Out
          </button>

          <p
            className="mt-6 text-xs"
            style={{ color: "rgba(99,230,226,0.2)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
          >
            ◈ Chaos-based OTP · Behavior Vector Auth · SHA-256 · Argon2
          </p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pingRing {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}