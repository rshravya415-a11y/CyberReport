import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowLeft, Save, ShieldCheck, Phone, Mail } from "lucide-react";
import { authAPI } from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("cyberreport_user_email");

  const [profile, setProfile] = useState({
    name: "",
    email: userEmail || "",
    phone: "",
    role: "USER",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    authAPI
      .getProfile()
      .then((response) => {
        const data = response.data || {};
        setProfile({
          name: data.name || "",
          email: data.email || userEmail,
          phone: data.phone || "",
          role: data.role || "USER",
        });
        if (data.name) {
          localStorage.setItem("cyberreport_user_name", data.name);
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to fetch profile from the backend server."
        );
      })
      .finally(() => setLoading(false));
  }, [userEmail, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await authAPI.updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      });

      const data = response.data || {};
      setProfile((prev) => ({
        ...prev,
        name: data.name || prev.name,
        phone: data.phone !== undefined ? data.phone : prev.phone,
      }));

      if (data.name) {
        localStorage.setItem("cyberreport_user_name", data.name);
      }

      setMessage("Profile settings successfully updated.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not update profile on the server."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-container narrow-container">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={16} /> Back to User Portal
      </Link>

      <div className="page-heading">
        <span className="eyebrow">ACCOUNT & IDENTITY</span>
        <h1>Profile Settings</h1>
        <p>Manage your account credentials and personal contact information.</p>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner" /> Loading profile...
        </div>
      ) : (
        <div className="form-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border-subtle)" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "var(--accent-cyan)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={24} />
            </div>

            <div>
              <strong style={{ fontSize: "1.2rem", color: "#ffffff", display: "block" }}>
                {profile.name || "Citizen Account"}
              </strong>
              <span style={{ fontSize: "0.85rem", color: "var(--accent-cyan)" }}>
                Role: {profile.role} · Verified User
              </span>
            </div>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}
          {message && <div className="form-success" role="status">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                className="cyber-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="field">
              <label htmlFor="profile-email">Email Address (Read-only)</label>
              <input
                id="profile-email"
                type="email"
                className="cyber-input"
                value={profile.email}
                readOnly
                disabled
                style={{ opacity: 0.65, cursor: "not-allowed" }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Email is permanently linked to your complaint records.
              </span>
            </div>

            <div className="field">
              <label htmlFor="profile-phone">Mobile Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                className="cyber-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              style={{ marginTop: 12, alignSelf: "flex-start" }}
              disabled={saving}
            >
              <Save size={16} /> {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
