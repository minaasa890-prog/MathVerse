import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:4000";
const STUDENT_ID = 1;

interface LessonContent {
  id: number;
  title: string;
  content: string;
  fileUrl?: string | null;
}

interface Chapter {
  id: number;
  title: string;
  subjectId?: number;
}

interface Lesson {
  id: number;
  title: string;
  content?: string | null;
  chapter?: Chapter | null;
  contents?: LessonContent[];
}

interface Progress {
  progress?: number;
  percentage?: number;
  completed?: boolean;
  isCompleted?: boolean;
  status?: string;
}

function StudentLessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("شناسه درس مشخص نیست.");
      setLoading(false);
      return;
    }

    loadLesson();
    loadProgress();
  }, [id]);

  const loadLesson = async () => {
    try {
      const response = await fetch(`${API_URL}/lessons/${id}`);

      if (!response.ok) {
        throw new Error("دریافت درس ناموفق بود.");
      }

      const data = await response.json();
      setLesson(data);
    } catch (err) {
      console.error(err);
      setError("خطا در دریافت اطلاعات درس.");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(
        `${API_URL}/progress/student/${STUDENT_ID}/lesson/${id}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      console.error("Progress error:", err);
    }
  };

  const handleCompleteLesson = async () => {
    if (!id) return;

    try {
      setCompleting(true);

      const response = await fetch(
        `${API_URL}/progress/complete/${STUDENT_ID}/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("تکمیل درس ناموفق بود.");
      }

      const data = await response.json();

      console.log("Lesson completed:", data);

      setProgress({
        progress: 100,
        percentage: 100,
        completed: true,
        isCompleted: true,
        status: "COMPLETED",
      });

      alert("✅ درس با موفقیت تکمیل شد.");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در تکمیل درس.");
    } finally {
      setCompleting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!progress) {
      return 0;
    }

    if (typeof progress.percentage === "number") {
      return progress.percentage;
    }

    if (typeof progress.progress === "number") {
      return progress.progress;
    }

    if (
      progress.completed === true ||
      progress.isCompleted === true ||
      progress.status === "COMPLETED"
    ) {
      return 100;
    }

    return 0;
  };

  const progressPercentage = getProgressPercentage();

  const isCompleted =
    progress?.completed === true ||
    progress?.isCompleted === true ||
    progress?.status === "COMPLETED" ||
    progressPercentage >= 100;

  const openFile = (fileUrl: string) => {
    const fullUrl = fileUrl.startsWith("http")
      ? fileUrl
      : `${API_URL}${fileUrl}`;

    window.open(fullUrl, "_blank");
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
          textAlign: "center",
          fontFamily: "Arial",
        }}
      >
        <h2>⏳ در حال دریافت درس...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
          fontFamily: "Arial",
        }}
      >
        <button
          onClick={() => navigate("/student/lessons")}
          style={{
            padding: "10px 18px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          ← بازگشت به درس‌ها
        </button>

        <div
          style={{
            padding: "20px",
            background: "#ffe5e5",
            borderRadius: "10px",
            color: "#b00020",
          }}
        >
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
          textAlign: "center",
          fontFamily: "Arial",
        }}
      >
        <h2>❌ درس پیدا نشد.</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "30px 20px",
        fontFamily: "Arial",
        direction: "rtl",
      }}
    >
      {/* Back */}
      <button
        onClick={() => navigate("/student/lessons")}
        style={{
          padding: "10px 18px",
          marginBottom: "25px",
          border: "none",
          borderRadius: "8px",
          background: "#eeeeee",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        ← بازگشت به درس‌ها
      </button>

      {/* Lesson Header */}
      <div
        style={{
          background: "#f7f7f7",
          borderRadius: "14px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            color: "#666",
            marginBottom: "10px",
          }}
        >
          درس #{lesson.id}
        </div>

        <h1 style={{ marginTop: 0 }}>📘 {lesson.title}</h1>

        {lesson.content && (
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.8,
              color: "#555",
            }}
          >
            {lesson.content}
          </p>
        )}

        {lesson.chapter && (
          <div
            style={{
              marginTop: "15px",
              fontWeight: "bold",
            }}
          >
            📚 فصل: {lesson.chapter.title}
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "14px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >
        <h2>📖 محتوای آموزشی</h2>

        {lesson.contents && lesson.contents.length > 0 ? (
          lesson.contents.map((item, index) => (
            <div
              key={item.id}
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "10px",
                background: "#fafafa",
                border: "1px solid #eee",
              }}
            >
              <div
                style={{
                  color: "#777",
                  marginBottom: "8px",
                }}
              >
                بخش {index + 1}
              </div>

              <h3 style={{ marginTop: 0 }}>
                📖 {item.title}
              </h3>

              <p
                style={{
                  lineHeight: 2,
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.content}
              </p>

              {item.fileUrl && (
                <button
                  onClick={() => openFile(item.fileUrl!)}
                  style={{
                    marginTop: "10px",
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#1976d2",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                >
                  📄 مشاهده فایل آموزشی
                </button>
              )}
            </div>
          ))
        ) : (
          <p>محتوای آموزشی برای این درس ثبت نشده است.</p>
        )}
      </div>

      {/* Progress */}
      <div
        style={{
          background: "#f7f7f7",
          borderRadius: "14px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >
        <h2>📊 پیشرفت درس</h2>

        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#ddd",
            borderRadius: "20px",
            overflow: "hidden",
            margin: "15px 0",
          }}
        >
          <div
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              height: "100%",
              background: "#4caf50",
              transition: "width 0.3s",
            }}
          />
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {progressPercentage}% تکمیل شده
        </div>
      </div>

      {/* Complete Button */}
      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          marginBottom: "40px",
        }}
      >
        {isCompleted ? (
          <div
            style={{
              padding: "18px",
              borderRadius: "12px",
              background: "#e8f5e9",
              color: "#2e7d32",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            ✅ این درس قبلاً تکمیل شده است.
          </div>
        ) : (
          <button
            onClick={handleCompleteLesson}
            disabled={completing}
            style={{
              padding: "15px 35px",
              border: "none",
              borderRadius: "10px",
              background: completing ? "#999" : "#2e7d32",
              color: "white",
              cursor: completing ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {completing ? "⏳ در حال ثبت..." : "✅ تکمیل درس"}
          </button>
        )}
      </div>
    </div>
  );
}

export default StudentLessonDetail;
