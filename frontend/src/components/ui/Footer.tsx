 
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">

      <div className="container mx-auto px-6 py-12">

        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              CORE <span className="text-blue-600">S+</span>
            </h2>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-[1.6]">
              مركز متخصص في الحجامة والمساج العلاجي وتأهيل الإصابات
              بأيدي متخصصين معتمدين.
            </p>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              الخدمات
            </h3>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>حجامة</li>
              <li>مساج علاجي</li>
              <li>تأهيل إصابات</li>
              <li>استشفاء رياضي</li>
            </ul>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              روابط مهمة
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link className="text-gray-600 dark:text-gray-400 hover:text-blue-600" to="/about">
                  من نحن
                </Link>
              </li>

              <li>
                <Link className="text-gray-600 dark:text-gray-400 hover:text-blue-600" to="/contact">
                  تواصل معنا
                </Link>
              </li>

              <li>
                <Link className="text-gray-600 dark:text-gray-400 hover:text-blue-600" to="/privacy">
                  سياسة الخصوصية
                </Link>
              </li>

              <li>
                <Link className="text-gray-600 dark:text-gray-400 hover:text-blue-600" to="/terms">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              تواصل
            </h3>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">

              <li>📞 0500000000</li>
              <li>💬 واتساب</li>
              <li>📸 إنستغرام</li>
              <li>📍 الرياض</li>

            </ul>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-4 text-sm">

              <a href="#" className="hover:text-blue-600 transition">
                تويتر
              </a>

              <a href="#" className="hover:text-pink-500 transition">
                إنستغرام
              </a>

              <a href="#" className="hover:text-yellow-500 transition">
                سناب
              </a>

              <a href="#" className="hover:text-red-500 transition">
                يوتيوب
              </a>

            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">

          © 2026  m.3laa — جميع الحقوق محفوظة

        </div>

      </div>

    </footer>
  );
};

export default Footer;