import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser, registerUser } from "../api";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parseError = async (response, fallback) => {
    try {
      const data = await response.json();
      return data.detail || fallback;
    } catch {
      return fallback;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "signup" && form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const response = await registerUser({
          username: form.username,
          password: form.password,
          full_name: form.full_name,
        });
        if (!response.ok) {
          throw new Error(await parseError(response, "Registration failed"));
        }
        const data = await response.json();
        login(data.user);
        setMessage("Account created successfully");
        navigate("/home", { replace: true });
      } else {
        const response = await loginUser({ username: form.username, password: form.password });
        if (!response.ok) {
          throw new Error(await parseError(response, "Login failed"));
        }
        const data = await response.json();
        login(data.user);
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-3d app-page">
      <div className="mx-auto grid w-full max-w-5xl gap-5 pt-6 md:pt-10 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="surface-3d app-card flex flex-col justify-between"
        >
          <div>
            <h1 className="app-title mb-3 text-3xl font-bold">
              <span className="inline-flex items-center gap-2">
                <img src="/bloodlink-logo.svg" alt="bloodlink" className="h-9 w-9 rounded-lg bg-red-50 p-1" />
                <span>Bloodlink</span>
              </span>
            </h1>
            <p className="app-subtitle text-sm leading-relaxed">
              Every drop matters. Start by signing in to continue.
            </p>

            <div className="auth-flow-scene mt-5" aria-hidden="true">
              <div className="auth-flow-track" />
              <div className="auth-flow-stream" />

              <div className="auth-human auth-human-donor">
                <span className="auth-human-head" />
                <span className="auth-human-torso" />
                <span className="auth-human-arm auth-human-arm-left" />
                <span className="auth-human-arm auth-human-arm-right" />
                <span className="auth-human-leg auth-human-leg-left" />
                <span className="auth-human-leg auth-human-leg-right" />
              </div>

              <div className="auth-flow-drop" />

              <div className="auth-human auth-human-patient">
                <span className="auth-human-head" />
                <span className="auth-human-torso" />
                <span className="auth-human-arm auth-human-arm-left" />
                <span className="auth-human-arm auth-human-arm-right" />
                <span className="auth-human-leg auth-human-leg-left" />
                <span className="auth-human-leg auth-human-leg-right" />
              </div>

              <p className="auth-flow-label auth-flow-label-donor">Donor</p>
              <p className="auth-flow-label auth-flow-label-patient">Patient</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">Fast Access</p>
              <p className="mt-1 text-sm text-gray-700">Login in seconds with username and password.</p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Donor Workflow</p>
              <p className="mt-1 text-sm text-gray-700">Register details once and stay available for requests.</p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Emergency Ready</p>
              <p className="mt-1 text-sm text-gray-700">Trigger emergency alerts to matching donors quickly.</p>
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 24 }}
          className="surface-3d app-card"
        >
          <p className="app-subtitle mb-5 text-sm">Secure account access for donor registration and emergency workflows</p>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                mode === "login" ? "bg-white text-red-600 shadow" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                mode === "signup" ? "bg-white text-red-600 shadow" : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-4"
          >
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={onChange}
                className="app-input"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              className="app-input"
              placeholder="Minimum 4 characters"
              autoComplete="username"
              spellCheck={false}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="app-input"
              placeholder="Minimum 8 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              autoCapitalize="none"
              required
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}

          <AnimatedButton
            type="submit"
            disabled={loading}
            className="app-pill-btn w-full rounded-lg bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
          </AnimatedButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;