import React, { useState } from "react";
import axios from "axios";
import { authService } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import type {
  AuthResponse,
  ApiError,
} from "../types/index";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  age: string;
}

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    age: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.password_confirmation ||
      !form.age
    ) {
      setError("من فضلك املأ جميع الحقول");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    try {
      setLoading(true);

      const data: AuthResponse =
        await authService.register({
          ...form,
          age: form.age,
        });

      login(data.user, data.token);

      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiError>(err)) {
        setError(
          err.response?.data?.message ??
            "حدث خطأ أثناء إنشاء الحساب"
        );
      } else {
        setError("حدث خطأ غير متوقع");
      }
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
            إنشاء حساب جديد
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
        >
          {/* NAME */}
          <input
            name="name"
            type="text"
            placeholder="الاسم"
            value={form.name}
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* EMAIL */}
          <input
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* PASSWORD */}
          <input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* CONFIRM PASSWORD */}
          <input
            name="password_confirmation"
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={form.password_confirmation}
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* AGE */}
          <input
            name="age"
            type="number"
            placeholder="العمر"
            value={form.age}
            max={100}
            min={1}
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* ERROR */}
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
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}

            {loading
              ? "جاري إنشاء الحساب..."
              : "إنشاء حساب"}
          </button>

          {/* LOGIN LINK */}
          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;