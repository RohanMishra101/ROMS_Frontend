import axios from "axios";
import API_BASE_URL from "../config/api.js";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if you're using cookies, else remove
});

// Attach token if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
