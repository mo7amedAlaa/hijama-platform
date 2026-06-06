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
        className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden"
      >
        <h1 className="text-3xl font-bold">من نحن</h1>
        <p className="text-gray-300 mt-2">
          قصة، رؤية، ورسالة نبني بها الثقة قبل أي خدمة
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
      <div className="mt-8 space-y-6">

        <Card title="قصتنا">
          بدأنا بفكرة بسيطة: تقديم خدمات صحية تقليدية مثل الحجامة بشكل
          احترافي، نظيف، ومبني على الثقة. ما بين التراث والطب الحديث،
          قررنا نعيد تقديم الشيء القديم بطريقة حديثة.
        </Card>

        <Card title="رؤيتنا">
          نؤمن أن الصحة مش رفاهية، بل أسلوب حياة. هدفنا نكون منصة موثوقة
          تجمع بين الخبرة التقليدية والتقنيات الحديثة في الرعاية الصحية.
        </Card>

        <Card title="رسالتنا">
          تقديم خدمات آمنة، نظيفة، ومبنية على الوعي الطبي، مع احترام
          احتياجات كل شخص بدون مبالغة أو وعود غير واقعية.
        </Card>

        <Card title="قيمنا">
          <ul className="space-y-2 list-disc pr-5 marker:text-emerald-600">
            <li>الشفافية بدون تجميل</li>
            <li>النظافة قبل أي شيء</li>
            <li>احترام العميل</li>
            <li>الجمع بين التراث والعلم</li>
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
      <h2 className="text-xl font-bold text-slate-800 mb-3">
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}