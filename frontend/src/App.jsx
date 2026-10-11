import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Report from "./pages/Report";
import TrackComplaint from "./pages/TrackComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import SecurityTools from "./pages/SecurityTools";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

// Protected Route for Normal User Portal
function UserProtectedRoute({ children }) {
  const userEmail = localStorage.getItem("cyberreport_user_email");
  const location = useLocation();

  if (!userEmail) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

// Protected Route for Admin Dashboard
function AdminProtectedRoute({ children }) {
  const adminEmail =
    sessionStorage.getItem("cyberreport_admin_email") ||
    localStorage.getItem("cyberreport_user_email");
  const role =
    sessionStorage.getItem("cyberreport_admin_email")
      ? "ADMIN"
      : localStorage.getItem("cyberreport_user_role");

  if (!adminEmail || role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// Redirect Admin away from public home page directly into Admin Dashboard
function PublicHomeRoute() {
  const adminEmail =
    sessionStorage.getItem("cyberreport_admin_email") ||
    (localStorage.getItem("cyberreport_user_role") === "ADMIN"
      ? localStorage.getItem("cyberreport_user_email")
      : null);

  if (adminEmail) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Home />;
}

// 404 Not Found Component
function NotFound() {
  return (
    <main className="page-container narrow-container" style={{ textAlign: "center", padding: "80px 20px" }}>
      <div className="form-panel empty-state">
        <span className="ref-code" style={{ fontSize: "2rem" }}>404</span>
        <h1 style={{ fontSize: "1.8rem", color: "#ffffff", margin: "12px 0 8px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          The requested page or route does not exist on CyberReport.
        </p>
        <NavigateToHomeButton />
      </div>
    </main>
  );
}

function NavigateToHomeButton() {
  return (
    <a href="/" className="button button-primary">
      Return to Homepage
    </a>
  );
}

function Layout() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith("/admin/dashboard");
  const isUserDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="app-shell">
      {!isAdminDashboard && <Header />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicHomeRoute />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/security-tools" element={<SecurityTools />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* User Portal Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <UserProtectedRoute>
              <UserDashboard />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <UserProtectedRoute>
              <Report />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <UserProtectedRoute>
              <MyComplaints />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/complaint/:id"
          element={
            <UserProtectedRoute>
              <ComplaintDetails />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <UserProtectedRoute>
              <Profile />
            </UserProtectedRoute>
          }
        />

        {/* Admin Portal Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdminDashboard && !isUserDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
