import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HijamaGuide() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center bg-slate-900 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <h1 className="text-3xl font-bold">دليل الحجامة</h1>
        <p className="mt-2 text-gray-300">
          قبل - أثناء - بعد الحجامة
        </p>

        {/* Back Button - FIXED */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 hover:bg-emerald-100 transition-all"
        >
          ← رجوع
        </button>
      </motion.div>

      {/* Content */}
      <div className="space-y-6 mt-8">

        <Card title="ما هي الحجامة">
          الحجامة تقنية علاجية قديمة تعتمد على تحسين الدورة الدموية عبر سحب دم
          بكميات بسيطة لتنشيط الجسم.
        </Card>

        <Card title="كيفية عمل الحجامة">
          <List items={[
            "تعقيم شامل للأدوات",
            "وضع الكؤوس لخلق شفط قوي",
            "خدوش سطحية دقيقة",
            "سحب الدم بكميات صغيرة",
            "تنظيف وتعقيم بعد الانتهاء"
          ]} />

          <Warning text="لا تُجرى إلا على يد مختص محترف." />
        </Card>

        <Card title="قبل الحجامة">
          <List items={[
            "تجنب الأكل الثقيل",
            "شرب الماء بكثرة",
            "تجنب مميعات الدم",
            "الراحة النفسية"
          ]} />
        </Card>

        <Card title="بعد الحجامة">
          <List items={[
            "راحة 24 ساعة",
            "تجنب الرياضة",
            "شرب سوائل كثيرة",
            "تجنب الماء الساخن"
          ]} />

          <Warning text="احمرار خفيف طبيعي ويختفي خلال أيام." />
        </Card>

      </div>
    </div>
  );
}

/* ---------- CARD ---------- */

function Card({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-r-4 border-emerald-500"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-3">
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

/* ---------- LIST ---------- */

function List({ items }) {
  return (
    <ul className="space-y-2 pr-5 list-disc marker:text-emerald-600">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

/* ---------- WARNING ---------- */

function Warning({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="mt-4 bg-amber-100 border-r-4 border-amber-500 p-3 rounded-lg text-sm shadow-sm"
    >
      ⚠️ {text}
    </motion.div>
  );
}