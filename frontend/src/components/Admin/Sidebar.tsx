import { useState } from "react";
import type { AdminView } from "../../types";

const NAV_ITEMS: { id: AdminView; label: string; icon: string }[] = [
  { id: "overview", label: "نظرة عامة", icon: "📊" },
  { id: "bookings", label: "الحجوزات", icon: "📅" },
  { id: "users", label: "المستخدمون", icon: "👥" },
  { id: "sessions", label: "الخدمات", icon: "🏥" },
  { id: "slots", label: "المواعيد", icon: "🕐" },
];

interface SidebarProps {
  view: AdminView;
  onSelect: (v: AdminView) => void;
  onLogout: () => void;
}

export default function Sidebar({ view, onSelect, onLogout }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (v: AdminView) => {
    onSelect(v);
    setOpen(false); // close on mobile after selection
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 w-full flex items-center justify-between bg-[#0A1222] text-white px-4 py-3 border-b border-white/10">
        <div className="font-bold">CORE S+</div>
        <button onClick={() => setOpen(true)} className="text-2xl">
          ☰
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 right-0 z-50
          h-screen w-64 bg-[#0A1222] border-l border-white/8
          flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/8">
          <div
            className="text-xl font-black"
            style={{
              background: "linear-gradient(135deg,#00C9A7,#F5A623)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CORE S+
          </div>
          <div className="text-xs text-gray-500 mt-0.5">لوحة التحكم</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-right
                ${
                  view === item.id
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}