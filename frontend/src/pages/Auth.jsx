import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api";

const Auth = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const targetPath = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Confirm password must match password");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const signupResult = await registerUser({
          username: username.trim(),
          password,
        });
        signup({
          username: signupResult?.username || username.trim(),
          full_name: signupResult?.username || username.trim(),
        });
      } else {
        const loginResult = await loginUser({
          username: username.trim(),
          password,
        });
        login({
          username: loginResult?.username || username.trim(),
          full_name: loginResult?.username || username.trim(),
        });
      }

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium min-h-screen flex items-stretch overflow-hidden">
      {/* Background Decorations */}
      <div className="auth-page-bg">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
      </div>

      {/* Left Side - Benefits Panel */}
      <motion.div
        className="auth-benefits-panel hidden lg:flex flex-col justify-center px-12 py-16"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Bloodlink</h2>
          <p className="text-lg text-red-100 max-w-sm leading-relaxed">
            Connect lives through blood donation. Every drop matters.
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="auth-benefit-icon">📍</div>
            <div>
              <h3 className="font-bold text-white mb-1">Find Nearby Donors</h3>
              <p className="text-sm text-red-100">Locate blood donors within 5-20 km radius in real-time</p>
            </div>
          </motion.div>

          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="auth-benefit-icon">🚨</div>
            <div>
              <h3 className="font-bold text-white mb-1">Emergency Mode</h3>
              <p className="text-sm text-red-100">Send urgent alerts to donors for critical situations</p>
            </div>
          </motion.div>

          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="auth-benefit-icon">🛡️</div>
            <div>
              <h3 className="font-bold text-white mb-1">Secure & Private</h3>
              <p className="text-sm text-red-100">Your health data is encrypted and protected</p>
            </div>
          </motion.div>

          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="auth-benefit-icon">⚡</div>
            <div>
              <h3 className="font-bold text-white mb-1">Lightning Fast</h3>
              <p className="text-sm text-red-100">Connect with donors instantly when you need it most</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-red-300/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✨</span>
            <p className="text-sm text-red-100">Trusted by thousands of lives saved</p>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form Panel */}
      <motion.div
        className="auth-form-panel flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      >
        <div className="mx-auto w-full max-w-md">
          {/* Form Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="auth-icon-badge">🩸</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bloodlink</h1>
                <p className="text-sm text-slate-500">Every drop matters</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600 mt-2">
              {mode === "signup"
                ? "Create an account to start saving lives"
                : "Sign in to access your account and find donors"}
            </p>
          </motion.div>

          {/* Mode Toggle */}
          <motion.div
            className="auth-toggle-enhanced mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="inline-flex gap-1 p-1.5 bg-slate-100 rounded-2xl">
              <motion.button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setConfirmPassword("");
                }}
                className={`auth-toggle-btn ${
                  mode === "login" ? "auth-toggle-btn-active" : "auth-toggle-btn-inactive"
                }`}
                layoutId="auth-toggle-premium"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-sm font-semibold">Sign In</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setConfirmPassword("");
                }}
                className={`auth-toggle-btn ${
                  mode === "signup" ? "auth-toggle-btn-active" : "auth-toggle-btn-inactive"
                }`}
                layoutId="auth-toggle-premium-2"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-sm font-semibold">Register</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="auth-label-premium mb-2.5 block">Username</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">👤</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input-premium"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <label className="auth-label-premium mb-2.5 block">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-premium"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
              {mode === "login" && (
                <p className="auth-input-hint mt-2">8+ characters for security</p>
              )}
            </motion.div>

            {/* Confirm Password Input - Signup Only */}
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label className="auth-label-premium mb-2.5 block">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">✓</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input-premium"
                    placeholder="Re-enter your password"
                    minLength={8}
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="auth-error-banner"
              >
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: mode === "signup" ? 0.45 : 0.4 }}
            >
              <AnimatedButton
                type="submit"
                disabled={loading}
                className="auth-submit-btn-premium w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading-spinner"></span>
                    Processing...
                  </span>
                ) : mode === "signup" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </AnimatedButton>
            </motion.div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-500">Secure & Encrypted</span>
              </div>
            </div>

            {/* Footer Info */}
            <p className="text-center text-xs text-slate-500">
              {mode === "signup"
                ? "Already have an account? "
                : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError("");
                }}
                className="font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                {mode === "signup" ? "Sign in here" : "Register here"}
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
