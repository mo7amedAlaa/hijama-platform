 
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../services/api";
import type { Booking } from "../types";
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const HeroSection = () => {
 const [nextBooking, setNextBooking] = useState<Booking | null>(null);
const { isAuth } = useAuth();

useEffect(() => {
  if (!isAuth) return;

  const load = async () => {
    try {
      const booking = await authService.nextSession();
      setNextBooking(booking);
    } catch (err) {
      setNextBooking(null);
    }
  };

  load();
}, [isAuth]);

  return (
    <section className="relative min-h-screen flex items-center bg-white dark:bg-gray-900 overflow-hidden">

      {/* 🌈 BACKGROUND EFFECTS */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-400/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-400/20 blur-3xl rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* 🔥 BOOKING BADGE */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4 flex items-center gap-2"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>

            <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
              متاح للحجز الآن — بدون انتظار
            </div>
          </motion.div>

          {/* TITLE */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white">
           <span dir="ltr">
  CORE <span className="text-blue-600 ml-1">S+</span>
</span>
            <br />
            <span className="text-blue-600">
              مركز الحجامة والاستشفاء المتكامل
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-3 text-gray-600 dark:text-gray-400 leading-[1.5] text-sm md:text-base">
            نقدم جلسات علاجية متخصصة بأيدي خبراء معتمدين في الحجامة والاستشفاء الطبيعي،
            مع متابعة دقيقة لكل حالة لضمان أفضل نتائج ممكنة.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">

            <Link
              to="/booking"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-center"
            >
              احجز جلستك الآن ←
            </Link>

            <button className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              🎥 شاهد كيف نعمل
            </button>

          </div>

          {/* STATS */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">

            {[
              { num: "2,000+", label: "عميل" },
              { num: "5,000+", label: "جلسة" },
              { num: "98%", label: "رضا" },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {item.num}
                </p>
                <p className="text-xs text-gray-500">
                  {item.label}
                </p>
              </div>
            ))}

          </div>

        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative overflow-hidden rounded-3xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl">

            {/* glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full" />

            <p className="text-xs text-gray-500">جلسة القادمة</p>

            {!nextBooking ? (
              <div className="text-center py-8">
                <div className="text-4xl">📭</div>
                <p className="text-sm text-gray-500 mt-2">
                  لا توجد جلسة قادمة
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >

                {/* status */}
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold
                    ${nextBooking.status === "confirmed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                    }`}>
                    {nextBooking.status === "confirmed" ? "✓ مؤكدة" : "⏳ قيد الانتظار"}
                  </span>

                  <span className="text-xs text-gray-500">
                    {nextBooking.booking_ref}
                  </span>
                </div>

                {/* session name */}
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  {nextBooking.therapy_session?.name_ar ?? "جلسة علاجية"}
                </h3>

                {/* details */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-gray-500">التاريخ</p>
                    <p className="font-semibold">
                      📅 {formatDate(nextBooking.slot?.date)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-gray-500">الوقت</p>
                    <p className="font-semibold">
                      ⏰ {nextBooking.slot?.start_time?.slice(0, 5)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-gray-500">المدة</p>
                    <p className="font-semibold">
                      ⏱ {nextBooking.therapy_session?.duration_minutes ?? 60} دقيقة
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-gray-500">النوع</p>
                    <p className="font-semibold">
                      🩸 حجامة علاجية
                    </p>
                  </div>

                </div>

                {/* footer animation */}
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    حضّر نفسك… جسمك جاي على إعادة تشغيل 🔄
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>

              </motion.div>
            )}

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;