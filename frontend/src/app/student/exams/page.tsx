"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:4000";

type Exam = {
  id?: number;
  examId?: number;
  title?: string;
  description?: string | null;
  duration?: number;
  totalQuestions?: number;
  questionsCount?: number;
  questionCount?: number;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
};

export default function StudentExamsPage() {
  const router = useRouter();

  const studentId = 1;

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        setError("");

        console.log("در حال دریافت لیست آزمون‌ها...");

        const response = await fetch(
          `${API_URL}/student/exams`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        console.log(
          "GET /student/exams status:",
          response.status
        );

        if (!response.ok) {
          throw new Error(
            `خطا در دریافت آزمون‌ها: ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "STUDENT EXAMS API RESPONSE:",
          data
        );

        /*
         * API ممکن است مستقیماً آرایه برگرداند:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * یا:
         *
         * {
         *   exams: [...]
         * }
         */

        let examList: Exam[] = [];

        if (Array.isArray(data)) {
          examList = data;
        } else if (
          data &&
          Array.isArray(data.exams)
        ) {
          examList = data.exams;
        } else if (
          data &&
          Array.isArray(data.data)
        ) {
          examList = data.data;
        } else if (
          data &&
          Array.isArray(data.results)
        ) {
          examList = data.results;
        }

        console.log(
          "NORMALIZED EXAMS:",
          examList
        );

        setExams(examList);
      } catch (err: any) {
        console.error(
          "LOAD EXAMS ERROR:",
          err
        );

        setError(
          err.message ||
            "خطا در دریافت آزمون‌ها"
        );
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, []);

  function getExamId(exam: Exam) {
    return exam.examId ?? exam.id ?? 0;
  }

  function getQuestionCount(exam: Exam) {
    return (
      exam.totalQuestions ??
      exam.questionsCount ??
      exam.questionCount ??
      0
    );
  }

  function openExam(exam: Exam) {
    const id = getExamId(exam);

    if (!id) {
      console.error(
        "شناسه آزمون پیدا نشد:",
        exam
      );

      return;
    }

    router.push(
      `/student/exams/${id}`
    );
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 p-6"
      >
        <div className="mx-auto max-w-5xl">

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">

            <div className="text-6xl mb-5">
              📚
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              در حال دریافت آزمون‌ها...
            </h1>

            <p className="text-gray-500 mt-3">
              لطفاً کمی صبر کنید
            </p>

          </div>

        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 p-6"
      >
        <div className="mx-auto max-w-3xl">

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">

            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-red-600">
              خطا در دریافت آزمون‌ها
            </h1>

            <p className="text-gray-600 mt-4">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700"
            >
              تلاش مجدد
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            📝 آزمون‌های من
          </h1>

          <p className="text-gray-500 mt-2">
            آزمون‌های موجود برای شما
          </p>

        </div>

        {/* Empty */}

        {exams.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">

            <div className="text-6xl mb-5">
              📚
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              هنوز آزمونی برای شما ثبت نشده است
            </h2>

            <p className="text-gray-500 mt-3">
              در حال حاضر آزمون قابل انجامی وجود ندارد.
            </p>

          </div>
        ) : (

          <div className="grid gap-6 md:grid-cols-2">

            {exams.map((exam, index) => {

              const examId =
                getExamId(exam);

              const questionCount =
                getQuestionCount(exam);

              return (
                <div
                  key={
                    examId ||
                    `exam-${index}`
                  }
                  className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
                >

                  {/* Icon */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                      📝
                    </div>

                    <div className="rounded-xl bg-blue-50 px-4 py-2 text-blue-700 font-bold">
                      آزمون {examId}
                    </div>

                  </div>

                  {/* Title */}

                  <h2 className="text-2xl font-bold text-gray-800 mt-6">
                    {exam.title ||
                      `آزمون شماره ${examId}`}
                  </h2>

                  {/* Description */}

                  {exam.description && (
                    <p className="text-gray-500 mt-3 leading-7">
                      {exam.description}
                    </p>
                  )}

                  {/* Information */}

                  <div className="grid grid-cols-2 gap-3 mt-6">

                    <div className="rounded-2xl bg-gray-50 p-4">

                      <p className="text-sm text-gray-500">
                        تعداد سوال
                      </p>

                      <p className="text-xl font-bold text-gray-800 mt-1">
                        {questionCount}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">

                      <p className="text-sm text-gray-500">
                        مدت آزمون
                      </p>

                      <p className="text-xl font-bold text-gray-800 mt-1">
                        {exam.duration ?? 0} دقیقه
                      </p>

                    </div>

                  </div>

                  {/* Start */}

                  <button
                    type="button"
                    onClick={() =>
                      openExam(exam)
                    }
                    disabled={!examId}
                    className="w-full mt-6 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🚀 شروع آزمون
                  </button>

                </div>
              );
            })}

          </div>

        )}

      </div>
    </main>
  );
}