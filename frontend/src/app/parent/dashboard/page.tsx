"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Child = {
studentId: number;
name: string;
class?: string;
totalExams: number;
average: number;
correctAnswers: number;
wrongAnswers?: number;
totalAnswers: number;
strengths: string[];
weaknesses: string[];
recommendation: string;
};

type ParentData = {
id: number;
name: string;
email?: string;
children: Child[];
};

export default function ParentDashboard() {
const [parent, setParent] = useState<ParentData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
async function loadDashboard() {
try {
setLoading(true);
setError("");

    const userText = localStorage.getItem("user");

    if (!userText) {
      setError("اطلاعات حساب والد پیدا نشد.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(userText);

    console.log("Logged in user:", user);

    if (!user?.id) {
      setError("شناسه کاربر پیدا نشد.");
      setLoading(false);
      return;
    }

    const parentId = Number(user.id);

    if (!Number.isInteger(parentId) || parentId <= 0) {
      setError("شناسه والد معتبر نیست.");
      setLoading(false);
      return;
    }

    const apiUrl =
      `http://localhost:4000/parent/dashboard/${parentId}`;

    console.log("Parent Dashboard URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Parent Dashboard API Error:",
        response.status,
        errorText
      );

      throw new Error(
        `خطا در دریافت اطلاعات والد (${response.status})`
      );
    }

    const data = await response.json();

    console.log("Parent Dashboard Data:", data);

    const children = Array.isArray(data?.children)
      ? data.children
      : [];

    setParent({
      id: data?.parent?.id ?? parentId,
      name: data?.parent?.name ?? user?.name ?? "والد",
      email: data?.parent?.email ?? user?.email ?? "",
      children,
    });
  } catch (err) {
    console.error("Parent Dashboard Error:", err);

    setError(
      err instanceof Error
        ? err.message
        : "ارتباط با سرور برقرار نشد."
    );
  } finally {
    setLoading(false);
  }
}

loadDashboard();

}, []);

if (loading) {
return ( <main
     dir="rtl"
     className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex items-center justify-center"
   > <div className="rounded-3xl bg-white p-10 shadow-xl text-center"> <div className="text-5xl">⏳</div>

      <h1 className="mt-4 text-2xl font-bold text-blue-700">
        در حال دریافت اطلاعات والد...
      </h1>

      <p className="mt-2 text-gray-500">
        لطفاً چند لحظه صبر کنید.
      </p>
    </div>
  </main>
);

}

if (error) {
return ( <main
     dir="rtl"
     className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 p-8 flex items-center justify-center"
   > <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl text-center"> <div className="text-6xl">⚠️</div>

      <h1 className="mt-5 text-2xl font-bold text-red-600">
        خطا
      </h1>

      <p className="mt-4 text-gray-700">
        {error}
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white transition hover:bg-blue-700"
      >
        تلاش دوباره
      </button>
    </div>
  </main>
);

}

const children = parent?.children ?? [];

