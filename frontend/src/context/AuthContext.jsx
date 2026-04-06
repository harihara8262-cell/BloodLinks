import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USER_KEY = "bloodlink_user";
const DONOR_FLAG_KEY = "bloodlink_donor_registered";
const DONOR_ELIGIBLE_KEY = "bloodlink_donor_eligible";
const PROFILE_STORE_KEY = "bloodlink_profile_store";

const readJson = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeUsername = (username) => String(username || "").trim().toLowerCase();

const readProfileStore = () => readJson(PROFILE_STORE_KEY, {});

const writeProfileStore = (store) => {
  localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(store));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJson(USER_KEY, null));
  const [hasRegisteredDonor, setHasRegisteredDonor] = useState(() => {
    return localStorage.getItem(DONOR_FLAG_KEY) === "1";
  });
  const [canRegisterDonor, setCanRegisterDonor] = useState(() => {
    return localStorage.getItem(DONOR_ELIGIBLE_KEY) === "1";
  });

  const getStoredProfile = (username) => {
    const key = normalizeUsername(username);
    if (!key) return null;
    const store = readProfileStore();
    return store[key] || null;
  };

  const upsertStoredProfile = (username, patch = {}) => {
    const key = normalizeUsername(username);
    if (!key) return;
    const store = readProfileStore();
    const nextEntry = {
      ...(store[key] || {}),
      ...patch,
    };
    store[key] = nextEntry;
    writeProfileStore(store);
  };

  const login = (payload) => {
    const baseUser = {
      username: payload?.username || "user",
      full_name: payload?.full_name || payload?.username || "User",
      auth_mode: "login",
    };

    const stored = getStoredProfile(baseUser.username);
    const safeUser = {
      ...baseUser,
      username: stored?.username || baseUser.username,
      full_name: stored?.full_name || baseUser.full_name,
      edited_profile: stored?.edited_profile === true,
    };
    const donorEligible = typeof stored?.donor_eligible === "boolean" ? stored.donor_eligible : false;
    const donorRegistered = typeof stored?.donor_registered === "boolean" ? stored.donor_registered : false;

    setUser(safeUser);
    setCanRegisterDonor(donorEligible);
    setHasRegisteredDonor(donorRegistered);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(DONOR_ELIGIBLE_KEY, donorEligible ? "1" : "0");
    localStorage.setItem(DONOR_FLAG_KEY, donorRegistered ? "1" : "0");
  };

  const signup = (payload) => {
    const baseUser = {
      username: payload?.username || "user",
      full_name: payload?.full_name || payload?.username || "User",
      auth_mode: "signup",
    };

    const stored = getStoredProfile(baseUser.username);
    const safeUser = {
      ...baseUser,
      username: stored?.username || baseUser.username,
      full_name: stored?.full_name || baseUser.full_name,
      edited_profile: stored?.edited_profile === true,
    };
    const donorEligible = typeof stored?.donor_eligible === "boolean" ? stored.donor_eligible : true;
    const donorRegistered = typeof stored?.donor_registered === "boolean" ? stored.donor_registered : false;

    setUser(safeUser);
    setCanRegisterDonor(donorEligible);
    setHasRegisteredDonor(donorRegistered);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(DONOR_ELIGIBLE_KEY, donorEligible ? "1" : "0");
    localStorage.setItem(DONOR_FLAG_KEY, donorRegistered ? "1" : "0");
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
    if (user?.username) {
      upsertStoredProfile(user.username, {
        username: user.username,
        full_name: user.full_name,
        edited_profile: user.edited_profile === true,
        donor_eligible: canRegisterDonor,
        donor_registered: true,
      });
    }
  };

  const updateDonorState = ({ donorAccess, donorStatus }) => {
    const canAccessDonor = donorAccess === "enabled";
    const isDonorRegistered = donorStatus === "registered";

    setCanRegisterDonor(canAccessDonor);
    setHasRegisteredDonor(isDonorRegistered);

    localStorage.setItem(DONOR_ELIGIBLE_KEY, canAccessDonor ? "1" : "0");
    localStorage.setItem(DONOR_FLAG_KEY, isDonorRegistered ? "1" : "0");

    if (user?.username) {
      upsertStoredProfile(user.username, {
        username: user.username,
        full_name: user.full_name,
        edited_profile: user.edited_profile === true,
        donor_eligible: canAccessDonor,
        donor_registered: isDonorRegistered,
      });
    }
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

      const prevKey = normalizeUsername(prev.username);
      const nextKey = normalizeUsername(nextUser.username);
      const store = readProfileStore();

      if (prevKey && prevKey !== nextKey) {
        delete store[prevKey];
      }

      if (nextKey) {
        store[nextKey] = {
          ...(store[nextKey] || {}),
          username: nextUser.username,
          full_name: nextUser.full_name,
          edited_profile: nextUser.edited_profile === true,
          donor_eligible: canRegisterDonor,
          donor_registered: hasRegisteredDonor,
        };
      }

      writeProfileStore(store);
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
