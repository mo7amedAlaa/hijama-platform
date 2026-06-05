// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyBookings } from "../../hooks/useBooking";
import { authService } from "../../services/api";
import { bookingService } from "../../services/api";
import type { Booking, BookingStatus, User } from "../../types";
import { useAuth } from "../../context/AuthContext";

// ─── Status config ────────────────────────────────────────────
const STATUS_MAP: Record<BookingStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "قيد الانتظار", color: "#F5A623", bg: "#F5A62315", border: "#F5A62340" },
  confirmed: { label: "مؤكدة",        color: "#00C9A7", bg: "#00C9A715", border: "#00C9A740" },
  completed: { label: "مكتملة",       color: "#5A6A85", bg: "#5A6A8515", border: "#5A6A8540" },
  cancelled: { label: "ملغاة",        color: "#FF4D6D", bg: "#FF4D6D15", border: "#FF4D6D40" },
};

const SESSION_ICONS: Record<number, string> = { 1:"🩸",2:"💆",3:"✨",4:"🏃",5:"🦾",6:"🧘" };

// ─── Edit Modal ───────────────────────────────────────────────
interface EditModalProps {
  booking: Booking;
  onClose: () => void;
  onSave: (id: number, notes: string) => Promise<void>;
}

function EditModal({ booking, onClose, onSave }: EditModalProps) {
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(booking.id, notes);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-md bg-[#0E1628] border border-white/10 rounded-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-white">تعديل الحجز</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            ×
          </button>
        </div>

        {/* Booking info (read-only) */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4 mb-5 space-y-2">
          {[
            { label:"الخدمة",  val: booking.therapy_session?.name_ar },
            { label:"التاريخ", val: booking?.appointment_date?.slice(0,10) },
            { label:"الوقت",   val: booking?.appointment_start?.slice(0,5) },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{r.label}</span>
              <span className="text-white font-semibold">{r.val ?? "—"}</span>
            </div>
          ))}
        </div>

        {/* Editable notes */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 mb-2 block">ملاحظات / طلبات خاصة</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            placeholder="مثال: أرجو التركيز على منطقة أسفل الظهر..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/25 transition-all">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />جارٍ الحفظ</>
              : "💾 حفظ التعديلات"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Confirm Dialog ────────────────────────────────────
interface CancelDialogProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

function CancelDialog({ booking, onClose, onConfirm }: CancelDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(booking.id);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-sm bg-[#0E1628] border border-red-500/20 rounded-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
            🗑️
          </div>
          <h3 className="text-lg font-black text-white mb-2">إلغاء الحجز</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            هل أنت متأكد من إلغاء حجز <span className="text-white font-semibold">{booking.therapy_session?.name_ar}</span>؟<br />
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/25 transition-all">
            تراجع
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-red-500/25 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الإلغاء</>
              : "تأكيد الإلغاء"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────
interface BookingCardProps {
  booking: Booking;
  onEdit: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}

function BookingCard({ booking, onEdit, onCancel }: BookingCardProps) {
  const status = STATUS_MAP[booking.status];
  const icon   = SESSION_ICONS[booking.therapy_session_id] ?? "🏥";
  const canAct = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="bg-[#111E33] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="font-bold text-white text-sm leading-tight">
              {booking.therapy_session?.name_ar ?? "—"}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 border"
              style={{ color: status.color, background: status.bg, borderColor: status.border }}>
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
            <span>📅 {booking?.appointment_date?.slice(0,10)?? "—"}</span>
            <span>⏰ {booking?.appointment_start?.slice(0,5) ?? "—"}</span>
            <span>🔖 {booking.booking_ref}</span>
          </div>

          {booking.notes && (
            <p className="text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2 mb-3 leading-relaxed line-clamp-2">
              💬 {booking.notes}
            </p>
          )}

          {/* Actions */}
          {canAct && (
            <div className="flex gap-2">
              <button onClick={() => onEdit(booking)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-all">
                ✏️ تعديل
              </button>
              <button onClick={() => onCancel(booking)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-red-500/40 hover:text-red-400 transition-all">
                🗑️ إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Header ───────────────────────────────────────────

interface ProfileHeaderProps { user: User; onLogout: () => void; }

function ProfileHeader({ user, onLogout }: ProfileHeaderProps) 
{
  const {  updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(user.name);
  const [phone,   setPhone]   = useState(user.phone ?? "");
  const [weight, setWeight] = useState(user.weight ?? "");
const [age, setAge] = useState(user.age ?? ""); 
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSave = async () => {
  try {
    setLoading(true);
    setError("");

    const payload = {
      name,
      phone,
      weight: weight ? Number(weight) : null,
      age: age ? Number(age) : null,
       
    };
    await updateProfile(payload);
    setEditing(false);
  } catch (err) {
    setError("فشل تحديث البيانات");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-[#111E33] border border-white/8 rounded-3xl p-6 mb-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl font-black text-black flex-shrink-0">
            {user.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              {user.role === "admin" ? "👑 أدمن" : "👤 عميل"}
            </span>
          </div>
        </div>
        <button onClick={onLogout}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-white/10 hover:border-red-500/30 rounded-xl px-3 py-1.5">
          تسجيل خروج
        </button>
      </div>

      {/* Editable fields */}
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">الاسم</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">رقم الهاتف</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60" />
          </div>
          
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">  الوزن </label>
            <input  type="number"
  value={weight}
  onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block"> العمر </label>
            <input  type="number"
  value={age}
  onChange={(e) => setAge(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
              إلغاء
            </button>
           <button
  onClick={handleSave}
  disabled={loading}
  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm"
>
  {loading ? "جاري الحفظ..." : "حفظ"}
</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:"الهاتف",         val: user.phone ?? "غير محدد" },
            { label:"العمر",           val: user.age   ?? "غير محدد" },
            { label:"تاريخ الانضمام", val: new Date(user.created_at).toLocaleDateString("ar-SA") },
            { label:"الوزن",           val: user.weight ? `${user.weight} كجم` : "غير محدد" },
          ].map(r => (
            <div key={r.label} className="bg-white/5 rounded-xl px-3 py-2.5">
              <div className="text-xs text-gray-500 mb-0.5">{r.label}</div>
              <div className="text-sm font-semibold text-white">{r.val}</div>
            </div>
          ))}
          <button onClick={() => setEditing(true)}
            className="col-span-2 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
            ✏️ تعديل الملف الشخصي
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Bookings Stats ───────────────────────────────────────────
function BookingStats({ bookings }: { bookings: Booking[] }) {
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {} as Record<BookingStatus, number>);

  const stats = [
    { label:"الكل",       val: bookings.length,         color:"#E8EDF5" },
    { label:"قيد الانتظار", val: counts.pending   ?? 0, color:"#F5A623" },
    { label:"مؤكدة",      val: counts.confirmed  ?? 0,  color:"#00C9A7" },
    { label:"مكتملة",     val: counts.completed  ?? 0,  color:"#5A6A85" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-[#111E33] border border-white/8 rounded-2xl p-3 text-center">
          <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.val}</div>
          <div className="text-xs text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────
const FILTER_OPTIONS: { label: string; value: BookingStatus | "all" }[] = [
  { label:"الكل",     value:"all" },
  { label:"قيد الانتظار", value:"pending" },
  { label:"مؤكدة",   value:"confirmed" },
  { label:"مكتملة",  value:"completed" },
  { label:"ملغاة",   value:"cancelled" },
];

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const { bookings, loading, error, fetch, cancel } = useMyBookings();

  const [filter,       setFilter]       = useState<BookingStatus | "all">("all");
  const [editTarget,   setEditTarget]   = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [user,         setUser]         = useState<User | null>(null);

  // load user + bookings
  useEffect(() => {
    fetch();
    authService.me().then(r => setUser(r.data)).catch(() => navigate("/login"));
  }, []);

  // update booking notes
  const handleSaveEdit = async (id: number, notes: string) => {
    await bookingService.update(id, { notes } as Partial<Booking>);
    fetch(); // refresh
  };

  // cancel booking
  const handleConfirmCancel = async (id: number) => {
    await cancel(id);
  };

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter(b => b.status === filter);

  // ── Skeleton ────────────────────────────────────────────────
  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-[#070D1A] p-4 pt-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-48 rounded-3xl bg-white/5 animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {Array(4).fill(0).map((_,i) => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
          {Array(3).fill(0).map((_,i) => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D1A] p-4 pt-8">
      {/* bg orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-amber-500/4 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Back button */}
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
          → العودة للرئيسية
        </button>

        {/* Profile header */}
        {user && <ProfileHeader user={user} onLogout={handleLogout} />}

        {/* Booking stats */}
        <BookingStats bookings={bookings} />

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">حجوزاتي</h3>
          <button onClick={() => navigate("/booking")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-xs hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/25">
            + حجز جديد
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                ${filter === opt.value
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Booking list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/3 border border-white/8 rounded-3xl">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">لا توجد حجوزات في هذا التصنيف</p>
            <button onClick={() => navigate("/booking")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm">
              احجز الآن
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <BookingCard key={b.id} booking={b}
                onEdit={setEditTarget}
                onCancel={setCancelTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {editTarget && (
        <EditModal booking={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit} />
      )}
      {cancelTarget && (
        <CancelDialog booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel} />
      )}
    </div>
  );
}