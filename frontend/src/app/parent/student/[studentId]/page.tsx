"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ChallengingProgressItem = {
  attemptId: number;
  questionId: number;
  date: string;
  difficulty: number;
  chapter: string;
  isCorrect: boolean;
  percentage: number;
};

type ChapterPerformance = {
  chapter: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
};

type Student = {
  studentId: number;
  name: string;
  class: string;
  totalExams: number;
  average: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalAnswers: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  chapterPerformance: ChapterPerformance[];
  firstActivityDate: string | null;
  lastActivityDate: string | null;
};

export default function StudentReportPage() {
  const params = useParams();

  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);

  const [challengingProgress, setChallengingProgress] = useState<
    ChallengingProgressItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudentReport() {
      try {
        setLoading(true);
        setError("");

        // =========================
        // دریافت اطلاعات والد
        // =========================

        const userText = localStorage.getItem("user");

        if (!userText) {
          throw new Error("اطلاعات حساب والد پیدا نشد.");
        }

        const user = JSON.parse(userText);

        if (!user?.id) {
          throw new Error("شناسه والد پیدا نشد.");
        }

        const parentId = Number(user.id);

        console.log("Parent Dashboard:");
        console.log("Parent ID:", parentId);
        console.log("Student ID:", studentId);

        // =========================
        // دریافت داشبورد والد
        // =========================

        const dashboardResponse = await fetch(
          `http://localhost:4000/parent/dashboard/${parentId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!dashboardResponse.ok) {
          throw new Error(
            `خطا در دریافت اطلاعات داشبورد والد: ${dashboardResponse.status}`,
          );
        }

        const dashboardData = await dashboardResponse.json();

        console.log("Parent Dashboard Data:", dashboardData);

        const children = Array.isArray(dashboardData.children)
          ? dashboardData.children
          : [];

        // =========================
        // پیدا کردن دانش‌آموز
        // =========================

        const foundStudent = children.find(
          (child: Student) =>
            Number(child.studentId) === Number(studentId),
        );

        if (!foundStudent) {
          throw new Error("اطلاعات این دانش‌آموز پیدا نشد");
        }

        setStudent(foundStudent);

        // =========================
        // دریافت سوالات چالشی
        // =========================

        const challengingResponse = await fetch(
          `http://localhost:4000/parent/student/${studentId}/challenging-progress`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (challengingResponse.ok) {
          const challengingData = await challengingResponse.json();

          console.log(
            "Challenging Progress:",
            challengingData,
          );

          setChallengingProgress(
            Array.isArray(challengingData)
              ? challengingData
              : [],
          );
        } else {
          console.warn(
            "خطا در دریافت سوالات چالشی:",
            challengingResponse.status,
          );

          setChallengingProgress([]);
        }
      } catch (err) {
        console.error("Student Report Error:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("خطایی در دریافت اطلاعات رخ داد.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadStudentReport();
  }, [studentId]);

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-700">
              در حال دریافت گزارش...
            </div>

            <p className="mt-3 text-gray-500">
              لطفاً چند لحظه صبر کنید.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // Error
  // =========================

  if (error || !student) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="mb-4 text-5xl">⚠️</div>

            <h1 className="text-2xl font-bold text-red-600">
              خطا
            </h1>

            <p className="mt-4 text-lg text-gray-700">
              {error || "اطلاعات این دانش‌آموز پیدا نشد"}
            </p>

            <Link
              href="/parent/dashboard"
              className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              بازگشت به داشبورد والد
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // محاسبات
  // =========================

  const totalChallenging = challengingProgress.length;

  const correctChallenging = challengingProgress.filter(
    (item) => item.isCorrect === true,
  ).length;

  const wrongChallenging =
    totalChallenging - correctChallenging;

  const challengingAverage =
    totalChallenging > 0
      ? Math.round(
          (correctChallenging / totalChallenging) * 100,
        )
      : 0;

  const chapterPerformance = Array.isArray(
    student.chapterPerformance,
  )
    ? [...student.chapterPerformance].sort(
        (a, b) => a.percentage - b.percentage,
      )
    : [];

  // =========================
  // نام قابل نمایش فصل
  // =========================

  const getChapterName = (chapter: string) => {
    if (!chapter || chapter.trim().toLowerCase() === "general") {
      return "سایر مباحث";
    }

    return chapter;
  };

  // =========================
  // وضعیت عملکرد فصل
  // =========================

  const getChapterStatus = (percentage: number) => {
    if (percentage >= 80) {
      return {
        label: "قوی",
        icon: "🟢",
        textClass: "text-green-700",
        bgClass: "bg-green-50",
        barClass: "bg-green-500",
      };
    }

    if (percentage >= 60) {
      return {
        label: "نیازمند تقویت",
        icon: "🟡",
        textClass: "text-yellow-700",
        bgClass: "bg-yellow-50",
        barClass: "bg-yellow-500",
      };
    }

    return {
      label: "ضعیف",
      icon: "🔴",
      textClass: "text-red-700",
      bgClass: "bg-red-50",
      barClass: "bg-red-500",
    };
  };

  // =========================
  // Render
  // =========================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              گزارش عملکرد دانش‌آموز
            </h1>

            <p className="mt-2 text-gray-500">
              گزارش کامل وضعیت تحصیلی {student.name}
            </p>
          </div>

          <Link
            href="/parent/dashboard"
            className="rounded-xl bg-white px-5 py-3 font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
          >
            ← بازگشت به داشبورد
          </Link>
        </div>

        {/* ================= STUDENT INFO ================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
          <div className="grid gap-5 md:grid-cols-4">

            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-sm text-gray-500">
                نام دانش‌آموز
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {student.name}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5">
              <p className="text-sm text-gray-500">
                کلاس
              </p>

              <p className="mt-2 text-xl font-bold text-purple-700">
                {student.class}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-sm text-gray-500">
                میانگین
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {student.average}٪
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-5">
              <p className="text-sm text-gray-500">
                تعداد پاسخ‌ها
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-700">
                {student.totalAnswers}
              </p>
            </div>

          </div>
        </section>

        {/* ================= STATS ================= */}

        <section className="mb-8 grid gap-5 md:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-4xl">📝</div>

            <p className="mt-4 text-gray-500">
              تعداد فعالیت‌ها
            </p>

            <p className="mt-2 text-3xl font-extrabold text-gray-800">
              {student.totalExams}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-4xl">✅</div>

            <p className="mt-4 text-gray-500">
              پاسخ صحیح
            </p>

            <p className="mt-2 text-3xl font-extrabold text-green-600">
              {student.correctAnswers}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-4xl">❌</div>

            <p className="mt-4 text-gray-500">
              پاسخ غلط
            </p>

            <p className="mt-2 text-3xl font-extrabold text-red-600">
              {student.wrongAnswers}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-4xl">📊</div>

            <p className="mt-4 text-gray-500">
              درصد موفقیت
            </p>

            <p className="mt-2 text-3xl font-extrabold text-blue-600">
              {student.average}٪
            </p>
          </div>

        </section>

        {/* ================= CHAPTER PERFORMANCE ================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">
              📚 تحلیل عملکرد فصل‌ها
            </h2>

            <p className="mt-2 text-gray-500">
              بررسی میزان تسلط دانش‌آموز در هر فصل بر اساس پاسخ‌های ثبت‌شده
            </p>
          </div>

          {chapterPerformance.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
              هنوز اطلاعات کافی برای تحلیل فصل‌ها وجود ندارد.
            </div>
          ) : (
            <div className="space-y-5">

              {chapterPerformance.map((chapter, index) => {
                const status = getChapterStatus(
                  chapter.percentage,
                );

                const safePercentage = Math.min(
                  Math.max(chapter.percentage, 0),
                  100,
                );

                return (
                  <div
                    key={`${chapter.chapter}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                  >

                    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                      <div>
                        <h3 className="text-lg font-extrabold text-gray-800">
                          {getChapterName(chapter.chapter)}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {chapter.totalQuestions} سؤال
                          {" • "}
                          {chapter.correctAnswers} صحیح
                          {" • "}
                          {chapter.wrongAnswers} غلط
                        </p>
                      </div>

                      <div
                        className={`rounded-xl px-4 py-2 font-bold ${status.bgClass} ${status.textClass}`}
                      >
                        {status.icon} {status.label}
                      </div>

                    </div>

                    <div className="h-5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${status.barClass}`}
                        style={{
                          width: `${safePercentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="text-sm text-gray-500">
                        میزان تسلط
                      </span>

                      <span
                        className={`text-xl font-extrabold ${status.textClass}`}
                      >
                        {chapter.percentage}٪
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

          {/* راهنمای رنگ‌ها */}

          {chapterPerformance.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">

              <div className="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                🟢 ۸۰٪ به بالا: قوی
              </div>

              <div className="rounded-xl bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700">
                🟡 ۶۰٪ تا ۷۹٪: نیازمند تقویت
              </div>

              <div className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                🔴 کمتر از ۶۰٪: ضعیف
              </div>

            </div>
          )}

        </section>

        {/* ================= CHALLENGING QUESTIONS ================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">
              🔥 عملکرد در سؤالات چالشی
            </h2>

            <p className="mt-2 text-gray-500">
              بررسی عملکرد دانش‌آموز در سؤالات با درجه سختی بالاتر
            </p>
          </div>

          {/* Summary */}

          <div className="mb-8 grid gap-5 md:grid-cols-4">

            <div className="rounded-2xl bg-blue-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                کل سؤالات چالشی
              </p>

              <p className="mt-2 text-3xl font-extrabold text-blue-700">
                {totalChallenging}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                صحیح
              </p>

              <p className="mt-2 text-3xl font-extrabold text-green-700">
                {correctChallenging}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                غلط
              </p>

              <p className="mt-2 text-3xl font-extrabold text-red-700">
                {wrongChallenging}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                میانگین موفقیت
              </p>

              <p className="mt-2 text-3xl font-extrabold text-purple-700">
                {challengingAverage}٪
              </p>
            </div>

          </div>

          {/* Challenging Questions */}

          {challengingProgress.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
              هنوز سؤال چالشی برای این دانش‌آموز ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-5">

              {challengingProgress.map((item, index) => (
                <div
                  key={item.attemptId}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >

                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-3">

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {index + 1}
                      </span>

                      <div>
                        <p className="font-bold text-gray-800">
                          سؤال {item.questionId}
                        </p>

                        <p className="text-sm text-gray-500">
                          فصل: {getChapterName(item.chapter)}
                          {" • "}
                          درجه سختی: {item.difficulty}
                        </p>
                      </div>

                    </div>

                    <div
                      className={
                        item.isCorrect
                          ? "font-bold text-green-600"
                          : "font-bold text-red-600"
                      }
                    >
                      {item.isCorrect
                        ? "✓ صحیح"
                        : "✕ غلط"}
                    </div>

                  </div>

                  <div className="h-5 overflow-hidden rounded-full bg-gray-200">

                    <div
                      className={
                        item.isCorrect
                          ? "h-full rounded-full bg-green-500 transition-all"
                          : "h-full rounded-full bg-red-500 transition-all"
                      }
                      style={{
                        width: `${Math.min(
                          Math.max(item.percentage, 0),
                          100,
                        )}%`,
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between text-sm">

                    <span className="text-gray-500">
                      پیشرفت تجمعی
                    </span>

                    <span className="font-bold text-gray-700">
                      {item.percentage}٪
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* ================= STRENGTHS / WEAKNESSES ================= */}

        <section className="mb-8 grid gap-6 md:grid-cols-2">

          {/* Strengths */}

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <h2 className="text-xl font-extrabold text-gray-800">
              💪 نقاط قوت
            </h2>

            <div className="mt-5 space-y-3">

              {student.strengths.length === 0 ? (
                <p className="text-gray-500">
                  هنوز نقطه قوت مشخصی ثبت نشده است.
                </p>
              ) : (
                student.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-green-50 p-4 font-bold text-green-700"
                  >
                    ✓ {getChapterName(strength)}
                  </div>
                ))
              )}

            </div>

          </div>

          {/* Weaknesses */}

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <h2 className="text-xl font-extrabold text-gray-800">
              🎯 نقاط نیازمند تمرین
            </h2>

            <div className="mt-5 space-y-3">

              {student.weaknesses.length === 0 ? (
                <p className="text-gray-500">
                  در حال حاضر نقطه ضعف مهمی ثبت نشده است.
                </p>
              ) : (
                student.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-red-50 p-4 font-bold text-red-700"
                  >
                    • {getChapterName(weakness)}
                  </div>
                ))
              )}

            </div>

          </div>

        </section>

        {/* ================= RECOMMENDATION ================= */}

        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-lg">

          <h2 className="text-2xl font-extrabold">
            💡 پیشنهاد آموزشی
          </h2>

          <p className="mt-4 text-lg leading-8">
            {student.recommendation}
          </p>

        </section>

        {/* ================= ACTIVITY DATES ================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">

          <h2 className="text-xl font-extrabold text-gray-800">
            🕒 اطلاعات فعالیت
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div className="rounded-2xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                اولین فعالیت
              </p>

              <p className="mt-2 font-bold text-gray-700">
                {student.firstActivityDate
                  ? new Date(
                      student.firstActivityDate,
                    ).toLocaleString("fa-IR")
                  : "ثبت نشده"}
              </p>

            </div>

            <div className="rounded-2xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                آخرین فعالیت
              </p>

              <p className="mt-2 font-bold text-gray-700">
                {student.lastActivityDate
                  ? new Date(
                      student.lastActivityDate,
                    ).toLocaleString("fa-IR")
                  : "ثبت نشده"}
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}