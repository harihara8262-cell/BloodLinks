import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import DonorCard from "../components/DonorCard";
import { searchDonors, emergencySearch, sendEmergencyAlert } from "../api";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const MapView = lazy(() => import("../components/MapView"));
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * Search Page Component
 * Allows patients to search for blood donors
 */
const Search = () => {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useState({
    blood_group: "O+",
    radius: 5,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [useEmergencyMode, setUseEmergencyMode] = useState(false);
  const [viewMode, setViewMode] = useState("map"); // 'list' or 'map'
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchMeta, setSearchMeta] = useState({
    donorsFound: 0,
    radius: 5,
    mode: "standard",
  });

  // Get user location on component mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = useCallback(() => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setMessage("📍 Location obtained successfully!");
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      }
    );
  }, []);

  const handleSearchChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === "radius" ? parseInt(value) || 5 : value,
    }));
  }, []);

  const executeSearch = async (forceEmergency = useEmergencyMode) => {
    if (!userLocation) {
      setError("Please get your location first");
      return false;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let result;

      if (forceEmergency) {
        result = await emergencySearch(
          searchParams.blood_group,
          userLocation.latitude,
          userLocation.longitude
        );
        setMessage(`🚨 ${result.message}`);
      } else {
        result = await searchDonors(
          searchParams.blood_group,
          userLocation.latitude,
          userLocation.longitude,
          searchParams.radius
        );
      }

      setDonors(result.donors || []);
      setSearchMeta({
        donorsFound: result.donors_found || 0,
        radius: result.search_radius || searchParams.radius,
        mode: forceEmergency ? "emergency" : "standard",
      });
      if (result.donors && result.donors.length > 0) {
        setSelectedDonor(result.donors[0]);
      } else {
        setSelectedDonor(null);
      }

      if (result.donors_found === 0) {
        setMessage(
          "🚨 No matching donors nearby right now. Try a wider radius or switch on Emergency Mode to alert faster."
        );
      } else {
        setMessage(
          `✅ Found ${result.donors_found} donor(s) within ${result.search_radius} km`
        );
      }
      return true;
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await executeSearch();
  };

  const handleEmergencyFabClick = async () => {
    if (!userLocation) {
      handleGetLocation();
      return;
    }
    setUseEmergencyMode(true);
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await sendEmergencyAlert({
        blood_group: searchParams.blood_group,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        requester_name: user?.full_name || user?.username || "A patient",
      });

      setDonors(result.donors || []);
      setSearchMeta({
        donorsFound: result.donors_found || 0,
        radius: result.search_radius || 20,
        mode: "emergency",
      });
      if (result.donors && result.donors.length > 0) {
        setSelectedDonor(result.donors[0]);
      } else {
        setSelectedDonor(null);
      }

      if ((result.notifications_sent || 0) > 0) {
        setMessage("✅ Alert sent successfully");
      } else if ((result.donors_found || 0) > 0) {
        const firstFailure = result.notification_failures?.[0]?.reason;
        const reasonText = firstFailure ? ` Reason: ${firstFailure}` : "";
        const missingConfig = (firstFailure || "").toLowerCase().includes("missing twilio config");
        const invalidNumber = (firstFailure || "").toLowerCase().includes("invalid recipient phone number");
        const dailyLimitReached =
          (firstFailure || "").toLowerCase().includes("daily message limit") ||
          (firstFailure || "").includes("63038");

        let actionText = " Please try again.";
        if (missingConfig) {
          actionText = " Configure Twilio credentials in backend/.env and restart backend.";
        } else if (dailyLimitReached) {
          actionText = " Twilio daily limit reached. Try again tomorrow or upgrade your Twilio account.";
        } else if (invalidNumber) {
          actionText = " Update donor phone numbers to valid mobile format and try again.";
        }

        setMessage(
          `⚠️ Found ${result.donors_found} donor(s), but SMS was not sent.${reasonText}${actionText}`
        );
      } else {
        setMessage("🚨 No donors found even in 20 km. Stay calm and try again in a moment.");
      }
    } catch (err) {
      setError(`Emergency alert failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCallDonor = (donor) => {
    // In a real app, this would integrate with SMS/calling service
    alert(
      `Calling ${donor.name}\nPhone: ${donor.phone}\n\nIn production, this would initiate a call.`
    );
  };

  return (
    <div className="page-3d app-page">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[340px_1fr]">
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="surface-3d app-card h-fit sticky top-24 self-start"
        >
          <h1 className="app-title mb-2 text-3xl font-bold">🩸 Bloodlink</h1>
          <p className="app-subtitle mb-5 text-sm">Find nearby donors quickly with flexible radius, live map view, and emergency outreach.</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Blood Group *</label>
              <select
                name="blood_group"
                value={searchParams.blood_group}
                onChange={handleSearchChange}
                className="app-select"
              >
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Search Radius (km)</label>
              <input
                type="number"
                name="radius"
                value={searchParams.radius}
                onChange={handleSearchChange}
                min="1"
                max="50"
                className="app-number"
              />
            </div>

            <AnimatedButton
              type="button"
              onClick={handleGetLocation}
              disabled={loading}
              className="app-pill-btn w-full rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              📍 Get Location
            </AnimatedButton>

            <div className="app-panel p-2">
              <button
                type="button"
                onClick={() => setUseEmergencyMode((prev) => !prev)}
                className={`w-full rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  useEmergencyMode
                    ? "bg-yellow-200 text-yellow-900 ring-2 ring-yellow-400"
                    : "bg-white text-gray-700 hover:bg-yellow-100"
                }`}
                aria-pressed={useEmergencyMode}
              >
                {useEmergencyMode ? "✅" : "🚨"} Emergency Mode
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`app-pill-btn rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📋 List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`app-pill-btn rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                🗺️ Map
              </button>
            </div>

            <AnimatedButton
              type="submit"
              disabled={loading || !userLocation}
              className="app-pill-btn w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Searching..." : "🔍 Search Donors"}
            </AnimatedButton>

            <AnimatedButton
              type="button"
              onClick={handleEmergencyFabClick}
              disabled={loading}
              className="app-pill-btn w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              🚨 Send Emergency Alert
            </AnimatedButton>
          </form>

          <div className="app-panel mt-4 p-3 text-xs text-gray-700">
            Tip: Start with normal search, then switch to emergency mode if no donors are found.
          </div>
        </motion.aside>

        <section className="space-y-4">
          <div className="app-panel flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">i</span>
            <p className="text-sm font-medium text-slate-700">
              {searchMeta.donorsFound > 0
                ? `${searchMeta.donorsFound} donor(s) found within ${searchMeta.radius} km (${searchMeta.mode} mode).`
                : `No donors found yet. Current radius: ${searchMeta.radius} km (${searchMeta.mode} mode).`}
            </p>
          </div>

          {message && (
            <div className="app-panel rounded-lg border border-blue-200 bg-blue-50/95 p-3 text-blue-800 shadow-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="app-panel rounded-lg border border-red-200 bg-red-50/95 p-3 text-red-800 shadow-sm">
              {error}
            </div>
          )}

          <LayoutGroup>
          {loading && donors.length === 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="rounded-xl bg-white p-6 shadow-md animate-pulse">
                  <div className="h-5 w-1/2 rounded bg-gray-200 mb-4" />
                  <div className="h-4 w-1/3 rounded bg-gray-200 mb-3" />
                  <div className="h-3 w-full rounded bg-gray-200 mb-2" />
                  <div className="h-3 w-4/5 rounded bg-gray-200 mb-6" />
                  <div className="h-10 w-full rounded bg-gray-200" />
                </div>
              ))}
            </motion.div>
          )}

          {donors.length > 0 && (
            <div>
              {viewMode === "list" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">📌 Available Donors ({donors.length})</h2>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.08 } },
                    }}
                  >
                    {donors.map((donor) => (
                      <DonorCard
                        key={donor.id}
                        donor={donor}
                        onCall={handleCallDonor}
                        onViewMap={(d) => {
                          setSelectedDonor(d);
                          setViewMode("map");
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              )}

              {viewMode === "map" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">🗺️ Donors on Map ({donors.length})</h2>
                  <Suspense
                    fallback={
                      <div className="surface-3d flex h-[520px] items-center justify-center rounded-xl bg-white/90 text-sm font-semibold text-gray-600">
                        Loading map...
                      </div>
                    }
                  >
                    <MapView userLocation={userLocation} donors={donors} selectedDonor={selectedDonor} />
                  </Suspense>

                  <AnimatePresence>
                    {selectedDonor && (
                      <motion.div
                        layoutId={`donor-${selectedDonor.id}`}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 22 }}
                        className="surface-3d mt-4 rounded-xl bg-white/95 p-5 border border-gray-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{selectedDonor.name}</h3>
                            <p className="text-sm text-gray-500">{selectedDonor.city}</p>
                          </div>
                          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                            {selectedDonor.blood_group}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">{selectedDonor.address}</p>
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                          {selectedDonor.distance} km away
                        </p>
                        <div className="mt-4 flex gap-2">
                          <AnimatedButton
                            onClick={() => handleCallDonor(selectedDonor)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
                          >
                            📞 Call
                          </AnimatedButton>
                          <AnimatedButton
                            onClick={() => setSelectedDonor(null)}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-300"
                          >
                            Close
                          </AnimatedButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {!loading && donors.length === 0 && message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="app-empty p-8 text-center"
              >
                <motion.div
                  className="mx-auto mb-4 text-4xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🚨
                </motion.div>
                <p className="text-gray-800 text-xl font-bold">No donors found nearby yet</p>
                <p className="text-gray-700 mt-2">
                  Expand your radius, refresh location, or trigger Emergency Mode to reach more donors quickly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          </LayoutGroup>
        </section>
      </div>
    </div>
  );
};

export default Search;
