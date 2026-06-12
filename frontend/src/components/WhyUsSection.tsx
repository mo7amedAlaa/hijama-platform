import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🎯",
    title: "متخصصون معتمدون",
    desc: "فريقنا حاصل على أعلى شهادات الاعتماد الدولي",
  },
  {
    icon: "⚡",
    title: "نتائج سريعة",
    desc: "أغلب عملائنا يشعرون بتحسن ملحوظ من الجلسة الأولى",
  },
  {
    icon: "📅",
    title: "حجز مرن",
    desc: "احجز موعدك في أي وقت بكل سهولة ويسر",
  },
  {
    icon: "🔒",
    title: "بيئة آمنة ومعقمة",
    desc: "أعلى معايير النظافة والتعقيم في كل جلسة",
  },
  {
    icon: "💬",
    title: "متابعة مستمرة",
    desc: "فريقنا معك قبل وبعد الجلسة للإجابة على استفساراتك",
  },
  {
    icon: "🏆",
    title: "خبرة ١٠+ سنوات",
    desc: "نخبة من أفضل المتخصصين في  جمهورية مصر",
  },
];

const WhyUsSection = () => {
  return (
    <section
      className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500 "
      id="features"
    >
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-medium">⭐ لماذا نحن</p>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
            لماذا تختار{" "}
            <span className="text-blue-600" dir="ltr">
              CORE S+
            </span>
            ؟
          </h2>

          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-[1.6]">
            نحن لا نقدم مجرد جلسات — نقدم تجربة علاجية متكاملة تبدأ من اللحظة
            التي تحجز فيها.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
              احجز الآن
            </button>

            <button className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              تعرف علينا أكثر
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{item.icon}</div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-[1.5]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
