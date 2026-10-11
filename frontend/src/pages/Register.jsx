import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { authAPI } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setBusy(true);

    try {
      await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      navigate("/login", {
        state: {
          registered: true,
          email: form.email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. An account with this email may already exist.";
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
          <span className="eyebrow">NEW COMPLAINANT REGISTRATION</span>
          <h1>Create Account</h1>
          <p className="auth-subtitle">
            Sign up to securely submit complaints and track investigation updates.
          </p>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="field">
            <label htmlFor="register-name">Full Name *</label>
            <input
              id="register-name"
              type="text"
              className="cyber-input"
              autoComplete="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email Address *</label>
            <input
              id="register-email"
              type="email"
              className="cyber-input"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="register-phone">Phone Number (Optional)</label>
            <input
              id="register-phone"
              type="tel"
              className="cyber-input"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password (Minimum 8 characters) *</label>
            <div className="input-wrap">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="cyber-input"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
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

          <div className="field">
            <label htmlFor="register-confirm">Confirm Password *</label>
            <div className="input-wrap">
              <input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                className="cyber-input"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="button button-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={busy}
          >
            {busy ? "Creating Account..." : "Register Account"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}