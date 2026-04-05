import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USER_KEY = "bloodlink_user";
const DONOR_FLAG_KEY = "bloodlink_donor_registered";
const DONOR_ELIGIBLE_KEY = "bloodlink_donor_eligible";

const readJson = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJson(USER_KEY, null));
  const [hasRegisteredDonor, setHasRegisteredDonor] = useState(() => {
    return localStorage.getItem(DONOR_FLAG_KEY) === "1";
  });
  const [canRegisterDonor, setCanRegisterDonor] = useState(() => {
    return localStorage.getItem(DONOR_ELIGIBLE_KEY) === "1";
  });

  const login = (payload) => {
    const safeUser = {
      username: payload?.username || "user",
      full_name: payload?.full_name || payload?.username || "User",
      auth_mode: "login",
    };
    setUser(safeUser);
    setCanRegisterDonor(false);
    setHasRegisteredDonor(false);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(DONOR_ELIGIBLE_KEY, "0");
    localStorage.setItem(DONOR_FLAG_KEY, "0");
  };

  const signup = (payload) => {
    const safeUser = {
      username: payload?.username || "user",
      full_name: payload?.full_name || payload?.username || "User",
      auth_mode: "signup",
    };
    setUser(safeUser);
    setCanRegisterDonor(true);
    setHasRegisteredDonor(false);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(DONOR_ELIGIBLE_KEY, "1");
    localStorage.setItem(DONOR_FLAG_KEY, "0");
  };

  const logout = () => {
    setUser(null);
    setHasRegisteredDonor(false);
    setCanRegisterDonor(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DONOR_FLAG_KEY);
    localStorage.removeItem(DONOR_ELIGIBLE_KEY);
  };

  const markDonorRegistered = () => {
    setHasRegisteredDonor(true);
    localStorage.setItem(DONOR_FLAG_KEY, "1");
  };

  const updateDonorState = ({ donorAccess, donorStatus }) => {
    const canAccessDonor = donorAccess === "enabled";
    const isDonorRegistered = donorStatus === "registered";

    setCanRegisterDonor(canAccessDonor);
    setHasRegisteredDonor(isDonorRegistered);

    localStorage.setItem(DONOR_ELIGIBLE_KEY, canAccessDonor ? "1" : "0");
    localStorage.setItem(DONOR_FLAG_KEY, isDonorRegistered ? "1" : "0");
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = {
        ...prev,
        username: updates?.username?.trim() || prev.username,
        full_name: updates?.full_name?.trim() || prev.full_name,
        edited_profile: updates?.edited_profile === true ? true : prev.edited_profile || false,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      hasRegisteredDonor,
      canRegisterDonor,
      login,
      signup,
      logout,
      markDonorRegistered,
      updateDonorState,
      updateProfile,
    }),
    [user, hasRegisteredDonor, canRegisterDonor]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
