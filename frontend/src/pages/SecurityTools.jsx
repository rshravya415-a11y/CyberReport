import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle, Search } from "lucide-react";

export default function SecurityTools() {
  const [password, setPassword] = useState("");
  const [urlToCheck, setUrlToCheck] = useState("");
  const [urlResult, setUrlResult] = useState(null);

  // Simple password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "Enter a password", color: "var(--text-muted)" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, text: "Weak", color: "#f43f5e" };
    if (score <= 4) return { score, text: "Moderate", color: "#f59e0b" };
    return { score, text: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(password);

  const checkUrl = (e) => {
    e.preventDefault();
    if (!urlToCheck.trim()) return;

    const lower = urlToCheck.toLowerCase().trim();
    const isSuspicious =
      lower.includes("bit.ly") ||
      lower.includes("tinyurl") ||
      lower.includes("free-gift") ||
      lower.includes("claim-prize") ||
      lower.includes("login-verification") ||
      lower.includes("secure-banking-update") ||
      lower.includes("apk") ||
      !lower.startsWith("https://");

    setUrlResult({
      suspicious: isSuspicious,
      message: isSuspicious
        ? "Caution: This URL exhibits patterns commonly used in phishing campaigns or lacks HTTPS encryption. Verify the domain independently."
        : "Initial check: The URL uses standard HTTPS scheme. Always confirm the exact official domain before providing credentials or banking details.",
    });
  };

  return (
    <section className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-heading">
        <span className="eyebrow">DIGITAL DEFENCE TOOLS</span>
        <h1>Cybersecurity Self-Check Utilities</h1>
        <p>Interactive tools to inspect password resilience and identify common phishing traps.</p>
      </div>

      <div className="tools-grid">
        <div className="tool-card">
          <div className="tool-header">
            <span className="tool-icon"><Lock size={22} /></span>
            <div>
              <h3>Password Strength Evaluator</h3>
              <p>Test the complexity of your passwords against standard security criteria.</p>
            </div>
          </div>

          <div className="tool-body">
            <label htmlFor="test-pwd">Test password (client-side only):</label>
            <input
              id="test-pwd"
              type="text"
              className="cyber-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type a password to test..."
            />
            {password && (
              <div className="strength-meter">
                <div className="strength-bar-bg">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <span style={{ color: strength.color, fontWeight: 700, fontSize: "13px" }}>
                  Rating: {strength.text} ({strength.score}/5)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="tool-card">
          <div className="tool-header">
            <span className="tool-icon"><Search size={22} /></span>
            <div>
              <h3>URL & Link Inspector</h3>
              <p>Analyze link structure for suspicious redirects, missing HTTPS, or spoofed domains.</p>
            </div>
          </div>

          <div className="tool-body">
            <form onSubmit={checkUrl} className="url-form">
              <input
                type="text"
                className="cyber-input"
                value={urlToCheck}
                onChange={(e) => setUrlToCheck(e.target.value)}
                placeholder="https://example.com/login"
              />
              <button type="submit" className="button button-primary">
                Inspect URL
              </button>
            </form>

            {urlResult && (
              <div className={`url-result-box ${urlResult.suspicious ? "alert-warning" : "alert-safe"}`}>
                {urlResult.suspicious ? (
                  <AlertTriangle size={20} className="text-warning" />
                ) : (
                  <CheckCircle size={20} className="text-success" />
                )}
                <p>{urlResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
