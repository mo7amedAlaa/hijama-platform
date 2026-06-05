// src/components/booking/SlotPicker.tsx
import React, { useState, useMemo, useEffect } from "react";
import api, { extractError } from "../../api/axios";
import type { GeneratedSlot } from "../../types";

// ─── Constants ────────────────────────────────────────────────
const ARABIC_MONTHS     = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const ARABIC_DAYS_SHORT = ["أح","إث","ثل","أر","خم","جم","سب"];
const ARABIC_DAYS_FULL  = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

// تقسيم الأوقات لفترات
const getPeriod = (time: string): "صباح" | "ظهر" | "مساء" => {
  const h = parseInt(time.slice(0, 2));
  if (h < 12) return "صباح";
  if (h < 17) return "ظهر";
  return "مساء";
};

const PERIOD_ICONS: Record<string, string> = {
  "صباح": "🌅",
  "ظهر":  "☀️",
  "مساء": "🌙",
};

// ─── CalendarMini ─────────────────────────────────────────────
export function CalendarMini({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (d: string) => void;
}) {
  const [view, setView] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const y           = view.getFullYear();
  const m           = view.getMonth();
  const firstDay    = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells       = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const toKey = (d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isCurrentMonth =
    view.getMonth() === new Date().getMonth() &&
    view.getFullYear() === new Date().getFullYear();

  return (
    <div className="bg-[#0E1628] border border-white/10 rounded-2xl p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setView(new Date(y, m + 1, 1))}
          className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 text-gray-400
            hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10
            transition-all active:scale-90 text-base leading-none"
        >›</button>

        <div className="text-center">
          <div className="text-sm font-bold text-white">
            {ARABIC_MONTHS[m]} {y}
          </div>
        </div>

        <button
          onClick={() => setView(new Date(y, m - 1, 1))}
          disabled={isCurrentMonth}
          className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 text-gray-400
            hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10
            transition-all active:scale-90 text-base leading-none
            disabled:opacity-30 disabled:cursor-not-allowed"
        >‹</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {ARABIC_DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-600 font-medium">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const date    = new Date(y, m, day);
          const isPast  = date < today;
          const key     = toKey(day);
          const isSel   = selected === key;
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => onChange(key)}
              className={[
                "aspect-square rounded-xl text-xs font-medium transition-all duration-150 relative",
                isPast
                  ? "text-gray-700 cursor-not-allowed"
                  : "cursor-pointer",
                isSel
                  ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/40 scale-105"
                  : "",
                isToday && !isSel
                  ? "ring-1 ring-emerald-500/50 text-emerald-400 font-bold bg-emerald-500/10"
                  : "",
                !isSel && !isPast && !isToday
                  ? "text-gray-300 hover:bg-white/10 hover:text-white active:scale-95"
                  : "",
              ].join(" ")}
            >
              {day}
              {isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slot Button ──────────────────────────────────────────────
function SlotBtn({
  slot,
  selected,
  onSelect,
}: {
  slot: GeneratedSlot;
  selected: boolean;
  onSelect: (s: GeneratedSlot) => void;
}) {
  const avail = slot.is_available;

  return (
    <button
      disabled={!avail}
      onClick={() => onSelect(slot)}
      className={[
        "relative flex flex-col items-center justify-center gap-0.5",
        "py-3 px-1 rounded-xl border text-xs font-semibold",
        "transition-all duration-200",
        // ── محدد ──
        selected
          ? "bg-emerald-500 border-emerald-400 text-black scale-[1.06] shadow-lg shadow-emerald-500/35 z-10"
          : "",
        // ── متاح ──
        avail && !selected
          ? "bg-white/4 border-white/10 text-gray-300 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/8 hover:text-emerald-300 hover:scale-[1.03] active:scale-95"
          : "",
        // ── محجوز ──
        !avail
          ? "bg-red-500/4 border-red-500/10 text-red-500/30 cursor-not-allowed"
          : "",
      ].join(" ")}
    >
      {/* وقت البداية */}
      <span className={`text-[13px] leading-tight ${!avail ? "line-through" : ""}`}>
        {slot.start_time.slice(0, 5)}
      </span>

      {/* وقت النهاية أو "محجوز" */}
      <span className={`text-[9px] leading-tight ${
        selected ? "text-black/60" : avail ? "text-gray-600" : "text-red-500/30"
      }`}>
        {avail ? slot.end_time.slice(0, 5) : "محجوز"}
      </span>

      {/* ✓ badge */}
      {selected && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-emerald-600 rounded-full flex items-center justify-center text-[9px] font-black shadow">
          ✓
        </span>
      )}
    </button>
  );
}

// ─── Period Section ───────────────────────────────────────────
function PeriodGroup({
  period,
  slots,
  selectedSlot,
  onSelect,
}: {
  period: string;
  slots: GeneratedSlot[];
  selectedSlot: GeneratedSlot | null;
  onSelect: (s: GeneratedSlot) => void;
}) {
  const availableCount = slots.filter(s => s.is_available).length;

  return (
    <div>
      {/* Period label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{PERIOD_ICONS[period]}</span>
        <span className="text-xs font-bold text-gray-400">{period}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          availableCount > 0
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-gray-600 bg-white/3 border-white/8"
        }`}>
          {availableCount} متاح
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {slots.map(s => (
          <SlotBtn
            key={s.start_time}
            slot={s}
            selected={
              selectedSlot?.start_time === s.start_time &&
              selectedSlot?.date === s.date
            }
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex items-center gap-5 text-[11px] text-gray-600">
      {[
        { color: "bg-white/10 border border-white/15", label: "متاح" },
        { color: "bg-emerald-500",                      label: "محدد" },
        { color: "bg-red-500/15 border border-red-500/10", label: "محجوز" },
      ].map(l => (
        <span key={l.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-md inline-block flex-shrink-0 ${l.color}`} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function SlotsSkeleton() {
  return (
    <div className="space-y-4">
      {[3, 4, 2].map((count, i) => (
        <div key={i}>
          <div className="h-4 w-20 rounded-lg bg-white/5 animate-pulse mb-2" />
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {Array(count * 2).fill(0).map((_, j) => (
              <div
                key={j}
                className="h-14 rounded-xl bg-white/5 animate-pulse"
                style={{ animationDelay: `${(i * count + j) * 50}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptySlots({ date }: { date: string }) {
  const d   = new Date(date + "T00:00:00");
  const day = ARABIC_DAYS_FULL[d.getDay()];
  return (
    <div className="text-center py-12 bg-white/3 border border-white/8 rounded-2xl">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-white text-sm font-bold mb-1">
        {day} — لا توجد مواعيد
      </p>
      <p className="text-gray-600 text-xs">اختر يوماً آخر من التقويم</p>
    </div>
  );
}

// ─── Selected Summary ─────────────────────────────────────────
function SelectedSummary({ slot }: { slot: GeneratedSlot }) {
  const d   = new Date(slot.date + "T00:00:00");
  const day = ARABIC_DAYS_FULL[d.getDay()];
  const mon = ARABIC_MONTHS[d.getMonth()];

  return (
    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg flex-shrink-0">
        ✅
      </div>
      <div>
        <p className="text-xs text-emerald-400/70">الموعد المحدد</p>
        <p className="text-sm font-bold text-white">
          {day}، {d.getDate()} {mon} — {slot.start_time.slice(0, 5)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export interface SlotPickerProps {
  date: string;
  onDateChange: (d: string) => void;
  selectedSlot: GeneratedSlot | null;
  onSlotSelect: (s: GeneratedSlot) => void;
}

export function SlotPicker({
  date,
  onDateChange,
  selectedSlot,
  onSlotSelect,
}: SlotPickerProps) {

  // ── جلب المواعيد من الـ API ──────────────────────────────
  const [slots,        setSlots]        = useState<GeneratedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError,   setSlotsError]   = useState<string | null>(null);

  useEffect(() => {
    if (!date) { setSlots([]); return; }

    setLoadingSlots(true);
    setSlotsError(null);
    setSlots([]);

    api.get<{ slots: GeneratedSlot[] }>("/slots", { params: { date } })
      .then(res => setSlots(res.data.slots))
      .catch(err => setSlotsError(extractError(err)))
      .finally(() => setLoadingSlots(false));

  }, [date]); // ← يعيد الجلب كل ما تغير التاريخ

  // ── تقسيم المواعيد لـ صباح / ظهر / مساء ─────────────────
  const grouped = useMemo(() => {
    const map: Record<string, GeneratedSlot[]> = {
      "صباح": [], "ظهر": [], "مساء": [],
    };
    slots.forEach(s => map[getPeriod(s.start_time)].push(s));
    return map;
  }, [slots]);

  const available = slots.filter(s => s.is_available).length;
  const booked    = slots.filter(s => !s.is_available).length;

  return (
    <div className="space-y-5">

      {/* ── Calendar ── */}
      <CalendarMini selected={date} onChange={onDateChange} />

      {/* ── No date ── */}
      {!date && (
        <div className="text-center py-8 text-gray-600 text-sm">
          👆 اختر تاريخاً من التقويم
        </div>
      )}

      {/* ── Slots panel ── */}
      {date && (
        <div className="space-y-4">

          {/* Sub-header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              مواعيد{" "}
              <span className="text-white font-semibold">
                {ARABIC_DAYS_FULL[new Date(date + "T00:00:00").getDay()]}
              </span>
            </p>
            {!loadingSlots && slots.length > 0 && (
              <div className="flex gap-3 text-xs">
                <span className="text-emerald-400 font-bold">{available} متاح</span>
                {booked > 0 && (
                  <span className="text-red-400/50">{booked} محجوز</span>
                )}
              </div>
            )}
          </div>

          {/* Loading */}
          {loadingSlots && <SlotsSkeleton />}

          {/* Error */}
          {!loadingSlots && slotsError && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3 text-sm text-red-400">
              <span>⚠️</span>
              <span>{slotsError}</span>
              <button
                onClick={() => onDateChange(date)}
                className="mr-auto text-xs underline hover:no-underline"
              >إعادة المحاولة</button>
            </div>
          )}

          {/* Empty */}
          {!loadingSlots && !slotsError && slots.length === 0 && (
            <EmptySlots date={date} />
          )}

          {/* Grouped slots */}
          {!loadingSlots && slots.length > 0 && (
            <div className="space-y-5">
              {(["صباح", "ظهر", "مساء"] as const).map(period =>
                grouped[period].length > 0 ? (
                  <PeriodGroup
                    key={period}
                    period={period}
                    slots={grouped[period]}
                    selectedSlot={selectedSlot}
                    onSelect={onSlotSelect}
                  />
                ) : null
              )}
              <Legend />
            </div>
          )}

          {/* Selected summary */}
          {selectedSlot && <SelectedSummary slot={selectedSlot} />}

        </div>
      )}
    </div>
  );
}