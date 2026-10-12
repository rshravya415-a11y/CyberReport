import axios from "axios";

// Clean and normalize API base URL
function getBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    // Strip trailing slashes and trailing /api so endpoints can cleanly use /api/...
    return envUrl.trim().replace(/\/+$/, "").replace(/\/api$/, "");
  }
  // In Vite dev mode, default to localhost:8080
  if (import.meta.env.DEV) {
    return "http://localhost:8080";
  }
  // In production, fallback to relative URL
  return "";
}

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// Attach auth tokens and user identifier header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cyberreport_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const userEmail =
    localStorage.getItem("cyberreport_user_email") ||
    sessionStorage.getItem("cyberreport_admin_email");

  if (userEmail) {
    config.headers["X-User-Email"] = userEmail;
  }

  return config;
});

// User-friendly network error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error(
        `[CyberReport API Network Error] Backend at "${API_BASE_URL || window.location.origin}" is unreachable. Check service status, URL, or CORS.`,
        error
      );
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/api/users/register", data),
  login: (data) => api.post("/api/users/login", data),
  logout: () => api.post("/api/logout"),
  getProfile: () => api.get("/api/users/profile"),
  updateProfile: (data) => api.put("/api/users/profile", data),
};

export const complaintAPI = {
  create: (data) => api.post("/api/complaints", data),

  uploadEvidence: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/complaints/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMine: () => api.get("/api/complaints/my"),
  getById: (id) => api.get(`/api/complaints/${id}`),

  track: (referenceNumber) =>
    api.get(
      `/api/complaints/track/${encodeURIComponent(
        (referenceNumber || "").trim()
      )}`
    ),

  getEvidenceUrl: (fileName) =>
    `${API_BASE_URL || ""}/api/complaints/evidence/${encodeURIComponent(fileName || "")}`,
};

export const adminAPI = {
  getDashboard: () => api.get("/api/admin/dashboard"),
  getAllComplaints: () => api.get("/api/admin/complaints"),
  getComplaintById: (id) => api.get(`/api/admin/complaints/${id}`),

  updateStatus: (id, status, adminRemarks) =>
    api.patch(`/api/admin/complaints/${id}/status`, {
      status,
      adminRemarks,
    }),

  updateRemarks: (id, adminRemarks) =>
    api.patch(`/api/admin/complaints/${id}/remarks`, {
      adminRemarks,
    }),
};

export const profileAPI = {
  get: () => api.get("/api/users/profile"),
  update: (data) => api.put("/api/users/profile", data),
};

export default api;
