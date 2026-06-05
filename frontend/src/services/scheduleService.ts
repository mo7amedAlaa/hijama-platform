// ─────────────────────────────────────────────────────────────
// src/services/scheduleService.ts
// كل الـ API calls المتعلقة بجدول العمل والمواعيد
// ─────────────────────────────────────────────────────────────
import api from "../api/axios";
import type { AxiosResponse } from "axios";

// ── Types ──────────────────────────────────────────────────
export interface WorkSchedule {
  id?: number;
  day_of_week: number;       // 0=أحد … 6=سبت
  start_time: string;        // "08:00"
  end_time: string;          // "20:00"
  slot_duration: number;     // 30 | 45 | 60 | 90
  is_active: boolean;
}

export interface BlockedSlot {
  id: number;
  date: string;              // "YYYY-MM-DD"
  start_time: string | null; // null = يوم كامل
  reason: string | null;
}

export interface SlotStats {
  today: { available: number; booked: number };
  this_month: {
    total: number; pending: number;
    confirmed: number; completed: number; cancelled: number;
  };
  blocked_days: number;
}

export interface BlockSlotPayload {
  date: string;
  start_time?: string | null;  // null = يوم كامل
  reason?: string;
}

// ── Service ────────────────────────────────────────────────
export const scheduleService = {

  // ── جدول العمل ─────────────────────────────────────────
  /** GET /api/admin/work-schedule */
  getWorkSchedule: (): Promise<AxiosResponse<WorkSchedule[]>> =>
    api.get("/admin/work-schedule"),

  /** PUT /api/admin/work-schedule */
  updateWorkSchedule: (
    schedules: WorkSchedule[]
  ): Promise<AxiosResponse<{ message: string; schedules: WorkSchedule[] }>> =>
    api.put("/admin/work-schedule", { schedules }),

  // ── تعطيل الأوقات ──────────────────────────────────────
  /** GET /api/admin/blocked-slots */
  getBlockedSlots: (): Promise<AxiosResponse<BlockedSlot[]>> =>
    api.get("/admin/blocked-slots"),

  /** POST /api/admin/blocked-slots */
  blockSlot: (
    payload: BlockSlotPayload
  ): Promise<AxiosResponse<BlockedSlot>> =>
    api.post("/admin/blocked-slots", payload),

  /** DELETE /api/admin/blocked-slots/{id} */
  unblockSlot: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/admin/blocked-slots/${id}`),

  // ── إحصائيات ───────────────────────────────────────────
  /** GET /api/admin/slots/stats */
  getStats: (): Promise<AxiosResponse<SlotStats>> =>
    api.get("/admin/slots/stats"),
};