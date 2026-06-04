// src/pages/AdminDashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { extractError } from "../../api/axios";
import type { Booking, BookingStatus, User, TherapySession } from "../../types";

// ─── Types ────────────────────────────────────────────────────
type AdminView = "overview" | "bookings" | "users" | "sessions" | "schedule";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

interface WorkSchedule {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

interface BlockedSlot {
  id: number;
  date: string;
  start_time: string | null;
  reason: string | null;
}

// ─── Constants ────────────────────────────────────────────────
const STATUS_CFG: Record<BookingStatus, { label: string; tw: string }> = {
  pending:   { label: "انتظار",  tw: "bg-amber-500/15  text-amber-400  border-amber-500/30"  },
  confirmed: { label: "مؤكدة",   tw: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  completed: { label: "مكتملة",  tw: "bg-slate-500/15  text-slate-400  border-slate-500/30"  },
  cancelled: { label: "ملغاة",   tw: "bg-red-500/15    text-red-400    border-red-500/30"    },
};

const SESSION_ICONS: Record<number, string> = { 1:"🩸",2:"💆",3:"✨",4:"🏃",5:"🦾",6:"🧘" };
const DAYS_AR = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

const NAV: { id: AdminView; label: string; icon: string }[] = [
  { id:"overview",  label:"عام",       icon:"📊" },
  { id:"bookings",  label:"الحجوزات",  icon:"📅" },
  { id:"users",     label:"العملاء",   icon:"👥" },
  { id:"sessions",  label:"الخدمات",   icon:"🏥" },
  { id:"schedule",  label:"الجدول",    icon:"🗓" },
];

// ─── Tiny helpers ─────────────────────────────────────────────
const Skeleton = ({ cls = "" }: { cls?: string }) => (
  <div className={`rounded-2xl bg-white/5 animate-pulse ${cls}`} />
);

const Badge = ({ status }: { status: BookingStatus }) => (
  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CFG[status].tw}`}>
    {STATUS_CFG[status].label}
  </span>
);

// ─── Toast ────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "ok"|"err" }) {
  return (
    <div className={`
      fixed top-4 left-1/2 -translate-x-1/2 z-[999]
      flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold
      shadow-xl backdrop-blur-sm border
      transition-all duration-300
      ${type === "ok"
        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
        : "bg-red-500/20    border-red-500/40    text-red-300"
      }
    `}>
      {type === "ok" ? "✅" : "⚠️"} {msg}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
interface StatCardProps {
  icon: string; label: string; value: number | string;
  color: string; onClick?: () => void;
}
function StatCard({ icon, label, value, color, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full text-right p-4 sm:p-5 rounded-2xl border border-white/8
        bg-[#111E33] hover:border-white/20
        transition-all duration-300 hover:-translate-y-1
        active:scale-[.97]
      `}
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl mb-3"
        style={{ background:`${color}18`, border:`1px solid ${color}30` }}
      >
        {icon}
      </div>
      <div className="text-xl sm:text-2xl font-black mb-0.5 transition-colors" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] sm:text-xs text-gray-500">{label}</div>
    </button>
  );
}

