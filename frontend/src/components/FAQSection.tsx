import   { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "هل الجلسات مؤلمة؟",
    a: "معظم الجلسات تكون مريحة جداً، وقد يشعر البعض بانزعاج بسيط فقط في البداية.",
  },
  {
    q: "كم مدة الجلسة؟",
    a: "تتراوح مدة الجلسة بين 45 إلى 60 دقيقة حسب نوع الخدمة.",
  },
  {
    q: "هل النتائج تظهر من أول جلسة؟",
    a: "نعم، كثير من العملاء يلاحظون تحسن من الجلسة الأولى، لكن النتائج الأفضل تكون مع الاستمرارية.",
  },
  {
    q: "هل الأدوات معقمة؟",
    a: "نستخدم أدوات معقمة 100% ونعتمد أعلى معايير النظافة الطبية.",
  },
  {
    q: "كيف أحجز موعد؟",
    a: "يمكنك الحجز مباشرة من الموقع أو عبر زر 'احجز الآن' وسيتم تأكيد الموعد فوراً.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500">

      <div className="container mx-auto px-6 max-w-3xl">

        {/* HEADER */}
        <div className="text-center mb-12">

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            ❓ الأسئلة الشائعة
          </h2>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            أسئلة يسألها عملاؤنا قبل الحجز
          </p>

        </div>

        {/* FAQ LIST */}
        <div className="space-y-3">

          {faqs.map((item, i) => {
            const isOpen = openIndex === i;

            return (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
              >

                {/* QUESTION */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-right px-5 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.q}
                  </span>

                  <span className="text-xl text-blue-600">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* ANSWER */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 leading-[1.6] bg-white dark:bg-gray-900"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
};

export default FAQSection;