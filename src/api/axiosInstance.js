import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // adjust if your API prefix differs
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
