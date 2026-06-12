import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService, statsService } from "../services/api";
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
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const load = async () => {
      try {
        const stats = await statsService.getStats();
        setStats(stats.data);
      } catch (err) {
        setStats(null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isAuth) {
      setNextBooking(null);
      return;
    }

    const loadBooking = async () => {
      try {
        const booking = await authService.nextSession();
        setNextBooking(booking);
      } catch (err) {
        setNextBooking(null);
      }
    };
    loadBooking();
  }, [isAuth]);

  return (
    <section className="relative min-h-screen flex items-center bg-gray-50 dark:bg-gray-950 overflow-hidden bg-[url('/src/assets/bg.png')] bg-cover bg-center bg-no-repeat">
      {/* 🌫️ OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-[2px]" />

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          dir="rtl"
          className="text-right"
        >
          {/* 🔥 BOOKING BADGE */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4 flex items-center gap-2"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-500/20">
              متاح للحجز الآن — بدون انتظار
            </div>
          </motion.div>

          {/* TITLE */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white">
            <span dir="ltr" className="inline-block">
              CORE{" "}
              <span className="text-blue-600 dark:text-blue-400 ml-1">S+</span>
            </span>
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              مركز الحجامة والاستشفاء المتكامل
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-3 text-gray-600 dark:text-gray-300 leading-[1.6] text-sm md:text-base">
            نقدم جلسات علاجية متخصصة بأيدي خبراء معتمدين في الحجامة والاستشفاء
            الطبيعي، مع متابعة دقيقة لكل حالة لضمان أفضل نتائج ممكنة.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/booking"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition text-center font-semibold shadow-lg shadow-blue-600/20"
            >
              احجز جلستك الآن ←
            </Link>

            <Link
              to={"/hijama_guide"}
              className="px-6 py-3 rounded-xl border text-center border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
            >
              دليل الحجامة قبل - أثناء - بعد الحجامة
            </Link>
          </div>

          {/* STATS */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { num: stats?.users ?? 0, label: "عميل" },
              { num: stats?.sessions ?? 0, label: "خدمات" },
              { num: stats?.booking ?? 0, label: "حجوزات" },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {item.num}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
          dir="rtl"
        >
          <div className="relative overflow-hidden rounded-3xl p-6 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700/60 shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/10 blur-3xl rounded-full" />

            <p className="text-xs text-gray-500 dark:text-gray-400">
              جلستك القادمة
            </p>

            {!nextBooking ? (
              <div className="text-center py-8">
                <div className="text-5xl">📭</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  لا توجد جلسات قادمة حالياً
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* الحالة */}
                <div className="flex justify-between items-center mt-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      nextBooking.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}
                  >
                    {nextBooking.status === "confirmed"
                      ? "✓ مؤكدة"
                      : "⏳ قيد الانتظار"}
                  </span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{nextBooking.booking_ref}
                  </span>
                </div>

                {/* اسم الجلسة */}
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  {nextBooking.therapy_session?.name_ar ||
                    nextBooking.therapy_session?.name ||
                    "جلسة علاجية"}
                </h3>

                {/* وصف الجلسة */}
                {nextBooking.therapy_session?.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                    {nextBooking.therapy_session?.description}
                  </p>
                )}

                {/* البيانات */}
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      التاريخ
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      📅 {formatDate(nextBooking.appointment_date)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      وقت البداية
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      ⏰ {nextBooking.appointment_start?.slice(0, 5)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      وقت النهاية
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      🏁 {nextBooking.appointment_end?.slice(0, 5)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      المدة
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      ⏱ {nextBooking.therapy_session?.duration_minutes ?? 60}{" "}
                      دقيقة
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      نوع الجلسة
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      🩸 {nextBooking.therapy_session?.name_ar ?? "علاجية"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      الحالة
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      {nextBooking.status === "confirmed"
                        ? "مؤكدة"
                        : "بانتظار التأكيد"}
                    </p>
                  </div>
                </div>

                {/* الملاحظات */}
                {nextBooking.notes && (
                  <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      ملاحظات الجلسة
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {nextBooking.notes}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-gray-200 dark:border-gray-700/60 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    حضّر نفسك… جسمك جاي على إعادة تشغيل 🔄
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      جاهزة
                    </span>
                  </div>
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