return ( <main
   dir="rtl"
   className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-8"
 > <div className="mx-auto max-w-6xl">

    {/* Header */}
    <header className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm font-bold text-blue-600">
            🎓 MathVerse
          </p>

          <h1 className="mt-2 text-3xl font-black text-blue-700">
            👨‍👩‍👧 داشبورد والد
          </h1>

          <p className="mt-3 text-lg text-gray-700">
            خوش آمدید {parent?.name || "والد"} 👋
          </p>

          {parent?.email && (
            <p className="mt-1 text-gray-500">
              {parent.email}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-blue-50 px-6 py-4 text-center">
          <div className="text-3xl">
            👨‍👩‍👧
          </div>

          <p className="mt-1 font-bold text-blue-700">
            حساب والد
          </p>
        </div>

      </div>
    </header>

    {/* Children */}
    <section className="mb-8">

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">
            👦 فرزندان
          </h2>

          <p className="mt-1 text-gray-500">
            وضعیت دانش‌آموزان متصل به حساب شما
          </p>
        </div>

        <div className="rounded-xl bg-blue-100 px-4 py-2 font-bold text-blue-700">
          {children.length} دانش‌آموز
        </div>
      </div>

      {children.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-lg">

          <div className="text-6xl">
            👨‍🎓
          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-800">
            هنوز دانش‌آموزی متصل نشده است
          </h3>

          <p className="mt-3 text-gray-500">
            پس از اتصال حساب دانش‌آموز، اطلاعات پیشرفت او در این بخش نمایش داده می‌شود.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">

          {children.map((child) => (
            <div
              key={child.studentId}
              className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >

              {/* Student Header */}
              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
                  🎓
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-800">
                    {child.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {child.class || "کلاس مشخص نشده"}
                  </p>
                </div>

              </div>

              {/* Main Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-2xl bg-blue-50 p-4 text-center">
                  <div className="text-sm text-gray-500">
                    میانگین
                  </div>

                  <div className="mt-1 text-3xl font-black text-blue-700">
                    {child.average}%
                  </div>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 text-center">
                  <div className="text-sm text-gray-500">
                    پاسخ صحیح
                  </div>

                  <div className="mt-1 text-3xl font-black text-green-700">
                    {child.correctAnswers}
                  </div>
                </div>

              </div>

              {/* Secondary Stats */}
              <div className="mt-3 grid grid-cols-2 gap-3">

                <div className="rounded-2xl bg-purple-50 p-4 text-center">
                  <div className="text-sm text-gray-500">
                    کل پاسخ‌ها
                  </div>

                  <div className="mt-1 text-2xl font-black text-purple-700">
                    {child.totalAnswers}
                  </div>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-4 text-center">
                  <div className="text-sm text-gray-500">
                    آزمون‌ها
                  </div>

                  <div className="mt-1 text-2xl font-black text-yellow-700">
                    {child.totalExams}
                  </div>
                </div>

              </div>

              {/* Wrong Answers */}
              {typeof child.wrongAnswers === "number" && (
                <div className="mt-3 rounded-2xl bg-red-50 p-4 text-center">

                  <div className="text-sm text-gray-500">
                    پاسخ‌های غلط
                  </div>

                  <div className="mt-1 text-2xl font-black text-red-700">
                    {child.wrongAnswers}
                  </div>

                </div>
              )}

              {/* Progress */}
              <div className="mt-6">

                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span className="text-gray-600">
                    عملکرد
                  </span>

                  <span className="text-blue-700">
                    {child.average}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(child.average, 0),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* Strengths */}
              {child.strengths?.length > 0 && (
                <div className="mt-5 rounded-2xl bg-green-50 p-4">

                  <h4 className="font-black text-green-700">
                    💪 نقاط قوت
                  </h4>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {child.strengths.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700"
                      >
                        {item}
                      </span>
                    ))}

                  </div>

                </div>
              )}

              {/* Weaknesses */}
              {child.weaknesses?.length > 0 && (
                <div className="mt-3 rounded-2xl bg-red-50 p-4">

                  <h4 className="font-black text-red-700">
                    📚 نیاز به تمرین
                  </h4>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {child.weaknesses.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700"
                      >
                        {item}
                      </span>
                    ))}

                  </div>

                </div>
              )}

              {/* Recommendation */}
              <div className="mt-4 rounded-2xl bg-indigo-50 p-4">

                <h4 className="font-black text-indigo-700">
                  🤖 پیشنهاد MathVerse
                </h4>

                <p className="mt-2 leading-7 text-gray-700">
                  {child.recommendation}
                </p>

              </div>

              {/* Report Button */}
              <Link
                href={`/parent/student/${child.studentId}`}
                className="mt-5 block w-full rounded-xl bg-blue-600 py-3 text-center font-bold text-white transition hover:bg-blue-700"
              >
                📊 مشاهده گزارش کامل
              </Link>

            </div>
          ))}

        </div>
      )}

    </section>

    {/* Features */}
    <section>

      <h2 className="mb-5 text-2xl font-black text-gray-800">
        امکانات والدین
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-3xl bg-white p-7 shadow-lg">

          <div className="text-5xl">
            📊
          </div>

          <h3 className="mt-5 text-xl font-black text-gray-800">
            گزارش پیشرفت
          </h3>

          <p className="mt-3 leading-7 text-gray-600">
            مشاهده روند یادگیری، میزان پیشرفت و عملکرد فرزند.
          </p>

        </div>

        <div className="rounded-3xl bg-white p-7 shadow-lg">

          <div className="text-5xl">
            📝
          </div>

          <h3 className="mt-5 text-xl font-black text-gray-800">
            نتایج آزمون‌ها
          </h3>

          <p className="mt-3 leading-7 text-gray-600">
            مشاهده نتایج آزمون‌ها و میزان موفقیت دانش‌آموز.
          </p>

        </div>

        <div className="rounded-3xl bg-white p-7 shadow-lg">

          <div className="text-5xl">
            🤖
          </div>

          <h3 className="mt-5 text-xl font-black text-gray-800">
            تحلیل هوشمند
          </h3>

          <p className="mt-3 leading-7 text-gray-600">
            بررسی نقاط قوت و ضعف یادگیری با کمک هوش مصنوعی.
          </p>

        </div>

      </div>

    </section>

    {/* Footer */}
    <footer className="mt-10 pb-5 text-center text-sm text-gray-500">
      MathVerse — سامانه هوشمند آموزش ریاضی
    </footer>

  </div>
</main>

);
}
