"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function StudentDashboard() {
  const studentId = 1;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/students/${studentId}/dashboard`
        );

        const result = await response.json();

        console.log("DASHBOARD DATA:", result);

        if (!response.ok) {
          throw new Error(
            result?.message || "دریافت اطلاعات داشبورد ناموفق بود."
          );
        }

        setData(result);
      } catch (err: any) {
        console.error("Dashboard error:", err);

        setError(
          err?.message || "خطا در دریافت اطلاعات داشبورد."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="text-xl text-gray-700">
            در حال دریافت داشبورد...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
      >
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow">
          <div className="mb-4 text-5xl">⚠️</div>

          <h1 className="text-2xl font-bold text-red-600">
            خطا در دریافت اطلاعات
          </h1>

          <p className="mt-4 text-gray-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="text-xl">
            اطلاعات داشبورد پیدا نشد.
          </p>
        </div>
      </main>
    );
  }

  const student = data.student || {};
  const analysis = data.analysis || {};
  const aiDecision = data.aiDecision || {};
  const nextQuestion = data.nextQuestion || {};

  /*
   * اطلاعات اصلی دانش‌آموز
   */
  const studentName = student.name || "دانش‌آموز";

  const level = Number(student.level ?? 1);

  const xp = Number(student.xp ?? 0);

  /*
   * اطلاعات آماری از analysis می‌آید
   */
  const totalQuestions = Number(
    analysis.total ?? 0
  );

  const correctAnswers = Number(
    analysis.correct ?? 0
  );

  const wrongAnswers = Number(
    analysis.wrong ?? 0
  );

  const accuracy = Number(
    analysis.mastery ?? 0
  );

  /*
   * محاسبه صحیح پیشرفت Level
   *
   * طبق سیستم فعلی MathVerse:
   *
   * Level 1 -> 0 تا 100 XP
   * Level 2 -> 100 تا 200 XP
   * Level 3 -> 200 تا 300 XP
   * ...
   * Level 12 -> 1100 تا 1200 XP
   *
   * بنابراین:
   *
   * شروع Level = (level - 1) * 100
   * پایان Level = level * 100
   */
  const currentLevelStartXp = Math.max(
    0,
    (level - 1) * 100
  );

  const nextLevelXp = level * 100;

  /*
   * XP کسب‌شده داخل Level فعلی
   */
  const xpInsideLevel = Math.max(
    0,
    xp - currentLevelStartXp
  );

  /*
   * مقدار XP مورد نیاز برای عبور از این Level
   */
  const xpNeededForLevel =
    nextLevelXp - currentLevelStartXp;

  /*
   * درصد پیشرفت Level
   */
  const progressPercent =
    xpNeededForLevel > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (xpInsideLevel / xpNeededForLevel) * 100
            )
          )
        )
      : 0;

  /*
   * مهارت‌ها / فصل‌ها
   */
  const skills = analysis.skills || {};

  const skillEntries = Object.entries(skills);

  /*
   * فصل‌های ضعیف:
   * هر فصلی که تعداد غلط آن بیشتر از صحیح باشد.
   */
  const weakAreas = skillEntries
    .filter(([_, value]: any) => {
      return (
        Number(value?.wrong ?? 0) >
        Number(value?.correct ?? 0)
      );
    })
    .sort((a: any, b: any) => {
      return (
        Number(b[1]?.wrong ?? 0) -
        Number(a[1]?.wrong ?? 0)
      );
    });

  /*
   * پیشنهاد هوش مصنوعی
   */
  const recommendedDifficulty = Number(
    aiDecision.recommendedDifficulty ?? 1
  );

  const aiAction =
    aiDecision.action || "SMART_PRACTICE";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-100 p-6"
    >
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <h1 className="text-4xl font-bold text-gray-800">
            سلام {studentName} 👋
          </h1>

          <p className="mt-3 text-gray-500">
            به داشبورد هوشمند MathVerse خوش آمدی
          </p>

        </section>

        {/* Statistics */}
        <section className="grid gap-5 md:grid-cols-4">

          {/* Level */}
          <div className="rounded-3xl bg-blue-50 p-6 shadow">

            <p className="text-gray-500">
              سطح فعلی
            </p>

            <h2 className="mt-2 text-4xl font-bold text-blue-700">
              {level}
            </h2>

          </div>

          {/* XP */}
          <div className="rounded-3xl bg-green-50 p-6 shadow">

            <p className="text-gray-500">
              XP
            </p>

            <h2 className="mt-2 text-4xl font-bold text-green-700">
              {xp}
            </h2>

          </div>

          {/* Questions */}
          <div className="rounded-3xl bg-purple-50 p-6 shadow">

            <p className="text-gray-500">
              تعداد سؤال
            </p>

            <h2 className="mt-2 text-4xl font-bold text-purple-700">
              {totalQuestions}
            </h2>

          </div>

          {/* Accuracy */}
          <div className="rounded-3xl bg-orange-50 p-6 shadow">

            <p className="text-gray-500">
              درصد موفقیت
            </p>

            <h2 className="mt-2 text-4xl font-bold text-orange-700">
              {accuracy}%
            </h2>

          </div>

        </section>

        {/* Detailed Statistics */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <h2 className="mb-6 text-2xl font-bold">
            📊 آمار عملکرد
          </h2>

          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-gray-500">
                کل پاسخ‌ها
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {totalQuestions}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-gray-500">
                پاسخ صحیح
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {correctAnswers}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-gray-500">
                پاسخ غلط
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700">
                {wrongAnswers}
              </p>
            </div>

          </div>

        </section>

        {/* XP Progress */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-xl font-bold">
              پیشرفت سطح بعدی
            </h2>

            <span className="font-bold text-blue-600">
              {progressPercent}%
            </span>

          </div>

          <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200">

            <div
              className="h-5 rounded-full bg-blue-600 transition-all"
              style={{
                width: `${progressPercent}%`,
              }}
            />

          </div>

          <p className="mt-3 text-gray-500">
            {xp} / {nextLevelXp} XP
          </p>

        </section>

        {/* AI Recommendation */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <h2 className="mb-5 text-2xl font-bold">
            🤖 پیشنهاد هوش مصنوعی
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-blue-50 p-5">

              <p className="text-gray-500">
                سطح دشواری پیشنهادی
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {recommendedDifficulty}
              </p>

            </div>

            <div className="rounded-2xl bg-purple-50 p-5">

              <p className="text-gray-500">
                تصمیم سیستم
              </p>

              <p className="mt-2 font-bold text-purple-700">
                {aiAction}
              </p>

            </div>

          </div>

        </section>

        {/* Weak Areas */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <h2 className="mb-5 text-2xl font-bold">
            📌 نیاز به تمرین بیشتر
          </h2>

          {weakAreas.length > 0 ? (

            <div className="space-y-4">

              {weakAreas.map(
                ([chapter, stats]: any) => (

                  <div
                    key={chapter}
                    className="rounded-2xl bg-red-50 p-5"
                  >

                    <div className="flex items-center justify-between">

                      <h3 className="font-bold text-red-700">
                        {chapter}
                      </h3>

                      <span className="rounded-full bg-red-100 px-4 py-1 text-sm text-red-700">
                        نیاز به مرور
                      </span>

                    </div>

                    <div className="mt-3 flex gap-6 text-sm">

                      <span className="text-green-700">
                        صحیح: {stats.correct}
                      </span>

                      <span className="text-red-700">
                        غلط: {stats.wrong}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="rounded-2xl bg-green-50 p-5 text-green-700">
              🎉 در حال حاضر موضوع ضعیفی مشخص نشده است.
            </div>

          )}

        </section>

        {/* All Skills */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <h2 className="mb-5 text-2xl font-bold">
            📚 وضعیت فصل‌ها
          </h2>

          <div className="space-y-4">

            {skillEntries.map(
              ([chapter, stats]: any) => {

                const correct = Number(
                  stats?.correct ?? 0
                );

                const wrong = Number(
                  stats?.wrong ?? 0
                );

                const total = correct + wrong;

                const mastery =
                  total > 0
                    ? Math.round(
                        (correct / total) * 100
                      )
                    : 0;

                return (
                  <div
                    key={chapter}
                    className="rounded-2xl border p-5"
                  >

                    <div className="flex justify-between">

                      <h3 className="font-bold">
                        {chapter}
                      </h3>

                      <span className="font-bold">
                        {mastery}%
                      </span>

                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-blue-600"
                        style={{
                          width: `${mastery}%`,
                        }}
                      />

                    </div>

                    <div className="mt-3 flex gap-6 text-sm">

                      <span className="text-green-700">
                        صحیح: {correct}
                      </span>

                      <span className="text-red-700">
                        غلط: {wrong}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* Next Question */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <h2 className="mb-5 text-2xl font-bold">
            🎯 سؤال پیشنهادی بعدی
          </h2>

          {nextQuestion?.id ? (

            <div className="rounded-2xl bg-blue-50 p-6">

              <h3 className="text-xl font-bold text-blue-800">
                {nextQuestion.title}
              </h3>

              {nextQuestion.description && (
                <p className="mt-3 text-gray-600">
                  {nextQuestion.description}
                </p>
              )}

              {nextQuestion.chapter && (
                <p className="mt-3 text-gray-600">
                  فصل: {nextQuestion.chapter}
                </p>
              )}

              {nextQuestion.difficulty !== undefined && (
                <p className="mt-2 text-gray-600">
                  سطح دشواری: {nextQuestion.difficulty}
                </p>
              )}

            </div>

          ) : (

            <div className="rounded-2xl bg-gray-50 p-5 text-gray-600">
              هنوز سؤال پیشنهادی جدیدی آماده نشده است.
            </div>

          )}

        </section>

        {/* Quick Actions */}
        <section className="grid gap-5 md:grid-cols-3">

          <a
            href="/student/ai"
            className="rounded-3xl bg-blue-600 p-6 text-center font-bold text-white shadow transition hover:bg-blue-700"
          >
            🤖 معلم هوشمند
          </a>

          <a
            href="/student/exams"
            className="rounded-3xl bg-purple-600 p-6 text-center font-bold text-white shadow transition hover:bg-purple-700"
          >
            📝 آزمون‌ها
          </a>

          <a
            href="/student/lessons"
            className="rounded-3xl bg-green-600 p-6 text-center font-bold text-white shadow transition hover:bg-green-700"
          >
            📚 درس‌های من
          </a>

        </section>

      </div>
    </main>
  );
}