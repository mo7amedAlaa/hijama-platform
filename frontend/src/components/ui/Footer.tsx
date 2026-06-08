 
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">

      <div className="container mx-auto px-6 py-12">

        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="flex justify-start text-xl font-extrabold text-gray-900 dark:text-white" >
             <a className="text-2xl font-extrabold text-gray-900 dark:text-white flex" dir="ltr">
  CORE <span className="text-blue-600 ml-1">S+</span>
</a>
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
                <Link className="text-gray-600 dark:text-gray-400 hover:text-blue-600" to="/about_us">
                  من نحن
                </Link>
              </li>

              <li>
                <Link className="text-gray-600 dark:text-gray-400 hover:text-blue-600" to="https://wa.me/01031830595">
                  تواصل معنا
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

              <li>📞 ٠١٠٣١٨٣٠٥٩٥</li>
              <li>💬 واتساب</li>
               <li>📍 ينها-القليوبية-مصر</li>

            </ul>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-4 text-sm">

              <a href="https://www.tiktok.com/@pro.recovery1?_r=1&_t=ZS-972T3DTo2Ta" className="hover:text-blue-600 transition">
                تيك توك
              </a>

              <a href="https://www.facebook.com/share/1EDRsWSDnp/" className="hover:text-pink-500 transition">
                فيسبوك
              </a>

              <a href="https://www.snapchat.com/add/core_s263909?share_id=_XMmop7tgZI&locale=ar-EG" className="hover:text-yellow-500 transition">
                سناب
              </a>

              <a href="https://www.instagram.com/cores123951?igsh=MXhxOGVtNWtvODE4YQ==" className="hover:text-violet-600 transition">
                انستقرام
              </a>

            </div>

          </div>

        </div>

      
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">

          © 2026  mo.3laa — جميع الحقوق محفوظة

        </div>

      </div>

    </footer>
  );
};

export default Footer;