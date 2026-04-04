import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, hasRegisteredDonor, canRegisterDonor } = useAuth();

  return (
    <div className="page-3d app-page">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="surface-3d app-card"
        >
          <div className="mb-6 flex items-center gap-3">
            <img src="/bloodlink-logo.svg?v=4" alt="Bloodlink logo" className="h-12 w-12 rounded-xl bg-red-50 p-1.5" />
            <div>
              <h1 className="app-title text-3xl font-bold">My Profile</h1>
              <p className="app-subtitle text-sm">Your account details</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{user?.username || "-"}</p>
            </div>

            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{user?.full_name || "-"}</p>
            </div>

            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Type</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {user?.auth_mode === "signup" ? "Signed up account" : "Login account"}
              </p>
            </div>

            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Donor Access</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {canRegisterDonor ? "Eligible to register as donor" : "Not eligible for donor registration"}
              </p>
            </div>

            <div className="app-panel p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Donor Status</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {hasRegisteredDonor ? "Donor profile registered" : "Donor profile not registered"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
