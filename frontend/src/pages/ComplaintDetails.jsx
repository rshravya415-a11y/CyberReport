import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Search,
  File,
  Download,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { complaintAPI } from "../api";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("cyberreport_user_email");

  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { state: { from: `/complaint/${id}` } });
      return;
    }

    setLoading(true);
    complaintAPI
      .getById(id)
      .then((response) => setComplaint(response.data))
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to load this complaint. You may not have authorization to view it."
        );
      })
      .finally(() => setLoading(false));
  }, [id, userEmail, navigate]);

  const getStatusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "pending":
        return "status-pending";
      case "under investigation":
        return "status-investigating";
      case "resolved":
        return "status-resolved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  return (
    <main className="page-container narrow-container">
      <Link to="/my-complaints" className="back-link">
        <ArrowLeft size={16} /> Back to My Complaints
      </Link>

      <div className="page-heading">
        <span className="eyebrow">CASE DOSSIER</span>
        <h1>Complaint Details</h1>
        <p>Comprehensive incident information stored in MySQL database.</p>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner" /> Loading complaint dossier...
        </div>
      )}

      {error && <div className="form-error" role="alert">{error}</div>}

      {complaint && !loading && (
        <article className="form-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 20, marginBottom: 24 }}>
            <div>
              <span className="ref-code" style={{ fontSize: "1.1rem" }}>
                {complaint.referenceNumber || `#${complaint.id}`}
              </span>
              <h2 style={{ fontSize: "1.45rem", color: "#ffffff", marginTop: 4 }}>
                {complaint.title || "Untitled Incident"}
              </h2>
            </div>

            <span className={`status-pill ${getStatusClass(complaint.status)}`} style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              {complaint.status || "Pending"}
            </span>
          </div>

          {/* Admin remarks / investigation notes */}
          {complaint.adminRemarks && (
            <div className="remarks-box" style={{ marginBottom: 24 }}>
              <h4>Official Investigation Remarks:</h4>
              <p>{complaint.adminRemarks}</p>
            </div>
          )}

          <div className="details-grid" style={{ borderTop: "none", paddingTop: 0 }}>
            <div className="detail-item">
              <span>Cybercrime Category</span>
              <strong>{complaint.crimeType || "Incident"}</strong>
            </div>

            <div className="detail-item">
              <span>Date of Incident</span>
              <strong>{complaint.incidentDate || "Not specified"}</strong>
            </div>

            <div className="detail-item">
              <span>Target Platform / App</span>
              <strong>{complaint.platform || "Not specified"}</strong>
            </div>

            <div className="detail-item">
              <span>Lodged Date</span>
              <strong>
                {complaint.createdAt ? String(complaint.createdAt).replace("T", " ").slice(0, 19) : "Recorded"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Complainant Account</span>
              <strong>{complaint.userEmail}</strong>
            </div>

            <div className="detail-item">
              <span>Suspect Details</span>
              <strong>{complaint.suspectDetails || "None provided"}</strong>
            </div>

            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
              <span>Incident Description</span>
              <p style={{ color: "var(--slate-200)", fontSize: "0.95rem", lineHeight: 1.6, marginTop: 6, whiteSpace: "pre-wrap" }}>
                {complaint.description || "No description provided."}
              </p>
            </div>

            {complaint.evidenceFileName && (
              <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                <span>Attached Evidence File</span>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 8, padding: "10px 16px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 6 }}>
                  <File size={18} color="var(--accent-cyan)" />
                  <strong style={{ fontSize: "0.9rem" }}>{complaint.evidenceFileName}</strong>
                  {complaint.evidenceFilePath && (
                    <a
                      href={complaintAPI.getEvidenceUrl(complaint.evidenceFilePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-outline button-small"
                      style={{ marginLeft: 12 }}
                    >
                      <Download size={14} /> Download File
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
            <Link to="/my-complaints" className="button button-secondary">
              Back to List
            </Link>

            <Link
              to="/track"
              state={{ referenceNumber: complaint.referenceNumber }}
              className="button button-cyan"
            >
              <Search size={15} /> Track in Public Tracker
            </Link>
          </div>
        </article>
      )}
    </main>
  );
}
