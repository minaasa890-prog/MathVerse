import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

interface NextLesson {
  studentId: number;
  lessonId: number | null;
  nextLesson: string | null;
  reason: string;
  type?: "PRACTICE" | "ADVANCED_PRACTICE" | string;
  chapter?: string;
}

const API_URL = "http://localhost:4000";
const STUDENT_ID = 1;

const StudentLessons: React.FC = () => {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [nextLesson, setNextLesson] =
    useState<NextLesson | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadLessons();
    loadNextLesson();
  }, []);

  // ============================================
  // دریافت درس‌ها
  // ============================================

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/lessons`
      );

      if (!response.ok) {
        throw new Error(
          `خطای سرور: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("LESSONS API:", data);

      setLessons(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "LESSONS ERROR:",
        err
      );

      setError(
        "دریافت درس‌ها از سرور با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // دریافت پیشنهاد هوشمند
  // ============================================

  const loadNextLesson = async () => {
    try {
      setLoadingRecommendation(true);

      const response = await fetch(
        `${API_URL}/adaptive-learning/next-lesson/${STUDENT_ID}`
      );

      if (!response.ok) {
        throw new Error(
          `خطای پیشنهاد AI: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "NEXT LESSON AI:",
        data
      );

      setNextLesson(data);
    } catch (err) {
      console.error(
        "NEXT LESSON ERROR:",
        err
      );

      setNextLesson(null);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // ============================================
  // باز کردن فایل آموزشی
  // ============================================

  const openFile = (
    fileUrl: string
  ) => {
    const url =
      fileUrl.startsWith("http")
        ? fileUrl
        : `${API_URL}${fileUrl}`;

    window.open(
      url,
      "_blank"
    );
  };

  // ============================================
  // باز کردن درس
  // ============================================

  const openLesson = (
    lessonId: number
  ) => {
    navigate(
      `/student/lessons/${lessonId}`
    );
  };

  // ============================================
  // شروع پیشنهاد AI
  // ============================================

  const startRecommendedLearning = () => {
    if (!nextLesson) {
      return;
    }

    // اگر پیشنهاد مربوط به یک درس باشد
    if (
      nextLesson.lessonId !== null &&
      nextLesson.lessonId !== undefined
    ) {
      navigate(
        `/student/lessons/${nextLesson.lessonId}`
      );

      return;
    }

    // اگر پیشنهاد تمرین باشد
    if (
      nextLesson.type === "PRACTICE" ||
      nextLesson.type === "ADVANCED_PRACTICE"
    ) {
      navigate(
        "/student/practice"
      );

      return;
    }

    // حالت پیش‌فرض
    navigate(
      "/student/practice"
    );
  };

  // ============================================
  // متن دکمه پیشنهاد
  // ============================================

  const getRecommendationButtonText = () => {
    if (!nextLesson) {
      return "شروع";
    }

    if (
      nextLesson.type === "PRACTICE"
    ) {
      return "🚀 شروع تمرین تکمیلی";
    }

    if (
      nextLesson.type ===
      "ADVANCED_PRACTICE"
    ) {
      return "🚀 شروع تمرین پیشرفته";
    }

    if (
      nextLesson.lessonId !== null &&
      nextLesson.lessonId !== undefined
    ) {
      return "🚀 شروع درس پیشنهادی";
    }

    return "🚀 شروع تمرین";
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily:
          "Tahoma, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* =========================================
            عنوان صفحه
        ========================================= */}

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
        >
          📚 درس‌های من
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          درس‌ها و مسیر یادگیری هوشمند شما
          در این قسمت نمایش داده می‌شوند.
        </p>

        {/* =========================================
            پیشنهاد هوشمند AI
        ========================================= */}

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "30px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.08)",
            border:
              "2px solid #7b61ff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "15px",
            }}
          >
            🤖 پیشنهاد یادگیری هوشمند
          </h2>

          {/* Loading */}

          {loadingRecommendation && (
            <div
              style={{
                color: "#666",
                padding: "10px 0",
              }}
            >
              ⏳ در حال بررسی وضعیت
              یادگیری شما...
            </div>
          )}

          {/* Recommendation */}

          {!loadingRecommendation &&
            nextLesson && (
              <div>
                <div
                  style={{
                    fontSize: "21px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                  }}
                >
                  {nextLesson.type ===
                  "PRACTICE"
                    ? "🧠 تمرین تکمیلی"
                    : nextLesson.type ===
                      "ADVANCED_PRACTICE"
                    ? "🏆 تمرین پیشرفته"
                    : "📘 درس پیشنهادی"}
                </div>

                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  {nextLesson.nextLesson}
                </div>

                {nextLesson.chapter && (
                  <div
                    style={{
                      display:
                        "inline-block",
                      background:
                        "#eef3ff",
                      color:
                        "#3157c8",
                      padding:
                        "7px 12px",
                      borderRadius:
                        "8px",
                      fontSize:
                        "14px",
                      marginBottom:
                        "12px",
                    }}
                  >
                    🎯 مهارت:
                    {" "}
                    {nextLesson.chapter}
                  </div>
                )}

                <div
                  style={{
                    color: "#555",
                    lineHeight: 1.9,
                    marginTop: "8px",
                  }}
                >
                  💡 دلیل پیشنهاد:
                  <br />
                  {nextLesson.reason}
                </div>

                <button
                  onClick={
                    startRecommendedLearning
                  }
                  style={{
                    marginTop: "18px",
                    border: "none",
                    background:
                      "#7b61ff",
                    color: "white",
                    padding:
                      "13px 24px",
                    borderRadius:
                      "10px",
                    cursor:
                      "pointer",
                    fontSize:
                      "16px",
                    fontWeight:
                      "bold",
                  }}
                >
                  {
                    getRecommendationButtonText()
                  }
                </button>
              </div>
            )}

          {/* No recommendation */}

          {!loadingRecommendation &&
            !nextLesson && (
              <div
                style={{
                  color: "#777",
                  lineHeight: 1.8,
                }}
              >
                فعلاً پیشنهاد جدیدی
                برای شما وجود ندارد.
              </div>
            )}
        </div>

        {/* =========================================
            Loading Lessons
        ========================================= */}

        {loading && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            ⏳ در حال دریافت درس‌ها...
          </div>
        )}

        {/* =========================================
            Error
        ========================================= */}

        {!loading && error && (
          <div
            style={{
              background:
                "#fff1f1",
              color: "#c62828",
              padding: "20px",
              borderRadius: "14px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* =========================================
            Empty
        ========================================= */}

        {!loading &&
          !error &&
          lessons.length === 0 && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "14px",
                textAlign: "center",
              }}
            >
              هنوز هیچ درسی برای
              شما ثبت نشده است.
            </div>
          )}

        {/* =========================================
            Lessons
        ========================================= */}

        {!loading &&
          !error &&
          lessons.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {lessons.map(
                (lesson) => (
                  <div
                    key={lesson.id}
                    style={{
                      background:
                        "white",
                      borderRadius:
                        "16px",
                      padding:
                        "22px",
                      boxShadow:
                        "0 4px 15px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "14px",
                        color:
                          "#777",
                        marginBottom:
                          "8px",
                      }}
                    >
                      درس #{lesson.id}
                    </div>

                    <h2
                      style={{
                        margin:
                          "0 0 12px",
                        fontSize:
                          "22px",
                      }}
                    >
                      📘{" "}
                      {lesson.title}
                    </h2>

                    {lesson.chapter && (
                      <div
                        style={{
                          display:
                            "inline-block",
                          background:
                            "#eef3ff",
                          color:
                            "#3157c8",
                          padding:
                            "6px 10px",
                          borderRadius:
                            "8px",
                          fontSize:
                            "13px",
                          marginBottom:
                            "15px",
                        }}
                      >
                        فصل:{" "}
                        {
                          lesson
                            .chapter
                            .title
                        }
                      </div>
                    )}

                    {lesson.content && (
                      <p
                        style={{
                          lineHeight:
                            1.8,
                          color:
                            "#444",
                        }}
                      >
                        {
                          lesson.content
                        }
                      </p>
                    )}

                    {/* محتوای آموزشی */}

                    {lesson.contents &&
                      lesson.contents
                        .length > 0 && (
                        <div
                          style={{
                            marginTop:
                              "20px",
                          }}
                        >
                          <h3
                            style={{
                              marginBottom:
                                "12px",
                            }}
                          >
                            📖 محتوای
                            آموزشی
                          </h3>

                          {lesson.contents.map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                                style={{
                                  borderTop:
                                    "1px solid #eee",
                                  paddingTop:
                                    "14px",
                                  marginTop:
                                    "14px",
                                }}
                              >
                                <h4
                                  style={{
                                    margin:
                                      "0 0 8px",
                                    fontSize:
                                      "17px",
                                  }}
                                >
                                  {
                                    item.title
                                  }
                                </h4>

                                <p
                                  style={{
                                    color:
                                      "#555",
                                    lineHeight:
                                      1.8,
                                    margin:
                                      "0 0 10px",
                                  }}
                                >
                                  {
                                    item.content
                                  }
                                </p>

                                {item.fileUrl && (
                                  <button
                                    onClick={() =>
                                      openFile(
                                        item.fileUrl as string
                                      )
                                    }
                                    style={{
                                      border:
                                        "none",
                                      background:
                                        "#3157c8",
                                      color:
                                        "white",
                                      padding:
                                        "9px 14px",
                                      borderRadius:
                                        "8px",
                                      cursor:
                                        "pointer",
                                    }}
                                  >
                                    📄 مشاهده
                                    فایل
                                    آموزشی
                                  </button>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* شروع درس */}

                    <button
                      onClick={() =>
                        openLesson(
                          lesson.id
                        )
                      }
                      style={{
                        width:
                          "100%",
                        marginTop:
                          "22px",
                        border:
                          "none",
                        background:
                          "#2e7d32",
                        color:
                          "white",
                        padding:
                          "13px 18px",
                        borderRadius:
                          "10px",
                        cursor:
                          "pointer",
                        fontSize:
                          "16px",
                        fontWeight:
                          "bold",
                      }}
                    >
                      🚀 شروع درس
                    </button>
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default StudentLessons;
