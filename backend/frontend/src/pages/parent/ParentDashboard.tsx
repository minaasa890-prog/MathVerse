import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  chapterPerformance?: {
    chapter: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    percentage: number;
  }[];

  progressHistory?: {
    attemptId: number;
    date: string;
    questionNumber: number;
    isCorrect: boolean;
    progress: number;
  }[];

  firstActivityDate?: string | null;
  lastActivityDate?: string | null;
}

interface ParentData {
  parent: {
    id: number;
    name: string;
  };

  children: ChildData[];
}

export default function ParentDashboard() {
  const navigate = useNavigate();

  const [data, setData] =
    useState<ParentData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // =====================================================
        // دریافت اطلاعات کاربر و JWT
        // =====================================================

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

        // =====================================================
        // تبدیل اطلاعات کاربر
        // =====================================================

        const user =
          JSON.parse(userText);

        const parentId =
          Number(user.id);

        // =====================================================
        // بررسی شناسه والد
        // =====================================================

        if (!parentId) {
          setError(
            "شناسه والد معتبر نیست.",
          );

          setLoading(false);

          return;
        }

        // =====================================================
        // بررسی Role
        // =====================================================

        if (user.role !== "PARENT") {
          setError(
            "این بخش فقط برای حساب والد قابل دسترسی است.",
          );

          setLoading(false);

          return;
        }

        console.log(
          "Parent ID:",
          parentId,
        );

        // =====================================================
        // درخواست امن به Backend
        // =====================================================

        const response =
          await fetch(
            `http://192.168.43.167:4000/parent/dashboard/${parentId}`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            },
          );

        // =====================================================
        // بررسی پاسخ
        // =====================================================

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "AUTH_ERROR",
            );
          }

          if (response.status === 403) {
            throw new Error(
              "FORBIDDEN",
            );
          }

          throw new Error(
            `Server error: ${response.status}`,
          );
        }

        // =====================================================
        // دریافت اطلاعات داشبورد
        // =====================================================

        const result: ParentData =
          await response.json();

        console.log(
          "Parent Dashboard API:",
          result,
        );

        console.log(
          "Children:",
          result.children,
        );

        setData(result);
      } catch (error) {
        console.error(
          "Parent Dashboard Error:",
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
            "شما اجازه دسترسی به این اطلاعات را ندارید.",
          );
        } else {
          setError(
            "ارتباط با سرور برقرار نشد.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>
          در حال دریافت اطلاعات...
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

        <p>
          لطفاً مطمئن شوید Backend روی
          پورت 4000 در حال اجراست.
        </p>
      </div>
    );
  }

  // =========================================================
  // No data
  // =========================================================

  if (!data) {
    return (
      <div style={styles.center}>
        <h2>
          اطلاعاتی پیدا نشد.
        </h2>
      </div>
    );
  }

  // =========================================================
  // No children
  // =========================================================

  if (
    !data.children ||
    data.children.length === 0
  ) {
    return (
      <div style={styles.center}>
        <h2>
          هنوز دانش‌آموزی به این حساب والد
          متصل نشده است.
        </h2>
      </div>
    );
  }

  // =========================================================
  // Dashboard
  // =========================================================

  return (
    <div style={styles.page}>
      {/* Header */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            داشبورد والد 👨‍👩‍👦
          </h1>

          <p style={styles.welcome}>
            خوش آمدید،{" "}
            {data.parent.name}
          </p>
        </div>

        <div style={styles.logo}>
          MathVerse 🎓
        </div>
      </div>

      {/* Children */}

      {data.children.map(
        (child) => (
          <div
            key={child.studentId}
          >
            {/* Student Header */}

            <div
              style={
                styles.studentHeader
              }
            >
              <div>
                <h2
                  style={
                    styles.studentName
                  }
                >
                  👨‍🎓 {child.name}
                </h2>

                <p
                  style={
                    styles.classText
                  }
                >
                  🏫 کلاس:{" "}
                  {child.class}
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
                  {child.average}%
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

            {/* Report Button */}

            <div
              style={
                styles.reportButtonContainer
              }
            >
              <button
                style={
                  styles.reportButton
                }
                onClick={() =>
                  navigate(
                    `/parent/student/${child.studentId}/report`,
                  )
                }
              >
                📋 مشاهده گزارش کامل
                دانش‌آموز
              </button>
            </div>

            {/* Statistics */}

            <div style={styles.cards}>
              <InfoCard
                icon="📊"
                title="میانگین عملکرد"
                value={`${child.average}%`}
              />

              <InfoCard
                icon="📝"
                title="تعداد فعالیت‌ها"
                value={
                  child.totalExams
                }
              />

              <InfoCard
                icon="✅"
                title="پاسخ صحیح"
                value={
                  child.correctAnswers
                }
              />

              <InfoCard
                icon="❓"
                title="کل پاسخ‌ها"
                value={
                  child.totalAnswers
                }
              />
            </div>

            {/* Progress */}

            <div style={styles.section}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                📈 پیشرفت تحصیلی
              </h2>

              {/* Overall progress */}

              <div
                style={
                  styles.progressBackground
                }
              >
                <div
                  style={{
                    ...styles.progress,

                    width: `${Math.min(
                      Math.max(
                        child.average,
                        0,
                      ),
                      100,
                    )}%`,
                  }}
                />
              </div>

              <p
                style={
                  styles.progressText
                }
              >
                عملکرد صحیح:{" "}
                {child.average}%
              </p>

              {/* Progress Chart */}

              {child.progressHistory &&
              child
                .progressHistory
                .length > 0 ? (
                <div
                  style={
                    styles.chartContainer
                  }
                >
                  <h3
                    style={
                      styles.chartTitle
                    }
                  >
                    روند عملکرد در فعالیت‌ها
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >
                    <LineChart
                      data={
                        child.progressHistory
                      }
                      margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="questionNumber"
                        label={{
                          value:
                            "شماره فعالیت",
                          position:
                            "insideBottom",
                          offset: -10,
                        }}
                      />

                      <YAxis
                        domain={[
                          0,
                          100,
                        ]}
                        tickFormatter={(
                          value,
                        ) =>
                          `${value}%`
                        }
                      />

                      <Tooltip
                        formatter={(
                          value,
                        ) => [
                          `${value}%`,
                          "عملکرد صحیح",
                        ]}
                        labelFormatter={(
                          label,
                        ) =>
                          `فعالیت ${label}`
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#4caf50"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                        }}
                        activeDot={{
                          r: 7,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p
                  style={
                    styles.muted
                  }
                >
                  هنوز داده‌ای برای نمایش
                  نمودار پیشرفت وجود ندارد.
                </p>
              )}
            </div>

            {/* Chapter Performance */}

            {child.chapterPerformance &&
              child
                .chapterPerformance
                .length > 0 && (
                <div
                  style={
                    styles.section
                  }
                >
                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    📚 عملکرد فصل‌ها
                  </h2>

                  <div
                    style={
                      styles.chapterChart
                    }
                  >
                    {child.chapterPerformance.map(
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
                              styles.chapterName
                            }
                          >
                            {
                              chapter.chapter
                            }
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

                            <span
                              style={
                                styles.chapterPercentage
                              }
                            >
                              {
                                chapter.percentage
                              }
                              %
                            </span>
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
                            }
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Strengths / Weaknesses */}

            <div style={styles.columns}>
              {/* Strengths */}

              <div
                style={
                  styles.section
                }
              >
                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  💪 نقاط قوت
                </h2>

                {child.strengths &&
                child.strengths.length >
                  0 ? (
                  child.strengths.map(
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
                    style={
                      styles.muted
                    }
                  >
                    هنوز نقطه قوت مشخصی
                    ثبت نشده است.
                  </p>
                )}
              </div>

              {/* Weaknesses */}

              <div
                style={
                  styles.section
                }
              >
                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  ⚠️ نقاط نیازمند تقویت
                </h2>

                {child.weaknesses &&
                child.weaknesses.length >
                  0 ? (
                  child.weaknesses.map(
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
                    style={
                      styles.success
                    }
                  >
                    🎉 در حال حاضر ضعف مهمی
                    شناسایی نشده است.
                  </p>
                )}
              </div>
            </div>

            {/* Recommendation */}

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
                {child.recommendation}
              </p>
            </div>
          </div>
        ),
      )}
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
      <div style={styles.cardIcon}>
        {icon}
      </div>

      <div style={styles.cardTitle}>
        {title}
      </div>

      <div style={styles.cardValue}>
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

  welcome: {
    marginTop: "10px",
    color: "#666",
    fontSize: "16px",
  },

  logo: {
    fontSize: "24px",
    fontWeight: "bold",
  },

  studentHeader: {
    maxWidth: "1200px",
    margin: "0 auto 15px",
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

  reportButtonContainer: {
    maxWidth: "1200px",
    margin: "0 auto 25px",
    display: "flex",
    justifyContent:
      "flex-start",
  },

  reportButton: {
    border: "none",
    borderRadius: "14px",
    padding: "13px 22px",
    background: "#1976d2",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    boxShadow:
      "0 4px 12px rgba(25,118,210,0.25)",
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

  progressBackground: {
    width: "100%",
    height: "20px",
    marginTop: "20px",
    background: "#e5e7eb",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    background: "#4caf50",
    borderRadius: "20px",
    transition: "width 0.5s",
  },

  progressText: {
    marginTop: "10px",
    color: "#666",
  },

  chartContainer: {
    marginTop: "30px",
    width: "100%",
  },

  chartTitle: {
    marginBottom: "15px",
    fontSize: "18px",
  },

  chapterChart: {
    marginTop: "20px",
  },

  chapterRow: {
    marginBottom: "22px",
  },

  chapterName: {
    fontWeight: "bold",
    marginBottom: "8px",
    fontSize: "15px",
  },

  chapterBarContainer: {
    position: "relative",
    width: "100%",
    height: "28px",
    background: "#e5e7eb",
    borderRadius: "14px",
    overflow: "hidden",
  },

  chapterBar: {
    height: "100%",
    background: "#4caf50",
    borderRadius: "14px",
    transition: "width 0.5s",
  },

  chapterPercentage: {
    position: "absolute",
    left: "10px",
    top: "4px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  chapterDetails: {
    marginTop: "6px",
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

  muted: {
    color: "#777",
  },

  success: {
    color: "#2e7d32",
    lineHeight: 1.8,
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

