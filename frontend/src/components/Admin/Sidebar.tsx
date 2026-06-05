import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminView } from "../../types";

const NAV_ITEMS: { id: AdminView; label: string; icon: string }[] = [
  { id: "overview", label: "نظرة عامة", icon: "📊" },
  { id: "bookings", label: "الحجوزات", icon: "📅" },
  { id: "consultations", label: "الاستشارات", icon: "👨‍⚕️" },
  { id: "users", label: "المستخدمون", icon: "👥" },
  { id: "sessions", label: "الخدمات", icon: "🏥" },
  { id: "slots", label: "المواعيد", icon: "🕐" },
];

interface SidebarProps {
  view: AdminView;
  onSelect: (v: AdminView) => void;
  onLogout: () => void;
}

export default function Sidebar({
  view,
  onSelect,
  onLogout,
}: SidebarProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (v: AdminView) => {
    onSelect(v);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#08111f]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="font-black text-lg bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
          CORE S+
        </h1>

        <motion.button
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: open ? 90 : 0 }}
          onClick={() => setOpen(true)}
          className="text-white text-2xl"
        >
          ☰
        </motion.button>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 300 }}
        animate={{
          x: open || window.innerWidth >= 768 ? 0 : 300,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 25,
        }}
        className="
          fixed md:sticky
          top-0 right-0
          z-50
          h-screen
          w-72
          bg-[#08111f]/95
          backdrop-blur-2xl
          border-l border-white/10
          flex flex-col
          overflow-hidden
        "
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 w-52 h-52 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="relative px-6 py-8 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              CORE S+
            </h2>

            <p className="text-xs text-gray-500">
              لوحة التحكم الإدارية
            </p>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item, index) => {
            const active = view === item.id;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  x: -4,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => handleSelect(item.id)}
                className={`
                  relative
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-2xl
                  text-sm
                  font-semibold
                  transition-all
                  overflow-hidden
                  ${
                    active
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-400/5"
                  />
                )}

                <span className="relative text-lg">
                  {item.icon}
                </span>

                <span className="relative">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(239,68,68,.08)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              text-sm
              text-gray-400
              hover:text-red-400
              transition-all
            "
          >
            <span>🚪</span>
            تسجيل الخروج
          </motion.button>

          <div className="mt-5 text-center">
            <p className="text-[11px] text-gray-600">
              CORE S+ Dashboard
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}