import React, { useState, useEffect } from "react";
import DonorCard from "../components/DonorCard";
import MapView from "../components/MapView";
import { searchDonors, emergencySearch } from "../api";

/**
 * Search Page Component
 * Allows patients to search for blood donors
 */
const Search = () => {
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'

  // Get user location on component mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
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
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === "radius" ? parseInt(value) || 5 : value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!userLocation) {
      setError("Please get your location first");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let result;

      if (useEmergencyMode) {
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

      if (result.donors_found === 0) {
        setMessage(
          "❌ No donors found. Try increasing search radius or use Emergency Mode."
        );
      } else {
        setMessage(
          `✅ Found ${result.donors_found} donor(s) within ${result.search_radius} km`
        );
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">🩸 bloodlink</h1>
          <p className="text-gray-700">Find Blood Donors Near You</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group *
                </label>
                <select
                  name="blood_group"
                  value={searchParams.blood_group}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Radius */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Radius (km)
                </label>
                <input
                  type="number"
                  name="radius"
                  value={searchParams.radius}
                  onChange={handleSearchChange}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  📍 Get Location
                </button>
              </div>
            </div>

            {/* Emergency Mode Toggle */}
            <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
              <input
                type="checkbox"
                checked={useEmergencyMode}
                onChange={(e) => setUseEmergencyMode(e.target.checked)}
                className="w-5 h-5 text-yellow-600 rounded"
              />
              <label className="ml-3 text-sm font-semibold text-gray-700">
                🚨 Emergency Mode (auto-expand radius if no donors found)
              </label>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📋 List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                🗺️ Map View
              </button>
            </div>

            {/* Messages */}
            {message && (
              <div className="p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg">
                {message}
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !userLocation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "🔍 Search Donors"}
            </button>
          </form>
        </div>

        {/* Results */}
        {donors.length > 0 && (
          <div>
            {viewMode === "list" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  📌 Available Donors ({donors.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donors.map((donor) => (
                    <DonorCard
                      key={donor.id}
                      donor={donor}
                      onCall={handleCallDonor}
                    />
                  ))}
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🗺️ Donors on Map ({donors.length})
                </h2>
                <MapView userLocation={userLocation} donors={donors} />
              </div>
            )}
          </div>
        )}

        {!loading && donors.length === 0 && message && (
          <div className="bg-yellow-50 rounded-lg p-8 text-center">
            <p className="text-gray-700 text-lg">No donors found in your area yet.</p>
            <p className="text-gray-600 mt-2">Try increasing the search radius or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
