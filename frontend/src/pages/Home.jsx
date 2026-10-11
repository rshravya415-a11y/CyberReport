import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Mail,
  UserX,
  MessageSquareWarning,
  Lock,
  Eye,
  AlertOctagon,
  ChevronDown,
  PhoneCall,
  Search,
  ExternalLink,
  CheckCircle2,
  FileText,
  KeyRound,
  QrCode,
  Smartphone,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [quickTrackRef, setQuickTrackRef] = useState("");

  const signedIn = Boolean(
    localStorage.getItem("cyberreport_user_email") ||
    sessionStorage.getItem("cyberreport_admin_email")
  );

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault();
    if (quickTrackRef.trim()) {
      navigate(`/track?ref=${encodeURIComponent(quickTrackRef.trim())}`);
    } else {
      navigate("/track");
    }
  };

  const cybercrimeTypes = [
    {
      icon: CreditCard,
      title: "Online Financial Fraud",
      desc: "Unauthorized bank withdrawals, UPI fraud, fraudulent payment gateways, and wallet scams.",
      category: "Online Financial Fraud",
      theme: "emerald",
      badge: "Financial",
    },
    {
      icon: Mail,
      title: "Phishing & Spoofing",
      desc: "Deceptive emails, fake banking portals, fake SMS alerts, and credential harvesting schemes.",
      category: "Phishing",
      theme: "amber",
      badge: "Deception",
    },
    {
      icon: UserX,
      title: "Identity Theft",
      desc: "Impersonation, stolen Aadhaar/PAN details, fake profiles created in your name, and document misuse.",
      category: "Identity Theft",
      theme: "purple",
      badge: "Identity",
    },
    {
      icon: MessageSquareWarning,
      title: "Social Media Harassment",
      desc: "Online bullying, non-consensual image sharing, hate speech, defamation, and malicious trolling.",
      category: "Social Media Harassment",
      theme: "rose",
      badge: "Harassment",
    },
    {
      icon: Lock,
      title: "Account Hacking & Ransomware",
      desc: "Compromised social media, email or banking accounts, malicious malware, and ransomware demands.",
      category: "Account Hacking",
      theme: "red",
      badge: "Breach",
    },
    {
      icon: Eye,
      title: "Cyberstalking & Blackmail",
      desc: "Persistent digital surveillance, unwanted messages, sextortion threats, and extortion demands.",
      category: "Cyberstalking",
      theme: "indigo",
      badge: "Extortion",
    },
    {
      icon: AlertOctagon,
      title: "Investment & Lottery Scams",
      desc: "Fake trading bots, bogus work-from-home job offers, crypto investment scams, and lottery prizes.",
      category: "Online Blackmail",
      theme: "orange",
      badge: "Fraud",
    },
    {
      icon: ShieldCheck,
      title: "Other Cyber Threats",
      desc: "Data leaks, corporate espionage, unauthorized device remote access, and emerging cyber incidents.",
      category: "Other",
      theme: "cyan",
      badge: "Incident",
    },
  ];

  const faqs = [
    {
      q: "What should I do immediately if I lose money to a cyber scam?",
      a: "Contact your bank or payment provider immediately to block cards and freeze account transactions. In India, immediately dial 1930 (National Cyber Crime Helpline) within the golden hour to freeze fraudulent money transfers, and record your complaint here with transaction IDs.",
    },
    {
      q: "What details do I need before filing a cybercrime report?",
      a: "Keep all evidence ready: transaction reference numbers (UTR/UPI IDs), recipient phone numbers/emails, screenshots of conversations, URL links, and exact dates and times of the incident.",
    },
    {
      q: "Can I track my complaint after submission?",
      a: "Yes. Every report generates a unique tracking reference (e.g. CR-XXXXXXXX). You can check your investigation status and admin remarks at any time via the 'Track Report' page without needing to re-enter your details.",
    },
    {
      q: "Can I attach screenshots or document evidence?",
      a: "Yes. Our reporting system supports uploading screenshots, bank statements, and documents (PNG, JPG, PDF, DOCX up to 10MB) directly into the database record for review.",
    },
    {
      q: "Is CyberReport an official police platform?",
      a: "CyberReport is an independent digital incident management platform developed to help victims organize evidence and track complaints. For official government police filings in India, please visit the official National Cyber Crime Reporting Portal at cybercrime.gov.in.",
    },
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main className="main-content">
      {/* ---------------- Hero Section ---------------- */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            CYBER INCIDENT REPORTING & TRACKING PORTAL
          </p>

          <h1>
            When cybercrime strikes, <em>take decisive action.</em>
          </h1>

          <p className="hero-lede">
            Document digital fraud, social media harassment, hacking, and scams.
            Receive an authentic reference number and follow real-time case updates
            in one secure, unified portal.
          </p>

          <div className="hero-actions">
            <Link
              to={signedIn ? "/report" : "/login"}
              className="button button-primary"
            >
              Report Cybercrime <ArrowRight size={17} />
            </Link>

            <Link to="/track" className="button button-secondary">
              <Search size={16} /> Track Existing Report
            </Link>
          </div>

          <div className="hero-badges">
            <div className="hero-badge-item badge-blue">
              <CheckCircle2 size={16} />
              <span>Instant Reference ID</span>
            </div>
            <div className="hero-badge-item badge-emerald">
              <CheckCircle2 size={16} />
              <span>Evidence Upload Ready</span>
            </div>
            <div className="hero-badge-item badge-indigo">
              <CheckCircle2 size={16} />
              <span>Admin Investigation Log</span>
            </div>
          </div>
        </div>

        {/* ---------------- Hero Right Panel: Interactive Quick Track & Filing ---------------- */}
        <div className="hero-visual">
          <div className="hero-quick-card">
            <div className="hero-card-header">
              <span className="hero-card-status">
                <span className="live-pulse-dot" />
                OFFICIAL INCIDENT DISPATCH
              </span>
              <span className="hero-card-tag">24/7 ACTIVE</span>
            </div>

            <div className="hero-card-title-wrap">
              <div className="hero-card-icon">
                <Search size={22} />
              </div>
              <div>
                <h3>Track Case or File Report</h3>
                <p>Lookup active status or start a priority incident filing</p>
              </div>
            </div>

            <form onSubmit={handleQuickTrackSubmit} className="hero-card-form">
              <label htmlFor="quick-track-input" className="hero-form-label">
                CHECK INCIDENT STATUS
              </label>
              <div className="hero-input-group">
                <Search size={16} className="hero-input-icon" />
                <input
                  id="quick-track-input"
                  type="text"
                  placeholder="Enter Reference (e.g. CR-9842A17B)"
                  value={quickTrackRef}
                  onChange={(e) => setQuickTrackRef(e.target.value)}
                  className="hero-track-input"
                />
                <button type="submit" className="button button-primary button-small">
                  Track <ArrowRight size={14} />
                </button>
              </div>
            </form>

            <div className="hero-quick-divider">
              <span>REPORT COMMON INCIDENTS</span>
            </div>

            <div className="hero-quick-pills">
              <Link
                to={signedIn ? "/report?category=Online%20Financial%20Fraud" : "/login"}
                className="hero-pill-btn pill-emerald"
              >
                <CreditCard size={13} /> Financial Fraud
              </Link>
              <Link
                to={signedIn ? "/report?category=Identity%20Theft" : "/login"}
                className="hero-pill-btn pill-purple"
              >
                <UserX size={13} /> Identity Theft
              </Link>
              <Link
                to={signedIn ? "/report?category=Social%20Media%20Harassment" : "/login"}
                className="hero-pill-btn pill-rose"
              >
                <MessageSquareWarning size={13} /> Social Abuse
              </Link>
              <Link
                to={signedIn ? "/report?category=Account%20Hacking" : "/login"}
                className="hero-pill-btn pill-red"
              >
                <Lock size={13} /> Account Hack
              </Link>
            </div>

            <div className="hero-card-emergency">
              <div className="hero-emergency-icon">
                <PhoneCall size={16} />
              </div>
              <div className="hero-emergency-text">
                <strong>Emergency Helpline: <a href="tel:1930">Dial 1930</a></strong>
                <p>Golden-hour financial fraud intervention (Toll-Free)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Emergency 1930 Strip ---------------- */}
      <section className="emergency-strip">
        <div className="emergency-info">
          <span className="emergency-icon">
            <PhoneCall size={22} />
          </span>
          <div className="emergency-text">
            <div className="emergency-title-row">
              <strong>Lost money to suspected online fraud or UPI scam?</strong>
              <span className="emergency-tag">CRITICAL GOLDEN HOUR</span>
            </div>
            <p>
              Act immediately! Contact your bank to freeze transactions and call the
              National Cyber Crime Helpline at <strong>1930</strong> right away.
            </p>
          </div>
        </div>

        <div className="emergency-actions">
          <a href="tel:1930" className="emergency-btn">
            <PhoneCall size={16} /> Call 1930 Helpline
          </a>
          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="emergency-gov-link"
          >
            Official Portal <ExternalLink size={13} />
          </a>
        </div>
      </section>

      {/* ---------------- About Section ---------------- */}
      <section className="section" id="about">
        <div className="section-heading">
          <span className="eyebrow">ABOUT CYBERREPORT</span>
          <h2>A transparent platform for cyber incident reporting</h2>
          <p>
            CyberReport empowers victims to organize evidence, create detailed
            incident timelines, and follow systematic investigation workflows from
            submission to resolution.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-feature-card card-accent-blue">
            <div className="about-icon-wrap icon-blue">
              <FileText size={24} />
            </div>
            <h3>Organized Documentation</h3>
            <p>
              Capture timestamps, platforms, suspect usernames, phone numbers,
              and critical evidence files in one standardized digital form.
            </p>
            <span className="about-card-badge badge-blue">Standardized</span>
          </div>

          <div className="about-feature-card card-accent-indigo">
            <div className="about-icon-wrap icon-indigo">
              <KeyRound size={24} />
            </div>
            <h3>Unique Case Identification</h3>
            <p>
              Receive a tamper-evident reference code (e.g. CR-XXXXXXXX) to track
              progress without exposing personal data publicly.
            </p>
            <span className="about-card-badge badge-indigo">Verifiable</span>
          </div>

          <div className="about-feature-card card-accent-emerald">
            <div className="about-icon-wrap icon-emerald">
              <ShieldCheck size={24} />
            </div>
            <h3>Admin Investigation Workflow</h3>
            <p>
              Dedicated administrator review portal allowing caseworkers to verify
              evidence, update statuses, and log official notes.
            </p>
            <span className="about-card-badge badge-emerald">Audited</span>
          </div>
        </div>
      </section>

      {/* ---------------- Supported Cybercrime Categories ---------------- */}
      <section className="section section-alt" id="categories">
        <div className="section-heading">
          <span className="eyebrow">SUPPORTED INCIDENTS</span>
          <h2>Types of Cybercrime Handled</h2>
          <p>
            Select the category that matches your experience to organize and file your report.
          </p>
        </div>

        <div className="categories-grid">
          {cybercrimeTypes.map((crime) => {
            const Icon = crime.icon;
            return (
              <div className={`category-card theme-${crime.theme}`} key={crime.title}>
                <div className="category-card-top">
                  <div className={`category-icon icon-${crime.theme}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`category-badge badge-${crime.theme}`}>
                    {crime.badge}
                  </span>
                </div>
                <h3>{crime.title}</h3>
                <p>{crime.desc}</p>
                <Link
                  to={
                    signedIn
                      ? `/report?category=${encodeURIComponent(crime.category)}`
                      : "/login"
                  }
                  className={`category-link link-${crime.theme}`}
                >
                  Report this incident <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- How It Works Section ---------------- */}
      <section className="section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">THE COMPLAINT PROCESS</span>
          <h2>How It Works: Three Clear Steps</h2>
          <p>
            Submitting and tracking your cybercrime complaint is simple and systematic.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card step-blue">
            <div className="step-card-header">
              <span className="step-number">01</span>
              <span className="step-pill pill-blue">SUBMISSION</span>
            </div>
            <h3>Describe What Happened</h3>
            <p>
              Fill out the complaint form with incident title, crime category, platform,
              date, description, and suspect details. Attach evidence files (screenshots,
              receipts, documents) or use voice input.
            </p>
          </div>

          <div className="step-card step-indigo">
            <div className="step-card-header">
              <span className="step-number">02</span>
              <span className="step-pill pill-indigo">DISPATCH</span>
            </div>
            <h3>Receive Reference Code</h3>
            <p>
              Once saved to the database, you instantly receive a unique tracking reference
              number (e.g. CR-C886851818). Save this code to monitor updates across portals.
            </p>
          </div>

          <div className="step-card step-emerald">
            <div className="step-card-header">
              <span className="step-number">03</span>
              <span className="step-pill pill-emerald">INVESTIGATION</span>
            </div>
            <h3>Track Investigation & Status</h3>
            <p>
              Check your report anytime using the Tracker. Follow updates as caseworkers
              transition your case from Pending to Under Investigation, Resolved, or Rejected.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Cyber Safety & Awareness ---------------- */}
      <section className="section section-alt" id="safety">
        <div className="section-heading">
          <span className="eyebrow">CYBER AWARENESS</span>
          <h2>Essential Digital Safety Tips</h2>
          <p>
            Stay proactive with these fundamental cybersecurity guidelines to protect
            your digital identity and financial accounts.
          </p>
        </div>

        <div className="safety-grid">
          <div className="safety-card safety-blue">
            <div className="safety-icon-wrap icon-blue">
              <KeyRound size={24} />
            </div>
            <h3>Enable Two-Factor Authentication (2FA)</h3>
            <p>
              Activate MFA across email, social media, and banking applications using
              authenticator apps rather than standard SMS codes where possible.
            </p>
          </div>

          <div className="safety-card safety-amber">
            <div className="safety-icon-wrap icon-amber">
              <QrCode size={24} />
            </div>
            <h3>QR Codes are for Sending Money Only</h3>
            <p>
              Never scan a QR code to “receive” money or prizes. Scanning a QR code
              in any UPI app will always debit funds from your account.
            </p>
          </div>

          <div className="safety-card safety-rose">
            <div className="safety-icon-wrap icon-rose">
              <Smartphone size={24} />
            </div>
            <h3>Never Install Unknown Remote Apps</h3>
            <p>
              Scammers often impersonate customer support asking you to install AnyDesk,
              TeamViewer, or QuickSupport to steal banking passwords. Never comply.
            </p>
          </div>

          <div className="safety-card safety-emerald">
            <div className="safety-icon-wrap icon-emerald">
              <Mail size={24} />
            </div>
            <h3>Inspect URLs & Sender Addresses</h3>
            <p>
              Check the full domain address before entering passwords. Banks and government
              agencies will never ask for PINs or passwords via SMS or WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Interactive FAQ Section ---------------- */}
      <section className="section" id="faq">
        <div className="section-heading">
          <span className="eyebrow">HELP & CLARIFICATIONS</span>
          <h2>Frequently Asked Questions</h2>
          <p>
            Got questions about filing reports, evidence handling, or tracking? Find answers here.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div className="faq-item" key={faq.q}>
              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={activeFaq === index}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: activeFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
              {activeFaq === index && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Contact & CTA Section ---------------- */}
      <section className="section section-alt" id="contact" style={{ textAlign: "center" }}>
        <div className="cta-banner">
          <div className="cta-content">
            <span className="cta-eyebrow">
              <Sparkles size={14} /> READY TO TAKE ACTION?
            </span>
            <h2>Submit Your Cyber Incident Report Now</h2>
            <p>
              Create an account or sign in to start organizing your complaint. Review and
              attach evidence before submitting to our database.
            </p>

            <div className="cta-actions">
              <Link
                to={signedIn ? "/report" : "/register"}
                className="button button-primary"
              >
                Get Started Now <ArrowRight size={17} />
              </Link>

              <Link to="/track" className="button button-secondary">
                Track a Report
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
