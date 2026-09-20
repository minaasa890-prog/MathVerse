import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../api/config";

interface ChapterPerformance {
  chapter: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
}

interface ChallengingProgress {
  attemptId: number;
  questionId: number;
  date: string;
  difficulty: number;
  chapter: string;
  isCorrect: boolean;
  percentage: number;
}

interface ChildData {
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
  chapterPerformance?: ChapterPerformance[];
}

interface ParentDashboardData {
  parent: {
    id: number;
    name: string;
  };
  children: ChildData[];
}

export default function StudentReport() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [student, setStudent] =
    useState<ChildData | null>(null);

  const [challenging, setChallenging] =
    useState<ChallengingProgress[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const userText =
          localStorage.getItem("user");

        const token =
          localStorage.getItem("token");

        if (!userText) {
          setError(
            "اطلاعات حساب والد پیدا نشد.",
          );

          setLoading(false);
          return;
        }

        if (!token) {
          setError(
            "نشست کاربری معتبر نیست. لطفاً دوباره وارد شوید.",
          );

          setLoading(false);
          return;
        }

        const user =
          JSON.parse(userText);

        const parentId =
          Number(user.id);

        const currentStudentId =
          Number(studentId);

        if (
          !parentId ||
          !currentStudentId
        ) {
          setError(
            "شناسه والد یا دانش‌آموز معتبر نیست.",
          );

          setLoading(false);
          return;
        }

        if (user.role !== "PARENT") {
          setError(
            "این گزارش فقط برای حساب والد قابل دسترسی است.",
          );

          setLoading(false);
          return;
        }

        // =====================================================
        // دریافت داشبورد والد
        // =====================================================

        const dashboardResponse =
          await fetch(
            `${API_URL}/parent/dashboard/${parentId}`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            },
          );

        if (!dashboardResponse.ok) {
          console.error(
            "PARENT DASHBOARD ERROR:",
            dashboardResponse.status,
          );

          if (
            dashboardResponse.status === 401
          ) {
            throw new Error(
              "AUTH_ERROR",
            );
          }

          if (
            dashboardResponse.status === 403
          ) {
            throw new Error(
              "FORBIDDEN",
            );
          }

          throw new Error(
            `Dashboard error: ${dashboardResponse.status}`,
          );
        }

        const dashboardData: ParentDashboardData =
          await dashboardResponse.json();

        console.log(
          "PARENT DASHBOARD DATA:",
          dashboardData,
        );

        // =====================================================
        // پیدا کردن دانش‌آموز
        // =====================================================

        const foundStudent =
          dashboardData.children.find(
            (child) =>
              Number(child.studentId) ===
              currentStudentId,
          );

        if (!foundStudent) {
          setError(
            "این دانش‌آموز به حساب والد متصل نیست.",
          );

          setLoading(false);
          return;
        }

        setStudent(foundStudent);

        // =====================================================
        // دریافت عملکرد سؤالات دشوار
        // =====================================================

        const challengingResponse =
          await fetch(
            `${API_URL}/parent/student/${currentStudentId}/challenging-progress`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            },
          );

        if (!challengingResponse.ok) {
          console.error(
            "CHALLENGING PROGRESS ERROR:",
            challengingResponse.status,
          );

          if (
            challengingResponse.status === 401
          ) {
            throw new Error(
              "AUTH_ERROR",
            );
          }

          if (
            challengingResponse.status === 403
          ) {
            throw new Error(
              "FORBIDDEN",
            );
          }

          throw new Error(
            `Challenging error: ${challengingResponse.status}`,
          );
        }

        const challengingData: ChallengingProgress[] =
          await challengingResponse.json();

        console.log(
          "CHALLENGING DATA:",
          challengingData,
        );

        setChallenging(
          challengingData,
        );
      } catch (error) {
        console.error(
          "Student Report Error:",
          error,
        );

        if (
          error instanceof Error &&
          error.message ===
            "AUTH_ERROR"
        ) {
          setError(
            "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
          );
        } else if (
          error instanceof Error &&
          error.message ===
            "FORBIDDEN"
        ) {
          setError(
            "شما اجازه دسترسی به این گزارش را ندارید.",
          );
        } else {
          setError(
            "دریافت گزارش با مشکل مواجه شد.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [studentId]);

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>
          در حال دریافت گزارش...
        </h2>
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (error) {
    return (
      <div style={styles.center}>
        <h2>{error}</h2>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate(
              "/parent/dashboard",
            )
          }
        >
          بازگشت به داشبورد والد
        </button>
      </div>
    );
  }

  // =========================================================
  // Student not found
  // =========================================================

  if (!student) {
    return (
      <div style={styles.center}>
        <h2>
          گزارش دانش‌آموز پیدا نشد.
        </h2>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate(
              "/parent/dashboard",
            )
          }
        >
          بازگشت
        </button>
      </div>
    );
  }

  // =========================================================
  // Challenging calculations
  // =========================================================

  const challengingCorrect =
    challenging.filter(
      (item) => item.isCorrect,
    ).length;

  const challengingTotal =
    challenging.length;

  const challengingAverage =
    challengingTotal > 0
      ? Math.round(
          (challengingCorrect /
            challengingTotal) *
            100,
        )
      : 0;

  // =========================================================
  // Main Report
  // =========================================================

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            📋 گزارش کامل دانش‌آموز
          </h1>

          <p style={styles.subtitle}>
            گزارش آموزشی{" "}
            {student.name}
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate(
              "/parent/dashboard",
            )
          }
        >
          ← بازگشت
        </button>
      </div>

      {/* STUDENT INFO */}

      <div style={styles.studentCard}>
        <div>
          <h2
            style={
              styles.studentName
            }
          >
            👨‍🎓 {student.name}
          </h2>

          <p
            style={
              styles.classText
            }
          >
            🏫 کلاس:{" "}
            {student.class}
          </p>
        </div>

        <div
          style={
            styles.averageBox
          }
        >
          <div
            style={
              styles.averageNumber
            }
          >
            {student.average}%
          </div>

          <div
            style={
              styles.averageLabel
            }
          >
            میانگین عملکرد
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div style={styles.cards}>
        <InfoCard
          icon="📊"
          title="میانگین"
          value={`${student.average}%`}
        />

        <InfoCard
          icon="📝"
          title="کل فعالیت‌ها"
          value={student.totalExams}
        />

        <InfoCard
          icon="✅"
          title="پاسخ صحیح"
          value={
            student.correctAnswers
          }
        />

        <InfoCard
          icon="❌"
          title="پاسخ غلط"
          value={
            student.wrongAnswers
          }
        />
      </div>

      {/* CHAPTER PERFORMANCE */}

      <div style={styles.section}>
        <h2
          style={
            styles.sectionTitle
          }
        >
          📚 عملکرد فصل‌ها
        </h2>

        {student.chapterPerformance &&
        student.chapterPerformance
          .length > 0 ? (
          student.chapterPerformance.map(
            (
              chapter,
              index,
            ) => (
              <div
                key={index}
                style={
                  styles.chapterRow
                }
              >
                <div
                  style={
                    styles.chapterHeader
                  }
                >
                  <strong>
                    {
                      chapter.chapter
                    }
                  </strong>

                  <strong>
                    {
                      chapter.percentage
                    }%
                  </strong>
                </div>

                <div
                  style={
                    styles.chapterBarContainer
                  }
                >
                  <div
                    style={{
                      ...styles.chapterBar,
                      width: `${Math.min(
                        Math.max(
                          chapter.percentage,
                          0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div
                  style={
                    styles.chapterDetails
                  }
                >
                  {
                    chapter.correctAnswers
                  }{" "}
                  صحیح از{" "}
                  {
                    chapter.totalQuestions
                  }{" "}
                  سؤال
                  {" | "}
                  {
                    chapter.wrongAnswers
                  }{" "}
                  غلط
                </div>
              </div>
            ),
          )
        ) : (
          <p
            style={styles.muted}
          >
            اطلاعات فصل‌ها موجود نیست.
          </p>
        )}
      </div>

      {/* STRENGTHS / WEAKNESSES */}

      <div style={styles.columns}>
        <div style={styles.section}>
          <h2
            style={
              styles.sectionTitle
            }
          >
            💪 نقاط قوت
          </h2>

          {student.strengths.length >
          0 ? (
            student.strengths.map(
              (
                strength,
                index,
              ) => (
                <div
                  key={index}
                  style={
                    styles.strength
                  }
                >
                  ✅ {strength}
                </div>
              ),
            )
          ) : (
            <p
              style={styles.muted}
            >
              هنوز نقطه قوت مشخصی
              ثبت نشده است.
            </p>
          )}
        </div>

        <div style={styles.section}>
          <h2
            style={
              styles.sectionTitle
            }
          >
            ⚠️ نقاط نیازمند تقویت
          </h2>

          {student.weaknesses.length >
          0 ? (
            student.weaknesses.map(
              (
                weakness,
                index,
              ) => (
                <div
                  key={index}
                  style={
                    styles.weakness
                  }
                >
                  ⚠️ {weakness}
                </div>
              ),
            )
          ) : (
            <p
              style={styles.success}
            >
              🎉 در حال حاضر ضعف مهمی
              شناسایی نشده است.
            </p>
          )}
        </div>
      </div>

      {/* CHALLENGING QUESTIONS */}

      <div style={styles.section}>
        <h2
          style={
            styles.sectionTitle
          }
        >
          🧠 عملکرد در سؤالات دشوار
        </h2>

        <div
          style={
            styles.challengeSummary
          }
        >
          <div>
            <span
              style={
                styles.challengeNumber
              }
            >
              {challengingAverage}%
            </span>

            <span
              style={
                styles.challengeLabel
              }
            >
              میانگین سؤالات دشوار
            </span>
          </div>

          <div>
            <span
              style={
                styles.challengeNumber
              }
            >
              {challengingCorrect}
            </span>

            <span
              style={
                styles.challengeLabel
              }
            >
              پاسخ صحیح
            </span>
          </div>

          <div>
            <span
              style={
                styles.challengeNumber
              }
            >
              {challengingTotal}
            </span>

            <span
              style={
                styles.challengeLabel
              }
            >
              کل سؤالات دشوار
            </span>
          </div>
        </div>

        {challenging.length > 0 ? (
          <div
            style={
              styles.challengeList
            }
          >
            {challenging.map(
              (
                item,
                index,
              ) => (
                <div
                  key={index}
                  style={
                    styles.challengeItem
                  }
                >
                  <div>
                    <strong>
                      سؤال #
                      {
                        item.questionId
                      }
                    </strong>

                    <div
                      style={
                        styles.challengeMeta
                      }
                    >
                      {
                        item.chapter
                      }{" "}
                      | سطح دشواری{" "}
                      {
                        item.difficulty
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.resultBadge,
                      background:
                        item.isCorrect
                          ? "#e8f5e9"
                          : "#ffebee",
                    }}
                  >
                    {item.isCorrect
                      ? "✅ صحیح"
                      : "❌ غلط"}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p
            style={styles.muted}
          >
            هنوز سؤالات دشواری برای این
            دانش‌آموز ثبت نشده است.
          </p>
        )}
      </div>

      {/* RECOMMENDATION */}

      <div
        style={
          styles.recommendation
        }
      >
        <h2
          style={
            styles.sectionTitle
          }
        >
          🎯 پیشنهاد آموزشی MathVerse
        </h2>

        <p
          style={
            styles.recommendationText
          }
        >
          {student.recommendation}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// Info Card
// =========================================================

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <div style={styles.card}>
      <div
        style={
          styles.cardIcon
        }
      >
        {icon}
      </div>

      <div
        style={
          styles.cardTitle
        }
      >
        {title}
      </div>

      <div
        style={
          styles.cardValue
        }
      >
        {value}
      </div>
    </div>
  );
}

// =========================================================
// Styles
// =========================================================

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    direction: "rtl",
    fontFamily:
      "Tahoma, Arial, sans-serif",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    direction: "rtl",
    textAlign: "center",
    gap: "20px",
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 25px",
    padding: "25px 30px",
    background: "#ffffff",
    borderRadius: "20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.06)",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "10px",
    color: "#666",
    fontSize: "16px",
  },

  backButton: {
    border: "none",
    borderRadius: "12px",
    padding: "12px 20px",
    background: "#1976d2",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
  },

  studentCard: {
    maxWidth: "1200px",
    margin: "0 auto 25px",
    padding: "25px 30px",
    background: "#ffffff",
    borderRadius: "20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.06)",
  },

  studentName: {
    margin: 0,
    fontSize: "25px",
  },

  classText: {
    marginTop: "10px",
    color: "#666",
  },

  averageBox: {
    minWidth: "140px",
    padding: "15px 25px",
    textAlign: "center",
    borderRadius: "16px",
    background: "#eef8ee",
  },

  averageNumber: {
    fontSize: "34px",
    fontWeight: "bold",
  },

  averageLabel: {
    marginTop: "5px",
    color: "#666",
    fontSize: "13px",
  },

  cards: {
    maxWidth: "1200px",
    margin: "0 auto 25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "22px",
    textAlign: "center",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.05)",
  },

  cardIcon: {
    fontSize: "30px",
    marginBottom: "10px",
  },

  cardTitle: {
    color: "#666",
    fontSize: "14px",
  },

  cardValue: {
    marginTop: "8px",
    fontSize: "28px",
    fontWeight: "bold",
  },

  section: {
    maxWidth: "1200px",
    margin: "0 auto 25px",
    padding: "25px",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    marginTop: 0,
    fontSize: "20px",
  },

  chapterRow: {
    marginTop: "22px",
  },

  chapterHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    marginBottom: "8px",
  },

  chapterBarContainer: {
    width: "100%",
    height: "25px",
    background: "#e5e7eb",
    borderRadius: "15px",
    overflow: "hidden",
  },

  chapterBar: {
    height: "100%",
    background: "#4caf50",
    borderRadius: "15px",
    transition:
      "width 0.5s",
  },

  chapterDetails: {
    marginTop: "7px",
    color: "#666",
    fontSize: "13px",
  },

  columns: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  strength: {
    marginTop: "10px",
    padding: "12px",
    background: "#eef8ee",
    borderRadius: "10px",
  },

  weakness: {
    marginTop: "10px",
    padding: "12px",
    background: "#fff3f3",
    borderRadius: "10px",
  },

  success: {
    color: "#2e7d32",
    lineHeight: 1.8,
  },

  muted: {
    color: "#777",
    lineHeight: 1.8,
  },

  challengeSummary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  challengeNumber: {
    display: "block",
    fontSize: "30px",
    fontWeight: "bold",
    textAlign: "center",
  },

  challengeLabel: {
    display: "block",
    marginTop: "6px",
    color: "#666",
    textAlign: "center",
    fontSize: "13px",
  },

  challengeList: {
    marginTop: "25px",
  },

  challengeItem: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "12px",
    background: "#f8f9fa",
  },

  challengeMeta: {
    marginTop: "6px",
    color: "#777",
    fontSize: "13px",
  },

  resultBadge: {
    padding: "8px 12px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  recommendation: {
    maxWidth: "1200px",
    margin: "25px auto",
    padding: "25px",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.05)",
  },

  recommendationText: {
    fontSize: "17px",
    lineHeight: 1.8,
  },
};
