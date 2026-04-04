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

  const validateUsername = (username) => {
    if (username.length > 8) {
      return "Username cannot be more than 8 characters";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length > 8) {
      return "Password cannot be more than 8 characters";
    }
    return null;
  };

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

    const usernameError = validateUsername(username.trim());
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
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
          <h2 className="text-4xl font-bold text-white mb-2">Bloodlink</h2>
          <p className="text-sm font-medium text-red-200 track-wider uppercase mb-4">Donation Network</p>
          <p className="text-base text-red-100 max-w-sm leading-relaxed">
            Connecting people who save lives with those who need them most.
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="auth-benefit-icon text-2xl font-bold text-white" style={{minWidth: '2rem'}}>01</div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Locate Nearby Donors</h3>
              <p className="text-xs text-red-100">Find blood donors 5-20 km away in real-time</p>
            </div>
          </motion.div>

          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="auth-benefit-icon text-2xl font-bold text-white" style={{minWidth: '2rem'}}>02</div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Emergency Response</h3>
              <p className="text-xs text-red-100">Send urgent alerts for critical situations</p>
            </div>
          </motion.div>

          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="auth-benefit-icon text-2xl font-bold text-white" style={{minWidth: '2rem'}}>03</div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Secure & Private</h3>
              <p className="text-xs text-red-100">Your health data is encrypted and protected</p>
            </div>
          </motion.div>

          <motion.div
            className="auth-benefit-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="auth-benefit-icon text-2xl font-bold text-white" style={{minWidth: '2rem'}}>04</div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Instant Connection</h3>
              <p className="text-xs text-red-100">Connect with donors instantly when needed</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-red-300/30">
          <p className="text-xs text-red-100 uppercase tracking-wide font-medium">Trusted by healthcare professionals</p>
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
            className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-400" />

            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Secure Access
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="auth-icon-badge" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#d92d20'}}>●</div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bloodlink</h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Access Portal</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {mode === "signup"
                ? "Create your account to join the donor response network."
                : "Access your account to search, connect, and respond faster."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Verified Profiles
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Fast Match
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Privacy First
              </span>
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
              <label className="auth-label-premium mb-2.5 block text-sm font-medium text-slate-700">Username</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" style={{fontSize: '0.95rem', fontWeight: '600', color: '#64748b'}}>●</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.slice(0, 8))}
                  className="auth-input-premium"
                  placeholder="Your username"
                  maxLength={8}
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
              <label className="auth-label-premium mb-2.5 block text-sm font-medium text-slate-700">
                {mode === "signup" ? "Create Password" : "Password"}
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" style={{fontSize: '0.95rem', fontWeight: '600', color: '#64748b'}}>●</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 8))}
                  className="auth-input-premium"
                  placeholder={mode === "signup" ? "Create your password" : "Maximum 8 characters"}
                  maxLength={8}
                  required
                />
              </div>
            </motion.div>

            {/* Confirm Password Input - Signup Only */}
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label className="auth-label-premium mb-2.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon" style={{fontSize: '0.95rem', fontWeight: '600', color: '#64748b'}}>●</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value.slice(0, 8))}
                    className="auth-input-premium"
                    placeholder="Confirm your password"
                    maxLength={8}
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
                <span className="text-lg font-bold">!</span>
                <span className="text-sm">{error}</span>
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
            <p className="text-center text-xs text-slate-500 font-medium">
              {mode === "signup"
                ? "Already a member? "
                : "New to Bloodlink? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError("");
                }}
                className="font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                {mode === "signup" ? "Sign in" : "Register"}
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
