import React from "react";

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const ARABIC_DAYS = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];

interface Slot {
  id: number;
  start_time: string;
}

interface CalendarMiniProps {
  selected: string | null;
  onChange: (date: string) => void;
}

interface SlotPickerProps {
  date: string | null;
  onDateChange: (date: string) => void;
  slots: Slot[];
  loadingSlots: boolean;
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
}

export function CalendarMini({
  selected,
  onChange,
}: CalendarMiniProps) {
  const [view, setView] = React.useState<Date>(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const y = view.getFullYear();
  const m = view.getMonth();

  const firstDay = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: days }, (_, i) => i + 1));

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setView(new Date(y, m + 1, 1))}
          className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
        >
          ›
        </button>

        <span className="text-sm font-bold text-white">
          {ARABIC_MONTHS[m]} {y}
        </span>

        <button
          type="button"
          onClick={() => setView(new Date(y, m - 1, 1))}
          className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
        >
          ‹
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["أح", "إث", "ثل", "أر", "خم", "جم", "سب"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-gray-600"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const date = new Date(y, m, day);
          const past = date < today;

          const formattedDate = `${y}-${String(m + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const isSel = selected === formattedDate;
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onChange(formattedDate)}
              className={`aspect-square rounded-lg text-xs transition-all
                ${past ? "text-gray-700 cursor-not-allowed" : "cursor-pointer"}
                ${isSel ? "bg-emerald-500 text-black font-bold" : ""}
                ${isToday && !isSel ? "text-emerald-400 font-bold" : ""}
                ${
                  !isSel && !past && !isToday
                    ? "text-gray-400 hover:bg-white/10"
                    : ""
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SlotPicker({
  date,
  onDateChange,
  slots,
  loadingSlots,
  selectedSlot,
  onSlotSelect,
}: SlotPickerProps) {
  const selectedDateObj = date ? new Date(date) : null;

  const dateLabel = selectedDateObj
    ? `${ARABIC_DAYS[selectedDateObj.getDay()]}، ${selectedDateObj.getDate()} ${
        ARABIC_MONTHS[selectedDateObj.getMonth()]
      }`
    : "اختر تاريخاً";

  return (
    <div className="space-y-5">
      <CalendarMini
        selected={date}
        onChange={onDateChange}
      />

      {date && (
        <div>
          <p className="text-sm text-gray-400 mb-3">
            المواعيد المتاحة —{" "}
            <span className="text-white font-semibold">
              {dateLabel}
            </span>
          </p>

          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-11 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm bg-white/5 rounded-2xl border border-white/10">
              😔 لا توجد مواعيد في هذا اليوم
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSlotSelect(slot)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border
                    ${
                      selectedSlot?.id === slot.id
                        ? "bg-emerald-500 text-black border-emerald-500 ring-2 ring-emerald-500/30"
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-emerald-500/40 hover:text-white"
                    }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}