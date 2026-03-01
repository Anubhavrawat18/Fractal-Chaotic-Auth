import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ParticleField from "../components/ParticleField";
import GlassCard from "../components/GlassCard";
import FractalLogo from "../components/FractalLogo";
import GlowButton from "../components/GlowButton";
import Alert from "../components/Alert";
import { verifyOTP } from "../api";

export default function OTPVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const inputRefs = useRef([]);

  // Redirect if user lands here without a session
  useEffect(() => {
    if (!session?.userId) navigate("/login");
  }, [session, navigate]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) return;

    setLoading(true);
    setAlert(null);

    try {
      await verifyOTP(session.userId, otpStr, session.behaviorVector);
      navigate("/success");
    } catch (e) {
      setAlert({ message: e.message, type: "error" });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: "#020c18" }}>
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

      <div className="relative z-10 w-full max-w-md">
        <p
          className="text-center mb-6 text-xs uppercase tracking-widest"
          style={{ color: "rgba(99,230,226,0.35)", fontFamily: "'Space Mono', monospace" }}
        >
          Fractal Auth System
        </p>

        <GlassCard>
          <div className="px-9 py-10" style={{ animation: "fadeUp 0.5s ease both" }}>
            <div className="flex flex-col items-center mb-9">
              <FractalLogo size={56} />
              <h1
                className="mt-4 text-xl font-bold tracking-tight"
                style={{ color: "rgba(220,240,255,0.95)", fontFamily: "'Syne', sans-serif" }}
              >
                OTP Verification
              </h1>
              <p
                className="mt-1 text-xs tracking-wider"
                style={{ color: "rgba(99,230,226,0.45)", fontFamily: "'Space Mono', monospace" }}
              >
                Enter your fractal one-time passcode
              </p>
            </div>

            {/* Demo OTP hint */}
            {/* {session?.demoOtp && (
              <div
                className="px-4 py-3 rounded-xl mb-6 text-xs text-center"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  background: "rgba(255,200,50,0.07)",
                  border: "1px solid rgba(255,200,50,0.2)",
                  color: "rgba(255,220,100,0.8)",
                }}
              >
                Demo OTP:{" "}
                <span style={{ color: "rgba(255,220,100,1)", letterSpacing: "0.3em" }}>
                  {session.demoOtp}
                </span>
              </div>
            )} */}

            <Alert {...(alert || { message: null })} />

            {/* 6-box OTP input */}
            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="text-center text-2xl outline-none rounded-xl transition-all duration-200"
                  style={{
                    width: "52px",
                    height: "64px",
                    fontFamily: "'Space Mono', monospace",
                    color: "rgba(99,230,226,1)",
                    background: digit ? "rgba(99,230,226,0.1)" : "rgba(99,230,226,0.03)",
                    border: `1px solid ${digit ? "rgba(99,230,226,0.6)" : "rgba(99,230,226,0.2)"}`,
                    boxShadow: digit ? "0 0 20px rgba(99,230,226,0.15)" : "none",
                  }}
                />
              ))}
            </div>

            <GlowButton
              onClick={handleVerify}
              loading={loading}
              disabled={otp.join("").length < 6}
            >
              Verify Identity
            </GlowButton>

            <Link to="/login">
              <GlowButton variant="ghost">Back to Login</GlowButton>
            </Link>
          </div>
        </GlassCard>

        <p
          className="text-center mt-5 text-xs"
          style={{ color: "rgba(99,230,226,0.2)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
        >
          ◈ Chaos-based OTP · Behavior Vector Auth · SHA-256
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}