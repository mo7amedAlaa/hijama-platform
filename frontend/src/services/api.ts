// src/services/api.ts
 
import type { AxiosResponse } from "axios";
import type {
  AuthResponse, LoginPayload, RegisterPayload,
  TherapySession, Slot, Booking,
  CreateBookingPayload, PaginatedResponse, User,
} from "../types";
import api from "../api/axios";



// ────────────────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────────────────
export const authService = {
  register: (data: RegisterPayload): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/register", data),

  login: (data: LoginPayload): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/login", data),

  logout: (): Promise<AxiosResponse<{ message: string }>> =>
    api.post("/logout"),

  me: (): Promise<AxiosResponse<User>> =>
    api.get("/me"),
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put("/me", data),
   nextSession: async () => {
  const res = await api.get("/me/next-session");
  return res.data.booking;
},
};
 

// ────────────────────────────────────────────────────────────
// Sessions
// ────────────────────────────────────────────────────────────
export const sessionService = {
  getAll: (): Promise<AxiosResponse<TherapySession[]>> =>
    api.get("/sessions"),
};

// ────────────────────────────────────────────────────────────
// Slots
// ────────────────────────────────────────────────────────────
export const slotService = {
  getByDate: (date: string): Promise<AxiosResponse<Slot[]>> =>
    api.get("/slots", { params: { date } }),
};

// ────────────────────────────────────────────────────────────
// Bookings
// ────────────────────────────────────────────────────────────
export const bookingService = {
  create: (data: CreateBookingPayload): Promise<AxiosResponse<Booking>> =>
    api.post("/bookings", data),

  getAll: (): Promise<AxiosResponse<PaginatedResponse<Booking>>> =>
    api.get("/bookings"),

  getMine: (): Promise<AxiosResponse<Booking[]>> =>
    api.get("/my-bookings"),

  getById: (id: number): Promise<AxiosResponse<Booking>> =>
    api.get(`/bookings/${id}`),

  update: (id: number, data: Partial<Booking>): Promise<AxiosResponse<Booking>> =>
    api.put(`/bookings/${id}`, data),

  cancel: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/bookings/${id}`),
 
  
};
 
// services/api.ts
export const consultationService = {
  my: () => api.get("/consultations"),
  create: (data: any) => api.post("/consultations", data),
};
