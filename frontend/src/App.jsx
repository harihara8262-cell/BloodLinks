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
  const { isAuthenticated, logout, hasRegisteredDonor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="app-nav app-nav-glow">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <img src="/bloodlink-logo.svg" alt="bloodlink" className="h-9 w-9 rounded-lg bg-red-50 p-1" />
          <span>Bloodlink</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {!hasRegisteredDonor && (
                <Link
                  to="/register"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Register as Donor
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="app-pill-btn rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { isAuthenticated, hasRegisteredDonor } = useAuth();
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <div className="starter-stage min-h-screen flex items-center justify-center px-4">
                    <motion.div
                      className="surface-3d app-card starter-card w-full max-w-xl text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <div className="blood-drop-wrap mb-5">
                        <div className="blood-drop" aria-hidden="true" />
                        <div className="blood-ripple" aria-hidden="true" />
                      </div>
                      <h1 className="app-title mb-2 text-4xl font-bold">Bloodlink</h1>
                      <p className="app-subtitle mb-6">
                        Every drop matters. Start by signing in to continue.
                      </p>
                      <div className="flex items-center justify-center gap-3 flex-wrap">
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
                      </div>
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
                    <div className="hero-stage min-h-screen px-4 py-10 sm:py-14">
                      <div className="hero-orb hero-orb-one" />
                      <div className="hero-orb hero-orb-two" />
                      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <motion.div
                          className="hero-card app-card surface-3d"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <h1 className="hero-title app-title mb-4 text-4xl font-bold sm:text-5xl">
                            <span className="inline-flex items-center gap-3">
                              <img src="/bloodlink-logo.svg" alt="bloodlink" className="h-12 w-12 rounded-xl bg-red-50 p-1.5" />
                              <span>Bloodlink</span>
                            </span>
                          </h1>
                          <p className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl">
                            Smart Nearby Blood Donor Finder
                          </p>
                          <p className="app-subtitle mb-8 max-w-xl leading-relaxed">
                            Connect patients with available blood donors within a 5 km radius using real-time location.
                            Reliable alerts, faster discovery, and smoother emergency response.
                          </p>

                          <motion.div
                            className="flex flex-wrap gap-3"
                            initial="hidden"
                            animate="show"
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                          >
                            {!hasRegisteredDonor && (
                              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                                <Link to="/register">
                                  <AnimatedButton className="app-pill-btn rounded-lg bg-red-600 px-7 py-3 font-bold text-white transition-colors hover:bg-red-700">
                                    Register as Donor
                                  </AnimatedButton>
                                </Link>
                              </motion.div>
                            )}
                            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                              <Link to="/search">
                                <AnimatedButton className="app-pill-btn rounded-lg bg-blue-600 px-7 py-3 font-bold text-white transition-colors hover:bg-blue-700">
                                  Find Donors
                                </AnimatedButton>
                              </Link>
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        <motion.div
                          className="surface-3d app-card grid gap-3"
                          initial={{ opacity: 0, y: 28 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.52, delay: 0.08, ease: "easeOut" }}
                        >
                          <div className="app-panel p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Live Radius</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">5 km</p>
                            <p className="mt-1 text-sm text-gray-600">Default intelligent donor matching zone</p>
                          </div>
                          <div className="app-panel p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Emergency Expansion</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">20 km</p>
                            <p className="mt-1 text-sm text-gray-600">Auto-expands in emergency mode</p>
                          </div>
                          <div className="app-panel p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Workflow</p>
                            <ol className="mt-2 space-y-1 text-sm text-gray-700">
                              <li>1. Login</li>
                              <li>2. Register donor</li>
                              <li>3. Search or trigger emergency alert</li>
                            </ol>
                          </div>
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
                      {hasRegisteredDonor ? <Navigate to="/search" replace /> : <Register />}
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
          </Routes>
        </AnimatePresence>
      </div>

      <footer className="content-layer bg-gray-800/95 text-gray-300 text-center py-6">
        <p>(c) 2024 Bloodlink. Connecting lives through blood donation.</p>
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
