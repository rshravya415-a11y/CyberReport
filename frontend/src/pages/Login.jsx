import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { authAPI } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    location.state?.registered
      ? "Registration successful! Please sign in with your credentials."
      : ""
  );
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    if (!form.email.trim() || !form.password) {
      setError("Please provide both email and password.");
      setBusy(false);
      return;
    }

    try {
      const response = await authAPI.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const data = response.data || {};

      localStorage.setItem("cyberreport_user_email", data.email || form.email.trim());
      localStorage.setItem("cyberreport_user_name", data.name || "");
      localStorage.setItem("cyberreport_user_role", data.role || "USER");

      if (data.token) {
        localStorage.setItem("cyberreport_token", data.token);
      }

      // Check role and redirect to the correct dashboard
      if (String(data.role || "").toUpperCase() === "ADMIN") {
        sessionStorage.setItem("cyberreport_admin_email", data.email || form.email.trim());
        sessionStorage.setItem("cyberreport_admin_name", data.name || "Administrator");
        navigate("/admin/dashboard", { replace: true });
      } else {
        const destination = location.state?.from || "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Sign in failed. Check your email and password.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span className="brand-mark" style={{ margin: "0 auto 12px" }}>
            <ShieldCheck size={24} />
          </span>
          <span className="eyebrow">CYBER INCIDENT PORTAL</span>
          <h1>User Sign In</h1>
          <p className="auth-subtitle">
            Sign in to access your complaints, report incidents, and view updates.
          </p>
        </div>

        {success && <div className="auth-success" role="status">{success}</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="field">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrap">
              <input
                id="login-email"
                type="email"
                className="cyber-input"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="cyber-input"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
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
            disabled={busy}
          >
            {busy ? "Signing in..." : "Sign In to Portal"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p style={{ marginTop: 12 }}>
            <Link to="/admin/login" style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
              Administrator Login Portal →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}