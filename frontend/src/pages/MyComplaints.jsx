import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  Filter,
  FilePlus,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { complaintAPI } from "../api";

export default function MyComplaints() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("cyberreport_user_email");

  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { state: { from: "/my-complaints" } });
      return;
    }

    complaintAPI
      .getMine()
      .then((res) => {
        setComplaints(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to retrieve your reports from the backend server."
        );
      })
      .finally(() => setBusy(false));
  }, [userEmail, navigate]);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.referenceNumber &&
        c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.crimeType &&
        c.crimeType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      String(c.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
    <main className="page-container">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={16} /> Back to User Portal
      </Link>

      <div className="page-heading">
        <span className="eyebrow">CASE AUDIT RECORD</span>
        <h1>My Cybercrime Complaints</h1>
        <p>Review the full history of reports lodged from your account.</p>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="table-controls">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            className="cyber-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Title, Reference ID, or Crime Type..."
          />
        </div>

        <div className="filters-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <Link to="/report" className="button button-primary button-small">
            <FilePlus size={15} /> New Report
          </Link>
        </div>
      </div>

      {busy ? (
        <div className="loading-indicator">
          <div className="spinner" /> Loading your reports...
        </div>
      ) : filtered.length === 0 ? (
        <div className="form-panel empty-state">
          <ShieldCheck size={40} />
          <h3>No Matching Complaints Found</h3>
          <p>
            {complaints.length === 0
              ? "You haven't filed any cybercrime reports yet."
              : "No reports match your current filter settings."}
          </p>
          {complaints.length === 0 && (
            <Link to="/report" className="button button-primary" style={{ marginTop: 16 }}>
              File a Complaint
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Complaint Title</th>
                <th>Category</th>
                <th>Date of Incident</th>
                <th>Status</th>
                <th>Investigation Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="ref-code">
                      {c.referenceNumber || `CR-#${c.id}`}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#ffffff" }}>{c.title}</strong>
                  </td>
                  <td>{c.crimeType || "Incident"}</td>
                  <td>{c.incidentDate || "Not recorded"}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(c.status)}`}>
                      {c.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    {c.adminRemarks ? (
                      <span style={{ color: "var(--accent-cyan)", fontSize: "0.82rem" }}>
                        {c.adminRemarks.length > 35
                          ? c.adminRemarks.slice(0, 35) + "..."
                          : c.adminRemarks}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                        None yet
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        to={`/complaint/${c.id}`}
                        className="button button-secondary button-small"
                      >
                        Details
                      </Link>
                      <Link
                        to="/track"
                        state={{ referenceNumber: c.referenceNumber }}
                        className="button button-cyan button-small"
                      >
                        Track
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}