import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setMessage("If your email is registered, an OTP has been sent.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (Server sets HttpOnly cookie automatically)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("/auth/verify-otp", { email, otp });
      setMessage("OTP verified. Enter your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password (Browser sends HttpOnly cookie automatically)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", { newPassword });
      navigate("/login", { state: { message: "Password updated! Please log in." } });
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl border border-zinc-800">
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        {message && <p className="text-sm text-green-400 mb-4">{message}</p>}
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-red-500"
            />
            <button
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 tracking-widest text-center text-lg focus:outline-none focus:border-red-500"
            />
            <button
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-red-500"
            />
            <button
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}