/**
 * Frontend API client
 * Handles all API calls to bloodlink backend
 */

const getApiBaseUrl = () => {
  let configured = String(import.meta.env.VITE_API_URL || "").trim();

  if (configured.startsWith("ttps://")) {
    configured = `h${configured}`;
  }

  if (configured.includes("YOUR-BACKEND-DOMAIN")) {
    configured = "";
  }

  if (configured && !/^https?:\/\//i.test(configured)) {
    configured = "";
  }

  if (configured) {
    try {
      const parsed = new URL(configured);
      if (!/^https?:$/i.test(parsed.protocol)) {
        configured = "";
      }
    } catch {
      configured = "";
    }
  }

  if (configured) return configured;

  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  if (isLocalHost) return "http://127.0.0.1:8000/api";

  return "";
};

const API_BASE_URL = getApiBaseUrl();

const getBackendUnreachableMessage = () => {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  if (isLocalHost) {
    return "Could not reach backend. Start backend on http://127.0.0.1:8000";
  }

  if (API_BASE_URL) {
    return `Could not reach backend at ${API_BASE_URL}. Check backend deployment and CORS settings.`;
  }

  return "Backend URL is invalid or not configured for this deployment. Set VITE_API_URL to your deployed backend base URL (for example https://your-backend-domain/api).";
};

const requestJson = async (url, options = {}, action = "Request") => {
  if (!API_BASE_URL) {
    throw new Error(getBackendUnreachableMessage());
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(getBackendUnreachableMessage());
  }

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      payload = await response.json();
    }
  } catch {
    payload = null;
  }

  if (response.ok && !contentType.includes("application/json")) {
    throw new Error(`Unexpected response format for ${action}. Check backend URL and API route configuration.`);
  }

  if (!response.ok) {
    const detail = payload?.detail || `${action} failed (${response.status})`;
    throw new Error(detail);
  }

  return payload;
};

export const registerUser = async (payload) => {
  return requestJson(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Register user"
  );
};

export const loginUser = async (payload) => {
  return requestJson(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Login"
  );
};

// Donor Registration
export const registerDonor = async (donorData) => {
  try {
    return await requestJson(
      `${API_BASE_URL}/donor/register`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(donorData),
      },
      "Donor registration"
    );
  } catch (error) {
    console.error("Error registering donor:", error);
    throw error;
  }
};

// Search Donors
export const searchDonors = async (blood, latitude, longitude, radius = 5) => {
  try {
    const params = new URLSearchParams({
      blood,
      lat: latitude,
      lng: longitude,
      radius,
    });
    return await requestJson(`${API_BASE_URL}/donor/search?${params}`, {}, "Donor search");
  } catch (error) {
    console.error("Error searching donors:", error);
    throw error;
  }
};

// Emergency Search (expanding radius)
export const emergencySearch = async (blood, latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      blood,
      lat: latitude,
      lng: longitude,
    });
    return await requestJson(`${API_BASE_URL}/donor/emergency-search?${params}`, {}, "Emergency search");
  } catch (error) {
    console.error("Error in emergency search:", error);
    throw error;
  }
};

export const sendEmergencyAlert = async ({ blood_group, latitude, longitude, message, requester_name }) => {
  try {
    return await requestJson(
      `${API_BASE_URL}/donor/emergency-alert`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blood_group,
        latitude,
        longitude,
        message,
        requester_name,
      }),
      },
      "Emergency alert"
    );
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    throw error;
  }
};

// Get All Donors
export const getAllDonors = async () => {
  try {
    return await requestJson(`${API_BASE_URL}/donor/all`, {}, "Fetch all donors");
  } catch (error) {
    console.error("Error fetching all donors:", error);
    throw error;
  }
};

// Update Donor Status
export const updateDonorStatus = async (donorId, available) => {
  try {
    const params = new URLSearchParams({
      available,
    });
    return await requestJson(
      `${API_BASE_URL}/donor/update-status/${donorId}?${params}`,
      { method: "PUT" },
      "Update donor status"
    );
  } catch (error) {
    console.error("Error updating donor status:", error);
    throw error;
  }
};

// Get Single Donor
export const getDonor = async (donorId) => {
  try {
    return await requestJson(`${API_BASE_URL}/donor/donor/${donorId}`, {}, "Fetch donor");
  } catch (error) {
    console.error("Error fetching donor:", error);
    throw error;
  }
};
