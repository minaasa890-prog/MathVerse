"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:4000";

interface LessonContent {
  id: number;
  title: string;
  content: string;
  fileUrl: string | null;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  chapterId: number;
  createdAt: string;
  chapter?: {
    id: number;
    title: string;
  };
  contents?: LessonContent[];
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/lessons`);

        if (!response.ok) {
          throw new Error("دریافت درس‌ها ناموفق بود.");
        }

        const data = await response.json();

        console.log("LESSONS DATA:", data);

        if (Array.isArray(data?.value)) {
          setLessons(data.value);
        } else if (Array.isArray(data)) {
          setLessons(data);
        } else {
          setLessons([]);
        }
      } catch (error) {
        console.error("Lesson Error:", error);
        setError("خطا در دریافت درس‌ها از سرور.");
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold text-gray-700">
            در حال دریافت درس‌ها...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-blue-700">
            📚 درس‌های من
          </h1>

          <p className="mt-3 text-gray-600">
            درس‌های آموزشی MathVerse را مشاهده و مطالعه کنید.
          </p>

          <div className="mt-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
            {lessons.length} درس آموزشی
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Lessons */}
        {lessons.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">

            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Lesson title */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {lesson.title}
                    </h2>

                    {lesson.chapter?.title && (
                      <p className="mt-2 text-sm font-medium text-blue-600">
                        📖 {lesson.chapter.title}
                      </p>
                    )}
                  </div>

                  <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                    درس {lesson.id}
                  </div>

                </div>

                {/* Description */}
                <p className="mt-5 leading-7 text-gray-600">
                  {lesson.content}
                </p>

                {/* Contents */}
                <div className="mt-5 rounded-2xl bg-gray-50 p-4">

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-gray-700">
                      📚 محتوای آموزشی
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-600 shadow-sm">
                      {lesson.contents?.length ?? 0} بخش
                    </span>

                  </div>

                  {lesson.contents && lesson.contents.length > 0 && (
                    <div className="mt-4 space-y-2">

                      {lesson.contents.map((content) => (
                        <div
                          key={content.id}
                          className="rounded-xl bg-white p-3"
                        >
                          <div className="font-medium text-gray-700">
                            {content.title}
                          </div>

                          {content.fileUrl && (
                            <span className="mt-1 inline-block text-xs text-green-600">
                              📄 فایل آموزشی موجود است
                            </span>
                          )}
                        </div>
                      ))}

                    </div>
                  )}

                </div>

                {/* Buttons */}
                <div className="mt-6 grid gap-3">

                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className="w-full rounded-xl bg-blue-600 py-3 text-center font-bold text-white transition hover:bg-blue-700"
                  >
                    📖 شروع یادگیری
                  </Link>

                  {lesson.contents?.some(
                    (content) => content.fileUrl
                  ) && (
                    <a
                      href={
                        lesson.contents.find(
                          (content) => content.fileUrl
                        )?.fileUrl
                          ? `${API_URL}${
                              lesson.contents.find(
                                (content) => content.fileUrl
                              )?.fileUrl
                            }`
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full rounded-xl border border-blue-200 bg-blue-50 py-3 text-center font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      📄 مشاهده فایل آموزشی
                    </a>
                  )}

                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">

            <div className="text-5xl">
              📚
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              هنوز درسی برای شما ثبت نشده است
            </h2>

            <p className="mt-2 text-gray-500">
              در حال حاضر هیچ درس آموزشی در سیستم وجود ندارد.
            </p>

          </div>
        )}

      </div>
    </main>
  );
}

