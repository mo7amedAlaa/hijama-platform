// ─────────────────────────────────────────────────────────────
// src/components/booking/StepIndicator.tsx

import type { Slot } from "../../types";
import { CalendarMini } from "./SlotPicker";

// ─────────────────────────────────────────────────────────────
interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 mb-6">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${i < current  ? "bg-emerald-500 text-black" : ""}
              ${i === current ? "bg-emerald-500 text-black ring-4 ring-emerald-500/30" : ""}
              ${i > current  ? "bg-white/10 text-gray-500 border border-white/10" : ""}`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] whitespace-nowrap hidden sm:block
              ${i === current ? "text-emerald-400 font-bold" : "text-gray-500"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 h-px mb-4 transition-all duration-500
              ${i < current ? "bg-emerald-500" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}




interface SlotPickerProps {
  date: string;
  onDateChange: (date: string) => void;
  slots: Slot[];
  loadingSlots: boolean;
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
}

export function SlotPicker({ date, onDateChange, slots, loadingSlots, selectedSlot, onSlotSelect }: SlotPickerProps) {
  return (
    <div className="space-y-5">
      <CalendarMini selected={date} onChange={onDateChange} />
      {date && (
        <div>
          <p className="text-sm text-gray-400 mb-3">
            المواعيد المتاحة — <span className="text-white font-semibold">{date}</span>
          </p>
          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm bg-white/5 rounded-2xl border border-white/10">
              😔 لا توجد مواعيد في هذا اليوم
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(slot => (
                <button key={slot.id} type="button" onClick={() => onSlotSelect(slot)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border
                    ${selectedSlot?.id === slot.id
                      ? "bg-emerald-500 text-black border-emerald-500 ring-2 ring-emerald-500/30"
                      : "bg-white/5 text-gray-300 border-white/10 hover:border-emerald-500/40"}`}>
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

