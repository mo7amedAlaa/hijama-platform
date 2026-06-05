// src/pages/AdminDashboard.tsx  —  V2
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Navigate, useNavigate ,Link } from "react-router-dom";
import api, { extractError } from "../../api/axios";
import type { Booking, BookingStatus, User, TherapySession } from "../../types";
import { authService } from "../../services/api";

// ─── Types ────────────────────────────────────────────────────
type AdminView = "overview" | "bookings" | "users" | "sessions" | "schedule" |"consultations" ;

interface WorkSchedule {
  id?: number; day_of_week: number; start_time: string;
  end_time: string; slot_duration: number; is_active: boolean;
}
interface BlockedSlot {
  id: number; date: string; start_time: string | null; reason: string | null;
}
interface DashboardStats {
  totalBookings: number; pendingBookings: number; confirmedBookings: number;
  completedBookings: number; totalUsers: number; totalRevenue: number;
}
type ConsultationStatus = "pending" | "ans";

type Consultation = {
  id: number;
  user_id: number;
  type: "voice" | "chat" | "video";
  name: string;
  phone?: string | null;
  message?: string | null;
  status: ConsultationStatus;
  doctor_reply?: string | null;
  created_at: string;
};
// ─── Constants ────────────────────────────────────────────────
const STATUS_CFG: Record<BookingStatus, { label: string; tw: string }> = {
  pending:   { label:"انتظار", tw:"bg-amber-500/15  text-amber-400  border-amber-500/30"   },
  confirmed: { label:"مؤكدة",  tw:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  completed: { label:"مكتملة", tw:"bg-slate-500/15  text-slate-400  border-slate-500/30"   },
  cancelled: { label:"ملغاة",  tw:"bg-red-500/15    text-red-400    border-red-500/30"     },
};

const SESSION_ICONS: Record<number, string> = { 1:"🩸",2:"💆",3:"✨",4:"🏃",5:"🦾",6:"🧘" };
const DAYS_AR = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

const NAV: { id: AdminView; label: string; icon: string }[] = [
  { id:"overview",  label:"عام",      icon:"📊" },
  { id:"bookings",  label:"حجوزات",   icon:"📅" },
  { id:"consultations",  label:"استشارات",   icon:"👨‍⚕️" },
  { id:"users",     label:"عملاء",    icon:"👥" },
  { id:"sessions",  label:"خدمات",    icon:"🏥" },
  { id:"schedule",  label:"جدول",     icon:"🗓" },
];

// ─── Tiny UI helpers ──────────────────────────────────────────
const Skeleton = ({ cls="" }: { cls?: string }) => (
  <div className={`rounded-2xl bg-white/5 animate-pulse ${cls}`} />
);

const Badge = ({ status }: { status: BookingStatus }) => (
  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_CFG[status].tw}`}>
    {STATUS_CFG[status].label}
  </span>
);

// ─── Animated counter hook ────────────────────────────────────
function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "ok"|"err" }) {
  return (
    <div className={`
      fixed top-4 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl
      text-sm font-semibold border shadow-2xl backdrop-blur-sm
      animate-[fadeDown_.3s_ease]
      ${type==="ok"
        ? "bg-emerald-900/80 border-emerald-500/50 text-emerald-300"
        : "bg-red-900/80    border-red-500/50    text-red-300"}
    `}>
      {type==="ok" ? "✅ " : "⚠️ "}{msg}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
interface ConfirmProps {
  title: string; body: string;
  onConfirm: () => void; onCancel: () => void;
}
function ConfirmDialog({ title, body, onConfirm, onCancel }: ConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0E1628] border border-white/10 rounded-3xl p-6 shadow-2xl animate-[fadeDown_.25s_ease]">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-base font-black text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/25 transition-all active:scale-95">
            تراجع
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold text-sm transition-all active:scale-95">
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 1. OVERVIEW
// ──────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string; label: string; target: number | string;
  color: string; delay?: number; onClick?: () => void;
}
function StatCard({ icon, label, target, color, delay = 0, onClick }: StatCardProps) {
  const isNum = typeof target === "number";
  const val = useCounter(isNum ? (target as number) : 0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button ref={ref} onClick={onClick}
      style={{ transitionDelay: `${delay}ms` }}
      className={`
        group w-full text-right p-4 sm:p-5 rounded-2xl border border-white/8
        bg-[#111E33] hover:border-white/20
        transition-all duration-500 hover:-translate-y-1.5 active:scale-[.97]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
      `}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
        {icon}
      </div>
      <div className="text-2xl font-black mb-0.5 tabular-nums" style={{ color }}>
        {isNum ? val.toLocaleString() : target}
      </div>
      <div className="text-[11px] text-gray-500">{label}</div>
    </button>
  );
}

function OverviewView({
  stats, bookings, loading, onNav,
}: { stats: DashboardStats; bookings: Booking[]; loading: boolean; onNav:(v:AdminView)=>void }) {
  const cards = [
    { icon:"📅", label:"إجمالي الحجوزات",  target:stats.totalBookings,     color:"#00C9A7", nav:"bookings" as AdminView },
    { icon:"⏳", label:"قيد الانتظار",      target:stats.pendingBookings,   color:"#F5A623", nav:"bookings" as AdminView },
    { icon:"✅", label:"مؤكدة",             target:stats.confirmedBookings, color:"#3B82F6", nav:"bookings" as AdminView },
    { icon:"🏁", label:"مكتملة",            target:stats.completedBookings, color:"#64748B", nav:"bookings" as AdminView },
    { icon:"👥", label:"العملاء",           target:stats.totalUsers,        color:"#A855F7", nav:"users"    as AdminView },
    { icon:"💰", label:"الإيرادات",         target:`${stats.totalRevenue.toLocaleString()} ر.س`, color:"#F5A623", nav:"bookings" as AdminView },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white">نظرة عامة</h2>
        <p className="text-xs text-gray-500 mt-1">ملخص النشاط الكلي</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {loading
          ? Array(6).fill(0).map((_,i) => <Skeleton key={i} cls="h-28" />)
          : cards.map((c,i) => (
            <StatCard key={c.label} icon={c.icon} label={c.label}
              target={c.target} color={c.color} delay={i*80}
              onClick={() => onNav(c.nav)} />
          ))
        }
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-bold text-white">أحدث الحجوزات</h3>
          <button onClick={() => onNav("bookings")}
            className="text-xs text-emerald-400 hover:underline transition-colors">عرض الكل</button>
        </div>
        {loading ? <Skeleton cls="h-52" /> : (
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full text-sm text-right min-w-[420px]">
              <thead>
                <tr className="bg-white/3 text-xs text-gray-500">
                  {["العميل","الخدمة","الموعد","الحالة"].map(h =>
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0,6).map((b,i) => (
                  <tr key={b.id}
                    style={{ animationDelay:`${i*40}ms` }}
                    className="border-t border-white/5 hover:bg-white/3 transition-colors animate-[fadeIn_.4s_ease_both]">
                    <td className="px-4 py-3 font-semibold text-white text-sm">{b.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{b.therapy_session?.name_ar ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {b.appointment_date}<br/>{b.appointment_time?.slice(0,5)}
                    </td>
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

// ──────────────────────────────────────────────────────────────
// 2. BOOKINGS — حذف المكتملة والملغاة + bulk delete
// ──────────────────────────────────────────────────────────────
function BookingsView({
  bookings, loading, onStatusChange, onDelete, onBulkDelete,
}: {
  bookings: Booking[]; loading: boolean;
  onStatusChange:(id:number,s:BookingStatus)=>void;
  onDelete:(id:number)=>void;
  onBulkDelete:(ids:number[])=>void;
}) {
  const [filter, setFilter] = useState<BookingStatus|"all">("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirm, setConfirm] = useState<{ ids: number[] }|null>(null);

  const filtered = bookings
    .filter(b => filter==="all" || b.status===filter)
    .filter(b => !q ||
      b.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
      b.booking_ref.toLowerCase().includes(q.toLowerCase()));

  const deletable = (s: BookingStatus) => s==="completed" || s==="cancelled";

  const toggleSelect = (id: number) =>
    setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAll = () => {
    const all = filtered.filter(b => deletable(b.status)).map(b => b.id);
    setSelected(new Set(all));
  };

  const handleBulk = () => {
    const ids = [...selected];
    if (!ids.length) return;
    setConfirm({ ids });
  };
const ShowDetails = (id:number) => {
  
  return <Navigate to={`/admin/booking/${id}`}/>
}
  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmDialog
          title={`حذف ${confirm.ids.length} حجز؟`}
          body="سيتم حذف الحجوزات المكتملة/الملغاة نهائياً. لا يمكن التراجع."
          onConfirm={() => { onBulkDelete(confirm.ids); setSelected(new Set()); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg sm:text-xl font-black text-white">الحجوزات</h2>
        {selected.size > 0 && (
          <button onClick={handleBulk}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/25 transition-all active:scale-95 animate-[fadeIn_.2s_ease]">
            🗑️ حذف {selected.size} محدد
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder="🔍 بحث بالاسم أو رقم الحجز..."
          className="bg-[#111E33] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 w-full sm:w-56 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          {(["all","pending","confirmed","completed","cancelled"] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all active:scale-95
                ${filter===f
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"}`}>
              {f==="all" ? "الكل" : STATUS_CFG[f].label}
            </button>
          ))}
        </div>
        <button onClick={selectAll}
          className="text-xs text-gray-500 hover:text-amber-400 underline transition-colors self-center">
          تحديد المحذوفة
        </button>
      </div>

      {loading ? <Skeleton cls="h-64" /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm text-right min-w-[600px]">
            <thead>
              <tr className="bg-white/3 text-xs text-gray-500">
                <th className="px-4 py-3 w-8" />
                {["رقم الحجز","العميل","الخدمة","الموعد","الحالة","تغيير",""].map(h =>
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0
                ? <tr><td colSpan={8} className="text-center py-12 text-gray-500 text-sm">لا توجد نتائج</td></tr>
                : filtered.map((b,i) => {
                    const canDel = deletable(b.status);
                    const isSel  = selected.has(b.id);
                    return (
                      <tr key={b.id}
                        style={{ animationDelay:`${i*30}ms` }}
                        className={`border-t border-white/5 transition-colors animate-[fadeIn_.35s_ease_both]
                          ${isSel ? "bg-red-500/8" : "hover:bg-white/3"}`}>
                        <td className="px-4 py-3">
                          {canDel && (
                            <input type="checkbox" checked={isSel}
                              onChange={()=>toggleSelect(b.id)}
                              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.booking_ref}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white text-sm">{b.user?.name ?? "—"}</div>
                          <div className="text-xs text-gray-500">{b.user?.phone ?? ""}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                          {SESSION_ICONS[b.therapy_session_id]??""} {b.therapy_session?.name_ar??"—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {b.appointment_date?.slice(0,10)}<br/>{b.appointment_start?.slice(0,5)}
                        </td>
                        <td className="px-4 py-3"><Badge status={b.status} /></td>
                        <td className="px-4 py-3">
                          <select value={b.status}
                            onChange={e=>onStatusChange(b.id, e.target.value as BookingStatus)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-emerald-500/60 cursor-pointer transition-colors">
                            {(Object.keys(STATUS_CFG) as BookingStatus[]).map(s =>
                              <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                            )}
                          </select>
                        </td>
                        <td className="flex gap-2 items-center justify-center px-4 py-3">
                          {canDel && (
                            <button onClick={()=>setConfirm({ ids:[b.id] })}
                              className="text-xs text-gray-600 hover:text-red-400 transition-colors">
                              🗑️
                            </button>
                          )}|{
                            <Link to={`/admin/bookings/${b.id}`}   className="text-xs text-gray-600 hover:text-amber-400 transition-colors">👁️</Link>
                          }
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 3. USERS — مع إحصائيات + عرض أفضل
// ──────────────────────────────────────────────────────────────
function UsersView({ users, loading, bookings }: { users: User[]; loading: boolean; bookings: Booking[] }) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all"|"admin"|"client">("all");

  const bookingCount = (uid: number) => bookings.filter(b => b.user_id === uid).length;

  const filtered = users
    .filter(u => roleFilter==="all" || u.role===roleFilter)
    .filter(u => !q ||
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">العملاء</h2>
          <p className="text-xs text-gray-500 mt-0.5">{users.length} مستخدم مسجل</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label:"الكل",    val:users.length,                            color:"text-white",        f:"all"    as const },
          { label:"عملاء",   val:users.filter(u=>u.role==="client").length, color:"text-blue-400",   f:"client" as const },
          { label:"أدمن",    val:users.filter(u=>u.role==="admin").length,  color:"text-amber-400",  f:"admin"  as const },
        ].map(c => (
          <button key={c.f} onClick={()=>setRoleFilter(c.f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95
              ${roleFilter===c.f
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/5 border-white/8 text-gray-500 hover:border-white/15"}`}>
            {c.label} <span className={`font-black ml-1 ${c.color}`}>{c.val}</span>
          </button>
        ))}
      </div>

      <input value={q} onChange={e=>setQ(e.target.value)}
        placeholder="🔍 بحث بالاسم أو البريد..."
        className="bg-[#111E33] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 w-full sm:w-64 transition-colors" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array(4).fill(0).map((_,i)=><Skeleton key={i} cls="h-24"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.length===0
            ? <div className="col-span-2 text-center py-12 text-gray-500 text-sm bg-white/3 border border-white/8 rounded-2xl">لا توجد نتائج</div>
            : filtered.map((u,i) => (
              <div key={u.id}
                style={{ animationDelay:`${i*40}ms` }}
                className="flex items-center gap-4 bg-[#111E33] border border-white/8 rounded-2xl px-4 py-3.5 hover:border-white/18 transition-all duration-300 animate-[fadeIn_.4s_ease_both]">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-base font-black text-black flex-shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{u.name}</div>
                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.role==="admin"
                        ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
                        : "text-blue-400  bg-blue-500/15  border-blue-500/30"
                    }`}>{u.role==="admin" ? "👑 أدمن" : "👤 عميل"}</span>
                    <span className="text-[10px] text-gray-600">
                      {bookingCount(u.id)} حجز
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 text-left flex-shrink-0">
                  {new Date(u.created_at).toLocaleDateString("ar-SA",{ month:"short", year:"numeric" })}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 4. SESSIONS — إضافة + حذف
// ──────────────────────────────────────────────────────────────
const EMPTY_SESSION = { name:"", name_ar:"", description:"", duration_minutes:60, price:0, is_active:true };

function SessionsView({
  sessions, loading, onToggle, onDelete, onCreate,
}: {
  sessions: TherapySession[]; loading: boolean;
  onToggle:(id:number,v:boolean)=>void;
  onDelete:(id:number)=>void;
  onCreate:(data:Partial<TherapySession>)=>void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_SESSION);
  const [confirm, setConfirm]   = useState<number|null>(null);
  const [saving, setSaving]     = useState(false);

  const handleCreate = async () => {
    if (!form.name_ar || !form.price) return;
    setSaving(true);
    await onCreate(form);
    setForm(EMPTY_SESSION);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {confirm!==null && (
        <ConfirmDialog
          title="حذف الخدمة؟"
          body="سيتم حذف هذه الخدمة نهائياً. الحجوزات المرتبطة بها ستبقى."
          onConfirm={()=>{ onDelete(confirm); setConfirm(null); }}
          onCancel={()=>setConfirm(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-white">الخدمات</h2>
        <button onClick={()=>setShowForm(p=>!p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/25 transition-all active:scale-95">
          {showForm ? "✕ إغلاق" : "+ إضافة خدمة"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#111E33] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 animate-[fadeIn_.25s_ease]">
          <h3 className="text-sm font-bold text-white mb-4">➕ خدمة جديدة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { label:"الاسم بالعربي *", field:"name_ar",    ph:"مثال: حجامة علاجية" },
              { label:"الاسم بالإنجليزي", field:"name",      ph:"Cupping" },
              { label:"السعر (ر.س) *",  field:"price",       ph:"250", type:"number" },
              { label:"المدة (دقيقة)",  field:"duration_minutes", ph:"60", type:"number" },
            ].map(f => (
              <div key={f.field}>
                <div className="text-xs text-gray-500 mb-1.5">{f.label}</div>
                <input
                  type={f.type ?? "text"}
                  value={(form as Record<string,unknown>)[f.field] as string}
                  placeholder={f.ph}
                  onChange={e => setForm(p => ({ ...p, [f.field]: f.type==="number" ? +e.target.value : e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-500 mb-1.5">الوصف</div>
              <textarea value={form.description} rows={2}
                placeholder="وصف الخدمة..."
                onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white transition-all active:scale-95">
              إلغاء
            </button>
            <button onClick={handleCreate} disabled={saving || !form.name_ar || !form.price}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm disabled:opacity-50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
              {saving ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>حفظ...</> : "💾 حفظ"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_,i)=><Skeleton key={i} cls="h-36"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessions.map((s,i) => (
            <div key={s.id}
              style={{ animationDelay:`${i*50}ms` }}
              className={`bg-[#111E33] border rounded-2xl p-4 sm:p-5 transition-all duration-300 group animate-[fadeIn_.4s_ease_both]
                ${s.is_active ? "border-white/8 hover:border-white/18" : "border-white/5 opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110">
                    {SESSION_ICONS[s.id]??"🏥"}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{s.name_ar}</div>
                    <div className="text-xs text-gray-500">{s.duration_minutes} دقيقة</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>onToggle(s.id,!s.is_active)}
                    className={`relative w-9 h-[18px] rounded-full transition-all duration-300 flex-shrink-0
                      ${s.is_active ? "bg-emerald-500" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-300
                      ${s.is_active ? "right-0.5" : "left-0.5"}`} />
                  </button>
                  <button onClick={()=>setConfirm(s.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-sm">🗑️</button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{s.description??"—"}</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-emerald-400">
                  {s.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">ر.س</span>
                </span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold transition-colors
                  ${s.is_active
                    ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                    : "text-gray-500 bg-white/5 border-white/10"}`}>
                  {s.is_active ? "نشطة" : "معطلة"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. ConsultationsView — نسخة محسّنة كاملة
// ─────────────────────────────────────────────────────────────

const CONSULT_TYPE_LABEL: Record<string, string> = {
  voice: "📞 مكالمة صوتية",
  chat:  "💬 محادثة نصية",
  video: "🎥 مكالمة مرئية",
};

const CONSULT_STATUS_CFG: Record<ConsultationStatus, { label: string; tw: string }> = {
  pending: { label: "قيد الانتظار", tw: "text-amber-400  bg-amber-500/15  border-amber-500/30"  },
  ans:     { label: "تم الرد",      tw: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
};

function ConsultationsView({
  consultations = [],
  loading,
  onReply,
  onDelete,
}: {
  consultations?: Consultation[];
  loading: boolean;
  onReply: (id: number, reply: string) => void;
  onDelete: (id: number) => void;
}) {
  const [filter,  setFilter]  = useState<ConsultationStatus | "all">("all");
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const safe     = Array.isArray(consultations) ? consultations : [];
  const filtered = safe.filter(c => filter === "all" || c.status === filter);
  const pending  = safe.filter(c => c.status === "pending").length;

  const toggleExpand = (id: number) =>
    setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSend = async (id: number) => {
    const text = replies[id]?.trim();
    if (!text) return;
    setSending(id);
    await onReply(id, text);
    setReplies(p => ({ ...p, [id]: "" }));
    setSending(null);
  };

  return (
    <div className="space-y-5">
      {/* Confirm dialog */}
      {confirm !== null && (
        <ConfirmDialog
          title="حذف الاستشارة؟"
          body="سيتم حذف هذه الاستشارة نهائياً."
          onConfirm={() => { onDelete(confirm); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">الاستشارات</h2>
          <p className="text-xs text-gray-500 mt-0.5">{safe.length} إجمالي</p>
        </div>
        {pending > 0 && (
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
            🔔 {pending} بانتظار الرد
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { val: "all",     label: "الكل",          count: safe.length },
          { val: "pending", label: "قيد الانتظار",  count: pending },
          { val: "ans",     label: "تم الرد",        count: safe.filter(c => c.status === "ans").length },
        ] as const).map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95
              ${filter === f.val
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"}`}>
            {f.label}
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
              ${filter === f.val ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-400"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 bg-white/3 border border-white/8 rounded-2xl">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400 text-sm font-semibold">لا توجد استشارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const isOpen   = expanded.has(c.id);
            const statusCfg = CONSULT_STATUS_CFG[c.status];

            return (
              <div key={c.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`bg-[#111E33] border rounded-2xl overflow-hidden transition-all duration-300 animate-[fadeIn_.35s_ease_both]
                  ${c.status === "pending"
                    ? "border-amber-500/20 hover:border-amber-500/35"
                    : "border-white/8 hover:border-white/15"}`}>

                {/* ── Card header ── */}
                <div className="flex items-start gap-4 p-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base font-black text-white flex-shrink-0">
                    {c.name?.[0] ?? "؟"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-white font-bold text-sm">{c.name}</p>
                        {c.phone && (
                          <p className="text-xs text-gray-500">{c.phone}</p>
                        )}
                      </div>
                      {/* Status badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusCfg.tw}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                      <span>{CONSULT_TYPE_LABEL[c.type] ?? c.type}</span>
                      <span>🕒 {c.created_at?.slice(0, 10)}</span>
                      {(c as any).updated_at && c.status === "ans" && (
                        <span>✅ رُدَّ {(c as any).updated_at?.slice(0, 10)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleExpand(c.id)}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/25 transition-all text-xs">
                      {isOpen ? "▲" : "▼"}
                    </button>
                    <button onClick={() => setConfirm(c.id)}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 hover:text-red-400 hover:border-red-500/30 transition-all text-sm">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* ── Expandable body ── */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-[fadeIn_.2s_ease]">

                    {/* رسالة العميل */}
                    {c.message && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">رسالة العميل</p>
                        <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 leading-relaxed">
                          {c.message}
                        </div>
                      </div>
                    )}

                    {/* رد الطبيب الموجود */}
                    {c.doctor_reply && (
                      <div>
                        <p className="text-[10px] text-emerald-500/70 mb-1.5 font-semibold uppercase tracking-wide">رد الطبيب</p>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-sm text-emerald-300 leading-relaxed">
                          💬 {c.doctor_reply}
                        </div>
                      </div>
                    )}

                    {/* حقل الرد */}
                    {c.status === "pending" && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">الرد</p>
                        <div className="flex gap-2">
                          <textarea
                            value={replies[c.id] ?? ""}
                            onChange={e => setReplies(p => ({ ...p, [c.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSend(c.id); }}
                            placeholder="اكتب ردك هنا... (Ctrl+Enter للإرسال)"
                            rows={3}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors"
                          />
                          <button
                            onClick={() => handleSend(c.id)}
                            disabled={sending === c.id || !replies[c.id]?.trim()}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-xs disabled:opacity-50 hover:-translate-y-0.5 transition-all active:scale-95 self-end flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                            {sending === c.id
                              ? <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              : "إرسال ✈️"
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// 5. SCHEDULE — جدول عمل + تعطيل + عرض المواعيد
// ──────────────────────────────────────────────────────────────
function ScheduleView({ toast }: { toast:(m:string,t:"ok"|"err")=>void }) {
  const [schedule,  setSchedule]  = useState<WorkSchedule[]>(
    Array.from({length:7},(_,i)=>({ day_of_week:i, start_time:"08:00", end_time:"20:00", slot_duration:60, is_active:i<5 }))
  );
  const [blocked,   setBlocked]   = useState<BlockedSlot[]>([]);
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().slice(0,10));
  const [previewSlots, setPreviewSlots] = useState<any[]>([]);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [blockNote, setBlockNote] = useState("");
  const [blocking,  setBlocking]  = useState(false);

  useEffect(() => {
    api.get<WorkSchedule[]>("/admin/work-schedule").then(r=>{if(r.data.length)setSchedule(r.data);}).catch(()=>{});
    api.get<BlockedSlot[]>("/admin/blocked-slots").then(r=>setBlocked(r.data)).catch(()=>{});
  },[]);

  // معاينة مواعيد يوم معين
  useEffect(() => {
  if (!previewDate) return;

  setLoadingPrev(true);

  api.get("/slots", { params: { date: previewDate } })
    .then(r => {
      setPreviewSlots(Array.isArray(r.data.slots) ? r.data.slots : []);
    })
    .catch(() => setPreviewSlots([]))
    .finally(() => setLoadingPrev(false));

}, [previewDate]);
  const updateDay = <K extends keyof WorkSchedule>(day:number, field:K, val:WorkSchedule[K]) =>
    setSchedule(s=>s.map(d=>d.day_of_week===day ? {...d,[field]:val} : d));

  const save = async () => {
    setSaving(true);
    try { await api.put("/admin/work-schedule",{schedules:schedule}); toast("تم حفظ جدول العمل","ok"); }
    catch(e){ toast(extractError(e),"err"); }
    finally { setSaving(false); }
  };

  const block = async () => {
    if (!blockDate) return;
    setBlocking(true);
    try {
      const {data} = await api.post<BlockedSlot>("/admin/blocked-slots",{
        date:blockDate, start_time:blockTime||null, reason:blockNote||null,
      });
      setBlocked(p=>[...p,data]);
      setBlockDate(""); setBlockTime(""); setBlockNote("");
      toast("تم التعطيل","ok");
    } catch(e){ toast(extractError(e),"err"); }
    finally { setBlocking(false); }
  };

  const unblock = async (id:number) => {
    try {
      await api.delete(`/admin/blocked-slots/${id}`);
      setBlocked(p=>p.filter(b=>b.id!==id));
      toast("تم إعادة الموعد","ok");
    } catch(e){ toast(extractError(e),"err"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-black text-white">جدول العمل والمواعيد</h2>

      {/* ── Work schedule ── */}
      <div className="bg-[#111E33] border border-white/8 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">📆 أوقات العمل الأسبوعية</h3>
        <div className="space-y-2.5">
          {schedule.map(day => (
            <div key={day.day_of_week}
              className={`rounded-xl border p-3 transition-all duration-300
                ${day.is_active ? "border-white/10 bg-white/3" : "border-white/5 opacity-50"}`}>

              {/* Mobile */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>updateDay(day.day_of_week,"is_active",!day.is_active)}
                      className={`relative w-9 h-[18px] rounded-full transition-all ${day.is_active?"bg-emerald-500":"bg-white/10"}`}>
                      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${day.is_active?"right-0.5":"left-0.5"}`}/>
                    </button>
                    <span className="text-sm font-semibold text-white">{DAYS_AR[day.day_of_week]}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${day.is_active?"text-emerald-400 bg-emerald-500/15 border-emerald-500/30":"text-gray-600 bg-white/5 border-white/8"}`}>
                    {day.is_active?"عمل":"إجازة"}
                  </span>
                </div>

                {day.is_active && (
                  <div className="grid grid-cols-3 gap-2">
                    <input type="time" value={day.start_time} onChange={e=>updateDay(day.day_of_week,"start_time",e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"/>
                    <input type="time" value={day.end_time} onChange={e=>updateDay(day.day_of_week,"end_time",e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"/>
                    <select value={day.slot_duration} onChange={e=>updateDay(day.day_of_week,"slot_duration",+e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                      {[30,45,60,90].map(d=><option key={d} value={d}>{d} د</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 flex items-center gap-2.5">
                  <button onClick={()=>updateDay(day.day_of_week,"is_active",!day.is_active)}
                    className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${day.is_active?"bg-emerald-500":"bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${day.is_active?"right-0.5":"left-0.5"}`}/>
                  </button>
                  <span className="text-sm font-semibold text-white">{DAYS_AR[day.day_of_week]}</span>
                </div>

                <div className="col-span-3">
                  <input type="time" value={day.start_time} disabled={!day.is_active}
                    onChange={e=>updateDay(day.day_of_week,"start_time",e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 disabled:cursor-not-allowed"/>
                </div>

                <div className="col-span-3">
                  <input type="time" value={day.end_time} disabled={!day.is_active}
                    onChange={e=>updateDay(day.day_of_week,"end_time",e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 disabled:cursor-not-allowed"/>
                </div>

                <div className="col-span-3">
                  <select value={day.slot_duration} disabled={!day.is_active}
                    onChange={e=>updateDay(day.day_of_week,"slot_duration",+e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none disabled:cursor-not-allowed">
                    {[30,45,60,90].map(d=><option key={d} value={d}>{d} دقيقة</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm disabled:opacity-60 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          {saving ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>حفظ...</> : "💾 حفظ الجدول"}
        </button>
      </div>

      {/* ── Preview slots ── */}
      <div className="bg-[#111E33] border border-white/8 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">👁️ معاينة مواعيد يوم</h3>

        <div className="flex items-center gap-3 mb-4">
          <input type="date" value={previewDate} onChange={e=>setPreviewDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60"/>
        </div>

        {loadingPrev ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array(8).fill(0).map((_,i)=><Skeleton key={i} cls="h-10"/>)}
          </div>
        ) : previewSlots.length===0 ? (
          <div className="text-center py-8 text-gray-500 text-sm bg-white/3 rounded-xl border border-white/8">
            لا توجد مواعيد — يوم إجازة أو غير محدد في الجدول
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
  {previewSlots.map((slot, i) => (
    <div
      key={i}
      className={`text-xs px-2 py-2 rounded-lg border text-center ${
        slot.is_available
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
    >
      {slot.start_time} - {slot.end_time}
    </div>
  ))}
</div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/30 inline-block"/>متاح
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/20 inline-block"/>محجوز
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Block slot ── */}
      <div className="bg-[#111E33] border border-white/8 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">🚫 تعطيل وقت أو يوم</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { label:"التاريخ *", type:"date", val:blockDate, set:setBlockDate },
            { label:"الوقت (فارغ = يوم كامل)", type:"time", val:blockTime, set:setBlockTime },
            { label:"السبب", type:"text", val:blockNote, set:setBlockNote },
          ].map(f=>(
            <div key={f.label}>
              <div className="text-xs text-gray-500 mb-1.5">{f.label}</div>
              <input
                type={f.type}
                value={f.val}
                onChange={e=>f.set(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
              />
            </div>
          ))}
        </div>

        <button onClick={block} disabled={blocking||!blockDate}
          className="px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-sm">
          🚫 تعطيل
        </button>

        {blocked.length>0 && (
          <div className="space-y-2 mt-4">
            {blocked.map(b=>(
              <div key={b.id}
                className="flex items-center justify-between bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2.5">
                <div className="text-xs text-gray-500">
                  {b.date} {b.start_time && `⏰ ${b.start_time}`}
                </div>
                <button onClick={()=>unblock(b.id)}
                  className="text-xs text-gray-500">
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

// ─── Navigation ───────────────────────────────────────────────
function Sidebar({ view, onSelect, onLogout }: { view:AdminView; onSelect:(v:AdminView)=>void; onLogout:()=>void }) {
  return (
    <aside className="hidden lg:flex w-52 xl:w-56 flex-shrink-0 bg-[#0A1222] border-l border-white/8 flex-col min-h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/8">
        <div className="text-xl font-black" style={{ background:"linear-gradient(135deg,#00C9A7,#F5A623)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          CORE S+
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">لوحة التحكم</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item=>(
          <button key={item.id} onClick={()=>onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-right
              ${view===item.id
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
    <nav className="lg:hidden fixed bottom-0 right-0 left-0 z-50 bg-[#0A1222]/95 backdrop-blur-md border-t border-white/8 flex">
      {NAV.map(item=>(
        <button key={item.id} onClick={()=>onSelect(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all active:scale-90
            ${view===item.id ? "text-emerald-400" : "text-gray-600 hover:text-gray-400"}`}>
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[9px] font-semibold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function TopBar({ view, onLogout }: { view:AdminView; onLogout:()=>void }) {
  const cur = NAV.find(n=>n.id===view);
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0A1222]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="text-base font-black" style={{ background:"linear-gradient(135deg,#00C9A7,#F5A623)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        CORE S+
      </div>
      <span className="text-sm text-gray-300 font-semibold">{cur?.icon} {cur?.label}</span>
      <button onClick={onLogout} className="text-xs text-gray-500 hover:text-red-400 transition-colors p-1">🚪</button>
    </header>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate    = useNavigate();
  const [view,      setView]      = useState<AdminView>("overview");
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
const [loadingC, setLoadingC] = useState(false);
  const [users,     setUsers]     = useState<User[]>([]);
  const [sessions,  setSessions]  = useState<TherapySession[]>([]);
  const [loadingB,  setLoadingB]  = useState(false);
  const [loadingU,  setLoadingU]  = useState(false);
  const [loadingS,  setLoadingS]  = useState(false);
  const [toast,     setToast]     = useState<{ msg:string; type:"ok"|"err" }|null>(null);

  const showToast = useCallback((msg:string, type:"ok"|"err"="ok")=>{
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3500);
  },[]);

  const fetchBookings = useCallback(async()=>{
    setLoadingB(true);
    try { const {data}=await api.get<{data:Booking[]}>("/bookings"); setBookings(data.data); }
    catch(e){ showToast(extractError(e),"err"); }
    finally { setLoadingB(false); }
  },[]);
  
 
const fetchConsultations = useCallback(async () => {
  setLoadingC(true);
  try {
    const { data } = await api.get<Consultation[]>("/consultations");
    setConsultations(Array.isArray(data) ? data : []);
  } catch (e) {                              // ✅ أضف (e)
    showToast(extractError(e), "err");
  } finally {
    setLoadingC(false);
  }
}, [showToast]);

  const fetchUsers = useCallback(async()=>{
    setLoadingU(true);
    try { const {data}=await api.get<{data:User[]}>("/users"); setUsers(data.data); }
    catch(e){ showToast(extractError(e),"err"); }
    finally { setLoadingU(false); }
  },[]);

  const fetchSessions = useCallback(async()=>{
    setLoadingS(true);
    try { const {data}=await api.get<TherapySession[]>("/all-sessions"); setSessions(data); }
    catch(e){ showToast(extractError(e),"err"); }
    finally { setLoadingS(false); }
  },[]);

  useEffect(()=>{ fetchBookings(); fetchUsers(); fetchSessions();  fetchConsultations();},[]);

  const handleStatusChange = async(id:number, status:BookingStatus)=>{
    try {
      await api.put(`/bookings/${id}`,{status});
      setBookings(p=>p.map(b=>b.id===id?{...b,status}:b));
      showToast("تم تحديث الحالة");
    } catch(e){ showToast(extractError(e),"err"); }
  };

  const handleDeleteBooking = async(id:number)=>{
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(p=>p.filter(b=>b.id!==id));
      showToast("تم الحذف");
    } catch(e){ showToast(extractError(e),"err"); }
  };

  const handleBulkDelete = async(ids:number[])=>{
    try {
      await Promise.all(ids.map(id=>api.delete(`/bookings/${id}`)));
      setBookings(p=>p.filter(b=>!ids.includes(b.id)));
      showToast(`تم حذف ${ids.length} حجز`);
    } catch(e){ showToast(extractError(e),"err"); }
  };

  const handleToggleSession = async(id:number, is_active:boolean)=>{
    try {
      await api.put(`/sessions/${id}`,{is_active});
      setSessions(p=>p.map(s=>s.id===id?{...s,is_active}:s));
      showToast(is_active?"تم تفعيل الخدمة":"تم إيقاف الخدمة");
    } catch(e){ showToast(extractError(e),"err"); }
  };

  const handleDeleteSession = async(id:number)=>{
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(p=>p.filter(s=>s.id!==id));
      showToast("تم حذف الخدمة");
    } catch(e){ showToast(extractError(e),"err"); }
  };

  const handleCreateSession = async(data:Partial<TherapySession>)=>{
    try {
      const res=await api.post<TherapySession>("/sessions",data);
      setSessions(p=>[...p,res.data]);
      showToast("تم إضافة الخدمة");
    } catch(e){ showToast(extractError(e),"err"); }
  };
  const handleConsultationStatus = async (id: number, status: ConsultationStatus) => {
  await api.put(`/consultations/${id}`, { status });
  setConsultations(p => p.map(c => c.id === id ? { ...c, status } : c));
};

const handleDeleteConsultation = async (id: number) => {
  await api.delete(`/consultations/${id}`);
  setConsultations(p => p.filter(c => c.id !== id));
};

  const handleLogout = async () => {
  try { await authService.logout(); } catch { /**/ }   
  localStorage.removeItem("token");
  navigate("/login");
};

  const stats: DashboardStats = {
    totalBookings:     bookings.length,
    pendingBookings:   bookings.filter(b=>b.status==="pending").length,
    confirmedBookings: bookings.filter(b=>b.status==="confirmed").length,
    completedBookings: bookings.filter(b=>b.status==="completed").length,
    totalUsers:        users.length,
    totalRevenue:      bookings.filter(b=>b.status==="completed").reduce((s,b)=>s+(b.therapy_session?.price??0),0),
  };

  return (
    <div className="flex min-h-screen bg-[#070D1A] text-white" dir="rtl"
      style={{ fontFamily:"'Tajawal','Cairo',sans-serif" }}>

      {/* keyframes */}
      <style>{`
        @keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      <Sidebar view={view} onSelect={setView} onLogout={handleLogout}/>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar view={view} onLogout={handleLogout}/>
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 overflow-y-auto">
          {view==="overview" && <OverviewView stats={stats} bookings={bookings} loading={loadingB} onNav={setView}/>}
          {view==="bookings" && <BookingsView bookings={bookings} loading={loadingB} onStatusChange={handleStatusChange} onDelete={handleDeleteBooking} onBulkDelete={handleBulkDelete}/>}
          {view==="users"    && <UsersView users={users} loading={loadingU} bookings={bookings}/>}
          {view==="sessions" && <SessionsView sessions={sessions} loading={loadingS} onToggle={handleToggleSession} onDelete={handleDeleteSession} onCreate={handleCreateSession}/>}
          {view==="schedule" && <ScheduleView toast={showToast}/>}
       {view === "consultations" && (
  <ConsultationsView
    consultations={consultations}
    loading={loadingC}
    onReply={async (id, reply) => {           // ✅ onReply مش onStatusChange
      try {
        await api.put(`/consultations/${id}`, {
          doctor_reply: reply,
          status: "ans",
        });
        setConsultations(p =>
          p.map(c => c.id === id ? { ...c, doctor_reply: reply, status: "ans" } : c)
        );
        showToast("تم إرسال الرد");
      } catch (e) {
        showToast(extractError(e), "err");
      }
    }}
    onDelete={async (id) => {
      try {
        await api.delete(`/consultations/${id}`);
        setConsultations(p => p.filter(c => c.id !== id));
        showToast("تم الحذف");
      } catch (e) {
        showToast(extractError(e), "err");
      }
    }}
  />
)}


        </main>
      </div>

      <BottomNav view={view} onSelect={setView}/>
    </div>
  );
}