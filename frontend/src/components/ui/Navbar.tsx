import React, { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [active, setActive] = useState("#home");

  const { user, isAuth, logout } = useAuth();

  const links = [
    { label: "الرئيسية", href: "#home" },
    { label: "الخدمات", href: "#services" },
    { label: "المميزات", href: "#features" },
    { label: "التقييمات", href: "#reviews" },
    { label: "اطلب استشارة", href: "#consultation" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleLinkClick = (href: string) => {
    setActive(href);
    setIsOpen(false);
  };

  const linkClass = (isActive: boolean) => `
    px-4 py-2 rounded-lg transition-all duration-300
    ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800"
    }
  `;

  return (
    <nav className="top-0 left-0 w-full z-50 border-b bg-white dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300">

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">

     <a className="text-2xl font-extrabold text-gray-900 dark:text-white flex" dir="ltr">
  CORE <span className="text-blue-600 ml-1">S+</span>
</a>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const isActive = active === link.href;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActive(link.href)}
                  className={linkClass(isActive)}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-3">

            {/* THEME */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* AUTH SECTION */}
            {!isAuth ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border text-gray-700 dark:text-gray-200"
                >
                  تسجيل الدخول
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  إنشاء حساب
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">

                {/* USER NAME */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <User size={16} />
                  {user?.name}
                </Link>

                {/* LOGOUT */}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white"
                >
                  <LogOut size={16} />
                  خروج
                </button>
              </div>
            )}

          </div>

          {/* MOBILE BUTTONS */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleDarkMode}>
              {darkMode ? <Sun /> : <Moon />}
            </button>

            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>

          <div className="flex flex-col gap-3 pb-6 pt-2">

            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={linkClass(active === link.href)}
              >
                {link.label}
              </a>
            ))}

            {/* AUTH MOBILE */}
            {!isAuth ? (
              <>
                <Link to="/login" className="px-4 py-2 border rounded-lg">
                  تسجيل الدخول
                </Link>

                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  إنشاء حساب
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
                >
                  حسابي - {user?.name.slice(0, 10)}
                </Link>

                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  تسجيل الخروج
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;