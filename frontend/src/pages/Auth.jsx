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
    if (username.length <= 8) {
      return "Username must be more than 8 characters";
    }
    if (!/[A-Z]/.test(username)) {
      return "Username must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(username)) {
      return "Username must contain at least one lowercase letter";
    }
    if (!/\d/.test(username)) {
      return "Username must contain at least one number";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(username)) {
      return "Username must contain at least one special character (!@#$%^&*)";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length <= 8) {
      return "Password must be more than 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
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
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="auth-icon-badge" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#d92d20'}}>●</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bloodlink</h1>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Access Portal</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600 mt-3">
              {mode === "signup"
                ? "Create your account to join our donor network"
                : "Access your account to find and connect with donors"}
            </p>
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
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input-premium"
                  placeholder="Your username"
                  required
                />
              </div>
              <p className="auth-input-hint mt-2 text-xs text-slate-500">
                {username.length <= 8 ? '✗' : '✓'} More than 8 characters • {/[A-Z]/.test(username) ? '✓' : '✗'} Uppercase • {/[a-z]/.test(username) ? '✓' : '✗'} Lowercase • {/\d/.test(username) ? '✓' : '✗'} Number • {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(username) ? '✓' : '✗'} Special
              </p>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <label className="auth-label-premium mb-2.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" style={{fontSize: '0.95rem', fontWeight: '600', color: '#64748b'}}>●</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-premium"
                  placeholder="9+ characters, mixed case, number & special char"
                  minLength={9}
                  required
                />
              </div>
              <p className="auth-input-hint mt-2 text-xs text-slate-500">
                {password.length <= 8 ? '✗' : '✓'} More than 8 chars • {/[A-Z]/.test(password) ? '✓' : '✗'} Uppercase • {/[a-z]/.test(password) ? '✓' : '✗'} Lowercase • {/\d/.test(password) ? '✓' : '✗'} Number • {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '✗'} Special
              </p>
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input-premium"
                    placeholder="Confirm your password"
                  minLength={9}
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
