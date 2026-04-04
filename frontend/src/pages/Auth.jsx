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
      <div className="mx-auto w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="surface-3d app-card"
        >
          <div className="mb-4 flex items-center gap-3">
            <img src="/bloodlink-logo.svg?v=4" alt="Bloodlink logo" className="h-12 w-12 rounded-xl bg-red-50 p-1.5" />
            <div>
              <h1 className="app-title text-3xl font-bold">{mode === "signup" ? "Bloodlink Sign Up" : "Bloodlink Login"}</h1>
              <p className="app-subtitle text-sm">
                {mode === "signup"
                  ? "Create account with username and password. Existing username can update password here."
                  : "Login for search and emergency access."}
              </p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setConfirmPassword("");
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setConfirmPassword("");
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                mode === "signup" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-flow-scene mb-6">
            <div className="auth-flow-track" />
            <div className="auth-flow-stream" />
            <div className="auth-flow-drop" />

            <div className="auth-human auth-human-donor" aria-hidden="true">
              <div className="auth-human-head" />
              <div className="auth-human-torso" />
              <div className="auth-human-arm auth-human-arm-left" />
              <div className="auth-human-arm auth-human-arm-right" />
              <div className="auth-human-leg auth-human-leg-left" />
              <div className="auth-human-leg auth-human-leg-right" />
            </div>

            <div className="auth-human auth-human-patient" aria-hidden="true">
              <div className="auth-human-head" />
              <div className="auth-human-torso" />
              <div className="auth-human-arm auth-human-arm-left" />
              <div className="auth-human-arm auth-human-arm-right" />
              <div className="auth-human-leg auth-human-leg-left" />
              <div className="auth-human-leg auth-human-leg-right" />
            </div>

            <span className="auth-flow-label auth-flow-label-donor">DONOR</span>
            <span className="auth-flow-label auth-flow-label-patient">PATIENT</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Username *</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="app-input"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input"
                placeholder="Enter password"
                minLength={8}
                required
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-input"
                  placeholder="Re-enter password"
                  minLength={8}
                  required
                />
              </div>
            )}

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

            <AnimatedButton
              type="submit"
              disabled={loading}
              className="app-pill-btn w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
            >
              {loading ? "Please wait..." : mode === "signup" ? "Register" : "Continue"}
            </AnimatedButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
