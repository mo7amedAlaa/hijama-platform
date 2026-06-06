// src/sections/ConsultationSection.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { consultationService } from "../services/api";

// ─── Types ────────────────────────────────────────────────────
type ConsultType   = "voice" | "chat" | "video";
type ConsultStatus = "pending" | "ans";

interface Consultation {
  id: number;
  type: ConsultType;
  status: ConsultStatus;
  name: string;
  phone: string | null;
  message: string | null;
  doctor_reply: string | null;
  created_at: string;
  updated_at: string;
}

interface FormState {
  name: string;
  phone: string;
  message: string;
}

// ─── Constants ────────────────────────────────────────────────
const OPTIONS: { title: string; desc: string; icon: string; type: ConsultType }[] = [
  { title:"مكالمة صوتية", desc:"تحدث مباشرة مع متخصص", icon:"📞", type:"voice" },
  { title:"محادثة نصية",  desc:"عبر واتساب أو الرسائل", icon:"💬", type:"chat"  },
  { title:"مكالمة مرئية", desc:"استشارة بالفيديو",       icon:"🎥", type:"video" },
];

const TYPE_LABEL: Record<ConsultType, string>   = { voice:"📞 صوتية", chat:"💬 نصية", video:"🎥 مرئية" };
const STATUS_CFG: Record<ConsultStatus, { label:string; tw:string }> = {
  pending: { label:"قيد الانتظار", tw:"text-amber-400 bg-amber-500/15 border-amber-500/30"   },
  ans:     { label:"تم الرد",      tw:"text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
};

// ─── Small helpers ────────────────────────────────────────────
const Input = ({
  name, value, onChange, placeholder, type = "text",
}: { name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder: string; type?: string }) => (
  <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
      placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors" />
);

// ─── Consultation Card ────────────────────────────────────────
function ConsultCard({ c, onDelete }: { c: Consultation; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const cfg  = STATUS_CFG[c.status];
  const hasReply = !!c.doctor_reply;

  return (
    <div className={`bg-[#111E33] border rounded-2xl overflow-hidden transition-all duration-300
      ${hasReply ? "border-emerald-500/25" : "border-white/8"}`}>

      {/* Header row */}
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-white/3 transition-colors">

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
          {OPTIONS.find(o => o.type === c.type)?.icon ?? "💬"}
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">{TYPE_LABEL[c.type]}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.tw}`}>
              {cfg.label}
            </span>
            {hasReply && !open && (
              <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                💬 رد جديد
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(c.created_at).toLocaleDateString("ar-SA", { day:"numeric", month:"long", year:"numeric" })}
          </p>
        </div>

        <span className="text-gray-600 text-xs flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">

          {/* رسالتك */}
          {c.message && (
            <div>
              <p className="text-[10px] text-gray-600 mb-1.5 font-semibold">رسالتك</p>
              <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 leading-relaxed">
                {c.message}
              </div>
            </div>
          )}

          {/* رد الطبيب */}
          {hasReply ? (
            <div>
              <p className="text-[10px] text-emerald-500/70 mb-1.5 font-semibold">رد المتخصص</p>
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5 text-sm text-emerald-300 leading-relaxed">
                <span className="text-emerald-400/60 ml-1">💬</span>
                {c.doctor_reply}
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">
                رُدَّ في {new Date(c.updated_at).toLocaleDateString("ar-SA", { day:"numeric", month:"long" })}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-400/70 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2.5">
              <span className="animate-pulse">⏳</span>
              سيتم الرد على استشارتك قريباً
            </div>
          )}

          {/* حذف */}
          <div className="flex justify-end pt-1">
            <button onClick={() => onDelete(c.id)}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1">
              🗑️ حذف الاستشارة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function ConsultationSection() {
  const navigate = useNavigate();

  const [step,          setStep]          = useState<"select" | "form" | "done">("select");
  const [selectedType,  setSelectedType]  = useState<ConsultType | null>(null);
  const [form,          setForm]          = useState<FormState>({ name:"", phone:"", message:"" });
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingList,   setLoadingList]   = useState(false);
  const [showList,      setShowList]      = useState(false);
  const [deleting,      setDeleting]      = useState<number | null>(null);

  // ── auth check ───────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) fetchConsultations();
  }, []);

  // ── fetch my consultations ────────────────────────────────
  const fetchConsultations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await consultationService.my();
      setConsultations(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, [ ]);

  // ── delete ────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await consultationService.delete(id);
      setConsultations(p => p.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedType) return;
    if (!form.name.trim()) { setError("الاسم مطلوب"); return; }

    setLoading(true);
    setError(null);
    try {
      await consultationService.create({ type: selectedType, ...form });
      setStep("done");
      fetchConsultations();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("select");
    setSelectedType(null);
    setForm({ name:"", phone:"", message:"" });
    setError(null);
  };

  // ── unread replies ────────────────────────────────────────
  const repliedCount = consultations.filter(c => c.status === "ans").length;
  const pendingCount = consultations.filter(c => c.status === "pending").length;

  // ─────────────────────────────────────────────────────────
  return (
    <section className="py-16 bg-[#070D1A]" id="consultation" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 text-xs text-emerald-400 font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            متاح الآن
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            استشارة متخصصة
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            تحدث مع أحد متخصصينا واحصل على رد مباشر خلال وقت قصير
          </p>
        </div>

        {/* ── Not logged in ── */}
        {!isLoggedIn && (
          <div className="text-center bg-[#111E33] border border-white/8 rounded-2xl p-8">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-gray-300 mb-2 font-semibold">يجب تسجيل الدخول أولاً</p>
            <p className="text-gray-600 text-sm mb-6">لإرسال استشارة أو متابعة ردودك</p>
            <button onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/25">
              تسجيل الدخول
            </button>
          </div>
        )}

        {/* ── Logged in ── */}
        {isLoggedIn && (
          <div className="space-y-6">

            {/* ── Step: select type ── */}
            {step === "select" && (
              <div>
                <p className="text-sm text-gray-400 mb-4 text-center">اختر طريقة الاستشارة</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {OPTIONS.map(opt => (
                    <button key={opt.type} onClick={() => { setSelectedType(opt.type); setStep("form"); }}
                      className="group p-5 rounded-2xl border border-white/8 bg-[#111E33]
                        hover:border-emerald-500/50 hover:bg-emerald-500/8
                        transition-all duration-200 text-right hover:-translate-y-1 active:scale-95">
                      <div className="text-3xl mb-3 transition-transform duration-200 group-hover:scale-110">
                        {opt.icon}
                      </div>
                      <h3 className="text-white font-bold text-sm mb-1">{opt.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step: form ── */}
            {step === "form" && selectedType && (
              <div className="bg-[#111E33] border border-white/8 rounded-2xl p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl">
                      {OPTIONS.find(o => o.type === selectedType)?.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">
                        {OPTIONS.find(o => o.type === selectedType)?.title}
                      </h3>
                      <p className="text-xs text-gray-500">أدخل بياناتك لإرسال الطلب</p>
                    </div>
                  </div>
                  <button onClick={reset}
                    className="text-gray-600 hover:text-white transition-colors text-sm">
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <Input name="name"    value={form.name}    onChange={e => setForm(p=>({...p,name:e.target.value}))}    placeholder="الاسم الكامل *" />
                  <Input name="phone"   value={form.phone}   onChange={e => setForm(p=>({...p,phone:e.target.value}))}   placeholder="رقم الهاتف (اختياري)" type="tel" />
                  <textarea name="message" value={form.message}
                    onChange={e => setForm(p=>({...p,message:e.target.value}))}
                    placeholder="اكتب سؤالك أو وصف حالتك بالتفصيل..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                      placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors" />
                </div>

                {error && (
                  <p className="text-red-400 text-xs mt-3 flex items-center gap-1.5">
                    <span>⚠️</span>{error}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={reset}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/25 transition-all active:scale-95">
                    رجوع
                  </button>
                  <button onClick={handleSubmit} disabled={loading || !form.name.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm
                      disabled:opacity-50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2
                      shadow-lg shadow-emerald-500/25">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>جارٍ الإرسال...</>
                      : "إرسال الطلب ✈️"
                    }
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: done ── */}
            {step === "done" && (
              <div className="text-center bg-[#111E33] border border-emerald-500/25 rounded-2xl p-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                  ✅
                </div>
                <h3 className="text-white font-black text-lg mb-2">تم إرسال طلبك!</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  سيرد عليك أحد متخصصينا في أقرب وقت ممكن.<br />
                  يمكنك متابعة ردودك من "استشاراتي".
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={reset}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/25 transition-all active:scale-95">
                    استشارة جديدة
                  </button>
                  <button onClick={() => { setShowList(true); fetchConsultations(); }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm hover:-translate-y-0.5 transition-all active:scale-95">
                    عرض استشاراتي
                  </button>
                </div>
              </div>
            )}

            {/* ── My consultations button ── */}
            {step !== "done" && (
              <button onClick={() => { setShowList(true); fetchConsultations(); }}
                className="relative w-full py-3 rounded-2xl bg-[#111E33] border border-white/8 text-white font-semibold text-sm
                  hover:border-white/20 transition-all active:scale-[.98] flex items-center justify-center gap-2">
                🧾 استشاراتي السابقة
                {consultations.length > 0 && (
                  <span className="flex items-center gap-3 text-xs">
                    {pendingCount > 0 && (
                      <span className="bg-amber-500 text-black font-black px-2 py-0.5 rounded-full">
                        {pendingCount} انتظار
                      </span>
                    )}
                    {repliedCount > 0 && (
                      <span className="bg-emerald-500 text-black font-black px-2 py-0.5 rounded-full">
                        {repliedCount} رد
                      </span>
                    )}
                  </span>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Modal: my consultations ── */}
        {showList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowList(false)}>
            <div className="w-full max-w-lg bg-[#0E1628] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div>
                  <h3 className="text-white font-black text-base">استشاراتي</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{consultations.length} استشارة</p>
                </div>
                <button onClick={() => setShowList(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-sm">
                  ✕
                </button>
              </div>

              {/* Modal body */}
              <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
                {loadingList ? (
                  Array(2).fill(0).map((_,i) => (
                    <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                  ))
                ) : consultations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-400 text-sm">لا توجد استشارات بعد</p>
                  </div>
                ) : (
                  consultations.map(c => (
                    <div key={c.id} style={{ opacity: deleting === c.id ? 0.4 : 1 }} className="transition-opacity">
                      <ConsultCard c={c} onDelete={handleDelete} />
                    </div>
                  ))
                )}
              </div>

              {/* Modal footer */}
              <div className="px-4 py-3 border-t border-white/8">
                <button onClick={() => setShowList(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm hover:-translate-y-0.5 transition-all active:scale-95">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}