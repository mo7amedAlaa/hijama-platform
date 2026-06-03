import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { consultationService } from "../services/api";

const options = [
  { title: "مكالمة صوتية", desc: "تحدث مباشرة مع متخصص", icon: "📞", action: "voice" },
  { title: "محادثة نصية", desc: "عبر واتساب أو الرسائل", icon: "💬", action: "chat" },
  { title: "مكالمة مرئية", desc: "استشارة بالفيديو", icon: "🎥", action: "video" },
];

const ConsultationSection = () => {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [myConsultations, setMyConsultations] = useState([]);
  const [loadingConsults, setLoadingConsults] = useState(false);

  const [showMyConsultations, setShowMyConsultations] = useState(false);

  // ─── check auth ─────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetchConsultations(token);
    }
  }, []);

  // ─── fetch consultations ─────────────────────
const fetchConsultations = async () => {
  try {
    setLoadingConsults(true);

    const res = await consultationService.my();

    setMyConsultations(res.data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoadingConsults(false);
  }
};

  // ─── select type ─────────────────────────────
  const handleSelect = (type) => {
    setSelectedType(type);
    setResult(null);
  };

  // ─── form change ─────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ─── submit ──────────────────────────────────
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setResult({ type: "error", message: "يجب تسجيل الدخول أولاً" });
      return;
    }

    if (!selectedType) {
      setResult({ type: "error", message: "اختر نوع الاستشارة أولاً" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/consultations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: selectedType,
            ...form,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "حدث خطأ");

      setResult({
        type: "success",
        message: "تم إرسال الطلب بنجاح 👌",
      });

      setForm({ name: "", phone: "", message: "" });
      setSelectedType(null);

      fetchConsultations(token);
    } catch (err) {
      setResult({ type: "error", message: err.message });
    }

    setLoading(false);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-950" id="consultation">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white">
            الاستشارات
          </h2>
        </div>

        {/* NOT LOGGED IN */}
        {!isLoggedIn && (
          <div className="text-center p-6 bg-gray-900 rounded-2xl">
            <p className="text-gray-300 mb-4">
              لازم تسجل دخول عشان تطلب استشارة
            </p>

            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl"
            >
              تسجيل الدخول
            </button>
          </div>
        )}

        {/* LOGGED IN */}
        {isLoggedIn && (
          <>
            {/* OPTIONS */}
            <div className="grid md:grid-cols-3 gap-6">
              {options.map((opt) => (
                <motion.div
                  key={opt.action}
                  onClick={() => handleSelect(opt.action)}
                  className={`cursor-pointer p-6 rounded-2xl border bg-gray-900 ${
                    selectedType === opt.action
                      ? "border-blue-500 scale-[1.02]"
                      : "border-gray-800"
                  }`}
                >
                  <div className="text-3xl">{opt.icon}</div>
                  <h3 className="text-white font-bold mt-2">
                    {opt.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {opt.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* FORM */}
            {selectedType && (
              <div className="mt-10 p-6 bg-gray-900 rounded-2xl">
                <h3 className="text-white mb-4">
                  طلب استشارة ({selectedType})
                </h3>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="الاسم"
                  className="w-full p-3 mb-3 rounded-lg bg-gray-800 text-white"
                />

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="رقم الهاتف"
                  className="w-full p-3 mb-3 rounded-lg bg-gray-800 text-white"
                />

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="التفاصيل"
                  rows="4"
                  className="w-full p-3 mb-3 rounded-lg bg-gray-800 text-white"
                />

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl"
                >
                  {loading ? "جارٍ الإرسال..." : "إرسال"}
                </button>

                {result && (
                  <p
                    className={`mt-3 text-sm ${
                      result.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.message}
                  </p>
                )}
              </div>
            )}

            {/* BUTTON - MY CONSULTATIONS */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMyConsultations(true)}
              className="mt-8 relative px-6 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-white font-bold"
            >
              🧾 استشارتك السابقة

              {myConsultations.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {myConsultations.length}
                </span>
              )}
            </motion.button>
          </>
        )}

        {/* MODAL */}
        {showMyConsultations && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowMyConsultations(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-gray-900 rounded-2xl p-5 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg font-bold mb-4">
                استشارتك السابقة
              </h3>

              {myConsultations.length === 0 ? (
                <p className="text-gray-400">مفيش استشارات لسه</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-auto">
                  {myConsultations.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-black/40 border border-gray-800"
                    >
                      <div className="flex justify-between">
                        <span className="text-white text-sm font-bold">
                          {c.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {c.status}
                        </span>
                      </div>

                      <p className="text-gray-400 text-xs mt-2">
                        {c.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowMyConsultations(false)}
                className="mt-4 w-full py-2 rounded-xl bg-emerald-500 text-black font-bold"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConsultationSection;