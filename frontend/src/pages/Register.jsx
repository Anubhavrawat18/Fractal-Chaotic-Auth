import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ParticleField from "../components/ParticleField";
import GlassCard from "../components/GlassCard";
import FractalLogo from "../components/FractalLogo";
import GlassInput from "../components/GlassInput";
import GlowButton from "../components/GlowButton";
import Alert from "../components/Alert";
import { registerUser } from "../api";
import { useBehaviorVector } from "../hooks/useBehaviorVector";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const { getBehaviorVector, resetBehavior } = useBehaviorVector();

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      return setAlert({ message: "All fields are required.", type: "error" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setAlert({ message: "Please enter a valid email address.", type: "error" });
    }
    if (form.password !== form.confirm) {
      return setAlert({ message: "Passwords do not match.", type: "error" });
    }

    setLoading(true);
    setAlert(null);

    const behaviorVector = getBehaviorVector();

    try {
      await registerUser(form.username, form.email, form.password, behaviorVector);
      resetBehavior();
      setAlert({ message: "Account created. Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      setAlert({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: "#020c18" }}>
      <div
        className="fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(15,40,80,0.9) 0%, #020c18 60%)" }}
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
                Create Account
              </h1>
              <p
                className="mt-1 text-xs tracking-wider"
                style={{ color: "rgba(99,230,226,0.45)", fontFamily: "'Space Mono', monospace" }}
              >
                Initialize your fractal identity
              </p>
            </div>

            <Alert {...(alert || { message: null })} />

            <GlassInput
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Choose a username"
            />
            <GlassInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
            />
            <GlassInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Choose a password"
            />
            <GlassInput
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Repeat your password"
            />

            <div className="mt-2" />
            <GlowButton onClick={handleRegister} loading={loading}>
              Initialize Account
            </GlowButton>
            <Link to="/login">
              <GlowButton variant="ghost">Already have an account</GlowButton>
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
        input::placeholder { color: rgba(99,230,226,0.2); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}















// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import ParticleField from "../components/ParticleField";
// import GlassCard from "../components/GlassCard";
// import FractalLogo from "../components/FractalLogo";
// import GlassInput from "../components/GlassInput";
// import GlowButton from "../components/GlowButton";
// import Alert from "../components/Alert";
// import { registerUser } from "../api";
// import { useBehaviorVector } from "../hooks/useBehaviorVector";

// export default function Register() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ username: "", password: "", confirm: "" });
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState(null);

//   // Starts capturing keystrokes, mouse, clicks the moment this page mounts
//   const { getBehaviorVector, resetBehavior } = useBehaviorVector();

//   const handleRegister = async () => {
//     if (!form.username || !form.password) {
//       return setAlert({ message: "All fields are required.", type: "error" });
//     }
//     if (form.password !== form.confirm) {
//       return setAlert({ message: "Passwords do not match.", type: "error" });
//     }

//     setLoading(true);
//     setAlert(null);

//     // Snapshot behavior at submit — this becomes the user's baseline profile
//     const behaviorVector = getBehaviorVector();

//     try {
//       await registerUser(form.username, form.password, behaviorVector);
//       resetBehavior();
//       setAlert({ message: "Account created. Redirecting to login...", type: "success" });
//       setTimeout(() => navigate("/login"), 1500);
//     } catch (e) {
//       setAlert({ message: e.message, type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: "#020c18" }}>
//       {/* Background layers */}
//       <div
//         className="fixed inset-0 z-0"
//         style={{
//           background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(15,40,80,0.9) 0%, #020c18 60%)",
//         }}
//       />
//       <div
//         className="fixed inset-0 z-0"
//         style={{
//           backgroundImage: `
//             linear-gradient(rgba(99,230,226,0.025) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(99,230,226,0.025) 1px, transparent 1px)
//           `,
//           backgroundSize: "48px 48px",
//         }}
//       />
//       <ParticleField />

//       <div className="relative z-10 w-full max-w-md">
//         {/* Brand label */}
//         <p
//           className="text-center mb-6 text-xs uppercase tracking-widest"
//           style={{ color: "rgba(99,230,226,0.35)", fontFamily: "'Space Mono', monospace" }}
//         >
//           Fractal Auth System
//         </p>

//         <GlassCard>
//           <div className="px-9 py-10" style={{ animation: "fadeUp 0.5s ease both" }}>
//             {/* Header */}
//             <div className="flex flex-col items-center mb-9">
//               <FractalLogo size={56} />
//               <h1
//                 className="mt-4 text-xl font-bold tracking-tight"
//                 style={{ color: "rgba(220,240,255,0.95)", fontFamily: "'Syne', sans-serif" }}
//               >
//                 Create Account
//               </h1>
//               <p
//                 className="mt-1 text-xs tracking-wider"
//                 style={{ color: "rgba(99,230,226,0.45)", fontFamily: "'Space Mono', monospace" }}
//               >
//                 Initialize your fractal identity
//               </p>
//             </div>

//             <Alert {...(alert || { message: null })} />

//             <GlassInput
//               label="Username"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               placeholder="Choose a username"
//             />
//             <GlassInput
//               label="Password"
//               type="password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               placeholder="Choose a password"
//             />
//             <GlassInput
//               label="Confirm Password"
//               type="password"
//               value={form.confirm}
//               onChange={(e) => setForm({ ...form, confirm: e.target.value })}
//               placeholder="Repeat your password"
//             />

//             <div className="mt-2" />
//             <GlowButton onClick={handleRegister} loading={loading}>
//               Initialize Account
//             </GlowButton>
//             <Link to="/login">
//               <GlowButton variant="ghost">Already have an account</GlowButton>
//             </Link>
//           </div>
//         </GlassCard>

//         <p
//           className="text-center mt-5 text-xs"
//           style={{ color: "rgba(99,230,226,0.2)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
//         >
//           ◈ Chaos-based OTP · Behavior Vector Auth · SHA-256
//         </p>
//       </div>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700&display=swap');
//         input::placeholder { color: rgba(99,230,226,0.2); }
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
//     </div>
//   );
// }