// ─── Overview ─────────────────────────────────────────────────
function OverviewView({
  stats, bookings, loading, onNav,
}: { stats: DashboardStats; bookings: Booking[]; loading: boolean; onNav:(v:AdminView)=>void }) {
  const cards = [
    { icon:"📅", label:"إجمالي الحجوزات",  value: stats.totalBookings,     color:"#00C9A7", nav:"bookings" as AdminView },
    { icon:"⏳", label:"قيد الانتظار",      value: stats.pendingBookings,   color:"#F5A623", nav:"bookings" as AdminView },
    { icon:"✅", label:"مؤكدة",             value: stats.confirmedBookings, color:"#3B82F6", nav:"bookings" as AdminView },
    { icon:"🏁", label:"مكتملة",            value: stats.completedBookings, color:"#64748B", nav:"bookings" as AdminView },
    { icon:"👥", label:"العملاء",           value: stats.totalUsers,        color:"#A855F7", nav:"users"    as AdminView },
    { icon:"💰", label:"الإيرادات",         value:`${stats.totalRevenue.toLocaleString()} ر.س`, color:"#F5A623", nav:"bookings" as AdminView },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white">نظرة عامة</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">ملخص النشاط</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {loading
          ? Array(6).fill(0).map((_,i) => <Skeleton key={i} cls="h-28" />)
          : cards.map(c => (
              <StatCard key={c.label} icon={c.icon} label={c.label}
                value={c.value} color={c.color} onClick={() => onNav(c.nav)} />
            ))
        }
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-bold text-white">أحدث الحجوزات</h3>
          <button onClick={() => onNav("bookings")}
            className="text-xs text-emerald-400 hover:underline transition-colors">
            عرض الكل
          </button>
        </div>
        {loading ? <Skeleton cls="h-48" /> : (
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full text-sm text-right min-w-[480px]">
              <thead>
                <tr className="bg-white/3">
                  {["العميل","الخدمة","الموعد","الحالة"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map(b => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{b.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{b.therapy_session?.name_ar ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{b.appointment_date} {b.appointment_time?.slice(0,5)}</td>
                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bookings ─────────────────────────────────────────────────
function BookingsView({
  bookings, loading, onStatusChange,
}: { bookings: Booking[]; loading: boolean; onStatusChange:(id:number,s:BookingStatus)=>void }) {
  const [filter, setFilter] = useState<BookingStatus|"all">("all");
  const [q, setQ] = useState("");

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !q || b.user?.name?.toLowerCase().includes(q.toLowerCase()) || b.booking_ref.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-black text-white">الحجوزات</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="🔍 بحث..."
          className="bg-[#111E33] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 w-full sm:w-56 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          {(["all","pending","confirmed","completed","cancelled"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all
                ${filter === f
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"}`}>
              {f === "all" ? "الكل" : STATUS_CFG[f].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton cls="h-64" /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm text-right min-w-[600px]">
            <thead>
              <tr className="bg-white/3">
                {["رقم الحجز","العميل","الخدمة","الموعد","الحالة","تغيير"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">لا توجد نتائج</td></tr>
                : filtered.map(b => (
                    <tr key={b.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.booking_ref}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-sm">{b.user?.name ?? "—"}</div>
                        <div className="text-xs text-gray-500">{b.user?.phone ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                        {SESSION_ICONS[b.therapy_session_id] ?? "🏥"} {b.therapy_session?.name_ar ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {b.appointment_date}<br />{b.appointment_time?.slice(0,5)}
                      </td>
                      <td className="px-4 py-3"><Badge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <select value={b.status}
                          onChange={e => onStatusChange(b.id, e.target.value as BookingStatus)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-emerald-500/60 cursor-pointer transition-colors">
                          {(Object.keys(STATUS_CFG) as BookingStatus[]).map(s => (
                            <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────
function UsersView({ users, loading }: { users: User[]; loading: boolean }) {
  const [q, setQ] = useState("");
  const filtered = users.filter(u => !q ||
    u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-black text-white">العملاء</h2>
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="🔍 بحث..."
        className="bg-[#111E33] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 w-full sm:w-56 transition-colors" />

      {loading ? <Skeleton cls="h-64" /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm text-right min-w-[480px]">
            <thead>
              <tr className="bg-white/3">
                {["المستخدم","الهاتف","الدور","الانضمام"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={4} className="text-center py-12 text-gray-500 text-sm">لا توجد نتائج</td></tr>
                : filtered.map(u => (
                    <tr key={u.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                            {u.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          u.role === "admin"
                            ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
                            : "text-blue-400 bg-blue-500/15 border-blue-500/30"
                        }`}>
                          {u.role === "admin" ? "👑 أدمن" : "👤 عميل"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sessions ─────────────────────────────────────────────────
function SessionsView({
  sessions, loading, onToggle,
}: { sessions: TherapySession[]; loading: boolean; onToggle:(id:number,v:boolean)=>void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-black text-white">الخدمات</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_,i) => <Skeleton key={i} cls="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessions.map(s => (
            <div key={s.id}
              className={`bg-[#111E33] border rounded-2xl p-4 sm:p-5 transition-all duration-300
                ${s.is_active ? "border-white/8 hover:border-white/18" : "border-white/5 opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl">
                    {SESSION_ICONS[s.id] ?? "🏥"}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{s.name_ar}</div>
                    <div className="text-xs text-gray-500">{s.duration_minutes} دقيقة</div>
                  </div>
                </div>
                {/* Toggle */}
                <button onClick={() => onToggle(s.id, !s.is_active)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0
                    ${s.is_active ? "bg-emerald-500" : "bg-white/10"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300
                    ${s.is_active ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{s.description ?? "—"}</p>
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-black text-emerald-400">
                  {s.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">ر.س</span>
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold transition-colors ${
                  s.is_active
                    ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                    : "text-gray-500 bg-white/5 border-white/10"
                }`}>{s.is_active ? "نشطة" : "معطلة"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Schedule (جدول العمل + تعطيل) ───────────────────────────
const DEFAULT_SCHEDULE: WorkSchedule[] = Array.from({ length: 7 }, (_, i) => ({
  day_of_week: i, start_time: "08:00", end_time: "20:00", slot_duration: 60, is_active: i < 5,
}));

function ScheduleView({ toast }: { toast: (m:string,t:"ok"|"err")=>void }) {
  const [schedule,  setSchedule]   = useState<WorkSchedule[]>(DEFAULT_SCHEDULE);
  const [blocked,   setBlocked]    = useState<BlockedSlot[]>([]);
  const [saving,    setSaving]     = useState(false);
  const [blockDate, setBlockDate]  = useState("");
  const [blockTime, setBlockTime]  = useState("");
  const [blockNote, setBlockNote]  = useState("");
  const [blocking,  setBlocking]   = useState(false);

  useEffect(() => {
    api.get<WorkSchedule[]>("/admin/work-schedule").then(r => { if (r.data.length) setSchedule(r.data); }).catch(()=>{});
    api.get<BlockedSlot[]>("/admin/blocked-slots").then(r => setBlocked(r.data)).catch(()=>{});
  }, []);

  const updateDay = <K extends keyof WorkSchedule>(day: number, field: K, val: WorkSchedule[K]) =>
    setSchedule(s => s.map(d => d.day_of_week === day ? { ...d, [field]: val } : d));

  const save = async () => {
    setSaving(true);
    try { await api.put("/admin/work-schedule", { schedules: schedule }); toast("تم حفظ جدول العمل", "ok"); }
    catch (e) { toast(extractError(e), "err"); }
    finally { setSaving(false); }
  };

  const block = async () => {
    if (!blockDate) return;
    setBlocking(true);
    try {
      const { data } = await api.post<BlockedSlot>("/admin/blocked-slots", {
        date: blockDate, start_time: blockTime || null, reason: blockNote || null,
      });
      setBlocked(p => [...p, data]);
      setBlockDate(""); setBlockTime(""); setBlockNote("");
      toast("تم التعطيل", "ok");
    } catch (e) { toast(extractError(e), "err"); }
    finally { setBlocking(false); }
  };

  const unblock = async (id: number) => {
    try {
      await api.delete(`/admin/blocked-slots/${id}`);
      setBlocked(p => p.filter(b => b.id !== id));
      toast("تم إعادة الموعد", "ok");
    } catch (e) { toast(extractError(e), "err"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-black text-white">جدول العمل</h2>

      {/* Work schedule */}
      <div className="bg-[#111E33] border border-white/8 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">📆 أوقات العمل الأسبوعية</h3>

        {/* Header labels — hidden on mobile */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-3 mb-1 text-[10px] text-gray-600">
          <div className="col-span-3">اليوم</div>
          <div className="col-span-3">من</div>
          <div className="col-span-3">إلى</div>
          <div className="col-span-3">مدة الموعد</div>
        </div>

        <div className="space-y-2.5">
          {schedule.map(day => (
            <div key={day.day_of_week}
              className={`rounded-xl border p-3 transition-all duration-300
                ${day.is_active ? "border-white/10 bg-white/3" : "border-white/5 opacity-50"}`}>

              {/* Mobile: stacked layout */}
              <div className="flex items-center justify-between mb-3 sm:hidden">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateDay(day.day_of_week, "is_active", !day.is_active)}
                    className={`relative w-9 h-[18px] rounded-full transition-all ${day.is_active ? "bg-emerald-500" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${day.is_active ? "right-0.5" : "left-0.5"}`} />
                  </button>
                  <span className="text-sm font-semibold text-white">{DAYS_AR[day.day_of_week]}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${
                  day.is_active ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" : "text-gray-600 bg-white/5 border-white/8"
                }`}>{day.is_active ? "يوم عمل" : "إجازة"}</span>
              </div>
              <div className={`grid grid-cols-2 sm:hidden gap-2 ${!day.is_active ? "pointer-events-none" : ""}`}>
                <div>
                  <div className="text-[10px] text-gray-600 mb-1">من</div>
                  <input type="time" value={day.start_time}
                    onChange={e => updateDay(day.day_of_week, "start_time", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 mb-1">إلى</div>
                  <input type="time" value={day.end_time}
                    onChange={e => updateDay(day.day_of_week, "end_time", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60" />
                </div>
              </div>

              {/* Desktop: grid layout */}
              <div className={`hidden sm:grid grid-cols-12 gap-2 items-center ${!day.is_active ? "pointer-events-none" : ""}`}>
                <div className="col-span-3 flex items-center gap-2.5">
                  <button onClick={() => updateDay(day.day_of_week, "is_active", !day.is_active)}
                    className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${day.is_active ? "bg-emerald-500" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${day.is_active ? "right-0.5" : "left-0.5"}`} />
                  </button>
                  <span className="text-sm font-semibold text-white">{DAYS_AR[day.day_of_week]}</span>
                </div>
                <div className="col-span-3">
                  <input type="time" value={day.start_time}
                    onChange={e => updateDay(day.day_of_week, "start_time", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60" />
                </div>
                <div className="col-span-3">
                  <input type="time" value={day.end_time}
                    onChange={e => updateDay(day.day_of_week, "end_time", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60" />
                </div>
                <div className="col-span-3">
                  <select value={day.slot_duration}
                    onChange={e => updateDay(day.day_of_week, "slot_duration", +e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60">
                    {[30,45,60,90].map(d => <option key={d} value={d}>{d} دقيقة</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm disabled:opacity-60 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          {saving
            ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />حفظ...</>
            : "💾 حفظ جدول العمل"
          }
        </button>
      </div>

      {/* Block slot */}
      <div className="bg-[#111E33] border border-white/8 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">🚫 تعطيل وقت أو يوم</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { label:"التاريخ *",   type:"date",   val:blockDate, set:setBlockDate },
            { label:"الوقت (فارغ = يوم كامل)", type:"time", val:blockTime, set:setBlockTime },
            { label:"السبب",       type:"text",   val:blockNote, set:setBlockNote, ph:"مثال: إجازة" },
          ].map(f => (
            <div key={f.label}>
              <div className="text-xs text-gray-500 mb-1.5">{f.label}</div>
              <input type={f.type} value={f.val}
                placeholder={(f as any).ph ?? ""}
                onChange={e => f.set(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/60 transition-colors" />
            </div>
          ))}
        </div>

        <button onClick={block} disabled={blocking || !blockDate}
          className="px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-sm disabled:opacity-50 hover:bg-red-500/25 active:scale-95 transition-all flex items-center gap-2 mb-5">
          {blocking
            ? <><span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />جارٍ...</>
            : "🚫 تعطيل"
          }
        </button>

        {blocked.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2">المعطلة ({blocked.length})</div>
            {blocked.map(b => (
              <div key={b.id}
                className="flex items-center justify-between bg-red-500/8 border border-red-500/15 rounded-xl px-3 sm:px-4 py-2.5 gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs min-w-0">
                  <span className="text-red-400 font-semibold">{b.date}</span>
                  <span className="text-gray-500">{b.start_time ? `⏰ ${b.start_time.slice(0,5)}` : "📅 يوم كامل"}</span>
                  {b.reason && <span className="text-gray-600 truncate">· {b.reason}</span>}
                </div>
                <button onClick={() => unblock(b.id)}
                  className="flex-shrink-0 text-xs text-gray-500 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 rounded-lg px-2.5 py-1 transition-all">
                  إعادة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar (desktop) + Bottom nav (mobile) ──────────────────
function Sidebar({ view, onSelect, onLogout }: { view:AdminView; onSelect:(v:AdminView)=>void; onLogout:()=>void }) {
  return (
    <aside className="hidden lg:flex w-52 xl:w-56 flex-shrink-0 bg-[#0A1222] border-l border-white/8 flex-col min-h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/8">
        <div className="text-xl font-black" style={{
          background:"linear-gradient(135deg,#00C9A7,#F5A623)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>CORE S+</div>
        <div className="text-[10px] text-gray-500 mt-0.5">لوحة التحكم</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-right
              ${view === item.id
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"}`}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/8">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all">
          🚪 خروج
        </button>
      </div>
    </aside>
  );
}

function BottomNav({ view, onSelect }: { view:AdminView; onSelect:(v:AdminView)=>void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 right-0 left-0 z-50 bg-[#0A1222]/95 backdrop-blur-md border-t border-white/8 flex safe-pb">
      {NAV.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all
            ${view === item.id ? "text-emerald-400" : "text-gray-600 hover:text-gray-400"}`}>
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[9px] font-semibold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Mobile top bar ───────────────────────────────────────────
function TopBar({ view, onLogout }: { view:AdminView; onLogout:()=>void }) {
  const current = NAV.find(n => n.id === view);
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0A1222] sticky top-0 z-40">
      <div className="text-base font-black" style={{
        background:"linear-gradient(135deg,#00C9A7,#F5A623)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      }}>CORE S+</div>
      <span className="text-sm text-gray-300 font-semibold">
        {current?.icon} {current?.label}
      </span>
      <button onClick={onLogout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
        🚪
      </button>
    </header>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view,     setView]     = useState<AdminView>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users,    setUsers]    = useState<User[]>([]);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loadingB, setLoadingB] = useState(false);
  const [loadingU, setLoadingU] = useState(false);
  const [loadingS, setLoadingS] = useState(false);
  const [toast,    setToast]    = useState<{ msg:string; type:"ok"|"err" } | null>(null);

  const showToast = useCallback((msg:string, type:"ok"|"err"="ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoadingB(true);
    try { const { data } = await api.get<{ data:Booking[] }>("/bookings"); setBookings(data.data); }
    catch (e) { showToast(extractError(e), "err"); }
    finally { setLoadingB(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingU(true);
    try { const { data } = await api.get<{ data:User[] }>("/users"); setUsers(data.data); }
    catch (e) { showToast(extractError(e), "err"); }
    finally { setLoadingU(false); }
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoadingS(true);
    try { const { data } = await api.get<TherapySession[]>("/sessions"); setSessions(data); }
    catch (e) { showToast(extractError(e), "err"); }
    finally { setLoadingS(false); }
  }, []);

  useEffect(() => { fetchBookings(); fetchUsers(); fetchSessions(); }, []);

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
      showToast("تم تحديث الحالة");
    } catch (e) { showToast(extractError(e), "err"); }
  };

  const handleToggleSession = async (id: number, is_active: boolean) => {
    try {
      await api.put(`/sessions/${id}`, { is_active });
      setSessions(p => p.map(s => s.id === id ? { ...s, is_active } : s));
      showToast(is_active ? "تم تفعيل الخدمة" : "تم إيقاف الخدمة");
    } catch (e) { showToast(extractError(e), "err"); }
  };

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch { /**/ }
    localStorage.removeItem("token");
    navigate("/login");
  };

  const stats: DashboardStats = {
    totalBookings:     bookings.length,
    pendingBookings:   bookings.filter(b => b.status === "pending").length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    totalUsers:        users.length,
    totalRevenue:      bookings.filter(b => b.status === "completed")
                               .reduce((s,b) => s + (b.therapy_session?.price ?? 0), 0),
  };

  return (
    <div className="flex min-h-screen bg-[#070D1A] text-white" dir="rtl">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Sidebar view={view} onSelect={setView} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar view={view} onLogout={handleLogout} />

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 overflow-y-auto">
          {view === "overview"  && <OverviewView stats={stats} bookings={bookings} loading={loadingB} onNav={setView} />}
          {view === "bookings"  && <BookingsView bookings={bookings} loading={loadingB} onStatusChange={handleStatusChange} />}
          {view === "users"     && <UsersView users={users} loading={loadingU} />}
          {view === "sessions"  && <SessionsView sessions={sessions} loading={loadingS} onToggle={handleToggleSession} />}
          {view === "schedule"  && <ScheduleView toast={showToast} />}
        </main>
      </div>

      <BottomNav view={view} onSelect={setView} />
    </div>
  );
}