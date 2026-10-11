import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  FileText,
  File,
  Download,
  X,
  Save,
  Eye,
  Camera,
  ExternalLink,
  Maximize2,
  Image as ImageIcon,
  Phone,
  User,
  Mail,
} from "lucide-react";
import { adminAPI, authAPI, complaintAPI } from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminEmail =
    sessionStorage.getItem("cyberreport_admin_email") ||
    localStorage.getItem("cyberreport_user_email");
  const adminName =
    sessionStorage.getItem("cyberreport_admin_name") || "Administrator";

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    underInvestigation: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [onlyWithEvidence, setOnlyWithEvidence] = useState(false);

  // Inspection Drawer / Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalStatus, setModalStatus] = useState("Pending");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Image Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [statsRes, listRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllComplaints(),
      ]);

      const statData = statsRes.data || {};
      const listData = Array.isArray(listRes.data) ? listRes.data : [];

      setComplaints(listData);

      const count = (s) =>
        listData.filter(
          (c) => String(c.status || "").toLowerCase() === s.toLowerCase()
        ).length;

      setStats({
        totalComplaints: statData.totalComplaints ?? listData.length,
        pendingComplaints: statData.pendingComplaints ?? count("Pending"),
        underInvestigation: statData.underInvestigation ?? count("Under Investigation"),
        resolvedComplaints: statData.resolvedComplaints ?? count("Resolved"),
        rejectedComplaints: statData.rejectedComplaints ?? count("Rejected"),
      });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not retrieve administrator records from backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleQuickStatusChange(id, newStatus) {
    setUpdatingId(id);
    setError("");
    setSuccessMsg("");

    try {
      await adminAPI.updateStatus(id, newStatus);
      setSuccessMsg(`Complaint status successfully updated to ${newStatus}.`);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update complaint status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function openInspectionModal(complaint) {
    setSelectedComplaint(complaint);
    setModalRemarks(complaint.adminRemarks || "");
    setModalStatus(complaint.status || "Pending");
    setError("");
    setSuccessMsg("");
  }

  async function handleSaveInspectionNotes() {
    if (!selectedComplaint) return;
    setSavingNotes(true);
    setError("");
    setSuccessMsg("");

    try {
      await adminAPI.updateStatus(
        selectedComplaint.id,
        modalStatus,
        modalRemarks.trim()
      );
      setSuccessMsg("Investigation notes and status successfully saved to MySQL.");
      await loadData();
      setSelectedComplaint((prev) => ({
        ...prev,
        status: modalStatus,
        adminRemarks: modalRemarks.trim(),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save investigation notes."
      );
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleLogout() {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      sessionStorage.removeItem("cyberreport_admin_email");
      sessionStorage.removeItem("cyberreport_admin_name");
      localStorage.removeItem("cyberreport_user_email");
      localStorage.removeItem("cyberreport_user_name");
      localStorage.removeItem("cyberreport_user_role");
      localStorage.removeItem("cyberreport_token");
      localStorage.removeItem("cyberreport_last_reference");
      navigate("/admin/login", { replace: true });
    }
  }

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const lower = String(fileName).toLowerCase();
    return (
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif")
    );
  };

  const filtered = complaints.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(c.referenceNumber || "").toLowerCase().includes(q) ||
      String(c.userEmail || "").toLowerCase().includes(q) ||
      String(c.title || "").toLowerCase().includes(q) ||
      String(c.crimeType || "").toLowerCase().includes(q) ||
      String(c.suspectDetails || "").toLowerCase().includes(q) ||
      String(c.description || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      String(c.status || "").toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "ALL" ||
      String(c.crimeType || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesEvidence =
      !onlyWithEvidence || Boolean(c.evidenceFilePath || c.evidenceFileName);

    return matchesSearch && matchesStatus && matchesCategory && matchesEvidence;
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

  const getCategoryTheme = (type) => {
    const t = String(type || "").toLowerCase();
    if (t.includes("financial") || t.includes("fraud") || t.includes("payment")) return "badge-emerald";
    if (t.includes("phishing")) return "badge-amber";
    if (t.includes("identity")) return "badge-purple";
    if (t.includes("harassment") || t.includes("social")) return "badge-rose";
    if (t.includes("hack") || t.includes("ransomware")) return "badge-red";
    if (t.includes("stalking") || t.includes("blackmail")) return "badge-indigo";
    return "badge-cyan";
  };

  return (
    <div className="dashboard-layout">
      {/* ---------------- Dedicated Admin Sidebar (Never leads to Home) ---------------- */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="brand" style={{ marginBottom: 16 }}>
            <span
              className="brand-mark"
              style={{
                borderColor: "#38bdf8",
                background: "rgba(56, 189, 248, 0.15)",
              }}
            >
              <ShieldAlert size={20} color="#38bdf8" />
            </span>
            <span className="brand-copy">
              <strong style={{ fontSize: "1.05rem" }}>CyberReport</strong>
              <small style={{ color: "#38bdf8" }}>ADMIN CONTROL</small>
            </span>
          </Link>
          <h2>CASE MANAGEMENT</h2>
        </div>

        <button
          onClick={() => {
            setStatusFilter("ALL");
            setOnlyWithEvidence(false);
            setSearchTerm("");
          }}
          className={`sidebar-nav-item ${statusFilter === "ALL" && !onlyWithEvidence ? "active" : ""}`}
        >
          <LayoutDashboard size={18} /> All Complaints ({stats.totalComplaints})
        </button>

        <button
          onClick={() => {
            setStatusFilter("Pending");
            setOnlyWithEvidence(false);
          }}
          className={`sidebar-nav-item ${statusFilter === "Pending" ? "active" : ""}`}
        >
          <Clock size={18} color="var(--status-pending)" /> Pending Cases ({stats.pendingComplaints})
        </button>

        <button
          onClick={() => {
            setStatusFilter("Under Investigation");
            setOnlyWithEvidence(false);
          }}
          className={`sidebar-nav-item ${statusFilter === "Under Investigation" ? "active" : ""}`}
        >
          <Search size={18} color="var(--status-investigating)" /> Active Inquiries ({stats.underInvestigation})
        </button>

        <button
          onClick={() => {
            setStatusFilter("Resolved");
            setOnlyWithEvidence(false);
          }}
          className={`sidebar-nav-item ${statusFilter === "Resolved" ? "active" : ""}`}
        >
          <CheckCircle size={18} color="var(--status-resolved)" /> Resolved Cases ({stats.resolvedComplaints})
        </button>

        <button
          onClick={() => {
            setStatusFilter("Rejected");
            setOnlyWithEvidence(false);
          }}
          className={`sidebar-nav-item ${statusFilter === "Rejected" ? "active" : ""}`}
        >
          <XCircle size={18} color="var(--status-rejected)" /> Rejected Cases ({stats.rejectedComplaints})
        </button>

        <button
          onClick={() => {
            setOnlyWithEvidence(true);
            setStatusFilter("ALL");
          }}
          className={`sidebar-nav-item ${onlyWithEvidence ? "active" : ""}`}
          style={{ marginTop: 8, borderColor: onlyWithEvidence ? "#38bdf8" : "transparent" }}
        >
          <Camera size={18} color="#38bdf8" /> With User Pictures / Evidence
        </button>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{ color: "#e11d48" }}
          >
            <LogOut size={18} /> Exit Admin Portal
          </button>
        </div>
      </aside>

      {/* ---------------- Main Incident & Evidence Console ---------------- */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <span className="eyebrow" style={{ color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}>
              INCIDENT CONTROL CENTRE · AUTHORIZED CASE OFFICERS
            </span>
            <h1>All Complaints & Evidence Review</h1>
            <p>
              Signed in as: <strong style={{ color: "var(--accent-blue)" }}>{adminEmail}</strong> ({adminName}) · Inspect complaints and user-uploaded evidence
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={loadData}
              className="button button-secondary"
              disabled={loading}
              title="Re-query MySQL database"
            >
              <RefreshCw size={15} className={loading ? "spinner" : ""} /> Refresh Data
            </button>
          </div>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}
        {successMsg && <div className="form-success" role="status">{successMsg}</div>}

        {/* ---------------- 5 Key Stats Cards ---------------- */}
        <section className="stats-grid">
          <div
            className="stat-card stat-total"
            style={{ cursor: "pointer" }}
            onClick={() => { setStatusFilter("ALL"); setOnlyWithEvidence(false); }}
          >
            <div className="stat-card-header">
              <span className="stat-label">Total Complaints</span>
              <div className="stat-icon-wrap icon-blue">
                <FileText size={18} />
              </div>
            </div>
            <strong className="stat-value">{stats.totalComplaints}</strong>
          </div>

          <div
            className="stat-card stat-pending"
            style={{ cursor: "pointer" }}
            onClick={() => { setStatusFilter("Pending"); setOnlyWithEvidence(false); }}
          >
            <div className="stat-card-header">
              <span className="stat-label">Pending Review</span>
              <div className="stat-icon-wrap icon-amber">
                <Clock size={18} />
              </div>
            </div>
            <strong className="stat-value" style={{ color: "var(--status-pending)" }}>
              {stats.pendingComplaints}
            </strong>
          </div>

          <div
            className="stat-card stat-investigating"
            style={{ cursor: "pointer" }}
            onClick={() => { setStatusFilter("Under Investigation"); setOnlyWithEvidence(false); }}
          >
            <div className="stat-card-header">
              <span className="stat-label">Under Investigation</span>
              <div className="stat-icon-wrap icon-indigo">
                <Search size={18} />
              </div>
            </div>
            <strong className="stat-value" style={{ color: "var(--status-investigating)" }}>
              {stats.underInvestigation}
            </strong>
          </div>

          <div
            className="stat-card stat-resolved"
            style={{ cursor: "pointer" }}
            onClick={() => { setStatusFilter("Resolved"); setOnlyWithEvidence(false); }}
          >
            <div className="stat-card-header">
              <span className="stat-label">Resolved</span>
              <div className="stat-icon-wrap icon-emerald">
                <CheckCircle size={18} />
              </div>
            </div>
            <strong className="stat-value" style={{ color: "var(--status-resolved)" }}>
              {stats.resolvedComplaints}
            </strong>
          </div>

          <div
            className="stat-card stat-rejected"
            style={{ cursor: "pointer" }}
            onClick={() => { setStatusFilter("Rejected"); setOnlyWithEvidence(false); }}
          >
            <div className="stat-card-header">
              <span className="stat-label">Rejected / Dismissed</span>
              <div className="stat-icon-wrap icon-rose">
                <XCircle size={18} />
              </div>
            </div>
            <strong className="stat-value" style={{ color: "var(--status-rejected)" }}>
              {stats.rejectedComplaints}
            </strong>
          </div>
        </section>

        {/* ---------------- Search and Filters Strip ---------------- */}
        <div className="table-controls">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              className="cyber-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Reference, Complainant Email, Title, Suspect, Description..."
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

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Crime Categories</option>
              <option value="Online Financial Fraud">Online Financial Fraud</option>
              <option value="Phishing">Phishing</option>
              <option value="Identity Theft">Identity Theft</option>
              <option value="Social Media Harassment">Social Media Harassment</option>
              <option value="Account Hacking">Account Hacking</option>
              <option value="Cyberstalking">Cyberstalking</option>
              <option value="Online Blackmail">Online Blackmail</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={() => setOnlyWithEvidence(!onlyWithEvidence)}
              className={`button button-small ${onlyWithEvidence ? "button-primary" : "button-outline"}`}
            >
              <Camera size={14} /> {onlyWithEvidence ? "Showing Pictures Only" : "Filter by Pictures"}
            </button>
          </div>
        </div>

        {/* ---------------- Complaints Data Table ---------------- */}
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner" /> Querying complaint records and evidence from MySQL...
          </div>
        ) : filtered.length === 0 ? (
          <div className="form-panel empty-state">
            <ShieldAlert size={40} />
            <h3>No Complaints Match Criteria</h3>
            <p>
              {complaints.length === 0
                ? "No complaints have been lodged in the database yet."
                : "No complaints found with the current search and filter selections."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Reference ID</th>
                  <th>Incident Title</th>
                  <th>Category</th>
                  <th>Complainant & Contact</th>
                  <th>Pictures & Evidence</th>
                  <th>Incident Date</th>
                  <th>Status</th>
                  <th>Quick Update</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const hasImage = isImageFile(c.evidenceFilePath || c.evidenceFileName);
                  const hasFile = Boolean(c.evidenceFilePath || c.evidenceFileName);

                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="ref-code">
                          {c.referenceNumber || `#${c.id}`}
                        </span>
                      </td>

                      <td>
                        <strong style={{ color: "var(--navy-deep)", fontSize: "0.92rem" }}>
                          {c.title}
                        </strong>
                      </td>

                      <td>
                        <span className={`category-badge ${getCategoryTheme(c.crimeType)}`}>
                          {c.crimeType || "Uncategorized"}
                        </span>
                      </td>

                      {/* Complainant Name & Contact Column */}
                      <td>
                        <div>
                          <strong
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              color: "var(--navy-deep)",
                              fontSize: "0.9rem",
                            }}
                          >
                            <User size={13} color="var(--accent-blue)" />
                            {c.userName || "Citizen Complainant"}
                          </strong>
                          <div style={{ marginTop: 2 }}>
                            {c.userPhone ? (
                              <a
                                href={`tel:${c.userPhone}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: "#2563eb",
                                  fontWeight: 700,
                                  fontSize: "0.82rem",
                                  textDecoration: "none",
                                }}
                                title="Click to call complainant"
                              >
                                <Phone size={11} /> {c.userPhone}
                              </a>
                            ) : (
                              <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                                No phone recorded
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              display: "block",
                              color: "var(--text-muted)",
                              fontSize: "0.76rem",
                              marginTop: 1,
                            }}
                          >
                            {c.userEmail}
                          </span>
                        </div>
                      </td>

                      {/* Pictures & Evidence Column */}
                      <td>
                        {hasImage ? (
                          <div
                            onClick={() => openInspectionModal(c)}
                            title="Click to inspect user uploaded picture"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              padding: "4px 8px",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: 6,
                            }}
                          >
                            <img
                              src={complaintAPI.getEvidenceUrl(c.evidenceFilePath)}
                              alt="Evidence thumbnail"
                              onError={(e) => { e.target.style.display = 'none'; }}
                              style={{
                                width: 28,
                                height: 28,
                                objectFit: "cover",
                                borderRadius: 4,
                                border: "1px solid #93c5fd",
                              }}
                            />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8" }}>
                              📷 View Photo
                            </span>
                          </div>
                        ) : hasFile ? (
                          <span
                            onClick={() => openInspectionModal(c)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 8px",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                            }}
                          >
                            📎 {c.evidenceFileName || "Document"}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>

                      <td>{c.incidentDate || "Not recorded"}</td>

                      <td>
                        <span className={`status-pill ${getStatusClass(c.status)}`}>
                          {c.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <select
                          value={c.status || "Pending"}
                          disabled={updatingId === c.id}
                          onChange={(e) =>
                            handleQuickStatusChange(c.id, e.target.value)
                          }
                          className="filter-select"
                          style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Investigation">
                            Under Investigation
                          </option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td>
                        <button
                          onClick={() => openInspectionModal(c)}
                          className="button button-primary button-small"
                          style={{ gap: 6 }}
                        >
                          <Eye size={14} /> Review Case & Evidence
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Comprehensive Case Review & Pictures Modal ---------------- */}
        {selectedComplaint && (
          <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
            <div
              className="modal-content"
              style={{ maxWidth: 820 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span className="ref-code" style={{ fontSize: "1.1rem" }}>
                      {selectedComplaint.referenceNumber || `#${selectedComplaint.id}`}
                    </span>
                    <span className={`status-pill ${getStatusClass(selectedComplaint.status)}`}>
                      {selectedComplaint.status || "Pending"}
                    </span>
                  </div>
                  <h2>{selectedComplaint.title}</h2>
                </div>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="close-btn"
                  aria-label="Close modal"
                >
                  <X size={22} />
                </button>
              </div>

              {/* ---------------- Complainant Contact & Identity Dossier ---------------- */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "16px 20px",
                  marginBottom: 22,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: 0.8 }}>
                    Complainant Full Name
                  </span>
                  <strong style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "1.05rem", color: "var(--navy-deep)", marginTop: 4 }}>
                    <User size={16} color="var(--accent-blue)" />
                    {selectedComplaint.userName || "Citizen Complainant"}
                  </strong>
                </div>

                <div>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: 0.8 }}>
                    Contact Phone Number
                  </span>
                  <div style={{ marginTop: 4 }}>
                    {selectedComplaint.userPhone ? (
                      <a
                        href={`tel:${selectedComplaint.userPhone}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: "#1d4ed8",
                          textDecoration: "none",
                        }}
                        title="Click to dial complainant"
                      >
                        <Phone size={15} />
                        {selectedComplaint.userPhone}
                      </a>
                    ) : (
                      <strong style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        Not provided
                      </strong>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: 0.8 }}>
                    Verified Email Address
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <a
                      href={`mailto:${selectedComplaint.userEmail}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--navy-deep)",
                        textDecoration: "none",
                      }}
                      title="Click to email complainant"
                    >
                      <Mail size={15} color="var(--accent-blue)" />
                      {selectedComplaint.userEmail}
                    </a>
                  </div>
                </div>

                <div>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: 0.8 }}>
                    Citizen Account ID
                  </span>
                  <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: 4 }}>
                    #{selectedComplaint.userId || "Registered"}
                  </strong>
                </div>
              </div>

              {/* Complainant & Incident Meta Grid */}
              <div className="details-grid" style={{ borderTop: "none", paddingTop: 0 }}>
                <div className="detail-item">
                  <span>Cybercrime Category</span>
                  <strong>{selectedComplaint.crimeType}</strong>
                </div>

                <div className="detail-item">
                  <span>Incident Date</span>
                  <strong>{selectedComplaint.incidentDate || "Not recorded"}</strong>
                </div>

                <div className="detail-item">
                  <span>Platform / App Used by Suspect</span>
                  <strong>{selectedComplaint.platform || "Not recorded"}</strong>
                </div>

                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span>Suspect Details (Handles / Phone / Bank Account)</span>
                  <strong>{selectedComplaint.suspectDetails || "None provided"}</strong>
                </div>

                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span>Incident Description</span>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid var(--border-card)",
                      borderRadius: 8,
                      padding: "14px 16px",
                      marginTop: 6,
                    }}
                  >
                    <p
                      style={{
                        color: "var(--text-main)",
                        fontSize: "0.92rem",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selectedComplaint.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* ---------------- PROMINENT PICTURES & EVIDENCE REVIEW SECTION ---------------- */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-card)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: "1.05rem", color: "var(--navy-deep)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Camera size={18} color="var(--accent-blue)" />
                    User Submitted Pictures & Evidence
                  </h3>
                  {selectedComplaint.evidenceFilePath && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Stored in secure evidence vault
                    </span>
                  )}
                </div>

                {selectedComplaint.evidenceFilePath ? (
                  isImageFile(selectedComplaint.evidenceFilePath || selectedComplaint.evidenceFileName) ? (
                    /* Image Evidence View */
                    <div
                      style={{
                        background: "#0f172a",
                        border: "1px solid #1e3a8a",
                        borderRadius: 10,
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {/* Image Viewer Container */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          maxHeight: 450,
                          overflow: "hidden",
                          borderRadius: 8,
                          background: "#000000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={complaintAPI.getEvidenceUrl(selectedComplaint.evidenceFilePath)}
                          alt={selectedComplaint.evidenceFileName || "Evidence Photo"}
                          onClick={() =>
                            setLightboxImage(
                              complaintAPI.getEvidenceUrl(selectedComplaint.evidenceFilePath)
                            )
                          }
                          style={{
                            maxWidth: "100%",
                            maxHeight: 450,
                            objectFit: "contain",
                            cursor: "zoom-in",
                            transition: "transform 0.2s",
                          }}
                          title="Click to view full screen"
                        />
                      </div>

                      {/* Image Controls Bar */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: "1px solid #1e293b",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ffffff", fontSize: "0.85rem" }}>
                          <ImageIcon size={16} color="#38bdf8" />
                          <strong>{selectedComplaint.evidenceFileName || "screenshot.png"}</strong>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage(
                                complaintAPI.getEvidenceUrl(selectedComplaint.evidenceFilePath)
                              )
                            }
                            className="button button-secondary button-small"
                          >
                            <Maximize2 size={13} /> Fullscreen Zoom
                          </button>

                          <a
                            href={complaintAPI.getEvidenceUrl(selectedComplaint.evidenceFilePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="button button-primary button-small"
                          >
                            <ExternalLink size={13} /> Open Original in New Tab
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Document Evidence View */
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <File size={24} color="var(--accent-blue)" />
                        <div>
                          <strong style={{ display: "block", color: "var(--navy-deep)", fontSize: "0.95rem" }}>
                            {selectedComplaint.evidenceFileName || "Attached Document"}
                          </strong>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            Uploaded evidence file
                          </span>
                        </div>
                      </div>

                      <a
                        href={complaintAPI.getEvidenceUrl(selectedComplaint.evidenceFilePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="button button-primary button-small"
                      >
                        <Download size={14} /> Download Document
                      </a>
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      background: "#f8fafc",
                      border: "1px dashed var(--border-medium)",
                      borderRadius: 8,
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.88rem",
                    }}
                  >
                    No pictures or evidence files were uploaded for this complaint.
                  </div>
                )}
              </div>

              {/* ---------------- Case Officer Remarks & Status Update Form ---------------- */}
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border-card)" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--navy-deep)", marginBottom: 14 }}>
                  Case Investigation Review & Status Update
                </h3>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label htmlFor="modal-status">Update Case Status</label>
                  <select
                    id="modal-status"
                    className="cyber-input"
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="field" style={{ marginBottom: 20 }}>
                  <label htmlFor="modal-remarks">
                    Investigation Remarks / Case Officer Notes (Visible to Complainant on Case Tracker)
                  </label>
                  <textarea
                    id="modal-remarks"
                    className="cyber-input"
                    rows={4}
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                    placeholder="Enter official investigation notes, action taken, bank dispute status, or police station referral..."
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="button button-outline"
                  >
                    Close Review
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveInspectionNotes}
                    className="button button-primary"
                    disabled={savingNotes}
                  >
                    <Save size={16} /> {savingNotes ? "Saving Notes..." : "Save Case Review & Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Fullscreen Lightbox for Evidence Pictures ---------------- */}
        {lightboxImage && (
          <div
            className="modal-overlay"
            style={{ zIndex: 2000, background: "rgba(0, 0, 0, 0.9)" }}
            onClick={() => setLightboxImage(null)}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "92vw",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  position: "absolute",
                  top: -40,
                  right: 0,
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
                aria-label="Close lightbox"
              >
                <X size={30} />
              </button>

              <img
                src={lightboxImage}
                alt="Enlarged Evidence"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
