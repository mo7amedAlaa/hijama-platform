import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaSnapchatGhost,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { sessionService } from "../../services/api";

export default function Footer() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await sessionService.getAll();
        setServices(response?.data || []);
      } catch (error) {
        console.error("Failed to load services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <footer
      dir="rtl"
      className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-6 py-12">
        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-10 text-right">
          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              <span className="inline-flex items-center" dir="ltr">
                CORE
                <span className="text-emerald-600 ml-1">S+</span>
              </span>
            </h2>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              مركز متخصص في الحجامة والمساج العلاجي وتأهيل الإصابات بأسلوب يجمع
              بين الخبرة التقليدية والنهج العلمي الحديث.
            </p>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              الخدمات
            </h3>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {loading ? (
                <li className="opacity-50">جاري التحميل...</li>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <li key={service.id}>
                    <Link
                      to="/booking"
                      className="hover:text-emerald-600 transition"
                    >
                      {service?.name_ar}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="opacity-50">لا توجد خدمات حالياً</li>
              )}
            </ul>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              روابط مهمة
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about_us"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition"
                >
                  من نحن
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              تواصل معنا
            </h3>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                📞{" "}
                <a
                  href="tel:+201031830595"
                  className="hover:text-emerald-600 transition"
                  dir="ltr"
                >
                  01031830595
                </a>
              </li>

              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.google.com/maps/place/30%C2%B028'10.3%22N+31%C2%B011'44.0%22E"
                  className="hover:text-emerald-600 transition"
                >
                  🗺️ الموقع على الخريطة
                </a>
              </li>
            </ul>

            {/* SOCIAL */}
            <div className="flex flex-row-reverse justify-end gap-4 mt-5 text-xl text-gray-600 dark:text-gray-400">
              <a
                href="https://wa.me/201031830595"
                className="hover:text-green-500 hover:scale-110 transition"
              >
                <FaWhatsapp />
              </a>

              <a
                href="https://www.facebook.com/share/1EDRsWSDnp/"
                className="hover:text-blue-600 hover:scale-110 transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.instagram.com/cores123951"
                className="hover:text-pink-500 hover:scale-110 transition"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.snapchat.com/add/core_s263909"
                className="hover:text-yellow-500 hover:scale-110 transition"
              >
                <FaSnapchatGhost />
              </a>

              <a
                href="https://www.tiktok.com/@pro.recovery1"
                className="hover:text-black dark:hover:text-white hover:scale-110 transition"
              >
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="flex items-center justify-center mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 gap-2">
          <a
            href="https://my-portfolio-ockk.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            <img
              src="/src/assets/logo.png"
              alt="CORE S+"
              className="w-6 h-6 rounded-full animate-spin hover:animate-none transition"
            />
          </a>

          <span>جميع الحقوق محفوظة © 2026</span>
        </div>
      </div>
    </footer>
  );
}
