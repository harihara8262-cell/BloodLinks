import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hasRegisteredDonor, setHasRegisteredDonor] = useState(false);

  const donorRegistrationKey = (username) => `bloodlink_donor_registered_${username}`;

  useEffect(() => {
    const raw = localStorage.getItem("bloodlink_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        if (parsed?.username) {
          setHasRegisteredDonor(localStorage.getItem(donorRegistrationKey(parsed.username)) === "true");
        }
      } catch {
        localStorage.removeItem("bloodlink_user");
      }
    }
  }, []);

  const login = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("bloodlink_user", JSON.stringify(nextUser));
    if (nextUser?.username) {
      setHasRegisteredDonor(localStorage.getItem(donorRegistrationKey(nextUser.username)) === "true");
    } else {
      setHasRegisteredDonor(false);
    }
  };

  const logout = () => {
    setUser(null);
    setHasRegisteredDonor(false);
    localStorage.removeItem("bloodlink_user");
  };

  const markDonorRegistered = () => {
    if (!user?.username) {
      return;
    }
    localStorage.setItem(donorRegistrationKey(user.username), "true");
    setHasRegisteredDonor(true);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hasRegisteredDonor,
      login,
      logout,
      markDonorRegistered,
    }),
    [hasRegisteredDonor, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}