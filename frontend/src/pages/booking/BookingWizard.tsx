// src/pages/BookingPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepIndicator }  from "../../components/booking/StepIndicator";
import { SessionCard }    from "../../components/booking/SessionCard";
import { SlotPicker }     from "../../components/booking/SlotPicker";
import { BookingSuccess } from "../../components/booking/BookingSuccess";
import { useSessions, useCreateBooking  } from "../../hooks/useBooking";
import type { TherapySession, GeneratedSlot, MedicalForm } from "../../types";

// ─── Step labels ─────────────────────────────────────────────
const STEPS = ["الخدمة", "الموعد", "بياناتك", "التأكيد"] as const;

// ─── Complaint / condition / goal options ────────────────────
const COMPLAINTS = [
  { id:"lower_back",    label:"آلام أسفل الظهر" },
  { id:"neck",          label:"آلام الرقبة" },
  { id:"shoulder",      label:"آلام الكتف" },
  { id:"knee",          label:"آلام الركبة" },
  { id:"muscle_strain", label:"شد عضلي" },
  { id:"disc",          label:"انزلاق غضروفي" },
  { id:"other",         label:"أخرى" },
];
const CONDITIONS = [
  { id:"bp",    label:"ضغط دم" }, { id:"sugar",  label:"سكر" },
  { id:"heart", label:"أمراض قلب" }, { id:"anemia", label:"أنيميا" },
  { id:"none",  label:"لا يوجد" },
];
const GOALS = [
  { id:"pain",        label:"تخفيف الألم" },
  { id:"mobility",    label:"زيادة الحركة" },
  { id:"recovery",    label:"الاستشفاء" },
  { id:"performance", label:"تحسين الأداء" },
  { id:"relax",       label:"الاسترخاء" },
];

