import  { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { TherapySession } from "../types";
import { sessionService } from "../services/api";

const ServicesSection = () => {
  const [services, setServices] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await sessionService.getAll();

        // حماية من شكل API
        const data = Array.isArray(res) ? res : res?.data ?? [];

        setServices(data);
      } catch (err) {
        setError("تعذر تحميل الخدمات");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950" id="services">
      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            🏥 خدماتنا
          </h2>
          <p className="text-gray-500 mt-2">
            اختر الخدمة المناسبة لجسمك… والباقي علينا
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="text-center text-red-500 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            📭 لا توجد خدمات متاحة حالياً
          </div>
        )}

        {/* GRID */}
        {!loading && !error && services.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl transition"
              >

                {/* ICON */}
                <div className="text-3xl mb-3 group-hover:scale-110 transition">
                  🏥
                </div>

                {/* NAME */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {service.name_ar}
                </h3>

                {/* DESC */}
                <p className="text-sm text-gray-500 mt-2">
                  {service.description ?? "جلسة علاجية متخصصة"}
                </p>

                {/* INFO */}
                <div className="mt-4 flex justify-between text-sm">
                  <span className="font-bold text-blue-600">
                    {service.price} ر.س
                  </span>

                  <span className="text-gray-500">
                    ⏱ {service.duration_minutes} دقيقة
                  </span>
                </div>

                {/* CTA */}
                <Link
                  to="/booking"
                  className="mt-4 block text-center py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  احجز الآن
                </Link>

              </motion.div>
            ))}

          </div>
        )}

      </div>
    </section>
  );
};

export default ServicesSection;