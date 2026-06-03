import React, { useState } from "react";
import { authService } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("من فضلك املأ جميع الحقول");
      return;
    }

    try {
      setLoading(true);

      const data = await authService.login({email, password});

      // 🔥 AuthContext instead of localStorage here
      login(data.user, data.token);

      navigate("/");

    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "حدث خطأ أثناء تسجيل الدخول";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-500">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            CORE <span className="text-blue-600">S+</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            تسجيل الدخول إلى حسابك
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
        >

          {/* Email */}
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* ERROR under fields */}
          {error && (
            <p className="text-red-500 text-sm mb-3">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}

            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          {/* REGISTER LINK */}
          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            ليس لديك حساب؟{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline"
            >
              إنشاء حساب
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;