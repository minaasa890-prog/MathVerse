"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password) {
      setError("لطفاً ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:4000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "ورود ناموفق بود."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "PARENT") {
        router.push("/parent/dashboard");
      } else if (data.user.role === "STUDENT") {
        router.push("/student");
      } else if (data.user.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/");
      }

    } catch (err: any) {
      setError(
        err?.message ||
        "خطایی هنگام ورود رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <h1 className="text-center text-3xl font-bold text-blue-700">
          ورود به MathVerse
        </h1>

        <p className="mt-3 text-center text-gray-600">
          وارد حساب کاربری خود شوید
        </p>

        <div className="mt-8 space-y-4">

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="ایمیل"
            className="w-full rounded-xl border p-3 text-right outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="رمز عبور"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
            className="w-full rounded-xl border p-3 text-right outline-none focus:ring-2 focus:ring-blue-400"
          />

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading
              ? "در حال ورود..."
              : "ورود"}
          </button>

        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          حساب ندارید؟

          <button
            type="button"
            onClick={() =>
              router.push("/register")
            }
            className="mr-2 text-blue-600 hover:text-blue-800"
          >
            ثبت‌نام
          </button>
        </div>

      </div>
    </main>
  );
}
