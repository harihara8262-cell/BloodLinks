import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import DonorCard from "../components/DonorCard";
import { searchDonors, emergencySearch, sendEmergencyAlert } from "../api";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const MapView = lazy(() => import("../components/MapView"));
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Search = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({ blood_group: "O+", radius: 5 });
  const [userLocation, setUserLocation] = useState(null);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [useEmergencyMode, setUseEmergencyMode] = useState(false);
  const [viewMode, setViewMode] = useState("map");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchMeta, setSearchMeta] = useState({ donorsFound: 0, radius: 5, mode: "standard" });

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
        setMessage("Location captured successfully.");
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
        setMessage(result.message || "Emergency search activated.");
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
        setMessage("No matching donors found nearby. Increase the radius or enable Emergency Mode.");
      } else {
        setMessage(`Found ${result.donors_found} donor(s) within ${result.search_radius} km.`);
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
        setMessage("Emergency alert sent successfully.");
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

        setMessage(`Found ${result.donors_found} donor(s), but SMS could not be sent.${reasonText}${actionText}`);
      } else {
        setMessage("No donors were found within 20 km. Please retry in a moment.");
      }
    } catch (err) {
      setError(`Emergency alert failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCallDonor = (donor) => {
    alert(`Calling ${donor.name}\nPhone: ${donor.phone}\n\nIn production, this would initiate a call.`);
  };

  return (
    <div className="search-stage min-h-screen px-4 py-8 sm:py-10">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-fit self-start lg:sticky lg:top-24"
        >
          <div className="search-sidebar surface-3d overflow-hidden rounded-3xl lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="search-sidebar-header">
              <div className="search-sidebar-bg" />
              <div className="search-sidebar-content relative z-10 p-6">
                <div className="search-kicker">Search Mode</div>
                <h1 className="search-sidebar-title mt-4">Find Donors</h1>
                <p className="search-sidebar-subtitle mt-3">Quick access to nearby blood donors</p>
                <div className="search-header-metrics mt-5">
                  <span className="search-header-chip">Live Tracking</span>
                  <span className="search-header-chip">Geo Verified</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-5 p-6 md:space-y-5 md:p-7">
              <div>
                <label className="search-label">Blood Group *</label>
                <select
                  name="blood_group"
                  value={searchParams.blood_group}
                  onChange={handleSearchChange}
                  className="search-select"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="search-label">Radius (km)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    name="radius"
                    value={searchParams.radius}
                    onChange={handleSearchChange}
                    min="1"
                    max="50"
                    className="search-slider flex-1"
                  />
                  <div className="search-radius-display">{searchParams.radius}</div>
                </div>
              </div>

              <AnimatedButton
                type="button"
                onClick={handleGetLocation}
                disabled={loading}
                className="search-btn-location w-full"
              >
                Get Location
              </AnimatedButton>

              <div className="search-emergency-toggle">
                <button
                  type="button"
                  onClick={() => setUseEmergencyMode((prev) => !prev)}
                  className={useEmergencyMode ? "search-emergency-active" : "search-emergency-inactive"}
                  aria-pressed={useEmergencyMode}
                >
                  {useEmergencyMode ? (
                    <>
                      Emergency Mode Active
                    </>
                  ) : (
                    <>Normal Mode</>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "search-view-btn search-view-active" : "search-view-btn search-view-inactive"}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={viewMode === "map" ? "search-view-btn search-view-active" : "search-view-btn search-view-inactive"}
                >
                  Map
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnimatedButton
                  type="submit"
                  disabled={loading || !userLocation}
                  className="search-btn-search"
                >
                  {loading ? "Searching..." : "Search"}
                </AnimatedButton>

                <AnimatedButton
                  type="button"
                  onClick={handleEmergencyFabClick}
                  disabled={loading}
                  className="search-btn-emergency"
                >
                  Alert
                </AnimatedButton>
              </div>

              <div className="search-tip">
                <p className="text-xs leading-5">
                  <span className="font-bold">Tip:</span> Start with normal search. Use Emergency Mode only when required.
                </p>
              </div>
            </form>
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <div className="search-status-card">
            <div className={`search-status-icon ${searchMeta.donorsFound > 0 ? "is-ok" : "is-info"}`}>
              <span className="search-status-core" />
              <span className="search-status-ring" />
              <span className="search-status-label">{searchMeta.donorsFound > 0 ? "Live" : "Scan"}</span>
            </div>
            <p className="search-status-text">
              {searchMeta.donorsFound > 0
                ? `${searchMeta.donorsFound} donor(s) within ${searchMeta.radius} km`
                : `Current radius: ${searchMeta.radius} km (${searchMeta.mode} mode)`}
            </p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="search-message-success"
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="search-message-error"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <LayoutGroup>
            {loading && donors.length === 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="search-donor-skeleton">
                    <div className="h-6 w-1/2 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 mb-4 animate-pulse" />
                    <div className="h-4 w-1/3 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 mb-3 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />
                      <div className="h-3 w-4/5 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {donors.length > 0 && (
              <div>
                {viewMode === "list" && (
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="search-results-header"
                    >
                      Available Donors ({donors.length})
                    </motion.h2>
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
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
                    <motion.h2
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="search-results-header"
                    >
                      Donors on Map ({donors.length})
                    </motion.h2>
                    <Suspense
                      fallback={
                        <div className="search-map-loader">
                          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            Loading map...
                          </motion.div>
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
                          className="search-donor-detail"
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="search-donor-name">{selectedDonor.name}</h3>
                              <p className="search-donor-location">{selectedDonor.city}</p>
                            </div>
                            <span className="search-blood-badge">{selectedDonor.blood_group}</span>
                          </div>
                          <p className="search-donor-address">{selectedDonor.address}</p>
                          <p className="search-donor-distance">Distance: {selectedDonor.distance} km</p>
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <AnimatedButton
                              onClick={() => handleCallDonor(selectedDonor)}
                              className="search-btn-call"
                            >
                              Call
                            </AnimatedButton>
                            <AnimatedButton
                              onClick={() => setSelectedDonor(null)}
                              className="search-btn-close"
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
                  className="search-empty-state"
                >
                  <motion.div
                    className="search-empty-icon"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="search-radar-core" />
                    <span className="search-radar-ring search-radar-ring-1" />
                    <span className="search-radar-ring search-radar-ring-2" />
                  </motion.div>
                  <p className="search-empty-title">No donors found nearby</p>
                  <p className="search-empty-text">
                    Increase your radius, refresh location, or enable Emergency Mode to reach more donors.
                  </p>
                  <motion.button
                    onClick={handleGetLocation}
                    className="search-btn-retry mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Refresh Location
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </motion.section>
      </div>
    </div>
  );
};

export default Search;
