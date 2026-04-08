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

const getLoopbackFallbackUrl = (url) => {
  if (url.includes("127.0.0.1")) {
    return url.replace("127.0.0.1", "localhost");
  }
  if (url.includes("localhost")) {
    return url.replace("localhost", "127.0.0.1");
  }
  return null;
};

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

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

const requestJson = async (url, options = {}, action = "Request") => {
  if (!API_BASE_URL) {
    throw new Error(getBackendUnreachableMessage());
  }

  // Add abort controller for timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  let response;
  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      keepalive: true,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    const fallbackUrl = getLoopbackFallbackUrl(url);

    if (fallbackUrl) {
      try {
        response = await fetch(fallbackUrl, {
          ...options,
          keepalive: true,
        });
      } catch {
        // Keep original error handling below.
      }
    }

    if (response) {
      // Continue with normal response parsing/validation below.
    } else if (error.name === 'AbortError') {
      throw new Error(`${action} timed out after ${REQUEST_TIMEOUT}ms. Backend may be slow or unreachable.`);
    } else {
      throw new Error(getBackendUnreachableMessage());
    }
  } finally {
    clearTimeout(timeoutId);
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

// Simple search cache to avoid redundant network calls
const searchCache = new Map();

// Search Donors with caching (valid for 5 minutes)
export const searchDonors = async (blood, latitude, longitude, radius = 5) => {
  try {
    // Cache key based on search parameters (round coords to 3 decimals)
    const cacheKey = `search_${blood}_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${radius}`;
    const cached = searchCache.get(cacheKey);
    
    // Return cached result if fresh (within 5 minutes)
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached.data;
    }
    
    const params = new URLSearchParams({
      blood,
      lat: latitude,
      lng: longitude,
      radius,
    });
    const result = await requestJson(`${API_BASE_URL}/donor/search?${params}`, {}, "Donor search");
    
    // Cache successful result
    searchCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Error searching donors:", error);
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
