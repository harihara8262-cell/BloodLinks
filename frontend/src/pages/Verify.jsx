import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Email Verification Page
 * Users verify their email with OTP after registration
 */
const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || "");
  const [name, setName] = useState(location.state?.name || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [resendTimer]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/email/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Verification failed");
        return;
      }

      setMessage("✅ Email verified successfully!");
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/email/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          name: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to resend OTP");
        return;
      }

      setMessage("✅ OTP resent successfully!");
      setResendTimer(60); // 60 seconds cooldown
      setOtp("");

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-red-600 mb-4">❌ Error</h1>
          <p className="text-center text-gray-700 mb-6">
            No email found. Please register first.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-2">🩸 bloodlink</h1>
        <p className="text-center text-gray-600 mb-8">Verify Your Email</p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>We sent a verification code to:</strong>
          </p>
          <p className="text-sm font-semibold text-blue-600 break-all">{email}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter 6-Digit OTP *
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
              }}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-center text-2xl tracking-widest font-bold"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              OTP expires in 10 minutes
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "✓ Verify OTP"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={loading || resendTimer > 0}
            className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>

        <hr className="my-6" />

        <p className="text-xs text-gray-500 text-center">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default Verify;
