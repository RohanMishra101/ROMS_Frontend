import axiosInstance from "./axiosInstance";

export const loginAdmin = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

export const registerAdmin = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const getProfile = async () => {
  const res = await axiosInstance.get("/auth/profile");
  return res.data;
};
