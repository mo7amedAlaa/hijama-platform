import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaSnapchatGhost,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

const Footer = () => {
  return (
    <>
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
                  <span className="text-blue-600 ml-1">S+</span>
                </span>
              </h2>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                مركز متخصص في الحجامة والمساج العلاجي وتأهيل الإصابات بأيدي
                متخصصين معتمدين.
              </p>
            </div>

            {/* SERVICES */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                الخدمات
              </h3>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>الحجامة</li>
                <li>المساج العلاجي</li>
                <li>تأهيل الإصابات</li>
                <li>الاستشفاء الرياضي</li>
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
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
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
                  📞 <span dir="ltr">01031830595</span>
                </li>

                <li>📍 بنها - القليوبية - مصر</li>
              </ul>

              {/* SOCIAL ICONS */}
              <div className="flex flex-row-reverse justify-end gap-4 mt-5 text-xl text-gray-600 dark:text-gray-400">
                <a
                  href="https://wa.me/201031830595"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>

                <a
                  href="https://www.facebook.com/share/1EDRsWSDnp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>

                <a
                  href="https://www.instagram.com/cores123951"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-500 transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>

                <a
                  href="https://www.snapchat.com/add/core_s263909"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow-500 transition-all duration-300 hover:scale-110"
                  aria-label="Snapchat"
                >
                  <FaSnapchatGhost />
                </a>

                <a
                  href="https://www.tiktok.com/@pro.recovery1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="TikTok"
                >
                  <FaTiktok />
                </a>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
            © 2026 mo.3laa — جميع الحقوق محفوظة
          </div>
        </div>
      </footer>

    
    </>
  );
};

export default Footer;