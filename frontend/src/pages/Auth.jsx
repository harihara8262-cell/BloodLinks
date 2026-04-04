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
    <div className="page-3d app-page">
      <div className="mx-auto w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="surface-3d app-card auth-shell"
        >
          <div className="auth-hero mb-7 overflow-hidden rounded-3xl">
            <div className="auth-hero-bg" />
            <div className="relative z-10 flex items-start justify-between gap-5 p-5 sm:p-6">
              <div>
                <div className="auth-kicker">{mode === "signup" ? "New member" : "Welcome back"}</div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {mode === "signup" ? "Create Account" : "Sign In"}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                  {mode === "signup"
                    ? "Join Bloodlink to register as a donor or search nearby blood donors during emergencies."
                    : "Access your account to search for donors or manage your donor profile."}
                </p>
              </div>
              <div className="auth-hero-icon">🩸</div>
            </div>
          </div>

          <div className="auth-mode-toggle mb-7">
            <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <motion.button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setConfirmPassword("");
                }}
                className={`auth-mode-btn ${
                  mode === "login" ? "auth-mode-btn-active" : "auth-mode-btn-inactive"
                }`}
                layoutId="auth-toggle"
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
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
                className={`auth-mode-btn ${
                  mode === "signup" ? "auth-mode-btn-active" : "auth-mode-btn-inactive"
                }`}
                layoutId="auth-toggle-2"
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
              >
                <span className="text-sm font-semibold">Register</span>
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <label className="auth-label mb-2 block text-sm font-semibold text-slate-700">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="app-input auth-input"
                placeholder="Enter your username"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            >
              <label className="auth-label mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input auth-input"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <p className="auth-helper mt-1.5 text-xs text-slate-500">Must be at least 8 characters long.</p>
            </motion.div>

            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
              >
                <label className="auth-label mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-input auth-input"
                  placeholder="Re-enter your password"
                  minLength={8}
                  required
                />
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700"
              >
                {error}
              </motion.div>
            )}

            <AnimatedButton
              type="submit"
              disabled={loading}
              className="auth-submit-btn mt-2 w-full rounded-xl px-4 py-3 font-bold text-white"
            >
              {loading ? "Processing..." : mode === "signup" ? "Create Account" : "Sign In"}
            </AnimatedButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
