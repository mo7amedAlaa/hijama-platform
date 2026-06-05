// src/pages/admin/BookingDetailsPage.tsx

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useShowBooking } from "../../hooks/useBooking";

const medicalMap: Record<string, string> = {
  // complaints
  lower_back: "آلام أسفل الظهر",
  neck: "آلام الرقبة",
  shoulder: "آلام الكتف",
  knee: "آلام الركبة",
  muscle_strain: "شد عضلي",
  disc: "انزلاق غضروفي",
  other: "أخرى",

  // conditions
  bp: "ضغط الدم",
  sugar: "مرض السكري",
  heart: "أمراض القلب",
  anemia: "أنيميا",
  none: "لا يوجد",

  // goals
  performance: "تحسين الأداء",
  recovery: "الاستشفاء",
  mobility: "زيادة الحركة",
  pain: "تخفيف الألم",
  relax: "الاسترخاء",
};

// ─── تحويل طبي ذكي
function formatMedicalList(value: any): string {
  if (!value) return "لا يوجد";

  const list = Array.isArray(value) ? value : [value];

  return list
    .map((item) => {
      const key = String(item).trim().toLowerCase();
      return medicalMap[key] || item;
    })
    .map((text) => `✓ ${text}`)
    .join("\n");
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { booking, loading, error, fetch } = useShowBooking();

  useEffect(() => {
    if (id) fetch(Number(id));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111f] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#07111f] flex items-center justify-center text-red-400">
        Booking not found
      </div>
    );
  }

  const statusColor: any = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4 ">
            <h1 className="text-3xl font-black">
                تفاصيل الحجز  
            </h1>

            <p className="bg-white/5 text-red-500 mt-1 px-3 py-1 rounded-full">
              #{booking.booking_ref}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            ← رجوع
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">

            {/* SESSION */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-5">
                🏥 معلومات الجلسة
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <Info title="الخدمة" value={booking.therapy_session?.name_ar} />
                <Info title="التاريخ" value={booking.appointment_date?.slice(0, 10)} />
                <Info title="بداية الجلسة" value={booking.appointment_start} />
                <Info title="نهاية الجلسة" value={booking.appointment_end} />

                <Info
                  title="المدة"
                  value={`${booking.therapy_session?.duration_minutes ?? 0} دقيقة`}
                />

                <Info title="الموقع" value={booking.injury_location} />
              </div>
            </div>

            {/* MEDICAL */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-5">
                🩺 البيانات الطبية
              </h2>

              <div className="space-y-4">

                <TextBlock
                  title="الشكوى الرئيسية"
                  value={formatMedicalList(booking.complaints)}
                />

                <TextBlock
                  title="التاريخ المرضي"
                  value={formatMedicalList(booking.conditions)}
                />

                <TextBlock
                  title="أهداف الجلسة"
                  value={formatMedicalList(booking.goals)}
                />

                <TextBlock
                  title="ملاحظات"
                  value={booking.notes}
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">

            <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-bold mb-4">
                حالة الحجز
              </h3>

              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  statusColor[booking.status] ||
                  "bg-gray-500/20 text-gray-400"
                }`}
              >
                {booking.status}
              </span>

              <div className="mt-6">
                <p className="text-gray-500 text-sm">
                  مستوى الألم
                </p>

                <div className="mt-2 h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-red-500"
                    style={{ width: `${booking.pain_level * 10}%` }}
                  />
                </div>

                <p className="mt-2 font-bold">
                  {booking.pain_level}/10
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-bold mb-4">
                👤 بيانات العميل
              </h3>

              <div className="space-y-3">
                <Info title="الاسم" value={booking.user?.name} />
                <Info title="البريد" value={booking.user?.email} />
                <Info title="الهاتف" value={booking.user?.phone} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────
// UI Components
// ──────────────────────────────

function Info({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <p className="text-xs text-gray-500 mb-1">
        {title}
      </p>

      <p className="font-semibold break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function TextBlock({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <p className="text-sm font-bold mb-2">
        {title}
      </p>

      <p className="text-gray-300 whitespace-pre-line leading-7">
        {value}
      </p>
    </div>
  );
}