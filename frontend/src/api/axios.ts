import axios, { AxiosError } from "axios";

// 👇 خذ الرابط من متغير بيئة
const baseURL = import.meta.env.VITE_API_URL || "https://higamaplatform.com/v2/api";

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
});

// 🔐 attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🧠 error helper
export const extractError = (err: unknown): string => {
  const e = err as AxiosError<{
    message?: string;
    errors?: Record<string, string[]>;
  }>;

  const errors = e.response?.data?.errors;

  if (errors) {
    const first = Object.values(errors)[0];
    if (first?.[0]) return first[0];
  }

  return e.response?.data?.message ?? "حدث خطأ غير متوقع";
};

export default api;