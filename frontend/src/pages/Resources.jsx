import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Link2, LockKeyhole, Smartphone, ExternalLink, ArrowRight } from "lucide-react";

const resources = [
  {
    icon: Link2,
    title: "Recognize Suspicious Links",
    text: "Check the full web address before signing in or entering payment information. Avoid shortened links like bit.ly from unknown numbers.",
  },
  {
    icon: LockKeyhole,
    title: "Secure Your Accounts",
    text: "Use unique passwords, enable multi-factor authentication (MFA), and never share an OTP, CVV, or UPI PIN with anyone claiming to be bank staff.",
  },
  {
    icon: Smartphone,
    title: "Protect Payment Details",
    text: "Verify payment requests independently. Never install remote-access apps (AnyDesk, TeamViewer) at the request of an unknown caller.",
  },
];

export default function Resources() {
  return (
    <main className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-heading">
        <span className="eyebrow">DIGITAL DEFENCE GUIDELINES</span>
        <h1>Small Steps. Safer Digital Habits.</h1>
        <p>Practical reminders and protocols for protecting your identity, money, and accounts.</p>
      </div>

      <div className="categories-grid" style={{ marginBottom: 40 }}>
        {resources.map(({ icon: Icon, title, text }) => (
          <article className="category-card" key={title}>
            <div className="category-icon">
              <Icon size={24} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="form-panel" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div className="brand-mark" style={{ flexShrink: 0, width: 44, height: 44 }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", marginBottom: 6 }}>
            Official Reporting and Assistance
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 16 }}>
            CyberReport is an independent digital incident management platform. For official police
            lodging in India, visit the National Cyber Crime Reporting Portal. If you suspect
            financial cyber fraud, call <strong>1930</strong> promptly and contact your bank.
          </p>
          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="button button-primary button-small"
          >
            Visit Official Govt Portal <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </main>
  );
}
