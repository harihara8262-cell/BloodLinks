/**
 * Frontend API client
 * Handles all API calls to bloodlink backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Donor Registration
export const registerDonor = async (donorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/donor/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(donorData),
    });
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/donor/search?${params}`);
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/donor/emergency-search?${params}`);
    return await response.json();
  } catch (error) {
    console.error("Error in emergency search:", error);
    throw error;
  }
};

// Get All Donors
export const getAllDonors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/donor/all`);
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/donor/update-status/${donorId}?${params}`, {
      method: "PUT",
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating donor status:", error);
    throw error;
  }
};

// Get Single Donor
export const getDonor = async (donorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/donor/donor/${donorId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching donor:", error);
    throw error;
  }
};
