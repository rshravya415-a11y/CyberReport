
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://cyberreport-production-ac95.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 20000,
});

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
        referenceNumber.trim()
      )}`
    ),

  getEvidenceUrl: (fileName) =>
    `${API_BASE_URL}/api/complaints/evidence/${fileName}`,
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
