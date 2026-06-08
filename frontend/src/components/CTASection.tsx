 
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-gray-900">

      {/* 🌈 BACKGROUND GLOW */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-3xl rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">

        {/* ICON */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-5xl mb-4"
        >
          🚀
        </motion.div>

        {/* TITLE */}
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.2]">
          جاهز تبدأ رحلة
          <br />
          <span className="text-blue-600">الاستشفاء؟</span>
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-4 text-gray-600 dark:text-gray-400 leading-[1.6]">
          احجز جلستك الأولى اليوم وابدأ الفرق من أول جلسة. فريقنا جاهز لاستقبالك.
        </p>

        {/* BUTTONS */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">

          {/* PRIMARY CTA */}
          <Link
            to="/booking"
            className="px-8 py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-500/20"
          >
            احجز الآن — مجاناً 🎉
          </Link>

          {/* SECONDARY CTA */}
          <a
            href="tel:+201031830595"
            className="px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
          >
            📞 تواصل معنا
          </a>

        </div>

        {/* SMALL TRUST LINE */}
        <p className="mt-6 text-xs text-gray-500">
          لا حاجة للدفع المسبق — احجز الآن وابدأ عند الموعد
        </p>

      </div>

    </section>
  );
};

export default CTASection;