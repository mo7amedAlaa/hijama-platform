import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { TherapySession } from "../types";
import { sessionService } from "../services/api";

const normalizeServices = (response: any): TherapySession[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.services)) return response.data.services;
  if (Array.isArray(response?.services)) return response.services;
  return [];
};

const SkeletonCard = () => (
  <div className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
);

const ServicesSection = () => {
  const [services, setServices] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await sessionService.getAll({
          signal: controller.signal,
        });

        const data = normalizeServices(response);

        setServices(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;

        console.error("Failed to load services:", err);
        setServices([]);
        setError("تعذر تحميل الخدمات حالياً");
      } finally {
        setLoading(false);
      }
    };

    loadServices();

    return () => controller.abort();
  }, []);

  const hasServices = services.length > 0;

  return (
    <section id="services" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            خدماتنا
          </h2>
          <p className="mt-2 text-gray-500">
            اختر الخدمة المناسبة لجسمك… والباقي علينا
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-lg mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-red-700">حدث خطأ</h3>
            <p className="text-red-600 mt-2">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && !hasServices && (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              لا توجد خدمات متاحة حالياً
            </h3>
            <p className="mt-2 text-gray-500">
              يرجى العودة لاحقاً أو التواصل معنا.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && hasServices && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id ?? `${service.name_ar}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Icon */}
                <div className="mb-3">
                  {service.icon_url ? (
                    <img
                      src={service.icon_url}
                      alt={service.name_ar}
                      loading="lazy"
                      className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {service.name_ar || "خدمة علاجية"}
                </h3>

                {/* Desc */}
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {service.description ||
                    "جلسة علاجية متخصصة لتحسين الصحة والحركة."}
                </p>

                {/* Meta */}
                <div className="mt-4 flex justify-between text-sm">
                  <span className="font-bold text-blue-600">
                    {service.price ?? 0} ج.م
                  </span>
                  <span className="text-gray-500">
                    ⏱ {service.duration_minutes ?? 0} دقيقة
                  </span>
                </div>

                {/* CTA */}
                <Link
                  to="/booking"
                  className="mt-4 block rounded-xl bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
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