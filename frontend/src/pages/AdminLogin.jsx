import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Eye, EyeOff, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { authAPI } from "../api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const data = response.data || {};

      if (String(data.role || "").toUpperCase() !== "ADMIN") {
        await authAPI.logout().catch(() => {});
        throw new Error("Access Denied: This account does not possess Administrator privileges.");
      }

      sessionStorage.setItem("cyberreport_admin_email", data.email || form.email.trim());
      sessionStorage.setItem("cyberreport_admin_name", data.name || "Administrator");
      localStorage.setItem("cyberreport_user_email", data.email || form.email.trim());
      localStorage.setItem("cyberreport_user_role", "ADMIN");

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid administrator credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card" style={{ borderColor: "rgba(56, 189, 248, 0.35)" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span
            className="brand-mark"
            style={{
              margin: "0 auto 12px",
              borderColor: "#38bdf8",
              background: "rgba(56, 189, 248, 0.15)",
            }}
          >
            <ShieldAlert size={24} color="#38bdf8" />
          </span>
          <span className="eyebrow" style={{ color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}>
            ADMINISTRATIVE CONTROL CONSOLE
          </span>
          <h1>Admin Sign In</h1>
          <p className="auth-subtitle">
            Restricted portal for authorized case officers and investigators.
          </p>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              className="cyber-input"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@cyberreport.com"
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">Master Password</label>
            <div className="input-wrap">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className="cyber-input"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button button-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Authorize Access"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
            <ArrowLeft size={14} /> Back to public site
          </Link>
        </div>
      </div>
    </main>
  );
}
