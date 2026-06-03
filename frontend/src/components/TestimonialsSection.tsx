 
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "أحمد السعيد",
    role: "رياضي محترف",
    text: "استشفاء مذهل بعد كل تمرين. لا أتخيل روتيني بدون جلسات CORE S+",
    initial: "أ",
  },
  {
    name: "سارة العمري",
    role: "موظفة",
    text: "آلام الظهر المزمنة اختفت تقريباً بعد ٤ جلسات فقط. خدمة احترافية جداً",
    initial: "س",
  },
  {
    name: "خالد القحطاني",
    role: "رياضي",
    text: "أنصح كل رياضي بتجربة الحجامة هنا. فريق محترف وبيئة راقية جداً",
    initial: "خ",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950 transition-colors duration-500 " id="reviews">

      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">

          <p className="text-blue-600 font-medium">
            💬 آراء عملائنا
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
            ماذا يقول عملاؤنا
          </h2>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >

              {/* STARS */}
              <div className="flex gap-1 text-yellow-400 text-sm mb-3">
                {"★★★★★"}
              </div>

              {/* TEXT */}
              <p className="text-gray-600 dark:text-gray-300 leading-[1.6] text-sm">
                "{item.text}"
              </p>

              {/* USER */}
              <div className="mt-6 flex items-center gap-3">

                {/* avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {item.initial}
                </div>

                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-sm">
                    {item.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.role}
                  </p>
                </div>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default TestimonialsSection;