import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { TherapySession } from "../types";
import { sessionService } from "../services/api";

const ServicesSection = () => {
  const [services, setServices] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await sessionService.getAll();

        let servicesData: TherapySession[] = [];

        if (Array.isArray(response)) {
          servicesData = response;
        } else if (Array.isArray(response?.data)) {
          servicesData = response.data;
        } else if (Array.isArray(response?.data?.services)) {
          servicesData = response.data.services;
        } else if (Array.isArray(response?.services)) {
          servicesData = response.services;
        }

        if (mounted) {
          setServices(servicesData);
        }
      } catch (err) {
        console.error("Failed to load services:", err);

        if (mounted) {
          setServices([]);
          setError("تعذر تحميل الخدمات حالياً");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="services"
      className="py-20 bg-gray-50 dark:bg-gray-950"
    >
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            🏥 خدماتنا
          </h2>

          <p className="mt-2 text-gray-500">
            اختر الخدمة المناسبة لجسمك… والباقي علينا
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-lg mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>

            <h3 className="font-bold text-red-700">
              حدث خطأ
            </h3>

            <p className="text-red-600 mt-2">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📭</div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              لا توجد خدمات متاحة حالياً
            </h3>

            <p className="mt-2 text-gray-500">
              يرجى العودة لاحقاً أو التواصل معنا لمعرفة الخدمات المتوفرة.
            </p>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && services.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id ?? index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-3 text-3xl transition group-hover:scale-110">
                  🏥
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {service.name_ar || "خدمة علاجية"}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {service.description ||
                    "جلسة علاجية متخصصة لتحسين الصحة والحركة."}
                </p>

                <div className="mt-4 flex justify-between text-sm">
                  <span className="font-bold text-blue-600">
                    {service.price ?? 0} ر.س
                  </span>

                  <span className="text-gray-500">
                    ⏱ {service.duration_minutes ?? 0} دقيقة
                  </span>
                </div>

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