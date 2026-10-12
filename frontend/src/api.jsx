import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

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
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/logout"),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
};

export const complaintAPI = {
  create: (data) => api.post("/complaints", data),
  uploadEvidence: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/complaints/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getMine: () => api.get("/complaints/my"),
  getById: (id) => api.get(`/complaints/${id}`),
  track: (referenceNumber) =>
    api.get(`/complaints/track/${encodeURIComponent(referenceNumber.trim())}`),
  getEvidenceUrl: (fileName) => `${API_BASE_URL}/complaints/evidence/${fileName}`,
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAllComplaints: () => api.get("/admin/complaints"),
  getComplaintById: (id) => api.get(`/admin/complaints/${id}`),
  updateStatus: (id, status, adminRemarks) =>
    api.patch(`/admin/complaints/${id}/status`, { status, adminRemarks }),
  updateRemarks: (id, adminRemarks) =>
    api.patch(`/admin/complaints/${id}/remarks`, { adminRemarks }),
};

export const profileAPI = {
  get: () => api.get("/users/profile"),
  update: (data) => api.put("/users/profile", data),
};

export default api;