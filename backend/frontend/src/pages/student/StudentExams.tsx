import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://192.168.43.167:4000";

export default function StudentExams() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const studentId = user?.id;

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    loadExams();
  }, [studentId]);

  async function loadExams() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/student/exams?studentId=${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت آزمون‌ها");
      }

      const data = await response.json();

      console.log("STUDENT EXAMS:", data);

      setExams(
        Array.isArray(data)
          ? data
          : data?.value ?? []
      );
    } catch (error) {
      console.error(error);

      alert("دریافت آزمون‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  function startExam(examId: number) {
    navigate(`/student/exams/${examId}`);
  }

  // =========================
  // NO STUDENT
  // =========================

  if (!loading && !studentId) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "Arial",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "25px",
            padding: "50px",
            textAlign: "center",
            boxShadow:
              "0 8px 25px rgba(15,23,42,.06)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "60px" }}>
            👤
          </div>

          <h2 style={{ marginTop: "15px" }}>
            اطلاعات دانش‌آموز پیدا نشد
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.8,
            }}
          >
            اطلاعات حساب کاربری شما کامل نیست.
            لطفاً دوباره وارد حساب کاربری خود شوید.
          </p>

          <button
            onClick={() =>
              navigate("/student/dashboard")
            }
            style={{
              marginTop: "20px",
              border: "none",
              background: "#4f46e5",
              color: "white",
              padding: "13px 25px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "Arial",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "55px" }}>
            📚
          </div>

          <h2 style={{ marginTop: "15px" }}>
            در حال دریافت آزمون‌ها...
          </h2>

          <p style={{ color: "#64748b" }}>
            لطفاً چند لحظه صبر کنید
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#eef2ff 0%,#f8fafc 35%)",
        padding: "30px 20px 60px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#4338ca,#6366f1)",
            color: "white",
            borderRadius: "28px",
            padding: "30px",
            boxShadow:
              "0 15px 35px rgba(79,70,229,.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "15px",
                  opacity: 0.85,
                }}
              >
                🎓 MathVerse
              </div>

              <h1
                style={{
                  margin: "8px 0 0",
                  fontSize: "32px",
                  fontWeight: 900,
                }}
              >
                📝 آزمون‌های من
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  opacity: 0.9,
                }}
              >
                آزمون خود را انتخاب کنید و دانش خود را محک بزنید.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,.15)",
                borderRadius: "20px",
                padding: "18px 25px",
                textAlign: "center",
                minWidth: "120px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.8,
                }}
              >
                تعداد آزمون‌ها
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 900,
                }}
              >
                {exams.length}
              </div>
            </div>
          </div>
        </div>

        {/* BACK BUTTON */}

        <button
          onClick={() =>
            navigate("/student/dashboard")
          }
          style={{
            marginTop: "20px",
            border: "none",
            background: "white",
            color: "#4338ca",
            padding: "12px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow:
              "0 5px 15px rgba(15,23,42,.06)",
          }}
        >
          ← بازگشت به داشبورد
        </button>

        {/* EMPTY */}

        {exams.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "25px",
              padding: "50px",
              marginTop: "25px",
              textAlign: "center",
              boxShadow:
                "0 8px 25px rgba(15,23,42,.06)",
            }}
          >
            <div style={{ fontSize: "60px" }}>
              📭
            </div>

            <h2>
              آزمونی برای شما وجود ندارد
            </h2>

            <p style={{ color: "#64748b" }}>
              در حال حاضر آزمون منتشرشده‌ای در کلاس‌های شما وجود ندارد.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            {exams.map((exam: any) => {
              const questionCount =
                exam.questionCount ??
                exam.questions?.length ??
                0;

              const isPublished =
                exam.status === "PUBLISHED";

              return (
                <div
                  key={exam.id}
                  style={{
                    background: "white",
                    borderRadius: "25px",
                    padding: "25px",
                    boxShadow:
                      "0 8px 25px rgba(15,23,42,.07)",
                    border:
                      isPublished
                        ? "1px solid #c7d2fe"
                        : "1px solid #e2e8f0",
                  }}
                >
                  {/* STATUS */}

                  <div
                    style={{
                      display: "inline-block",
                      padding: "7px 12px",
                      borderRadius: "20px",
                      background: isPublished
                        ? "#dcfce7"
                        : "#f1f5f9",
                      color: isPublished
                        ? "#15803d"
                        : "#64748b",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {isPublished
                      ? "🟢 منتشر شده"
                      : "⚪ " +
                        (exam.status || "نامشخص")}
                  </div>

                  {/* TITLE */}

                  <h2
                    style={{
                      marginTop: "18px",
                      marginBottom: "10px",
                      fontSize: "22px",
                      fontWeight: 900,
                    }}
                  >
                    📝 {exam.title}
                  </h2>

                  {/* DESCRIPTION */}

                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: 1.8,
                      minHeight: "50px",
                    }}
                  >
                    {exam.description ||
                      "توضیحی برای این آزمون ثبت نشده است."}
                  </p>

                  {/* INFO */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    <InfoBox
                      icon="⏱"
                      title="زمان"
                      value={`${exam.duration || 0} دقیقه`}
                    />

                    <InfoBox
                      icon="📚"
                      title="سوالات"
                      value={`${questionCount} سوال`}
                    />
                  </div>

                  {/* BUTTON */}

                  <button
                    onClick={() =>
                      startExam(exam.id)
                    }
                    disabled={!isPublished}
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      border: "none",
                      borderRadius: "15px",
                      padding: "15px",
                      cursor: isPublished
                        ? "pointer"
                        : "not-allowed",
                      background: isPublished
                        ? "#4f46e5"
                        : "#cbd5e1",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: 900,
                    }}
                  >
                    {isPublished
                      ? "🚀 شروع آزمون"
                      : "🔒 آزمون منتشر نشده"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   INFO BOX
========================= */

function InfoBox({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "15px",
        padding: "14px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
        }}
      >
        {icon} {title}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontWeight: 900,
        }}
      >
        {value}
      </div>
    </div>
  );
}
