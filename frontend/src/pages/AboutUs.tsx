import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden text-justify"
      >
        <h1 className="text-3xl font-bold ">
          مرحبًا بكم في
          <span dir="ltr">CORE S+ </span>
        </h1>

        <p className="text-gray-300 mt-2 leading-relaxed">
          مركز متخصص في الحجامة العلاجية، المساج العلاجي والاسترخائي، الريكافري
          الرياضي، والتأهيل الحركي.
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow hover:scale-105 transition"
        >
          ← رجوع
        </button>
      </motion.div>

      {/* Content */}
      <div className="mt-8 space-y-6 text-justify">
        <Card title="من نحن">
          نحن مركز متخصص في تقديم خدمات علاجية متكاملة تعتمد على الدمج بين
          الأساليب العلمية الحديثة والخبرة العملية في التعامل مع مختلف الحالات،
          بدايةً من آلام العضلات والمفاصل وحتى إصابات الملاعب وبرامج التأهيل
          والاستشفاء الرياضي.
        </Card>

        <Card title="رسالتنا">
          تقديم خدمات علاجية احترافية تساعد على تحسين الصحة، تخفيف الألم،
          واستعادة النشاط والحيوية من خلال تقييم دقيق وخطط علاجية مخصصة لكل
          حالة، بدون مبالغة أو وعود غير واقعية.
        </Card>

        <Card title="هدفنا">
          توفير تجربة علاجية متكاملة تعتمد على المتابعة المستمرة والاهتمام
          بالتفاصيل، لتحقيق أفضل نتائج ممكنة لكل عميل وفق احتياجاته الفردية.
        </Card>

        <Card title="قيمنا">
          <ul className="space-y-2 list-disc pr-5 marker:text-emerald-600">
            <li>الشفافية والوضوح بدون تجميل</li>
            <li>النظافة والمعايير المهنية العالية</li>
            <li>احترام احتياجات كل عميل</li>
            <li>الدمج بين التراث والعلم الحديث</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ---------- CARD ---------- */

function Card({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6 border-r-4 border-emerald-500"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </motion.div>
  );
}
