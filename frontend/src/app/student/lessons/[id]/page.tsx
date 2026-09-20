"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:4000";

interface LessonContent {
  id: number;
  title: string;
  lessonId: number;
  createdAt: string;
  content: string;
  fileUrl: string | null;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  chapterId: number;
  createdAt: string;
  contents: LessonContent[];
}

export default function StudentLessonDetailPage() {
  const params = useParams();

  const id = params?.id;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/lessons/${id}`
        );

        if (!response.ok) {
          throw new Error("دریافت اطلاعات درس ناموفق بود.");
        }

        const data = await response.json();

        console.log("LESSON DETAIL:", data);

        setLesson(data);
      } catch (error) {
        console.error("Lesson Detail Error:", error);

        setError(
          "خطا در دریافت اطلاعات درس از سرور."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold text-gray-700">
            در حال دریافت اطلاعات درس...
          </h1>
        </div>
      </main>
    );
  }

  if (error || !lesson) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 p-6"
      >
        <div className="mx-auto max-w-4xl">

          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">

            <div className="text-5xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold text-red-600">
              {error || "درس پیدا نشد"}
            </h1>

            <Link
              href="/student/lessons"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              بازگشت به درس‌ها
            </Link>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6"
    >
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href="/student/lessons"
          className="mb-6 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-blue-600 shadow hover:bg-blue-50"
        >
          ← بازگشت به درس‌ها
        </Link>

        {/* Lesson Header */}
        <section className="rounded-3xl bg-white p-8 shadow-lg">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-bold text-blue-600">
                📚 درس {lesson.id}
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-800">
                {lesson.title}
              </h1>
            </div>

            <div className="rounded-2xl bg-blue-100 px-5 py-3 text-center text-blue-700">
              <div className="text-sm">
                محتوای آموزشی
              </div>

              <div className="text-2xl font-bold">
                {lesson.contents?.length ?? 0}
              </div>

              <div className="text-sm">
                بخش
              </div>
            </div>

          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5">

            <h2 className="font-bold text-gray-700">
              درباره این درس
            </h2>

            <p className="mt-3 leading-8 text-gray-600">
              {lesson.content}
            </p>

          </div>

        </section>

        {/* Contents */}
        <section className="mt-8">

          <h2 className="mb-5 text-2xl font-bold text-gray-800">
            📖 محتوای درس
          </h2>

          <div className="space-y-5">

            {lesson.contents?.map(
              (content, index) => (
                <article
                  key={content.id}
                  className="rounded-3xl bg-white p-6 shadow-lg"
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                      {index + 1}
                    </div>

                    <div className="flex-1">

                      <h3 className="text-xl font-bold text-gray-800">
                        {content.title}
                      </h3>

                      <p className="mt-4 leading-8 text-gray-600">
                        {content.content}
                      </p>

                      {content.fileUrl && (
                        <div className="mt-5">

                          <a
                            href={`${API_URL}${content.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
                          >
                            📄 مشاهده فایل آموزشی
                          </a>

                        </div>
                      )}

                    </div>

                  </div>

                </article>
              )
            )}

          </div>

        </section>

        {/* Completion */}
        <section className="mt-8 rounded-3xl bg-white p-8 text-center shadow-lg">

          <div className="text-4xl">
            🎓
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            آماده یادگیری هستی؟
          </h2>

          <p className="mt-2 text-gray-600">
            محتوای این درس را مطالعه کن و سپس برای تمرین و آزمون آماده شو.
          </p>

          <Link
            href="/student/practice"
            className="mt-6 inline-block rounded-xl bg-purple-600 px-8 py-3 font-bold text-white hover:bg-purple-700"
          >
            🧠 رفتن به تمرین تطبیقی
          </Link>

        </section>

      </div>
    </main>
  );
}

