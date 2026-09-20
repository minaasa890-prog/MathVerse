"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:4000";
const studentId = 1;

type Question = {
  id: number;
  title: string;
  description?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  score?: number;
};

type Exam = {
  id: number;
  title: string;
  duration: number;
  questions: Question[];
};

type AnswerMap = {
  [questionId: number]: string;
};

type ResultAnswer = {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  score: number;
  maxScore?: number;
  question?: Question;
};

type ExamResult = {
  success?: boolean;
  examId?: number;
  studentId?: number;
  total?: number;
  correct?: number;
  score?: number;
  totalScore?: number;
  percentage?: number;
  earnedScore?: number;
  earnedXP?: number;
  details?: ResultAnswer[];
};

export default function StudentExamPage() {
  const params = useParams();

  const examId = params?.examId;

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState<ExamResult | null>(null);

  const [aiSolutions, setAiSolutions] = useState<{
    [questionId: number]: string;
  }>({});

  const [loadingSolution, setLoadingSolution] = useState<{
    [questionId: number]: boolean;
  }>({});

  /*
   * ============================
   * دریافت اطلاعات آزمون
   * ============================
   */

  useEffect(() => {
    if (!examId) return;

    const loadExam = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/exams/${examId}/start/${studentId}`,
        );

        if (!response.ok) {
          throw new Error("خطا در دریافت آزمون");
        }

        const data = await response.json();

        console.log("EXAM START RESPONSE:", data);

        const loadedExam = data.exam ?? data;

        setExam(loadedExam);

        const duration = Number(loadedExam.duration ?? 20) * 60;

        setTimeLeft(duration);
      } catch (error) {
        console.error("LOAD EXAM ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  /*
   * ============================
   * تایمر آزمون
   * ============================
   */

  useEffect(() => {
    if (!exam || result || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, result, timeLeft]);

  /*
   * ============================
   * فرمت زمان
   * ============================
   */

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  /*
   * ============================
   * انتخاب پاسخ
   * ============================
   */

  const handleAnswer = (answer: string) => {
    if (!exam || result) return;

    const question = exam.questions[currentIndex];

    if (!question) return;

    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  /*
   * ============================
   * ارسال آزمون
   * ============================
   */

  const submitExam = async () => {
    if (!exam || submitting || result) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/exams/${exam.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            answers,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("خطا در ثبت آزمون");
      }

      const data = await response.json();

      console.log("EXAM RESULT:", data);

      setResult(data);
    } catch (error) {
      console.error("SUBMIT EXAM ERROR:", error);

      alert("در ثبت آزمون مشکلی به وجود آمد.");
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ============================
   * تعداد پاسخ‌های داده شده
   * ============================
   */

  const answeredCount = exam
    ? exam.questions.filter(
        (question) =>
          answers[question.id] !== undefined,
      ).length
    : 0;

  /*
   * ============================
   * درصد پیشرفت
   * ============================
   */

  const progress =
    exam && exam.questions.length > 0
      ? Math.round(
          ((currentIndex + 1) /
            exam.questions.length) *
            100,
        )
      : 0;

  /*
   * ============================
   * سؤال فعلی
   * ============================
   */

  const currentQuestion =
    exam?.questions[currentIndex];

  /*
   * ============================
   * راه‌حل هوش مصنوعی
   * ============================
   */

  const getAiSolution = async (
    questionId: number,
  ) => {
    if (aiSolutions[questionId]) {
      return;
    }

    try {
      setLoadingSolution((previous) => ({
        ...previous,
        [questionId]: true,
      }));

      const response = await fetch(
        `${API_URL}/ai-question/solution/${questionId}`,
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت راه‌حل");
      }

      const data = await response.json();

      console.log("AI SOLUTION:", data);

      const solution =
        data.solution ??
        data.explanation ??
        data.answer ??
        "راه‌حل در دسترس نیست.";

      setAiSolutions((previous) => ({
        ...previous,
        [questionId]: solution,
      }));
    } catch (error) {
      console.error("AI SOLUTION ERROR:", error);

      setAiSolutions((previous) => ({
        ...previous,
        [questionId]:
          "در دریافت راه‌حل هوش مصنوعی مشکلی به وجود آمد.",
      }));
    } finally {
      setLoadingSolution((previous) => ({
        ...previous,
        [questionId]: false,
      }));
    }
  };

  /*
   * ============================
   * Loading
   * ============================
   */

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="mb-4 text-5xl">
              ⏳
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              در حال بارگذاری آزمون...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================
   * نتیجه آزمون
   * ============================
   */

  if (result && exam) {
    /*
     * Backend جدید:
     *
     * correct
     * total
     * details
     *
     * بنابراین دیگر از:
     * correctAnswers
     * totalQuestions
     * answers
     *
     * استفاده نمی‌کنیم.
     */

    const correctAnswers =
      result.correct ?? 0;

    const totalQuestions =
      result.total ?? exam.questions.length;

    const finalScore =
      result.score ??
      result.earnedScore ??
      0;

    const percentage =
      result.percentage ??
      (totalQuestions > 0
        ? Math.round(
            (correctAnswers / totalQuestions) *
              100,
          )
        : 0);

    const resultAnswers =
      result.details ?? [];

    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6"
      >
        <div className="mx-auto max-w-5xl">

          {/* Header */}

          <header className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <h1 className="text-3xl font-extrabold text-blue-700">
                  MathVerse 🚀
                </h1>

                <p className="mt-2 text-gray-500">
                  {exam.title}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                <Link
                  href="/student"
                  className="rounded-xl bg-blue-50 px-4 py-2 font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  🏠 داشبورد
                </Link>

                <Link
                  href="/student/exams"
                  className="rounded-xl bg-purple-50 px-4 py-2 font-bold text-purple-700 transition hover:bg-purple-100"
                >
                  📚 آزمون‌ها
                </Link>

              </div>
            </div>
          </header>

          {/* Result Summary */}

          <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

            <div className="mb-8 text-center">

              <div className="mb-4 text-6xl">
                🎉
              </div>

              <h2 className="text-3xl font-extrabold text-green-600">
                آزمون با موفقیت ثبت شد
              </h2>

              <p className="mt-3 text-gray-600">
                {percentage === 100
                  ? "عالی بود! همه پاسخ‌ها صحیح هستند."
                  : "آزمون شما با موفقیت ثبت شد."}
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-4">

              {/* Score */}

              <div className="rounded-2xl bg-blue-50 p-5 text-center">

                <div className="mb-2 text-sm font-bold text-gray-500">
                  نمره
                </div>

                <div className="text-3xl font-extrabold text-blue-700">
                  {finalScore}
                </div>

              </div>

              {/* Correct */}

              <div className="rounded-2xl bg-green-50 p-5 text-center">

                <div className="mb-2 text-sm font-bold text-gray-500">
                  پاسخ صحیح
                </div>

                <div className="text-3xl font-extrabold text-green-700">
                  {correctAnswers} از {totalQuestions}
                </div>

              </div>

              {/* Percentage */}

              <div className="rounded-2xl bg-purple-50 p-5 text-center">

                <div className="mb-2 text-sm font-bold text-gray-500">
                  درصد
                </div>

                <div className="text-3xl font-extrabold text-purple-700">
                  {percentage}%
                </div>

              </div>

              {/* Answered */}

              <div className="rounded-2xl bg-orange-50 p-5 text-center">

                <div className="mb-2 text-sm font-bold text-gray-500">
                  پاسخ‌های ثبت‌شده
                </div>

                <div className="text-3xl font-extrabold text-orange-700">
                  {answeredCount} از{" "}
                  {exam.questions.length}
                </div>

              </div>

            </div>

          </section>

          {/* Review */}

          <section className="rounded-3xl bg-white p-6 shadow-xl">

            <div className="mb-6">

              <h2 className="text-2xl font-extrabold text-gray-800">
                📋 بررسی پاسخ‌ها
              </h2>

              <p className="mt-2 text-gray-500">
                پاسخ‌های خود را بررسی کنید و برای
                سؤال‌های اشتباه از راه‌حل هوش مصنوعی
                استفاده کنید.
              </p>

            </div>

            <div className="space-y-5">

              {exam.questions.map(
                (question, index) => {

                  /*
                   * بسیار مهم:
                   *
                   * صحت پاسخ را مستقیماً
                   * از Backend می‌خوانیم.
                   *
                   * Backend:
                   *
                   * isCorrect: true / false
                   */

                  const answer =
                    resultAnswers.find(
                      (item) =>
                        item.questionId ===
                        question.id,
                    );

                  const selectedAnswer =
                    answer?.selectedAnswer ??
                    answers[question.id];

                  const isCorrect =
                    answer?.isCorrect === true;

                  const score =
                    answer?.score ??
                    (isCorrect
                      ? question.score ?? 10
                      : 0);

                  return (
                    <div
                      key={question.id}
                      className={`rounded-2xl border-2 p-5 ${
                        isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >

                      {/* Question Header */}

                      <div className="mb-4 flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <span className="text-2xl">
                            {isCorrect
                              ? "✓"
                              : "✗"}
                          </span>

                          <span className="font-bold text-gray-700">
                            سؤال {index + 1}
                          </span>

                        </div>

                        <span className="font-bold text-gray-700">
                          {score} /{" "}
                          {question.score ?? 10}
                        </span>

                      </div>

                      {/* Question */}

                      <h3 className="mb-4 text-lg font-bold leading-8 text-gray-800">
                        {question.title}
                      </h3>

                      {/* Selected Answer */}

                      <div className="rounded-xl bg-white p-4">

                        <div className="mb-2 font-bold text-gray-600">
                          پاسخ شما
                        </div>

                        <div className="text-lg font-extrabold text-blue-700">
                          {selectedAnswer ||
                            "بدون پاسخ"}
                        </div>

                        {/* Correct / Wrong */}

                        <div
                          className={`mt-3 font-bold ${
                            isCorrect
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {isCorrect
                            ? "✅ پاسخ شما صحیح است."
                            : "❌ پاسخ شما صحیح نیست."}
                        </div>

                      </div>

                      {/* AI Solution */}

                      {!isCorrect && (
                        <div className="mt-4">

                          {!aiSolutions[
                            question.id
                          ] ? (
                            <button
                              type="button"
                              onClick={() =>
                                getAiSolution(
                                  question.id,
                                )
                              }
                              disabled={
                                loadingSolution[
                                  question.id
                                ]
                              }
                              className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {loadingSolution[
                                question.id
                              ]
                                ? "⏳ در حال دریافت راه‌حل..."
                                : "🤖 مشاهده راه‌حل هوش مصنوعی"}
                            </button>
                          ) : (
                            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">

                              <h4 className="mb-3 text-lg font-extrabold text-purple-700">
                                🤖 راه‌حل هوش مصنوعی
                              </h4>

                              <div className="whitespace-pre-wrap leading-8 text-gray-700">
                                {
                                  aiSolutions[
                                    question.id
                                  ]
                                }
                              </div>

                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                },
              )}

            </div>

          </section>

          {/* Footer Buttons */}

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              href="/student/exams"
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              📚 بازگشت به آزمون‌ها
            </Link>

            <Link
              href="/student"
              className="rounded-xl bg-gray-700 px-6 py-3 font-bold text-white transition hover:bg-gray-800"
            >
              🏠 داشبورد
            </Link>

          </div>

          <footer className="py-8 text-center text-gray-500">
            MathVerse 🚀
          </footer>

        </div>
      </main>
    );
  }

  /*
   * ============================
   * اگر سؤال وجود نداشت
   * ============================
   */

  if (!currentQuestion) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8"
      >
        <div className="mx-auto max-w-5xl">

          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">

            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              سؤالی برای نمایش وجود ندارد.
            </h1>

            <Link
              href="/student/exams"
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
            >
              بازگشت به آزمون‌ها
            </Link>

          </div>

        </div>
      </main>
    );
  }

  /*
   * ============================
   * صفحه آزمون
   * ============================
   */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6"
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <header className="mb-6 rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h1 className="text-3xl font-extrabold text-blue-700">
                MathVerse 🚀
              </h1>

              <p className="mt-2 text-gray-500">
                {exam?.title}
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                href="/student"
                className="rounded-xl bg-blue-50 px-4 py-2 font-bold text-blue-700 transition hover:bg-blue-100"
              >
                🏠 داشبورد
              </Link>

              <Link
                href="/student/exams"
                className="rounded-xl bg-purple-50 px-4 py-2 font-bold text-purple-700 transition hover:bg-purple-100"
              >
                📚 آزمون‌ها
              </Link>

              <div className="rounded-xl bg-orange-50 px-4 py-2 font-extrabold text-orange-700">
                ⏱️ {formatTime(timeLeft)}
              </div>

            </div>

          </div>

        </header>

        {/* Progress */}

        <section className="mb-6 rounded-2xl bg-white p-5 shadow">

          <div className="mb-3 flex w-full items-center justify-between gap-6 text-sm font-bold text-gray-600">

            <span className="whitespace-nowrap">
              سؤال {currentIndex + 1} از{" "}
              {exam.questions.length}
            </span>

            <span className="shrink-0 whitespace-nowrap">
              {progress}%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-100">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="mt-3 text-sm text-gray-500">

            پاسخ داده شده:{" "}

            <span className="font-bold text-gray-800">
              {answeredCount}
            </span>{" "}

            از {exam.questions.length}

          </div>

        </section>

        {/* Question */}

        <section className="rounded-3xl bg-white p-6 shadow-xl">

          <div className="mb-6">

            <div className="mb-4 flex items-center justify-between">

              <span className="rounded-xl bg-blue-100 px-4 py-2 font-extrabold text-blue-700">
                سؤال {currentIndex + 1}
              </span>

              <span className="text-sm font-bold text-gray-400">
                {currentQuestion.score ?? 10} امتیاز
              </span>

            </div>

            <h2 className="text-2xl font-extrabold leading-10 text-gray-800">
              {currentQuestion.title}
            </h2>

            {currentQuestion.description && (
              <p className="mt-3 text-gray-500">
                {currentQuestion.description}
              </p>
            )}

          </div>

          {/* Options */}

          <div className="grid gap-4 md:grid-cols-2">

            {[
              {
                key: "A",
                value: currentQuestion.optionA,
              },
              {
                key: "B",
                value: currentQuestion.optionB,
              },
              {
                key: "C",
                value: currentQuestion.optionC,
              },
              {
                key: "D",
                value: currentQuestion.optionD,
              },
            ].map((option) => {

              const selected =
                answers[currentQuestion.id] ===
                option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    handleAnswer(option.key)
                  }
                  className={`rounded-2xl border-2 p-5 text-right transition ${
                    selected
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-extrabold ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {option.key}
                    </span>

                    <span className="text-lg font-bold text-gray-800">
                      {option.value}
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

          {/* Navigation */}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() =>
                setCurrentIndex(
                  (previous) =>
                    Math.max(
                      0,
                      previous - 1,
                    ),
                )
              }
              className="rounded-xl bg-gray-100 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← سؤال قبل
            </button>

            {currentIndex <
            exam.questions.length - 1 ? (

              <button
                type="button"
                onClick={() =>
                  setCurrentIndex(
                    (previous) =>
                      Math.min(
                        exam.questions.length - 1,
                        previous + 1,
                      ),
                  )
                }
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
              >
                سؤال بعد →
              </button>

            ) : null}

          </div>

        </section>

        {/* Question Navigator */}

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-lg">

          <h3 className="mb-4 text-lg font-extrabold text-gray-800">
            شماره سؤالات
          </h3>

          <div className="flex flex-wrap gap-3">

            {exam.questions.map(
              (question, index) => {

                const answered =
                  answers[question.id] !==
                  undefined;

                const current =
                  index === currentIndex;

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() =>
                      setCurrentIndex(index)
                    }
                    className={`h-12 w-12 rounded-xl font-extrabold transition ${
                      current
                        ? "bg-blue-600 text-white shadow-lg"
                        : answered
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              },
            )}

          </div>

          <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-500">

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              سؤال فعلی
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              پاسخ داده شده
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-300" />
              بدون پاسخ
            </div>

          </div>

        </section>

        {/* Submit */}

        {answeredCount > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-6 text-center shadow-lg">

            <p className="mb-4 text-gray-600">
              {answeredCount} از{" "}
              {exam.questions.length} سؤال
              پاسخ داده شده است.
            </p>

            <button
              type="button"
              onClick={submitExam}
              disabled={submitting}
              className="rounded-2xl bg-green-600 px-8 py-4 text-lg font-extrabold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "⏳ در حال ثبت آزمون..."
                : "✅ ثبت نهایی آزمون"}
            </button>

          </section>
        )}

        <footer className="py-8 text-center text-gray-500">
          MathVerse 🚀
        </footer>

      </div>
    </main>
  );
}