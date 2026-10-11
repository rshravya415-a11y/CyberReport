import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  ListFilter,
  Search,
  User,
  LogOut,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import { complaintAPI, authAPI } from "../api";

export default function UserDashboard() {
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("cyberreport_user_email");
  const userName = localStorage.getItem("cyberreport_user_name") || "Citizen";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { state: { from: "/dashboard" } });
      return;
    }

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const response = await complaintAPI.getMine();
        const list = Array.isArray(response.data) ? response.data : [];
        setComplaints(list);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to connect to the backend server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userEmail, navigate]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors
    } finally {
      localStorage.removeItem("cyberreport_user_email");
      localStorage.removeItem("cyberreport_user_name");
      localStorage.removeItem("cyberreport_user_role");
      localStorage.removeItem("cyberreport_token");
      localStorage.removeItem("cyberreport_last_reference");
      navigate("/");
    }
  };

  const countByStatus = (status) =>
    complaints.filter(
      (c) => String(c.status || "").toLowerCase() === status.toLowerCase()
    ).length;

  const total = complaints.length;
  const pending = countByStatus("Pending");
  const investigating = countByStatus("Under Investigation");
  const resolved = countByStatus("Resolved");
  const rejected = countByStatus("Rejected");

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
    <div className="dashboard-layout">
      {/* ---------------- Vertical Sidebar ---------------- */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="brand" style={{ marginBottom: 16 }}>
            <span className="brand-mark">
              <ShieldCheck size={20} />
            </span>
            <span className="brand-copy">
              <strong style={{ fontSize: "1.05rem" }}>CyberReport</strong>
              <small>USER PORTAL</small>
            </span>
          </Link>
          <h2>NAVIGATION</h2>
        </div>

        <Link to="/dashboard" className="sidebar-nav-item active">
          <LayoutDashboard size={18} /> Overview
        </Link>

        <Link to="/report" className="sidebar-nav-item">
          <FilePlus size={18} /> Submit Complaint
        </Link>

        <Link to="/my-complaints" className="sidebar-nav-item">
          <ListFilter size={18} /> My Complaints ({total})
        </Link>

        <Link to="/track" className="sidebar-nav-item">
          <Search size={18} /> Track Complaint
        </Link>

        <Link to="/profile" className="sidebar-nav-item">
          <User size={18} /> Account Profile
        </Link>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{ color: "#e11d48" }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>Welcome back, {userName}</h1>
            <p>
              Account: <strong style={{ color: "var(--accent-blue)" }}>{userEmail}</strong> · Active Complaints Overview
            </p>
          </div>

          <Link to="/report" className="button button-primary">
            <FilePlus size={16} /> File New Complaint
          </Link>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner" /> Loading your reports...
          </div>
        ) : (
          <>
            {/* ---------------- Stats Grid ---------------- */}
            <section className="stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-card-header">
                  <span className="stat-label">Total Reports</span>
                  <div className="stat-icon-wrap icon-blue">
                    <FileText size={18} />
                  </div>
                </div>
                <strong className="stat-value">{total}</strong>
              </div>

              <div className="stat-card stat-pending">
                <div className="stat-card-header">
                  <span className="stat-label">Pending</span>
                  <div className="stat-icon-wrap icon-amber">
                    <Clock size={18} />
                  </div>
                </div>
                <strong className="stat-value" style={{ color: "var(--status-pending)" }}>
                  {pending}
                </strong>
              </div>

              <div className="stat-card stat-investigating">
                <div className="stat-card-header">
                  <span className="stat-label">Under Investigation</span>
                  <div className="stat-icon-wrap icon-indigo">
                    <Search size={18} />
                  </div>
                </div>
                <strong className="stat-value" style={{ color: "var(--status-investigating)" }}>
                  {investigating}
                </strong>
              </div>

              <div className="stat-card stat-resolved">
                <div className="stat-card-header">
                  <span className="stat-label">Resolved</span>
                  <div className="stat-icon-wrap icon-emerald">
                    <CheckCircle size={18} />
                  </div>
                </div>
                <strong className="stat-value" style={{ color: "var(--status-resolved)" }}>
                  {resolved}
                </strong>
              </div>

              <div className="stat-card stat-rejected">
                <div className="stat-card-header">
                  <span className="stat-label">Rejected</span>
                  <div className="stat-icon-wrap icon-rose">
                    <XCircle size={18} />
                  </div>
                </div>
                <strong className="stat-value" style={{ color: "var(--status-rejected)" }}>
                  {rejected}
                </strong>
              </div>
            </section>

            {/* ---------------- Quick Actions Strip ---------------- */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 36 }}>
              <div className="category-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "1rem" }}>Report a Cybercrime</h3>
                <p style={{ fontSize: "0.82rem", margin: "6px 0 14px" }}>
                  File details regarding financial fraud, identity theft, or social media harassment.
                </p>
                <Link to="/report" className="button button-primary button-small" style={{ alignSelf: "flex-start" }}>
                  Start Reporting <ArrowRight size={14} />
                </Link>
              </div>

              <div className="category-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "1rem" }}>Track Reference ID</h3>
                <p style={{ fontSize: "0.82rem", margin: "6px 0 14px" }}>
                  Look up case progress, investigator remarks, and latest case status.
                </p>
                <Link to="/track" className="button button-secondary button-small" style={{ alignSelf: "flex-start" }}>
                  Track Case <Search size={14} />
                </Link>
              </div>

              <div className="category-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "1rem" }}>Emergency Helpline</h3>
                <p style={{ fontSize: "0.82rem", margin: "6px 0 14px" }}>
                  Dial 1930 immediately for financial fraud within 24 hours of incident.
                </p>
                <a href="tel:1930" className="button button-danger button-small" style={{ alignSelf: "flex-start" }}>
                  Dial 1930
                </a>
              </div>
            </div>

            {/* ---------------- Recent Complaints Table ---------------- */}
            <section>
              <div className="table-controls">
                <div>
                  <h2 style={{ fontSize: "1.25rem", color: "var(--text-main)" }}>
                    Your Reported Incidents
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    Showing records saved under {userEmail}
                  </p>
                </div>

                {complaints.length > 0 && (
                  <Link to="/my-complaints" className="button button-secondary button-small">
                    View Full Complaints List ({total})
                  </Link>
                )}
              </div>

              {complaints.length === 0 ? (
                <div className="form-panel empty-state">
                  <ShieldCheck size={40} />
                  <h3>No Complaints Registered Yet</h3>
                  <p>
                    When you submit a cyber incident, it will be securely recorded and tracked here.
                  </p>
                  <Link
                    to="/report"
                    className="button button-primary"
                    style={{ marginTop: 18 }}
                  >
                    File Your First Complaint <ArrowRight size={16} />
                  </Link>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 6).map((c) => (
                        <tr key={c.id}>
                          <td>
                            <span className="ref-code">
                              {c.referenceNumber || `CR-#${c.id}`}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "var(--text-main)" }}>
                              {c.title || "Untitled incident"}
                            </strong>
                          </td>
                          <td>{c.crimeType || "Incident"}</td>
                          <td>{c.incidentDate || "Not recorded"}</td>
                          <td>
                            <span className={`status-pill ${getStatusClass(c.status)}`}>
                              {c.status || "Pending"}
                            </span>
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
            </section>
          </>
        )}
      </main>
    </div>
  );
}
