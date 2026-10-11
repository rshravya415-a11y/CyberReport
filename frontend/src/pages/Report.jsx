import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ShieldAlert,
  ArrowRight,
  Upload,
  File,
  X,
  Mic,
  CheckCircle,
  Copy,
  ArrowLeft,
  Search,
  LayoutDashboard,
} from "lucide-react";
import { complaintAPI, authAPI } from "../api";

export default function Report() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userEmail = localStorage.getItem("cyberreport_user_email");
  const storedName = localStorage.getItem("cyberreport_user_name") || "";

  const [form, setForm] = useState({
    title: "",
    crimeType: searchParams.get("category") || "",
    platform: "",
    incidentDate: "",
    description: "",
    suspectDetails: "",
    userName: storedName,
    userPhone: "",
    evidenceFileName: "",
    evidenceFilePath: "",
  });

  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState("");

  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Post-submission confirmation state
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { state: { from: "/report" } });
      return;
    }

    authAPI
      .getProfile()
      .then((res) => {
        const data = res.data || {};
        setForm((prev) => ({
          ...prev,
          userName: prev.userName || data.name || "",
          userPhone: prev.userPhone || data.phone || "",
        }));
      })
      .catch(() => {
        // Fallback gracefully to existing state
      });
  }, [userEmail, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Handle Evidence File Upload
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File is too large. Maximum allowed size is 10 MB.");
      return;
    }

    // Validate extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["png", "jpg", "jpeg", "pdf", "txt", "doc", "docx"];
    if (!ext || !allowed.includes(ext)) {
      setFileError("Invalid format. Allowed types: PNG, JPG, JPEG, PDF, TXT, DOC, DOCX.");
      return;
    }

    setUploadingFile(true);
    try {
      const response = await complaintAPI.uploadEvidence(file);
      setEvidenceFile(file);
      setForm((prev) => ({
        ...prev,
        evidenceFileName: response.data.fileName,
        evidenceFilePath: response.data.filePath,
      }));
    } catch (err) {
      setFileError(
        err.response?.data?.message || "Failed to upload evidence file."
      );
    } finally {
      setUploadingFile(false);
    }
  }

  function handleRemoveFile() {
    setEvidenceFile(null);
    setForm((prev) => ({
      ...prev,
      evidenceFileName: "",
      evidenceFilePath: "",
    }));
  }

  // Speech Recognition
  function startVoiceReport() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice recognition is not supported in this browser. Please type your description."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || "";
      setForm((prev) => ({
        ...prev,
        description: prev.description
          ? `${prev.description} ${spokenText}`
          : spokenText,
      }));
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access.");
      } else {
        setError("Could not capture audio. Please type your explanation.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setError("Voice recognition failed to start.");
    }
  }

  // Submit Complaint
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!userEmail) {
      navigate("/login", { state: { from: "/report" } });
      return;
    }

    if (!form.title.trim()) {
      setError("Please provide a complaint title.");
      return;
    }

    if (!form.crimeType) {
      setError("Please choose a cybercrime category.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe what occurred in detail.");
      return;
    }

    setBusy(true);

    try {
      const payload = {
        title: form.title.trim(),
        crimeType: form.crimeType,
        platform: form.platform.trim(),
        incidentDate: form.incidentDate || null,
        description: form.description.trim(),
        suspectDetails: form.suspectDetails.trim(),
        userName: form.userName?.trim() || undefined,
        userPhone: form.userPhone?.trim() || undefined,
        evidenceFileName: form.evidenceFileName || null,
        evidenceFilePath: form.evidenceFilePath || null,
      };

      const response = await complaintAPI.create(payload);
      const data = response.data || {};

      if (!data.referenceNumber) {
        throw new Error("No reference code returned by the server.");
      }

      setSubmittedData({
        referenceNumber: data.referenceNumber,
        status: data.status || "Pending",
        title: form.title.trim(),
        category: form.crimeType,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not submit complaint. Check server connectivity."
      );
    } finally {
      setBusy(false);
    }
  }

  const copyReference = () => {
    if (submittedData?.referenceNumber) {
      navigator.clipboard.writeText(submittedData.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If already submitted, show Confirmation View
  if (submittedData) {
    return (
      <main className="page-container narrow-container">
        <div className="form-panel" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 24px rgba(16, 185, 129, 0.2)",
            }}
          >
            <CheckCircle size={36} />
          </div>

          <span className="eyebrow" style={{ color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
            COMPLAINT LODGED SUCCESSFULLY
          </span>

          <h1 style={{ fontSize: "2rem", color: "var(--deep-navy)", margin: "14px 0 8px" }}>
            Report Saved to MySQL Database
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 28px" }}>
            Your complaint is officially recorded under <strong>{userEmail}</strong>.
            Save your unique Reference Number below to track your investigation.
          </p>

          <div
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-md)",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: 420,
              margin: "0 auto 32px",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>
                Tracking Reference Number
              </span>
              <strong
                style={{
                  display: "block",
                  fontSize: "1.4rem",
                  fontFamily: "ui-monospace, monospace",
                  color: "var(--accent-cyan)",
                  marginTop: 4,
                }}
              >
                {submittedData.referenceNumber}
              </strong>
            </div>

            <button
              onClick={copyReference}
              className="button button-cyan button-small"
              title="Copy to clipboard"
            >
              <Copy size={16} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link
              to="/track"
              state={{ referenceNumber: submittedData.referenceNumber, submitted: true }}
              className="button button-primary"
            >
              <Search size={16} /> Track Complaint Now
            </Link>

            <Link to="/dashboard" className="button button-secondary">
              <LayoutDashboard size={16} /> Go to Dashboard
            </Link>

            <button
              onClick={() => {
                setSubmittedData(null);
                setForm({
                  title: "",
                  crimeType: "",
                  platform: "",
                  incidentDate: "",
                  description: "",
                  suspectDetails: "",
                  evidenceFileName: "",
                  evidenceFilePath: "",
                });
                setEvidenceFile(null);
              }}
              className="button button-outline"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={16} /> Back to User Portal
      </Link>

      <div className="page-heading">
        <span className="eyebrow">NEW INCIDENT REGISTRATION</span>
        <h1>Report a Cybercrime</h1>
        <p>
          Lodge the incident details, timestamps, platforms, and evidence for official review.
        </p>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="form-panel">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="userName">Complainant Full Name *</label>
            <input
              id="userName"
              name="userName"
              className="cyber-input"
              required
              value={form.userName}
              onChange={handleChange}
              placeholder="Your full legal name"
            />
          </div>

          <div className="field">
            <label htmlFor="userPhone">Contact Phone Number *</label>
            <input
              id="userPhone"
              name="userPhone"
              type="tel"
              className="cyber-input"
              required
              value={form.userPhone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div className="field">
            <label htmlFor="title">Complaint Title *</label>
            <input
              id="title"
              name="title"
              className="cyber-input"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Unauthorized UPI debit of ₹25,000"
            />
          </div>

          <div className="field">
            <label htmlFor="crimeType">Cybercrime Category *</label>
            <select
              id="crimeType"
              name="crimeType"
              className="cyber-input"
              required
              value={form.crimeType}
              onChange={handleChange}
            >
              <option value="">-- Select Category --</option>
              {[
                "Online Financial Fraud",
                "Phishing",
                "Identity Theft",
                "Social Media Harassment",
                "Account Hacking",
                "Cyberstalking",
                "Online Blackmail",
                "Other",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="platform">Website / Application / Platform</label>
            <input
              id="platform"
              name="platform"
              className="cyber-input"
              value={form.platform}
              onChange={handleChange}
              placeholder="e.g. WhatsApp, Instagram, PhonePe, SBI YONO"
            />
          </div>

          <div className="field">
            <label htmlFor="incidentDate">Date of Occurrence</label>
            <input
              id="incidentDate"
              name="incidentDate"
              type="date"
              className="cyber-input"
              value={form.incidentDate}
              onChange={handleChange}
            />
          </div>

          {/* Voice to Report Panel */}
          <div className="form-full">
            <div className="voice-panel">
              <div className="voice-header">
                <span className="voice-title">
                  <Mic size={18} /> Optional Voice-to-Text Input (Speak-to-Report)
                </span>

                <div className="voice-controls">
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
                    className="filter-select"
                    disabled={isListening}
                  >
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">हिन्दी (Hindi)</option>
                    <option value="te-IN">తెలుగు (Telugu)</option>
                  </select>

                  <button
                    type="button"
                    onClick={startVoiceReport}
                    className={`button button-small ${isListening ? "button-danger" : "button-cyan"}`}
                    disabled={isListening || busy}
                  >
                    {isListening ? "Listening..." : "🎙 Dictate"}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Speak clearly into your microphone in English, Hindi, or Telugu. The speech
                will be appended to your description box below for editing.
              </p>
            </div>
          </div>

          {/* Incident Description */}
          <div className="form-full field">
            <label htmlFor="description">Incident Description *</label>
            <textarea
              id="description"
              name="description"
              className="cyber-input"
              required
              rows={6}
              value={form.description}
              onChange={handleChange}
              placeholder="Provide a step-by-step account of what happened: how the scammer contacted you, what information was exchanged, transaction IDs, etc."
            />
          </div>

          {/* Suspect Details */}
          <div className="form-full field">
            <label htmlFor="suspectDetails">Suspect Details (If available)</label>
            <textarea
              id="suspectDetails"
              name="suspectDetails"
              className="cyber-input"
              rows={3}
              value={form.suspectDetails}
              onChange={handleChange}
              placeholder="Suspect's mobile number, UPI ID, email address, website link, or profile handle."
            />
          </div>

          {/* Evidence Upload Section */}
          <div className="form-full field">
            <label>Attach Evidence (Screenshots, PDFs, Receipts up to 10 MB)</label>

            {!evidenceFile ? (
              <label className="dropzone">
                <Upload size={28} style={{ color: "var(--accent-cyan)", marginBottom: 8 }} />
                <span style={{ display: "block", color: "var(--deep-navy)", fontWeight: 600, fontSize: "0.95rem" }}>
                  {uploadingFile ? "Uploading File to Server..." : "Click to Browse or Drop Evidence File"}
                </span>
                <span style={{ display: "block", color: "var(--text-dim)", fontSize: "0.8rem", marginTop: 4 }}>
                  Supported formats: PNG, JPG, JPEG, PDF, TXT, DOC, DOCX
                </span>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  disabled={uploadingFile}
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.doc,.docx"
                />
              </label>
            ) : (
              <div className="file-preview">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <File size={20} color="var(--accent-cyan)" />
                  <div>
                    <strong style={{ fontSize: "0.9rem", color: "var(--deep-navy)" }}>
                      {evidenceFile.name}
                    </strong>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      {(evidenceFile.size / 1024).toFixed(1)} KB · Uploaded successfully
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="button button-outline button-small"
                  title="Remove file"
                >
                  <X size={15} /> Remove
                </button>
              </div>
            )}

            {fileError && <p style={{ color: "#f43f5e", fontSize: "0.82rem", marginTop: 6 }}>{fileError}</p>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ color: "var(--text-dim)", fontSize: "0.82rem" }}>
            * Required fields. Saved under: <strong>{userEmail}</strong>
          </span>

          <button
            type="submit"
            className="button button-primary"
            disabled={busy || uploadingFile || isListening}
          >
            {busy ? "Saving to Database..." : "Submit Complaint"} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </main>
  );
}