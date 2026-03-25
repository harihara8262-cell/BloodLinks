import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Verify from "./pages/Verify";
import "./App.css";

/**
 * Main App Component
 * Routing and navigation
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-red-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
              🩸 bloodlink
            </Link>
            <div className="flex gap-6">
              <Link to="/register" className="hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                Register as Donor
              </Link>
              <Link to="/search" className="hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                Find Donors
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
                <div className="max-w-2xl text-center">
                  <h1 className="text-5xl font-bold text-red-600 mb-4">🩸 bloodlink</h1>
                  <p className="text-2xl text-gray-700 mb-8">
                    Smart Nearby Blood Donor Finder
                  </p>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Connect patients with available blood donors within a 5 km radius.
                    Fast, secure, and life-saving.
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Link
                      to="/register"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                      Register as Donor
                    </Link>
                    <Link
                      to="/search"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                      Find Donors
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/search" element={<Search />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
          <p>© 2024 bloodlink. Connecting lives through blood donation.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
