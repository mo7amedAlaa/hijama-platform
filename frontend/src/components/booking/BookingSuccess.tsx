
// ─────────────────────────────────────────────────────────────
// src/components/booking/BookingSuccess.tsx
// ─────────────────────────────────────────────────────────────
import type { Booking } from "../../types";

interface BookingSuccessProps {
  booking: Booking | null;
  onNewBooking: () => void;
  onViewBookings: () => void;
}

export function BookingSuccess({ booking, onNewBooking, onViewBookings }: BookingSuccessProps) {
  const rows = [
    { label: "الخدمة",  val: booking?.therapy_session?.name_ar },
    { label: "التاريخ", val: booking?.slot?.date },
    { label: "الوقت",   val: booking?.slot?.start_time?.slice(0, 5) },
    { label: "الحالة",  val: "قيد المراجعة" },
  ];
  return (
    <div className="flex flex-col items-center text-center py-10 px-4 space-y-6">
      <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-5xl animate-bounce">
        ✅
      </div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">تم الحجز بنجاح!</h2>
        <p className="text-gray-400 text-sm leading-relaxed">سيتواصل معك فريقنا لتأكيد الموعد.</p>
      </div>
      <div className="bg-white/5 border border-emerald-500/30 rounded-2xl px-8 py-5 w-full max-w-xs">
        <p className="text-xs text-gray-500 mb-1">رقم الحجز</p>
        <p className="text-3xl font-black tracking-widest text-emerald-400">{booking?.booking_ref}</p>
      </div>
      <div className="w-full max-w-xs space-y-2 text-sm">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between py-2 border-b border-white/8">
            <span className="text-gray-500">{r.label}</span>
            <span className="text-white font-semibold">{r.val ?? "—"}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 w-full max-w-xs pt-2">
        <button onClick={onNewBooking}
          className="flex-1 py-3 rounded-xl border border-white/15 text-sm text-gray-300 hover:border-emerald-500/40 hover:text-white transition-all">
          + حجز جديد
        </button>
        <button onClick={onViewBookings}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/30">
          حجوزاتي ←
        </button>
      </div>
    </div>
  );
}