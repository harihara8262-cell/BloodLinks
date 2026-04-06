import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const profileLockKey = (username) => `bloodlink_profile_locked_${String(username || "").trim().toLowerCase()}`;

const Profile = () => {
  const { user, hasRegisteredDonor, canRegisterDonor, updateProfile, updateDonorState } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showCompletedBadge, setShowCompletedBadge] = useState(false);
  const [profileLocked, setProfileLocked] = useState(false);
  const [draft, setDraft] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    donorAccess: canRegisterDonor ? "enabled" : "restricted",
    donorStatus: hasRegisteredDonor ? "registered" : "not_registered",
  });

  const canShowEditButton = !profileLocked && !user?.edited_profile;

  useEffect(() => {
    setDraft({
      username: user?.username || "",
      full_name: user?.full_name || "",
      donorAccess: canRegisterDonor ? "enabled" : "restricted",
      donorStatus: hasRegisteredDonor ? "registered" : "not_registered",
    });
  }, [user, canRegisterDonor, hasRegisteredDonor]);

  useEffect(() => {
    const key = profileLockKey(user?.username);
    setProfileLocked(localStorage.getItem(key) === "1" || user?.edited_profile === true);
  }, [user]);

  useEffect(() => {
    if (!formSuccess && !showCompletedBadge) return;

    const timeoutId = setTimeout(() => {
      setFormSuccess("");
      setShowCompletedBadge(false);
    }, 60000);

    return () => clearTimeout(timeoutId);
  }, [formSuccess, showCompletedBadge]);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setDraft({
      username: user?.username || "",
      full_name: user?.full_name || "",
      donorAccess: canRegisterDonor ? "enabled" : "restricted",
      donorStatus: hasRegisteredDonor ? "registered" : "not_registered",
    });
    setFormError("");
    setFormSuccess("");
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    setFormError("");
    setFormSuccess("");

    if (!draft.username.trim()) {
      setFormError("Username is required.");
      return;
    }

    if (!draft.full_name.trim()) {
      setFormError("Full name is required.");
      return;
    }

    updateProfile({
      username: draft.username,
      full_name: draft.full_name,
      edited_profile: true,
    });

    updateDonorState({
      donorAccess: draft.donorAccess,
      donorStatus: draft.donorStatus,
    });

    localStorage.setItem(profileLockKey(draft.username), "1");
    setProfileLocked(true);

    setFormSuccess("Profile details updated successfully.");
    setShowCompletedBadge(true);
    setIsEditing(false);
  };

  const accountTypeLabel = user?.auth_mode === "signup" ? "Registered via sign-up" : "Signed in with login";
  const donorAccessLabel = canRegisterDonor ? "Ready to register as donor" : "Donor registration unavailable";
  const donorStatusLabel = hasRegisteredDonor ? "Donor profile registered" : "Donor profile not yet created";
  const displayName = user?.full_name || user?.username || "Guest";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "B";
  const donorStatusTone = hasRegisteredDonor ? "success" : "warning";
  const accessTone = canRegisterDonor ? "success" : "muted";

  return (
    <div className="page-3d app-page">
      <div className="mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="surface-3d app-card profile-shell"
        >
          <div className="profile-hero mb-8 overflow-hidden rounded-3xl">
            <div className="profile-hero-bg" />
            <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-4">
                <div className="profile-avatar">
                  <span>{initials}</span>
                </div>
                <div>
                  <div className="profile-kicker">Profile overview</div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{displayName}</h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Your account and donor information in one place, with live registration status.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="profile-chip profile-chip-red">Bloodlink</span>
                <span className={`profile-chip profile-chip-${donorStatusTone}`}>{donorStatusLabel}</span>
                <span className={`profile-chip profile-chip-${accessTone}`}>{donorAccessLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6">
              <motion.div className="app-panel p-4" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="profile-label">Profile Details</p>
                    <p className="profile-note">If details are missing, edit and save them here.</p>
                  </div>
                  {!isEditing && canShowEditButton ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFormError("");
                        setFormSuccess("");
                        setIsEditing(true);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      Edit Details
                    </button>
                  ) : isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : showCompletedBadge ? (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Editing Completed
                    </span>
                  ) : null}
                </div>

                {formError && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</p>
                )}
                {formSuccess && (
                  <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{formSuccess}</p>
                )}

                {isEditing && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="profile-label">Username</label>
                      <input
                        name="username"
                        value={draft.username}
                        onChange={handleDraftChange}
                        className="app-input"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="profile-label">Full Name</label>
                      <input
                        name="full_name"
                        value={draft.full_name}
                        onChange={handleDraftChange}
                        className="app-input"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="profile-label">Donor Access</label>
                      <select
                        name="donorAccess"
                        value={draft.donorAccess}
                        onChange={handleDraftChange}
                        className="app-select"
                      >
                        <option value="enabled">Enabled</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>
                    <div>
                      <label className="profile-label">Donor Status</label>
                      <select
                        name="donorStatus"
                        value={draft.donorStatus}
                        onChange={handleDraftChange}
                        className="app-select"
                      >
                        <option value="registered">Registered</option>
                        <option value="not_registered">Not registered</option>
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="profile-metric-grid">
                <motion.div className="app-panel profile-metric" whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
                  <p className="profile-label">Username</p>
                  <p className="profile-value">{user?.username || "-"}</p>
                </motion.div>

                <motion.div className="app-panel profile-metric" whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
                  <p className="profile-label">Full Name</p>
                  <p className="profile-value">{user?.full_name || "-"}</p>
                </motion.div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <motion.div className="app-panel profile-detail-card p-4" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                  <p className="profile-label">Account Type</p>
                  <p className="profile-value">{accountTypeLabel}</p>
                  <p className="profile-note">This describes how your account was created.</p>
                </motion.div>

                <motion.div className="app-panel profile-detail-card p-4" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                  <p className="profile-label">Donor Access</p>
                  <p className="profile-value">{donorAccessLabel}</p>
                  <p className="profile-note">Eligibility is checked from your current account state.</p>
                </motion.div>
              </div>

              <motion.div className="app-panel profile-status-panel p-4" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="profile-label">Donor Status</p>
                    <p className="profile-value">{donorStatusLabel}</p>
                    <p className="profile-note">Complete your donor profile to appear in nearby searches and alerts.</p>
                  </div>
                  <div className={`profile-status-dot profile-status-dot-${donorStatusTone}`} />
                </div>
              </motion.div>
            </div>

            <motion.div
              className="app-panel profile-summary-panel p-5"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="profile-label">Account snapshot</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">A quick read of your current Bloodlink profile state.</p>
                </div>
                <div className="profile-badge-ring">●</div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="profile-snapshot-row">
                  <span>Username</span>
                  <strong>{user?.username || "-"}</strong>
                </div>
                <div className="profile-snapshot-row">
                  <span>Full Name</span>
                  <strong>{user?.full_name || "-"}</strong>
                </div>
                <div className="profile-snapshot-row">
                  <span>Access</span>
                  <strong>{canRegisterDonor ? "Enabled" : "Restricted"}</strong>
                </div>
                <div className="profile-snapshot-row">
                  <span>Status</span>
                  <strong>{hasRegisteredDonor ? "Active donor" : "Not registered"}</strong>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
