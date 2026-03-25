import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerDonor } from "../api";

/**
 * Register Page Component
 * Allows donors to register with their details
 */
const Register = () => {
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const TAMIL_NADU_CITIES = [
    "Adyar",
    "Ambattur",
    "Arakkonam",
    "Ariyalur",
    "Attur",
    "Avadi",
    "Avinashi",
    "Bodinayakkanur",
    "Chengalpattu",
    "Chennai",
    "Chidambaram",
    "Coonoor",
    "Coimbatore",
    "Cuddalore",
    "Dharapuram",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Gingee",
    "Gobichettipalayam",
    "Gudiyattam",
    "Gurunur",
    "Harur",
    "Hosur",
    "Iyakkudi",
    "Jeypore",
    "Jolarpet",
    "Kanchipuram",
    "Kandachipuram",
    "Karaikudi",
    "Karaipettai",
    "Kargudi",
    "Karmanghat",
    "Karp",
    "Karur",
    "Kaverippattinam",
    "Kavindapadi",
    "Kayalpatnam",
    "Kazi Dosa",
    "Kodaikanal",
    "Kottaiyur",
    "Koyilandy",
    "Krishnagiri",
    "Kullanchavadi",
    "Kunnamkulam",
    "Kunnam",
    "Kunpukkulum",
    "Kurinjipadi",
    "Kusumagiri",
    "Madurai",
    "Mahabalipuram",
    "Mahindra",
    "Mahur",
    "Malappuram",
    "Mamandur",
    "Manapparai",
    "Mandamakottai",
    "Mangalwedha",
    "Manjolar",
    "Manjakuppam",
    "Marakkanam",
    "Mariadevchi",
    "Marikuppam",
    "Markanam",
    "Markapur",
    "Marmagao",
    "Marmari",
    "Marthandam",
    "Marvellabad",
    "Masan",
    "Masareddi",
    "Masareddygar",
    "Masareddypalayam",
    "Masareddypalayam",
    "Masareddypet",
    "Masareguppe",
    "Masaret",
    "Masarha",
    "Masaripuram",
    "Masarkuppam",
    "Masarmandyam",
    "Masarpalle",
    "Masarpalli",
    "Masarpalligunte",
    "Masarpalligunte",
    "Masarpalligunte",
    "Masarpalligunte",
    "Masarpalligunte",
    "Masarpalligunte",
    "Maharishi Vihar",
    "Manakuppam",
    "Manauli",
    "Manavilasa",
    "Mandambakkam",
    "Manjambakkam",
    "Manjanagaram",
    "Maniyarkulam",
    "Manjarai",
    "Manjeri",
    "Manjeshwar",
    "Manjeshwaram",
    "Manjeshwaram",
    "Manjira",
    "Manjivakkara",
    "Manjora",
    "Manjunath",
    "Manjur",
    "Manjushri",
    "Manjushwara",
    "Manjuvara",
    "Manjuveli",
    "Manjuvettu",
    "Manivanakottai",
    "Maniyacaud",
    "Maniyampeta",
    "Maniyampet",
    "Maniyannur",
    "Maniyapulavam",
    "Maniyaram",
    "Maniyarkulam",
    "Maniyarvalai",
    "Maniyila",
    "Maniyilla",
    "Manikadamba",
    "Manikapaika",
    "Manikalahalli",
    "Manikal",
    "Manikaranai",
    "Manikancharai",
    "Manikandapuram",
    "Manikandapuram",
    "Manikar",
    "Manikari",
    "Manikarkavalai",
    "Manikarkavalai",
    "Manikasila",
    "Manikeri",
    "Manikkampattu",
    "Manikkamparai",
    "Manikkampuzha",
    "Manikkappuram",
    "Manikkasseri",
    "Maniked",
    "Manikeri",
    "Manikesi",
    "Manikham",
    "Manikhara",
    "Manikhera",
    "Manikhet",
    "Manikhibra",
    "Manikilangi",
    "Manikilanka",
    "Manikinar",
    "Manikjhar",
    "Manikkad",
    "Manikkadakara",
    "Manikkadavu",
    "Manikkadi",
    "Manikkakkanam",
    "Manikkakkanam",
    "Manikkakkanam",
    "Manikkakkanam",
    "Manikkal",
    "Manikkala",
    "Manikkalam",
    "Manikkala",
    "Manikkala",
    "Manikkala",
    "Manikkala",
    "Manikkali",
    "Manikkali",
    "Manikkali",
    "Manikkali",
    "Manikkaman",
    "Manikkana",
    "Manikkana",
    "Manikkana",
    "Manikkana",
    "Manikkandakkara",
    "Manikhanda Pradesh",
    "Manikkando",
    "Manikkandode",
    "Manikkandoori",
    "Manikkandyankara",
    "Manikkane",
    "Manikkane",
    "Manikkane",
    "Manikkane",
    "Manikhannala",
    "Manikkannala",
    "Manikkanna Vaka",
    "Manikkannayya Vaka",
    "Manikkannayya",
    "Manikkannayya",
    "Manikkannayya",
    "Manikkannayya",
    "Manikkanneda",
    "Manikkanneru",
    "Manikkanneru",
    "Manikkanneru",
    "Manikkanneru",
    "Manikkanneru",
    "Manikkannesh",
    "Manikkanne",
    "Manikkannela",
    "Manikkanne",
    "Manikkannela",
    "Manikkanneryudi",
    "Manikkanneryudi",
    "Manikkanneryudi",
    "Manikkanneryudi",
    "Mayavaram",
    "Mayiladuthurai",
    "Mayurbhanj",
    "Medak",
    "Medavakkam",
    "Medavaranam",
    "Medavarakkanam",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Medavaram",
    "Kodambakkam",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani",
    "Kodandapani"
  ];

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGetLocation = async () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        // Reverse geocoding to get address details
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();

          // Extract address components
          const address = data.address || {};
          const roadName = address.road || address.residential || address.neighbourhood || "";
          const fetchedCity = address.city || address.town || address.village || "";

          // Try to find a matching city in Tamil Nadu cities list
          const matchedCity = TAMIL_NADU_CITIES.find(
            (city) => city.toLowerCase() === fetchedCity.toLowerCase()
          ) || fetchedCity;

          setFormData((prev) => ({
            ...prev,
            address: roadName,
            city: matchedCity,
          }));

          setLocationObtained(true);
          setMessage("📍 Location obtained & address auto-filled!");
        } catch (err) {
          setLocationObtained(true);
          setMessage("📍 Location obtained! Please fill address manually.");
          console.error("Reverse geocoding error:", err);
        }

        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      setError("Please obtain your location first");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await registerDonor(formData);
      
      // Redirect to email verification page
      navigate("/verify", {
        state: {
          email: formData.email,
          name: formData.name,
        },
      });
    } catch (err) {
      setError(`❌ Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-2">🩸 bloodlink</h1>
        <p className="text-center text-gray-600 mb-8">Register as a Blood Donor</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address * (for verification)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group *</label>
            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">-- Select City --</option>
              {TAMIL_NADU_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Location {locationObtained && "✓"}</label>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-gray-600 mb-2">
                Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
              </p>
            )}
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-2 transition-colors"
            >
              {loading ? "Getting Location..." : "📍 Get My Location"}
            </button>
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleInputChange}
              className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
            <label className="ml-3 text-sm font-semibold text-gray-700">Available to donate</label>
          </div>

          {/* Messages */}
          {message && <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">{message}</div>}
          {error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Registering..." : "✓ Register as Donor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
