import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register  from "./pages/Register";
import Login     from "./pages/Login";
import OTPVerify from "./pages/OTPVerify";
import Success   from "./pages/Success";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Navigate to="/login" replace />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/success"    element={<Success />} />
        <Route path="*"           element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}