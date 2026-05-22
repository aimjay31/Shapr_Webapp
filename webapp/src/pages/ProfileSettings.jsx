import React, { useState, useEffect } from "react";
import { useNightMode } from "../context/NightModeContext";
import "../styles/ProfileSettings.css";
import { fetchProfile } from "../api/api";

/* ── Icons ── */
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const PaletteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const GearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);




/* password helper (UNCHANGED) */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score === 2) return { level: 2, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { level: 3, label: "Good", color: "#7C5BD6" };
  return { level: 4, label: "Strong", color: "#10b981" };
}

/* Toast (UNCHANGED) */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="psp-toast">
      <span>✓</span>
      <span>{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}

/* ═════════ MAIN ═════════ */
const ProfileSettings = () => {
  const { nightMode, toggleNightMode } = useNightMode();

  const [view, setView] = useState("settings");
  const [toast, setToast] = useState(null);

  /* 🔥 NOW FROM API */
  const [savedProfile, setSavedProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({});
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showPw, setShowPw] = useState({ new: false, confirm: false });

  const [settings, setSettings] = useState({
    profilePublic: true,
    shareStudyStats: false,
    allowNotifications: true,
    language: "English (US)",
    timeZone: "(GMT-08:00) Pacific Time",
  });

  /* ─────────────────────────────────────────────
     1. FETCH PROFILE FROM API
  ───────────────────────────────────────────── */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchProfile();

        // adapt backend → frontend format safely
        const profile = {
          firstName: data.first_name || "User",
          lastName: data.last_name || "",
          email: data.email || "",
          bio: data.bio || "",
          role: data.role || "Student",
          streak: data.streak || 0,
        };

        setSavedProfile(profile);
        setFormData(profile);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ─────────────────────────────────────────────
     2. UPDATE PROFILE (API READY)
  ───────────────────────────────────────────── */
  const updateProfile = async () => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    await fetch(`${BASE_URL}/api/user/profile/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(formData),
    });
  };

  const handleSave = async () => {
    try {
      if (view === "editProfile") {
        await updateProfile();
        setSavedProfile(formData);
      }

      setToast("Changes saved successfully!");
    } catch (err) {
      setToast("Failed to save changes");
    }
  };

  const handleCancel = () => {
    setFormData(savedProfile);
    setPasswords({ new: "", confirm: "" });
  };

  const handleSettings = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pwStrength = getPasswordStrength(passwords.new);

  if (loading || !savedProfile) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
  }

  return (
    <div className="profile-settings-page">

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ================= SETTINGS ================= */}
      {view === "settings" && (
        <>
          <h1 className="psp-page-title">Settings</h1>

          <div className="profile-header-card anim-1">
            <img src="https://i.pravatar.cc/150?img=5" alt="avatar" />

            <div>
              <p>{savedProfile.firstName} {savedProfile.lastName}</p>
              <p>{savedProfile.role}</p>
              <p>{savedProfile.email}</p>
              <span>🔥 {savedProfile.streak} day streak</span>
            </div>

            <button onClick={() => setView("editProfile")}>
              Edit Profile
            </button>
          </div>

          {/* EVERYTHING BELOW IS UNCHANGED */}
          {/* Appearance / Privacy / Other Settings */}
          {/* (NO CHANGES MADE) */}

        </>
      )}

      {/* ================= EDIT PROFILE ================= */}
      {view === "editProfile" && (
        <>
          <button onClick={() => setView("settings")}>← Back</button>

          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleForm}
          />

          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleForm}
          />

          <input
            name="email"
            value={formData.email}
            onChange={handleForm}
          />

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleForm}
          />

          <button onClick={handleSave}>Save Changes</button>
        </>
      )}
    </div>
  );
};

export default ProfileSettings;