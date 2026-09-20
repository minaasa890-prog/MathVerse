"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon?: string | null;
  xpReward: number;
};

export default function StudentDashboard() {
  const studentId = 1;

  const [data, setData] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [loading, setLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
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

    async function loadAchievements() {
      try {
        setAchievementsLoading(true);

        const response = await fetch(
          `${API_URL}/achievements/student/${studentId}`
        );

        const result = await response.json();

        console.log("ACHIEVEMENTS DATA:", result);

        if (!response.ok) {
          throw new Error(
            result?.message || "دریافت دستاوردها ناموفق بود."
          );
        }

        /*
         * Backend ممکن است مستقیماً آرایه برگرداند
         * یا آن را داخل achievements قرار دهد.
         */
        const achievementList =
          Array.isArray(result)
            ? result
            : result?.achievements || [];

        setAchievements(achievementList);
      } catch (err) {
        console.error("Achievements error:", err);
        setAchievements([]);
      } finally {
        setAchievementsLoading(false);
      }
    }

    loadDashboard();
    loadAchievements();
  }, []);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-gray-100"
      >
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <div className="text-5xl">📚</div>

          <p className="mt-4 text-xl font-bold text-gray-700">
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
        className="flex min-h-screen items-center justify-center bg-gray-100 p-6"
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
            className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
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
        className="flex min-h-screen items-center justify-center bg-gray-100"
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

  const studentName = student.name || "دانش‌آموز";

  const level = Number(student.level ?? 1);
  const xp = Number(student.xp ?? 0);

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
   * Level Progress
   *
   * Level 1: 0 - 99 XP
   * Level 2: 100 - 199 XP
   * Level 3: 200 - 299 XP
   *
   * بنابراین:
   * شروع Level = (level - 1) * 100
   * پایان Level = level * 100
   */
  const currentLevelStartXp = Math.max(
    0,
    (level - 1) * 100
  );

  const nextLevelXp = level * 100;

  const xpInsideLevel = Math.max(
    0,
    xp - currentLevelStartXp
  );

  const xpNeededForLevel =
    nextLevelXp - currentLevelStartXp;

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
   * Skills
   */
  const skills = analysis.skills || {};

  const skillEntries = Object.entries(skills);

  /*
   * Weak Areas
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
   * AI Recommendation
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
              پیشرفت تا سطح بعدی
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

        {/* Achievements */}
        <section className="rounded-3xl bg-white p-8 shadow">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                🏆 دستاوردهای من
              </h2>

              <p className="mt-2 text-gray-500">
                موفقیت‌هایی که در مسیر یادگیری به دست آورده‌ای
              </p>
            </div>

            <div className="rounded-full bg-yellow-50 px-5 py-2 font-bold text-yellow-700">
              {achievements.length} دستاورد
            </div>

          </div>

          {achievementsLoading ? (

            <div className="rounded-2xl bg-gray-50 p-8 text-center">
              <div className="text-4xl">🏆</div>

              <p className="mt-3 text-gray-500">
                در حال دریافت دستاوردها...
              </p>
            </div>

          ) : achievements.length > 0 ? (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {achievements.map((achievement) => (

                <div
                  key={achievement.id}
                  className="rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-4xl">
                      {achievement.icon || "🏆"}
                    </div>

                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      +{achievement.xpReward} XP
                    </div>

                  </div>

                  <h3 className="mt-5 text-lg font-bold text-gray-800">
                    {achievement.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {achievement.description}
                  </p>

                </div>

              ))}

            </div>

          ) : (

            <div className="rounded-2xl bg-gray-50 p-8 text-center">

              <div className="text-5xl">
                🏆
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-700">
                هنوز دستاوردی کسب نکرده‌ای
              </h3>

              <p className="mt-2 text-gray-500">
                با انجام آزمون‌ها و تمرین‌ها اولین دستاوردت را به دست بیاور.
              </p>

            </div>

          )}

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
            href="/student/practice"
            className="rounded-3xl bg-green-600 p-6 text-center font-bold text-white shadow transition hover:bg-green-700"
          >
            🧠 تمرین هوشمند
          </a>

        </section>

      </div>
    </main>
  );
}