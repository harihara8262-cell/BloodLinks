import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import AnimatedButton from "./components/AnimatedButton";
import "./App.css";

const Auth = lazy(() => import("./pages/Auth"));
const Register = lazy(() => import("./pages/Register"));
const Search = lazy(() => import("./pages/Search"));
const Profile = lazy(() => import("./pages/Profile"));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="surface-3d rounded-xl bg-white/90 px-6 py-4 text-sm font-semibold text-gray-700">
        Loading page...
      </div>
    </div>
  );
}

function Navigation() {
  const { isAuthenticated, logout, hasRegisteredDonor, canRegisterDonor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== "/";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="app-nav app-nav-glow">
      <div className="app-nav-inner mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="app-nav-brand flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <img src="/bloodlink-logo.svg?v=4" alt="bloodlink" className="h-9 w-9 rounded-lg bg-red-50 p-1" />
          <span>Bloodlink</span>
        </Link>
        <div className="app-nav-actions flex flex-wrap items-center gap-2 sm:gap-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="app-nav-btn rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Back
            </button>
          )}
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="app-nav-btn rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Profile
              </Link>
              {canRegisterDonor && !hasRegisteredDonor && (
                <Link
                  to="/register"
                  className="app-nav-btn rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Register as Donor
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="app-nav-btn app-pill-btn rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="app-nav-btn rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function MobileAppNav() {
  const { isAuthenticated, hasRegisteredDonor, canRegisterDonor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthRoute = location.pathname === "/auth";
  const isRootRoute = location.pathname === "/";

  const tabs = isAuthenticated
    ? [
        { to: "/home", label: "Home", icon: "home" },
        ...(canRegisterDonor && !hasRegisteredDonor ? [{ to: "/register", label: "Register", icon: "register" }] : []),
        { to: "/search", label: "Search", icon: "search" },
        { to: "/profile", label: "Profile", icon: "profile" },
      ]
    : [
        { to: "/", label: "Start", icon: "home" },
        { to: "/auth", label: "Access", icon: "access" },
      ];

  const TabIcon = ({ name }) => {
    if (name === "home") {
      return (
        <svg viewBox="0 0 24 24" className="mobile-app-tab-icon" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.8a.7.7 0 0 1-.7-.7v-4a1.5 1.5 0 0 0-3 0v4a.7.7 0 0 1-.7.7H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    }

    if (name === "register") {
      return (
        <svg viewBox="0 0 24 24" className="mobile-app-tab-icon" aria-hidden="true">
          <path d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.8 0-7 2-7 4.4V20h8.2a4.8 4.8 0 0 1-.2-1.2V17h-2v-2h2v-2h2v2h2v2h-2v1.8c0 .4.1.8.3 1.2H19v-2.6c0-2.4-3.2-4.4-7-4.4Zm7-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2Z" />
        </svg>
      );
    }

    if (name === "search") {
      return (
        <svg viewBox="0 0 24 24" className="mobile-app-tab-icon" aria-hidden="true">
          <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.8 10.4 3.3 3.3-1.4 1.4-3.3-3.3 1.4-1.4Z" />
        </svg>
      );
    }

    if (name === "access") {
      return (
        <svg viewBox="0 0 24 24" className="mobile-app-tab-icon" aria-hidden="true">
          <path d="M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5Zm3 7V7a3 3 0 0 0-6 0v2h6Zm-3 4a2 2 0 0 1 1 3.7V19h-2v-2.3a2 2 0 0 1 1-3.7Z" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" className="mobile-app-tab-icon" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.1-8 4.7V22h16v-3.3c0-2.6-3.6-4.7-8-4.7Z" />
      </svg>
    );
  };

  if (!isAuthenticated && !isRootRoute && !isAuthRoute) {
    return null;
  }

  return (
    <div className="mobile-app-nav-wrap content-layer" aria-hidden="false">
      <nav className="mobile-app-nav" aria-label="Mobile app navigation">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <button
              key={tab.to}
              type="button"
              onClick={() => navigate(tab.to)}
              className={active ? "mobile-app-tab is-active" : "mobile-app-tab"}
            >
              <span className="mobile-app-tab-badge">
                <TabIcon name={tab.icon} />
              </span>
              <span className="mobile-app-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, hasRegisteredDonor, canRegisterDonor } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
    const smallScreen = window.matchMedia("(max-width: 900px)").matches;
    document.documentElement.setAttribute("data-performance", lowCpu || lowMemory || smallScreen ? "lite" : "full");
  }, []);

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <div className="moving-bg" aria-hidden="true">
        <div className="moving-bg-layer moving-bg-gradient" />
        <div className="moving-bg-layer moving-bg-grid" />
        <div className="moving-bg-layer moving-bg-glow" />
      </div>

      <Navigation />

      <div className="content-layer flex-grow">
        <AnimatePresence mode="sync" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <div className="starter-stage min-h-screen flex items-center justify-center px-4">
                    <motion.div
                      className="surface-3d app-card starter-card w-full max-w-2xl text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      <div className="starter-card-bg starter-card-bg-one" aria-hidden="true" />
                      <div className="starter-card-bg starter-card-bg-two" aria-hidden="true" />

                      <motion.div
                        className="blood-drop-wrap mb-5"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.26, delay: 0.04, ease: "easeOut" }}
                      >
                        <div className="blood-drop" aria-hidden="true" />
                        <div className="blood-ripple" aria-hidden="true" />
                      </motion.div>

                      <motion.h1
                        className="app-title starter-title mb-2 text-4xl font-bold sm:text-5xl"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, delay: 0.08, ease: "easeOut" }}
                      >
                        Bloodlink
                      </motion.h1>

                      <motion.p
                        className="app-subtitle mb-6 text-base sm:text-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, delay: 0.11, ease: "easeOut" }}
                      >
                        Every drop matters. Start by signing in to continue.
                      </motion.p>

                      <motion.div
                        className="starter-divider"
                        initial={{ opacity: 0, scaleX: 0.7 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.22, delay: 0.13, ease: "easeOut" }}
                      />

                      <motion.div
                        className="starter-cta-row flex items-center justify-center gap-3 flex-wrap"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.16, ease: "easeOut" }}
                      >
                        {!isAuthenticated && (
                          <Link to="/auth">
                            <AnimatedButton className="app-pill-btn rounded-lg bg-red-600 px-7 py-3 font-bold text-white transition-colors hover:bg-red-700">
                              Login / Sign Up
                            </AnimatedButton>
                          </Link>
                        )}
                        {isAuthenticated && (
                          <Link to="/home">
                            <AnimatedButton className="app-pill-btn rounded-lg bg-blue-600 px-7 py-3 font-bold text-white transition-colors hover:bg-blue-700">
                              Continue to App
                            </AnimatedButton>
                          </Link>
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                </PageTransition>
              }
            />

            <Route
              path="/auth"
              element={
                <PageTransition>
                  <Suspense fallback={<RouteFallback />}>
                    <Auth />
                  </Suspense>
                </PageTransition>
              }
            />

            <Route
              path="/home"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <div className="home-stage min-h-screen px-4 py-10 sm:py-12">
                      <div className="hero-orb hero-orb-one" />
                      <div className="hero-orb hero-orb-two" />
                      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:gap-8">
                        <motion.div
                          className="home-hero surface-3d overflow-hidden rounded-3xl"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <div className="home-hero-bg" />
                          <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                                  <h1 className="mt-0 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                <span className="inline-flex items-center gap-3">
                                  <img src="/bloodlink-logo.svg?v=4" alt="bloodlink" className="h-12 w-12 rounded-lg bg-red-50 p-1 ring-1 ring-red-100" />
                                  <span>Bloodlink</span>
                                </span>
                              </h1>
                              <p className="mt-4 text-xl font-semibold text-slate-800 sm:text-2xl">
                                Smart Nearby Blood Donor Finder
                              </p>
                              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                Connect patients with available blood donors within a 5 km radius using real-time location. Faster discovery and smoother donor matching.
                              </p>

                              <motion.div
                                className="mt-6 flex flex-wrap gap-3"
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                              >
                                {canRegisterDonor && !hasRegisteredDonor && (
                                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                                    <Link to="/register">
                                      <AnimatedButton className="home-btn-register rounded-2xl px-7 py-3 font-bold text-white">
                                        Register as Donor
                                      </AnimatedButton>
                                    </Link>
                                  </motion.div>
                                )}
                                <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                                  <Link to="/search">
                                    <AnimatedButton className="home-btn-search rounded-2xl px-7 py-3 font-bold text-white">
                                      Find Donors
                                    </AnimatedButton>
                                  </Link>
                                </motion.div>
                              </motion.div>
                            </div>
                            <div className="home-hero-icon text-5xl sm:text-6xl">🩸</div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="grid gap-6 md:grid-cols-3"
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: {},
                            show: {
                              transition: { staggerChildren: 0.1, delayChildren: 0.15 },
                            },
                          }}
                        >
                          <motion.div
                            className="home-feature-card surface-3d overflow-hidden rounded-2xl border border-slate-200"
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -6 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <div className="home-feature-bg" style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.08))" }} />
                            <div className="relative z-10 p-6">
                              <div className="home-feature-icon text-3xl">📍</div>
                              <h3 className="mt-4 text-lg font-bold text-slate-900">Live Radius</h3>
                              <p className="mt-1 text-3xl font-bold text-blue-600">5 km</p>
                              <p className="mt-3 text-sm leading-6 text-slate-600">Default intelligent donor matching zone for optimal coverage</p>
                            </div>
                          </motion.div>

                          <motion.div
                            className="home-feature-card surface-3d overflow-hidden rounded-2xl border border-slate-200"
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -6 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <div className="home-feature-bg" style={{ background: "linear-gradient(135deg, rgba(217, 45, 32, 0.1), rgba(239, 68, 68, 0.08))" }} />
                            <div className="relative z-10 p-6">
                              <div className="home-feature-icon text-3xl">🚨</div>
                              <h3 className="mt-4 text-lg font-bold text-slate-900">Expanded Search</h3>
                              <p className="mt-1 text-3xl font-bold text-red-600">20 km</p>
                              <p className="mt-3 text-sm leading-6 text-slate-600">Allows broader donor discovery when the initial radius is too narrow</p>
                            </div>
                          </motion.div>

                          <motion.div
                            className="home-feature-card surface-3d overflow-hidden rounded-2xl border border-slate-200"
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -6 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <div className="home-feature-bg" style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.08))" }} />
                            <div className="relative z-10 p-6">
                              <div className="home-feature-icon text-3xl">⚡</div>
                              <h3 className="mt-4 text-lg font-bold text-slate-900">Quick Workflow</h3>
                              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-green-600">1.</span>
                                  <span>Login to your account</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-green-600">2.</span>
                                  <span>Register as a donor</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-green-600">3.</span>
                                  <span>Search donors</span>
                                </li>
                              </ol>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  </ProtectedRoute>
                </PageTransition>
              }
            />

            <Route
              path="/register"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      {hasRegisteredDonor || !canRegisterDonor ? <Navigate to="/home" replace /> : <Register />}
                    </Suspense>
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/search"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Search />
                    </Suspense>
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Profile />
                    </Suspense>
                  </ProtectedRoute>
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      <MobileAppNav />

      <footer className="app-footer content-layer bg-gray-800/95 text-gray-300 text-center py-6">
        <p>(c) {new Date().getFullYear()} Bloodlink. Connecting lives through blood donation.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
