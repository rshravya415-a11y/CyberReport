import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Download,
  File,
} from "lucide-react";
import { complaintAPI } from "../api";

export default function TrackComplaint() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryRef = searchParams.get("ref");
  const explicitRef = location.state?.referenceNumber || queryRef || "";

  const [reference, setReference] = useState(explicitRef);
  const [complaint, setComplaint] = useState(location.state?.complaint || null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Only query if explicitly supplied via URL ?ref=... or immediate post-submission state
    if (explicitRef && !complaint) {
      fetchComplaint(explicitRef);
    }
  }, [explicitRef]);

  async function fetchComplaint(refCode) {
    if (!refCode || !refCode.trim()) {
      setError("Please enter a valid complaint reference number.");
      return;
    }

    setError("");
    setBusy(true);
    setSearched(true);

    try {
      const response = await complaintAPI.track(refCode.trim());
      setComplaint(response.data);
    } catch (err) {
      setComplaint(null);
      setError(
        err.response?.data?.message ||
          "No complaint found matching this reference number. Please verify the code."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleTrackSubmit(e) {
    e.preventDefault();
    fetchComplaint(reference);
  }

  const getStatusStep = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "pending") return 1;
    if (s === "under investigation") return 2;
    if (s === "resolved" || s === "rejected") return 3;
    return 1;
  };

  const currentStep = getStatusStep(complaint?.status);
  const isRejected = String(complaint?.status || "").toLowerCase() === "rejected";

  return (
    <main className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-heading">
        <span className="eyebrow">CASE SURVEILLANCE & AUDIT</span>
        <h1>Track Your Complaint</h1>
        <p>
          Enter your unique reference number (e.g. CR-2026-894102) to inspect current status and investigation logs.
        </p>
      </div>

      <div className="form-panel">
        <form onSubmit={handleTrackSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="search-input-wrap" style={{ maxWidth: "none" }}>
            <Search size={18} />
            <input
              type="text"
              className="cyber-input"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. CR-2026-894102"
              required
            />
          </div>

          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? "Checking Database..." : "Track Status"}
          </button>
        </form>

        {error && <div className="form-error" style={{ marginTop: 20 }}>{error}</div>}

        {busy && (
          <div className="loading-indicator">
            <div className="spinner" /> Querying incident record from MySQL...
          </div>
        )}

        {!complaint && !busy && !error && (
          <div className="empty-state" style={{ padding: "48px 20px" }}>
            <ShieldCheck size={48} color="var(--accent-blue)" style={{ margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ color: "var(--navy-deep)", fontSize: "1.2rem", marginBottom: 6 }}>
              Enter Your Reference ID Above
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 520, margin: "0 auto", fontSize: "0.92rem", lineHeight: 1.6 }}>
              Every complaint submitted to CyberReport is assigned a unique reference code (e.g. CR-2026-894102).
              Paste your reference number to view real-time case status and caseworker notes.
            </p>
          </div>
        )}

        {complaint && !busy && (
          <div className="tracker-status-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
              <div>
                <span className="ref-code" style={{ fontSize: "1.1rem" }}>
                  {complaint.referenceNumber}
                </span>
                <h2 style={{ fontSize: "1.5rem", color: "var(--deep-navy)", marginTop: 4 }}>
                  {complaint.title || "Untitled Incident"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Category: <strong>{complaint.crimeType || "Cybercrime"}</strong> · Lodged: {complaint.createdAt ? String(complaint.createdAt).slice(0, 10) : "Recorded"}
                </p>
              </div>

              <span
                className={`status-pill ${
                  isRejected
                    ? "status-rejected"
                    : complaint.status === "Resolved"
                    ? "status-resolved"
                    : complaint.status === "Under Investigation"
                    ? "status-investigating"
                    : "status-pending"
                }`}
                style={{ fontSize: "0.88rem", padding: "6px 14px" }}
              >
                {complaint.status || "Pending"}
              </span>
            </div>

            {/* Timeline */}
            <div className="timeline">
              <div className={`timeline-step ${currentStep >= 1 ? "completed" : ""}`}>
                <div className="timeline-icon">
                  <CheckCircle size={20} />
                </div>
                <strong style={{ color: "var(--deep-navy)", fontSize: "0.88rem" }}>1. Recorded</strong>
                <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>Lodge received</span>
              </div>

              <div
                className={`timeline-step ${
                  currentStep >= 2 ? (currentStep === 2 ? "active" : "completed") : ""
                }`}
              >
                <div className="timeline-icon">
                  <Clock size={20} />
                </div>
                <strong style={{ color: "var(--deep-navy)", fontSize: "0.88rem" }}>2. Investigation</strong>
                <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>Case officer review</span>
              </div>

              <div
                className={`timeline-step ${
                  currentStep >= 3
                    ? isRejected
                      ? "completed"
                      : "completed"
                    : ""
                }`}
              >
                <div
                  className="timeline-icon"
                  style={isRejected ? { background: "#f43f5e", borderColor: "#f43f5e", color: "#fff" } : {}}
                >
                  {isRejected ? <XCircle size={20} /> : <ShieldCheck size={20} />}
                </div>
                <strong style={{ color: isRejected ? "#f43f5e" : "var(--deep-navy)", fontSize: "0.88rem" }}>
                  {isRejected ? "3. Rejected" : "3. Resolved"}
                </strong>
                <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                  {isRejected ? "Case dismissed" : "Action completed"}
                </span>
              </div>
            </div>

            {/* Admin Remarks / Investigation Notes */}
            {complaint.adminRemarks && (
              <div className="remarks-box">
                <h4>Official Investigation Remarks:</h4>
                <p>{complaint.adminRemarks}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <span>Incident Date</span>
                <strong>{complaint.incidentDate || "Not recorded"}</strong>
              </div>

              <div className="detail-item">
                <span>Platform / Service</span>
                <strong>{complaint.platform || "Not specified"}</strong>
              </div>

              <div className="detail-item">
                <span>Complainant Email</span>
                <strong>{complaint.userEmail || "Protected"}</strong>
              </div>

              <div className="detail-item">
                <span>Suspect Details</span>
                <strong>{complaint.suspectDetails || "None provided"}</strong>
              </div>

              <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                <span>Incident Description</span>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, marginTop: 4, whiteSpace: "pre-wrap" }}>
                  {complaint.description || "No description provided."}
                </p>
              </div>

              {complaint.evidenceFileName && (
                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span>Attached Evidence</span>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, padding: "8px 14px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 6 }}>
                    <File size={16} color="var(--accent-cyan)" />
                    <strong style={{ fontSize: "0.88rem" }}>{complaint.evidenceFileName}</strong>
                    {complaint.evidenceFilePath && (
                      <a
                        href={complaintAPI.getEvidenceUrl(complaint.evidenceFilePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="button button-outline button-small"
                        style={{ marginLeft: 8 }}
                      >
                        <Download size={13} /> View File
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}