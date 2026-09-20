import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

type TopicAnalysis = {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
};

type Skill = {
  id: number;
  studentId: number;
  chapter: string;
  correctCount: number;
  wrongCount: number;
  masteryScore: number;
  level: number;
  lastUpdated: string;
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon?: string | null;
  xpReward: number;
  earnedAt?: string;
};

type DashboardData = {
  student: {
    id: number;
    name: string;
    email: string;
    level: number;
    xp: number;
    currentLevelStart: number;
    nextLevelXP: number;
    xpInsideLevel: number;
    xpProgress: number;
  };

  stats: {
    totalQuestions: number;
    correctAnswers: number;
    totalScore: number;
    percentage: number;
  };

  ai: {
    topicAnalysis: TopicAnalysis[];
    strongTopics: TopicAnalysis[];
    weakTopics: TopicAnalysis[];
    skills: Skill[];
    strongSkills: Skill[];
    weakSkills: Skill[];
    recommendation: string;
    aiMessage: string;
  };
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  // ==============================
  // AUTH
  // ==============================

  const { logout } = useAuth();

  // ==============================
  // STATE
  // ==============================

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [achievementsLoading, setAchievementsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==============================
  // LOAD DASHBOARD
  // ==============================

  useEffect(() => {
    console.log(
      "STUDENT DASHBOARD COMPONENT LOADED"
    );

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/dashboard/student/1`
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard request failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "STUDENT DASHBOARD:",
          result
        );

        console.log(
          "STUDENT XP:",
          result?.student?.xp
        );

        setData(result);
      } catch (err) {
        console.error(
          "STUDENT DASHBOARD ERROR:",
          err
        );

        setError(
          "خطا در دریافت اطلاعات داشبورد"
        );
      } finally {
        setLoading(false);
      }
    };

    // ==============================
    // LOAD ACHIEVEMENTS
    // ==============================

    const loadAchievements = async () => {
      try {
        setAchievementsLoading(true);

        const response = await fetch(
          `${API_URL}/achievements/student/1`
        );

        if (!response.ok) {
          throw new Error(
            `Achievements request failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "ACHIEVEMENTS:",
          result
        );

        const list =
          Array.isArray(result)
            ? result
            : result?.achievements || [];

        setAchievements(list);
      } catch (err) {
        console.error(
          "ACHIEVEMENTS ERROR:",
          err
        );

        setAchievements([]);
      } finally {
        setAchievementsLoading(false);
      }
    };

    loadDashboard();
    loadAchievements();
  }, []);

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Tahoma, Arial, sans-serif",
          background:
            "linear-gradient(135deg, #eef2ff, #f8fafc)",
          fontSize: "20px",
          color: "#334155",
        }}
      >
        در حال بارگذاری داشبورد...
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error || !data) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily:
            "Tahoma, Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>
            خطا در بارگذاری داشبورد
          </h2>

          <p
            style={{
              color: "#dc2626",
            }}
          >
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              cursor: "pointer",
              background: "#4f46e5",
              color: "#ffffff",
              fontSize: "15px",
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // DATA
  // ==============================

  const student = data.student;
  const stats = data.stats;
  const ai = data.ai;

  const xpProgress = Number(
    student.xpProgress ?? 0
  );

  const weakSkills =
    ai.weakSkills || [];

  const strongSkills =
    ai.strongSkills || [];

  // ==============================
  // RENDER
  // ==============================

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)",
        padding: "30px 20px 50px",
        fontFamily:
          "Tahoma, Arial, sans-serif",
        color: "#1e293b",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.08)",
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

            {/* HEADER RIGHT */}

            <div
              style={{
                flex: 1,
                minWidth: "250px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6366f1",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                🎓 MathVerse
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                }}
              >
                داشبورد دانش‌آموز
              </h1>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#64748b",
                  fontSize: "17px",
                }}
              >
                خوش آمدی، {student.name} 👋
              </p>
            </div>

            {/* HEADER ACTIONS */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >

              {/* LEVEL CARD */}

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  color: "#ffffff",
                  borderRadius: "20px",
                  padding: "20px 30px",
                  minWidth: "190px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.9,
                  }}
                >
                  سطح فعلی
                </div>

                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  {student.level}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                  }}
                >
                  {student.xp} XP
                </div>
              </div>

              {/* LOGOUT BUTTON */}

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  border:
                    "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  padding:
                    "12px 18px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily:
                    "Tahoma, Arial, sans-serif",
                  whiteSpace: "nowrap",
                  transition:
                    "all 0.2s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    "#fee2e2";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    "#fef2f2";
                }}
              >
                🚪 خروج از حساب
              </button>
            </div>
          </div>

          {/* =====================================================
              XP PROGRESS
          ===================================================== */}

          <div
            style={{
              marginTop: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "9px",
              }}
            >
              <strong>
                پیشرفت سطح
              </strong>

              <strong
                style={{
                  color: "#4f46e5",
                }}
              >
                {xpProgress}%
              </strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e2e8f0",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${xpProgress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #4f46e5, #8b5cf6)",
                  borderRadius:
                    "999px",
                  transition:
                    "width 0.5s ease",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "8px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <span>
                {student.currentLevelStart} XP
              </span>

              <span>
                {student.nextLevelXP} XP
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          <StatCard
            icon="⭐"
            title="امتیاز تجربه"
            value={student.xp}
            subtitle="XP"
          />

          <StatCard
            icon="🏆"
            title="امتیاز"
            value={stats.totalScore}
            subtitle="امتیاز کسب‌شده"
          />

          <StatCard
            icon="📈"
            title="درصد موفقیت"
            value={`${stats.percentage}%`}
            subtitle="عملکرد کلی"
          />

          <StatCard
            icon="📝"
            title="تعداد سؤالات"
            value={stats.totalQuestions}
            subtitle="سؤالات پاسخ‌داده‌شده"
          />

          <StatCard
            icon="✅"
            title="پاسخ صحیح"
            value={stats.correctAnswers}
            subtitle="پاسخ‌های درست"
          />
        </div>

        {/* =====================================================
            PERFORMANCE
        ===================================================== */}

        <Section
          title="📈 عملکرد تحصیلی"
        >
          <p
            style={{
              color: "#64748b",
              marginTop: 0,
            }}
          >
            وضعیت کلی پاسخ‌های شما
          </p>

          <div
            style={{
              marginTop: "20px",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#4f46e5",
            }}
          >
            {stats.percentage}%
          </div>
        </Section>

        {/* =====================================================
            AI ANALYSIS
        ===================================================== */}

        <Section
          title="🤖 تحلیل هوش مصنوعی"
        >
          <p
            style={{
              color: "#64748b",
              marginTop: 0,
            }}
          >
            تحلیل عملکرد و پیشنهاد یادگیری شخصی‌سازی‌شده
          </p>

          {/* STRONG SKILLS */}

          {strongSkills.length > 0 && (
            <div
              style={{
                marginTop: "25px",
              }}
            >
              <h3
                style={{
                  color: "#15803d",
                }}
              >
                💪 نقاط قوت
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {strongSkills.map(
                  (skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      type="strong"
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* WEAK SKILLS */}

          <div
            style={{
              marginTop: "25px",
            }}
          >
            <h3
              style={{
                color: "#dc2626",
              }}
            >
              ⚠️ نقاط ضعف
            </h3>

            {weakSkills.length === 0 ? (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "14px",
                  padding: "18px",
                  color: "#64748b",
                }}
              >
                در حال حاضر نقطه ضعف مشخصی ثبت نشده است.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {weakSkills.map(
                  (skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      type="weak"
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* AI RECOMMENDATION */}

          <div
            style={{
              marginTop: "30px",
              background:
                "linear-gradient(135deg, #eef2ff, #f5f3ff)",
              border:
                "1px solid #ddd6fe",
              borderRadius: "18px",
              padding: "22px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              💡 پیشنهاد هوشمند MathVerse
            </h3>

            <p
              style={{
                lineHeight: 1.9,
                marginBottom: "8px",
              }}
            >
              {ai.aiMessage}
            </p>

            <strong
              style={{
                color: "#4f46e5",
              }}
            >
              {ai.recommendation}
            </strong>
          </div>
        </Section>

        {/* =====================================================
            ACHIEVEMENTS
        ===================================================== */}

        <Section
          title="🏆 دستاوردهای من"
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                color: "#64748b",
                margin: 0,
              }}
            >
              موفقیت‌هایی که در مسیر یادگیری به دست آورده‌ای
            </p>

            <div
              style={{
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: "999px",
                padding: "9px 18px",
                fontWeight: "bold",
              }}
            >
              {achievements.length} دستاورد
            </div>
          </div>

          {achievementsLoading ? (
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              در حال دریافت دستاوردها...
            </div>
          ) : achievements.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              هنوز دستاوردی کسب نکرده‌ای.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              {achievements.map(
                (achievement) => (
                  <div
                    key={achievement.id}
                    style={{
                      background:
                        "linear-gradient(135deg, #fffbeb, #ffffff)",
                      border:
                        "1px solid #fde68a",
                      borderRadius: "20px",
                      padding: "22px",
                      boxShadow:
                        "0 8px 20px rgba(15,23,42,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "62px",
                          height: "62px",
                          borderRadius: "18px",
                          background:
                            "#fef3c7",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontSize: "34px",
                        }}
                      >
                        {achievement.icon ||
                          "🏆"}
                      </div>

                      <div
                        style={{
                          background:
                            "#dcfce7",
                          color: "#15803d",
                          borderRadius:
                            "999px",
                          padding:
                            "6px 10px",
                          fontSize:
                            "13px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        +
                        {
                          achievement.xpReward
                        }{" "}
                        XP
                      </div>
                    </div>

                    <h3
                      style={{
                        margin:
                          "18px 0 8px",
                        fontSize: "18px",
                      }}
                    >
                      {
                        achievement.title
                      }
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.8,
                        margin: 0,
                        fontSize: "14px",
                      }}
                    >
                      {
                        achievement.description
                      }
                    </p>

                    {achievement.earnedAt && (
                      <div
                        style={{
                          marginTop:
                            "14px",
                          fontSize:
                            "12px",
                          color:
                            "#94a3b8",
                        }}
                      >
                        کسب‌شده در:{" "}
                        {new Date(
                          achievement.earnedAt
                        ).toLocaleDateString(
                          "fa-IR"
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </Section>

        {/* =====================================================
            LEARNING PATH
        ===================================================== */}

        {weakSkills.length > 0 && (
          <div
            style={{
              background:
                "linear-gradient(135deg, #312e81, #4f46e5)",
              color: "#ffffff",
              borderRadius: "24px",
              padding: "30px",
              marginBottom: "25px",
              boxShadow:
                "0 12px 30px rgba(79,70,229,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "25px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.85,
                    marginBottom: "8px",
                  }}
                >
                  🎯 مسیر یادگیری پیشنهادی شما
                </div>

                <h2
                  style={{
                    margin: "0 0 10px",
                  }}
                >
                  تمرکز روی{" "}
                  {
                    weakSkills[0]
                      .chapter
                  }
                </h2>

                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.8,
                    opacity: 0.92,
                  }}
                >
                  عملکرد شما در این بخش{" "}
                  <strong>
                    {
                      weakSkills[0]
                        .masteryScore
                    }%
                  </strong>{" "}
                  است.
                  <br />
                  تمرین تطبیقی MathVerse سؤال‌ها را
                  متناسب با سطح شما انتخاب می‌کند.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/student/practice?chapter=${encodeURIComponent(
                      weakSkills[0]
                        .chapter
                    )}`
                  )
                }
                style={{
                  border: "none",
                  background: "#ffffff",
                  color: "#4338ca",
                  padding: "15px 25px",
                  borderRadius: "14px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  minWidth: "190px",
                }}
              >
                🎯 شروع تمرین تطبیقی
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
            marginBottom: "35px",
          }}
        >
          <ActionCard
            icon="📝"
            title="آزمون‌ها"
            description="مشاهده و شرکت در آزمون‌های موجود"
            onClick={() =>
              navigate(
                "/student/exams"
              )
            }
          />

          <ActionCard
            icon="🎯"
            title="تمرین تطبیقی"
            description="تمرین هوشمند بر اساس نقاط قوت و ضعف شما"
            onClick={() =>
              navigate(
                "/student/practice"
              )
            }
          />

          <ActionCard
            icon="🤖"
            title="دستیار هوش مصنوعی"
            description="دریافت راهنمایی و کمک هوشمند در ریاضی"
            onClick={() =>
              navigate(
                "/student/ai"
              )
            }
          />
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px",
            paddingTop: "10px",
          }}
        >
          MathVerse • سامانه یادگیری هوشمند ریاضی
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "28px",
        marginBottom: "25px",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "18px",
          fontSize: "23px",
        }}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "23px",
        boxShadow:
          "0 8px 25px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          fontSize: "30px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#64748b",
          marginTop: "10px",
        }}
      >
        {title}
      </div>

      <strong
        style={{
          display: "block",
          fontSize: "28px",
          marginTop: "5px",
        }}
      >
        {value}
      </strong>

      <span
        style={{
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

function SkillCard({
  skill,
  type,
}: {
  skill: Skill;
  type: "strong" | "weak";
}) {
  const isStrong =
    type === "strong";

  return (
    <div
      style={{
        border:
          isStrong
            ? "1px solid #bbf7d0"
            : "1px solid #fee2e2",
        background:
          isStrong
            ? "#f0fdf4"
            : "#fff7f7",
        borderRadius: "16px",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <strong
          style={{
            fontSize: "17px",
            color:
              isStrong
                ? "#15803d"
                : "#dc2626",
          }}
        >
          {isStrong
            ? "💪"
            : "⚠️"}{" "}
          {skill.chapter}
        </strong>

        <strong
          style={{
            color:
              isStrong
                ? "#15803d"
                : "#dc2626",
            fontSize: "20px",
          }}
        >
          {skill.masteryScore}%
        </strong>
      </div>

      <div
        style={{
          marginTop: "10px",
          color: "#64748b",
        }}
      >
        درست: {skill.correctCount}
        {" | "}
        غلط: {skill.wrongCount}
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        background: "#ffffff",
        borderRadius: "20px",
        padding: "25px",
        textAlign: "right",
        cursor: "pointer",
        boxShadow:
          "0 8px 25px rgba(15,23,42,0.06)",
        fontFamily:
          "Tahoma, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "34px",
        }}
      >
        {icon}
      </div>

      <h3>{title}</h3>

      <p
        style={{
          color: "#64748b",
          marginBottom: 0,
        }}
      >
        {description}
      </p>
    </button>
  );
}