import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { registerDonor } from "../api";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const MINIMUM_AGE = 18;

const TAMIL_NADU_CITIES = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

const normalize = (value) => value.toLowerCase().replace(/[^a-z]/g, "");

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
};

const getBestTamilNaduCity = (addressParts, validCities) => {
  const candidates = [
    addressParts.city,
    addressParts.town,
    addressParts.village,
    addressParts.municipality,
    addressParts.county,
    addressParts.state_district,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    const exact = validCities.find((city) => normalize(city) === normalizedCandidate);
    if (exact) {
      return exact;
    }
    const contains = validCities.find((city) => normalize(city).includes(normalizedCandidate));
    if (contains) {
      return contains;
    }
  }

  return candidates[0] || "";
};

const Register = () => {
  const navigate = useNavigate();
  const { markDonorRegistered } = useAuth();
  const cityOptions = useMemo(() => TAMIL_NADU_CITIES, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    blood_group: "O+",
    address: "",
    city: "",
    latitude: null,
    longitude: null,
    available: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [locationObtained, setLocationObtained] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        phone: onlyDigits,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGetLocation = () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          const address = data.address || {};

          const lineParts = [
            address.house_number,
            address.road || address.residential,
            address.suburb || address.neighbourhood,
          ].filter(Boolean);

          const detectedAddress = lineParts.join(", ") || data.display_name?.split(",")[0] || "";
          const detectedCity = getBestTamilNaduCity(address, cityOptions);
          const state = address.state || "";

          setFormData((prev) => ({
            ...prev,
            address: detectedAddress || prev.address,
            city: detectedCity || prev.city,
          }));

          setLocationObtained(true);
          if (state && state.toLowerCase() !== "tamil nadu") {
            setMessage(
              `Location captured. State detected as ${state}. Please verify city and address before submitting.`
            );
          } else {
            setMessage("Location, address and city were auto-filled. Please verify and submit.");
          }
        } catch (geocodeError) {
          setLocationObtained(true);
          setMessage("Location captured. Please fill address and city manually.");
          console.error("Reverse geocoding failed:", geocodeError);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setError(`Error getting location: ${geoError.message}`);
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = calculateAge(formData.date_of_birth);

    if (!formData.latitude || !formData.longitude) {
      setError("Please capture location first");
      return;
    }

    if (!formData.name || !formData.phone || !formData.gender || !formData.date_of_birth || !formData.address || !formData.city) {
      setError("Please fill all required fields");
      return;
    }

    if (age === null) {
      setError("Please enter a valid date of birth");
      return;
    }

    if (age < MINIMUM_AGE) {
      setError(`You must be at least ${MINIMUM_AGE} years old to register as a donor`);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await registerDonor(formData);
      if (!result?.donor_id) {
        throw new Error(result?.detail || "Registration failed");
      }
      markDonorRegistered();
      setMessage("Registration successful");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (submitError) {
      setError(`Registration failed: ${submitError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-3d app-page">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="surface-3d app-card h-fit lg:sticky lg:top-24"
        >
          <h1 className="app-title mb-2 text-3xl font-bold">
            <span className="inline-flex items-center gap-2">
              <img src="/bloodlink-logo.svg?v=4" alt="bloodlink" className="h-9 w-9 rounded-lg bg-red-50 p-1" />
              <span>Bloodlink</span>
            </span>
          </h1>
          <p className="app-subtitle mb-5 text-sm">Register once and become available for nearby emergency requests.</p>

          <div className="grid gap-3">
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Step 1</p>
              <p className="mt-1 text-sm text-gray-700">Enter your donor details and blood group.</p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Step 2</p>
              <p className="mt-1 text-sm text-gray-700">Capture location and verify auto-filled address.</p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Step 3</p>
              <p className="mt-1 text-sm text-gray-700">Submit and stay available for urgent requests.</p>
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 24, rotateX: 5 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 24 }}
          className="surface-3d app-card"
        >
          <p className="app-subtitle mb-6 text-sm">Register as a Blood Donor. Donors must be 18 years or older.</p>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="app-input"
              required
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit phone number"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              className="app-input"
              required
            />
          </motion.div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Blood Group</label>
            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleInputChange}
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
            <label className="mb-2 block text-sm font-semibold text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="app-select"
              required
            >
              <option value="">-- Select Gender --</option>
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className="app-input"
              required
            />
            <p className="mt-2 text-xs text-gray-600">
              {formData.date_of_birth
                ? (() => {
                    const age = calculateAge(formData.date_of_birth);
                    if (age === null) {
                      return "Enter a valid date of birth.";
                    }
                    return age >= MINIMUM_AGE
                      ? `Verified: ${age} years old.`
                      : `Age check failed: ${age} years old. You must be at least ${MINIMUM_AGE}.`;
                  })()
                : "Used to verify donor age."}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street or locality"
              className="app-input"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="app-select"
              required
            >
              <option value="">-- Select City --</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="app-panel p-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Location {locationObtained ? "captured" : "required"}
            </label>
            {formData.latitude && formData.longitude && (
              <p className="mb-2 text-xs text-gray-600">
                Lat: {formData.latitude.toFixed(5)}, Lng: {formData.longitude.toFixed(5)}
              </p>
            )}
            <AnimatedButton
              type="button"
              onClick={handleGetLocation}
              disabled={loading}
              className="app-pill-btn w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
            >
              {loading ? "Detecting location..." : "Detect Location and Auto-fill Address"}
            </AnimatedButton>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleInputChange}
              className="h-4 w-4 rounded text-red-600 focus:ring-2 focus:ring-red-500"
            />
            <label className="ml-3 text-sm font-semibold text-gray-700">Available to donate</label>
          </div>

          {message && <div className="rounded-lg border border-green-300 bg-green-100 p-3 text-sm text-green-700">{message}</div>}
          {error && <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-sm text-red-700">{error}</div>}

          <AnimatedButton
            type="submit"
            disabled={loading}
            className="app-pill-btn w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Register as Donor"}
          </AnimatedButton>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
