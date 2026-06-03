import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
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
export const extractError = (err: unknown): string => {
  const e = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const errors = e.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors)[0];
    if (first?.[0]) return first[0];
  }
  return e.response?.data?.message ?? "حدث خطأ غير متوقع";
};
export default api;