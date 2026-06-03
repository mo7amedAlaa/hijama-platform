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