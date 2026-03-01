import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ParticleField from "../components/ParticleField";
import GlassCard from "../components/GlassCard";
import FractalLogo from "../components/FractalLogo";
import GlassInput from "../components/GlassInput";
import GlowButton from "../components/GlowButton";
import Alert from "../components/Alert";
import { loginUser } from "../api";
import { useBehaviorVector } from "../hooks/useBehaviorVector";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const { getBehaviorVector, resetBehavior } = useBehaviorVector();

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      return setAlert({ message: "All fields are required.", type: "error" });
    }

    setLoading(true);
    setAlert(null);

    const behaviorVector = getBehaviorVector();

    try {
      const data = await loginUser(form.username, form.password, behaviorVector);
      resetBehavior();
      navigate("/verify-otp", {
        state: {
          userId: data.user_id,
          behaviorVector,
          // demoOtp removed — OTP is now sent to registered email
        },
      });
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
                Welcome Back
              </h1>
              <p
                className="mt-1 text-xs tracking-wider"
                style={{ color: "rgba(99,230,226,0.45)", fontFamily: "'Space Mono', monospace" }}
              >
                Authenticate your fractal identity
              </p>
            </div>

            <Alert {...(alert || { message: null })} />

            <GlassInput
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username"
            />
            <GlassInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
            />

            <div className="mt-2" />
            <GlowButton onClick={handleLogin} loading={loading}>
              Authenticate
            </GlowButton>
            <Link to="/register">
              <GlowButton variant="ghost">Create new account</GlowButton>
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
// import { loginUser } from "../api";
// import { useBehaviorVector } from "../hooks/useBehaviorVector";

// export default function Login() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState(null);

//   // Starts capturing keystrokes, mouse, clicks the moment this page mounts
//   const { getBehaviorVector, resetBehavior } = useBehaviorVector();

//   const handleLogin = async () => {
//     if (!form.username || !form.password) {
//       return setAlert({ message: "All fields are required.", type: "error" });
//     }

//     setLoading(true);
//     setAlert(null);

//     // Snapshot behavior at the exact moment the user hits submit
//     const behaviorVector = getBehaviorVector();

//     try {
//       const data = await loginUser(form.username, form.password, behaviorVector);
//       resetBehavior();
//       navigate("/verify-otp", {
//         state: {
//           userId: data.user_id,
//           behaviorVector,
//           demoOtp: data.generated_otp_for_demo,
//         },
//       });
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
//         <p
//           className="text-center mb-6 text-xs uppercase tracking-widest"
//           style={{ color: "rgba(99,230,226,0.35)", fontFamily: "'Space Mono', monospace" }}
//         >
//           Fractal Auth System
//         </p>

//         <GlassCard>
//           <div className="px-9 py-10" style={{ animation: "fadeUp 0.5s ease both" }}>
//             <div className="flex flex-col items-center mb-9">
//               <FractalLogo size={56} />
//               <h1
//                 className="mt-4 text-xl font-bold tracking-tight"
//                 style={{ color: "rgba(220,240,255,0.95)", fontFamily: "'Syne', sans-serif" }}
//               >
//                 Welcome Back
//               </h1>
//               <p
//                 className="mt-1 text-xs tracking-wider"
//                 style={{ color: "rgba(99,230,226,0.45)", fontFamily: "'Space Mono', monospace" }}
//               >
//                 Authenticate your fractal identity
//               </p>
//             </div>

//             <Alert {...(alert || { message: null })} />

//             <GlassInput
//               label="Username"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               placeholder="Enter your username"
//             />
//             <GlassInput
//               label="Password"
//               type="password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               placeholder="Enter your password"
//             />

//             <div className="mt-2" />
//             <GlowButton onClick={handleLogin} loading={loading}>
//               Authenticate
//             </GlowButton>
//             <Link to="/register">
//               <GlowButton variant="ghost">Create new account</GlowButton>
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