// ─── Small reusable UI ───────────────────────────────────────
interface ErrorBannerProps { msg: string | null; onClose: () => void; }
function ErrorBanner({ msg, onClose }: ErrorBannerProps) {
  if (!msg) return null;
  return (
    <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
      <span>⚠️ {msg}</span>
      <button onClick={onClose} className="text-red-400/60 hover:text-red-400 text-lg">×</button>
    </div>
  );
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

interface CheckChipProps { label: string; checked: boolean; onToggle: () => void; }
function CheckChip({ label, checked, onToggle }: CheckChipProps) {
  return (
    <button type="button" onClick={onToggle}
      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
        ${checked
          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/25"}`}>
      {checked && "✓ "}{label}
    </button>
  );
}

// ─── Step 2: Medical form ─────────────────────────────────────
interface MedicalFormProps {
  form: MedicalForm;
  onChange: <K extends keyof MedicalForm>(field: K, val: MedicalForm[K]) => void;
}
function MedicalFormStep({ form, onChange }: MedicalFormProps) {
  const toggle = (field: "complaints" | "conditions" | "goals", id: string) => {
    const current = form[field] as string[];
    onChange(field, current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  };

  return (
    <div className="space-y-6">
      {[
        { label:"الشكوى الرئيسية", field:"complaints" as const, opts: COMPLAINTS },
        { label:"التاريخ المرضي",  field:"conditions" as const, opts: CONDITIONS },
        { label:"أهداف الجلسة",    field:"goals"      as const, opts: GOALS },
      ].map(({ label, field, opts }) => (
        <div key={field}>
          <p className="text-xs text-gray-500 mb-3">{label}</p>
          <div className="flex flex-wrap gap-2">
            {opts.map(o => (
              <CheckChip key={o.id} label={o.label}
                checked={(form[field] as string[]).includes(o.id)}
                onToggle={() => toggle(field, o.id)} />
            ))}
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-2 block">مستوى الألم</label>
          <select value={form.pain_level}
            onChange={e => onChange("pain_level", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60">
            <option value="">اختر</option>
            <option value="1-3">1–3 خفيف</option>
            <option value="4-6">4–6 متوسط</option>
            <option value="7-10">7–10 شديد</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-2 block">مكان الإصابة</label>
          <input value={form.injury_location}
            onChange={e => onChange("injury_location", e.target.value)}
            placeholder="مثال: الركبة اليمنى"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-2 block">ملاحظات إضافية (اختياري)</label>
        <textarea value={form.notes}
          onChange={e => onChange("notes", e.target.value)}
          rows={3} placeholder="أي معلومات إضافية..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 resize-none" />
      </div>
    </div>
  );
}

// ─── Step 3: Review ───────────────────────────────────────────
interface ReviewProps {
  session: TherapySession | null;
  slot: GeneratedSlot | null;
  date: string;
  medForm: MedicalForm;
}
function ReviewStep({ session, slot, date, medForm }: ReviewProps) {
  const rows = [
    { label:"الخدمة",       val: session?.name_ar },
    { label:"التاريخ",      val: date },
    { label:"الوقت",        val: slot?.start_time?.slice(0, 5) },
    { label:"السعر",        val: session ? `${session.price} ر.س` : undefined },
    { label:"مستوى الألم",  val: medForm.pain_level  || undefined },
    { label:"مكان الإصابة", val: medForm.injury_location || undefined },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-5 space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between text-sm">
            <span className="text-gray-500">{r.label}</span>
            <span className="text-white font-semibold">{r.val ?? "—"}</span>
          </div>
        ))}
      </div>
      {medForm.complaints.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">الشكاوى المحددة</p>
          <div className="flex flex-wrap gap-1.5">
            {medForm.complaints.map(c => (
              <span key={c} className="px-2 py-1 bg-white/8 border border-white/10 rounded-lg text-xs text-gray-300">{c}</span>
            ))}
          </div>
        </div>
      )}
      <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-400 leading-relaxed">
        ⚠️ بالضغط على "تأكيد الحجز" توافق على شروط المركز. يُرجى الحضور قبل ١٠ دقائق من الموعد.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(0);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
  const [selectedDate,    setSelectedDate]    = useState<string>("");
  const [selectedSlot,    setSelectedSlot]    = useState<GeneratedSlot | null>(null);
  const [medForm, setMedForm] = useState<MedicalForm>({
    complaints: [], conditions: [], goals: [],
    pain_level: "", injury_location: "", notes: "",
  });

  // مش محتاج useSlots هنا — SlotPicker بيجيب المواعيد بنفسه
  const { sessions, loading: loadingSessions, error: sessionsErr, fetch: fetchSessions } = useSessions();
  const { booking,  loading: submitting,      error: submitErr,   create }               = useCreateBooking();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  
  const updateMed = <K extends keyof MedicalForm>(field: K, val: MedicalForm[K]) =>
    setMedForm(f => ({ ...f, [field]: val }));

  const canNext = (): boolean => {
    if (step === 0) return !!selectedSession;
    if (step === 1) return !!selectedSlot;
    return true;
  };

  const handleNext = () => { if (canNext()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!selectedSession || !selectedSlot) return;
    setLocalError(null);
   try {
      await create({
        therapy_session_id: selectedSession.id,

         appointment_start: selectedSlot.start_time.slice(0, 5),

        appointment_date: selectedSlot.date,
        complaints: medForm.complaints,
        conditions: medForm.conditions,
        goals: medForm.goals,
        pain_level: medForm.pain_level || undefined,
        injury_location: medForm.injury_location || undefined,
        notes: medForm.notes || undefined,
      });

      setStep(4);
    } catch {
      // error lives in submitErr from the hook
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelectedSession(null);
    setSelectedDate("");
    setSelectedSlot(null);
    setMedForm({ complaints:[], conditions:[], goals:[], pain_level:"", injury_location:"", notes:"" });
  };

  const stepTitles = ["اختر الخدمة","حدد الموعد","بياناتك الصحية","مراجعة وتأكيد"];

  // ── Success ───────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#070D1A] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0E1628] border border-white/8 rounded-3xl overflow-hidden">
          <BookingSuccess
            booking={booking}
            onNewBooking={handleReset}
            onViewBookings={() => navigate("/profile")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D1A] flex items-center justify-center p-4">
      {/* bg orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="bg-[#0E1628] border border-white/8 rounded-3xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="px-6 pt-7 pb-0">
            <div className="flex items-center gap-3 mb-1">
              {step > 0 && (
                <button onClick={handleBack}
                  className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/25 transition-all text-sm">
                  →
                </button>
              )}
              <div>
                <h1 className="text-lg font-black text-white">{stepTitles[step]}</h1>
                <p className="text-xs text-gray-500 mt-0.5">الخطوة {step + 1} من {STEPS.length}</p>
              </div>
            </div>
            {/* Progress */}
            <div className="h-1 bg-white/5 rounded-full mt-4 mb-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <StepIndicator steps={[...STEPS]} current={step} />
          </div>

          {/* Body */}
          <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
            <ErrorBanner
              msg={localError ?? sessionsErr ?? submitErr}
              onClose={() => setLocalError(null)}
            />

            {step === 0 && (
              <div className="space-y-3">
                {loadingSessions
                  ? <LoadingSkeleton rows={4} />
                  : sessions.map(s => (
                    <SessionCard key={s.id} session={s}
                      selected={selectedSession?.id === s.id}
                      onSelect={setSelectedSession} />
                  ))
                }
              </div>
            )}

            {step === 1 && (
              <SlotPicker
                date={selectedDate}
                onDateChange={(d) => {
                  setSelectedDate(d);
                  setSelectedSlot(null);
                }}
                selectedSlot={selectedSlot}
                onSlotSelect={(s) => {
                  if (s.is_available) setSelectedSlot(s);
                }}
              />
            )}

            {step === 2 && <MedicalFormStep form={medForm} onChange={updateMed} />}

            {step === 3 && (
              <ReviewStep
                session={selectedSession}
                slot={selectedSlot}
                date={selectedDate}
                medForm={medForm}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-7 pt-2 border-t border-white/5">
            {step < 3 ? (
              <button onClick={handleNext} disabled={!canNext()}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all
                  ${canNext()
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30"
                    : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/8"}`}>
                التالي ←
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> جارٍ الحجز...</>
                  : "✓ تأكيد الحجز"
                }
              </button>
            )}
          </div>
        </div>

        {/* Summary pill */}
        {step > 0 && selectedSession && (
          <div className="mt-3 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-gray-400">
            <span className="text-base">🏥</span>
            <span className="font-semibold text-white">{selectedSession.name_ar}</span>
            {selectedDate && <><span>·</span><span>{selectedDate}</span></>}
            {selectedSlot && (
              <><span>·</span><span className="text-emerald-400 font-bold">{selectedSlot.start_time.slice(0, 5)}</span></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}