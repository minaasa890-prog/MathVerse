"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

type Classroom = {
  id: number;
  name: string;
  students: number;
  exams: number;
};

type TeacherDashboard = {
  teacherId: number;
  name: string;
  totalClasses: number;
  totalStudents: number;
  totalExams: number;
  classes: Classroom[];
};

type CreatedExam = {
  id: number;
  title: string;
  duration: number;
  status: string;
  questions: {
    questionId: number;
  }[];
};

export default function TeacherDashboardPage() {
  const [dashboard, setDashboard] =
    useState<TeacherDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedClassroom, setSelectedClassroom] =
    useState("");

  const [title, setTitle] =
    useState("آزمون هوشمند ریاضی");

  const [description, setDescription] =
    useState("آزمون ساخته شده توسط معلم");

  const [duration, setDuration] =
    useState("20");

  const [questionCount, setQuestionCount] =
    useState("3");

  const [difficulty, setDifficulty] =
    useState("1");

  const [chapter, setChapter] =
    useState("");

  const [lastExam, setLastExam] =
    useState<CreatedExam | null>(null);

  // فعلاً برای تست از Teacher One استفاده می‌کنیم
  const teacherId = 37;

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/teacher/dashboard/${teacherId}`
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات معلم");
      }

      const data: TeacherDashboard =
        await response.json();

      setDashboard(data);

      if (
        data.classes.length > 0 &&
        !selectedClassroom
      ) {
        setSelectedClassroom(
          String(data.classes[0].id)
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "ارتباط با سرور برقرار نشد. مطمئن شوید Backend روی پورت 4000 اجراست."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function createExam() {
    setMessage("");
    setError("");
    setLastExam(null);

    if (!selectedClassroom) {
      setError("لطفاً یک کلاس انتخاب کنید.");
      return;
    }

    if (!title.trim()) {
      setError("لطفاً عنوان آزمون را وارد کنید.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        `${API_URL}/teacher/exam/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId,
            classroomId: Number(selectedClassroom),
            title: title.trim(),
            description: description.trim(),
            duration: Number(duration),
            questionCount: Number(questionCount),
            chapter: chapter || undefined,
            difficulty: Number(difficulty),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "ساخت آزمون ناموفق بود."
        );
      }

      setLastExam(data.exam);

      setMessage(
        `آزمون با موفقیت ساخته شد. شناسه آزمون: ${data.exam.id}`
      );

      await loadDashboard();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "خطایی هنگام ساخت آزمون رخ داد."
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Tahoma, Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
            fontSize: "20px",
          }}
        >
          در حال بارگذاری پنل معلم...
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily:
          "Tahoma, Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <header
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a, #2563eb)",
          color: "white",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              opacity: 0.85,
              marginBottom: "8px",
            }}
          >
            MathVerse
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
            }}
          >
            پنل معلم
          </h1>

          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              fontSize: "17px",
              opacity: 0.95,
            }}
          >
            خوش آمدی، {dashboard?.name} 👋
          </p>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px 20px 60px",
        }}
      >
        {/* Statistics */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "30px",
          }}
        >
          <StatCard
            title="تعداد کلاس‌ها"
            value={dashboard?.totalClasses ?? 0}
            icon="🏫"
          />

          <StatCard
            title="تعداد دانش‌آموزان"
            value={dashboard?.totalStudents ?? 0}
            icon="👨‍🎓"
          />

          <StatCard
            title="تعداد آزمون‌ها"
            value={dashboard?.totalExams ?? 0}
            icon="📝"
          />
        </section>

        {/* Classes */}
        <section
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "25px",
            marginBottom: "30px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "23px",
            }}
          >
            کلاس‌های من 🏫
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "15px",
            }}
          >
            {dashboard?.classes.map((classroom) => (
              <div
                key={classroom.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "15px",
                  padding: "18px",
                  background: "#fafafa",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "12px",
                  }}
                >
                  {classroom.name}
                </h3>

                <div
                  style={{
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  👨‍🎓 دانش‌آموز:{" "}
                  {classroom.students}
                </div>

                <div
                  style={{
                    color: "#6b7280",
                  }}
                >
                  📝 آزمون:{" "}
                  {classroom.exams}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Create Exam */}
        <section
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: "25px" }}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "8px",
                fontSize: "25px",
              }}
            >
              ساخت آزمون جدید 📝
            </h2>

            <p
              style={{
                color: "#6b7280",
                margin: 0,
              }}
            >
              معلم می‌تواند با استفاده از بانک سؤال
              MathVerse برای کلاس خود آزمون بسازد.
            </p>
          </div>

          {/* Success */}
          {message && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#047857",
                border:
                  "1px solid #a7f3d0",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              ✅ {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                border:
                  "1px solid #fecaca",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              ❌ {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Classroom */}
            <FormField label="کلاس">
              <select
                value={selectedClassroom}
                onChange={(e) =>
                  setSelectedClassroom(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  انتخاب کلاس
                </option>

                {dashboard?.classes.map(
                  (classroom) => (
                    <option
                      key={classroom.id}
                      value={classroom.id}
                    >
                      {classroom.name} —{" "}
                      {classroom.students} دانش‌آموز
                    </option>
                  )
                )}
              </select>
            </FormField>

            {/* Title */}
            <FormField label="عنوان آزمون">
              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="مثلاً آزمون فصل سوم"
                style={inputStyle}
              />
            </FormField>

            {/* Description */}
            <FormField label="توضیحات">
              <input
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="توضیحات آزمون"
                style={inputStyle}
              />
            </FormField>

            {/* Question Count */}
            <FormField label="تعداد سؤال">
              <select
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="3">
                  3 سؤال
                </option>

                <option value="5">
                  5 سؤال
                </option>

                <option value="10">
                  10 سؤال
                </option>

                <option value="15">
                  15 سؤال
                </option>

                <option value="20">
                  20 سؤال
                </option>
              </select>
            </FormField>

            {/* Duration */}
            <FormField label="مدت آزمون">
              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                style={inputStyle}
              >
                <option value="10">
                  10 دقیقه
                </option>

                <option value="15">
                  15 دقیقه
                </option>

                <option value="20">
                  20 دقیقه
                </option>

                <option value="30">
                  30 دقیقه
                </option>

                <option value="45">
                  45 دقیقه
                </option>

                <option value="60">
                  60 دقیقه
                </option>
              </select>
            </FormField>

            {/* Difficulty */}
            <FormField label="سطح دشواری">
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
                style={inputStyle}
              >
                <option value="1">
                  آسان
                </option>

                <option value="2">
                  متوسط
                </option>

                <option value="3">
                  سخت
                </option>
              </select>
            </FormField>

            {/* Chapter */}
            <FormField label="فصل">
              <select
                value={chapter}
                onChange={(e) =>
                  setChapter(e.target.value)
                }
                style={inputStyle}
              >
                <option value="">
                  همه فصل‌ها
                </option>

                <option value="فصل 2 - عددهای صحیح">
                  فصل ۲ - عددهای صحیح
                </option>

                <option value="فصل 3 - جبر و معادله">
                  فصل ۳ - جبر و معادله
                </option>
              </select>
            </FormField>
          </div>

          <button
            onClick={createExam}
            disabled={creating}
            style={{
              marginTop: "30px",
              width: "100%",
              padding: "17px",
              border: "none",
              borderRadius: "14px",
              background: creating
                ? "#9ca3af"
                : "#2563eb",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: creating
                ? "not-allowed"
                : "pointer",
              transition: "0.2s",
            }}
          >
            {creating
              ? "⏳ در حال ساخت آزمون..."
              : "🚀 ساخت و انتشار آزمون"}
          </button>

          {/* Last Exam */}
          {lastExam && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                borderRadius: "15px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#1d4ed8",
                }}
              >
                🎉 آزمون آماده است
              </h3>

              <p>
                <strong>عنوان:</strong>{" "}
                {lastExam.title}
              </p>

              <p>
                <strong>شناسه آزمون:</strong>{" "}
                {lastExam.id}
              </p>

              <p>
                <strong>تعداد سؤال:</strong>{" "}
                {lastExam.questions?.length ?? 0}
              </p>

              <p>
                <strong>مدت:</strong>{" "}
                {lastExam.duration} دقیقه
              </p>

              <p
                style={{
                  color: "#047857",
                  fontWeight: "bold",
                  marginBottom: 0,
                }}
              >
                🟢 آزمون منتشر شده و آماده نمایش
                به دانش‌آموزان است.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "25px",
        boxShadow:
          "0 8px 25px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontSize: "30px",
          marginBottom: "10px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#6b7280",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#1e3a8a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  fontSize: "15px",
  outline: "none",
};

