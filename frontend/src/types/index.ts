

// ─── Auth ────────────────────────────────────────────────────
export type UserRole = "admin" | "client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  age: string | null;
  weight: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  age?: string;
  weight?: string;
}

// ─── Therapy Session (الخدمات) ───────────────────────────────
export interface TherapySession {
  id: number;
  name: string;
  name_ar: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Slot (المواعيد) ─────────────────────────────────────────
export interface Slot {
  id: number;
  date: string;        // "YYYY-MM-DD"
  start_time: string;  // "HH:MM:SS"
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Booking ─────────────────────────────────────────────────
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: number;
  user_id: number;
  therapy_session_id: number;
  slot_id: number;
  status: BookingStatus;
  booking_ref: string;
  notes: string | null;
  complaints: string[] | null;
  conditions: string[] | null;
  goals: string[] | null;
  pain_level: string | null;
  injury_location: string | null;
  injury_duration: string | null;
  created_at: string;
  updated_at: string;
  // eager-loaded relations
  user?: User;
  therapy_session?: TherapySession;
  slot?: Slot;
}

export interface CreateBookingPayload {
  therapy_session_id: number;
  slot_id: number;
  notes?: string;
  complaints?: string[];
  conditions?: string[];
  goals?: string[];
  pain_level?: string;
  injury_location?: string;
  injury_duration?: string;
}

// ─── Medical form (local UI state) ──────────────────────────
export interface MedicalForm {
  complaints: string[];
  conditions: string[];
  goals: string[];
  pain_level: string;
  injury_location: string;
  notes: string;
}

// ─── API pagination wrapper ──────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Generic API error ───────────────────────────────────────
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
//updateProfile
export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  password?: string;
  weight?: number;
  age?: number;
} 
  // ─── Types ────────────────────────────────────────────────────
export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

export type AdminView = "overview" | "bookings" | "users" | "sessions" | "slots";
