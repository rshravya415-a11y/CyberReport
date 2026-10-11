import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, User, LogOut, LayoutDashboard, FileText, Search } from "lucide-react";
import { authAPI } from "../api";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = localStorage.getItem("cyberreport_user_email");
  const userName = localStorage.getItem("cyberreport_user_name");
  const userRole = localStorage.getItem("cyberreport_user_role");
  const adminEmail = sessionStorage.getItem("cyberreport_admin_email");

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Don't render general header on admin dashboard (it has its own topbar/sidebar)
  if (isAdminRoute && location.pathname !== "/admin/login") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("cyberreport_user_email");
      localStorage.removeItem("cyberreport_user_name");
      localStorage.removeItem("cyberreport_user_role");
      localStorage.removeItem("cyberreport_token");
      localStorage.removeItem("cyberreport_last_reference");
      sessionStorage.removeItem("cyberreport_admin_email");
      sessionStorage.removeItem("cyberreport_admin_name");
      navigate("/");
    }
  };

  return (
    <header className="site-header">
      <Link to={userRole === "ADMIN" || adminEmail ? "/admin/dashboard" : "/"} className="brand" aria-label="CyberReport Home">
        <span className="brand-mark">
          <ShieldCheck size={22} />
        </span>
        <span className="brand-copy">
          <strong>CyberReport</strong>
          <small>Incident Portal</small>
        </span>
      </Link>

      <nav className="main-nav" aria-label="Main Navigation">
        <Link to="/">Home</Link>
        <a href="/#about">About</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#safety">Cyber Safety</a>
        <a href="/#faq">FAQ</a>
        <a href="/#contact">Contact</a>
      </nav>

      <div className="header-actions">
        <Link to="/track" className="button button-secondary button-small">
          <Search size={15} /> Track Report
        </Link>

        {userEmail || adminEmail ? (
          <>
            {userRole === "ADMIN" || adminEmail ? (
              <Link to="/admin/dashboard" className="user-badge">
                <LayoutDashboard size={15} /> Admin Portal
              </Link>
            ) : (
              <Link to="/dashboard" className="user-badge">
                <User size={15} /> {userName || userEmail.split("@")[0]}
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="button button-outline button-small"
              title="Sign out"
            >
              <LogOut size={15} /> Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="button button-outline button-small">
              Sign in
            </Link>
            <Link to="/register" className="button button-primary button-small">
              Register ↗
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
