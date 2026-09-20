import { useEffect, useRef, useState } from "react";

export default function StudentPractice() {
  const studentId = 1;
  const API_URL = "http://192.168.43.167:4000";

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<any>(null);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [finished, setFinished] = useState(false);

  const [answerResult, setAnswerResult] = useState<any>(null);

  const [result, setResult] = useState<any>(null);

  const [questionsReview, setQuestionsReview] = useState<any[]>([]);

  const [showSolution, setShowSolution] = useState<number | null>(null);

  // =====================================================
  // پاسخ تشریحی از روی تصویر
  // =====================================================

  const [writtenImage, setWrittenImage] =
    useState<File | null>(null);

  const [writtenLoading, setWrittenLoading] =
    useState(false);

  const [writtenResult, setWrittenResult] =
    useState<any>(null);

  const [writtenError, setWrittenError] =
    useState("");

  const startedRef = useRef(false);

  // =====================================================
  // گرفتن JWT
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // انتخاب تصویر پاسخ تشریحی
  // =====================================================

  const handleWrittenImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setWrittenError(
        "لطفاً یک فایل تصویری معتبر انتخاب کنید.",
      );

      setWrittenImage(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setWrittenError(
        "حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.",
      );

      setWrittenImage(null);
      return;
    }

    setWrittenError("");
    setWrittenResult(null);
    setWrittenImage(file);
  };

  // =====================================================
  // تحلیل پاسخ تشریحی
  // =====================================================

  const analyzeWrittenAnswer = async () => {
    if (!question) {
      return;
    }

    if (!writtenImage) {
      setWrittenError(
        "ابتدا تصویر پاسخ تشریحی خود را انتخاب کنید.",
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setWrittenError(
        "لطفاً دوباره وارد حساب کاربری شوید.",
      );

      return;
    }

    try {
      setWrittenLoading(true);
      setWrittenError("");
      setWrittenResult(null);

      const formData = new FormData();

      formData.append(
        "image",
        writtenImage,
      );

      formData.append(
        "questionId",
        String(question.id),
      );

      const response = await fetch(
        `${API_URL}/written-answer/analyze`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        },
      );

      const data = await response.json();

      console.log(
        "WRITTEN ANSWER RESULT:",
        data,
      );

      if (!response.ok) {
        setWrittenError(
          data?.message ||
            "خطا در تحلیل پاسخ تشریحی.",
        );

        return;
      }

      if (!data?.success) {
        setWrittenError(
          data?.message ||
            "تحلیل پاسخ تشریحی انجام نشد.",
        );

        return;
      }

      setWrittenResult(data);
    } catch (error) {
      console.error(
        "WRITTEN ANSWER ERROR:",
        error,
      );

      setWrittenError(
        "ارتباط با سرور برای تحلیل تصویر برقرار نشد.",
      );
    } finally {
      setWrittenLoading(false);
    }
  };

  // =====================================================
  // شروع تمرین
  // =====================================================

  const startPractice = async () => {
    const token = getToken();

    if (!token) {
      alert(
        "لطفاً دوباره وارد حساب کاربری شوید.",
      );

      return;
    }

    try {
      setLoading(true);
      setFinished(false);
      setResult(null);
      setQuestion(null);
      setQuestionsReview([]);
      setAnswerResult(null);
      setSelectedAnswer("");
      setShowSolution(null);

      setWrittenImage(null);
      setWrittenResult(null);
      setWrittenError("");

      const response = await fetch(
        `${API_URL}/adaptive-learning/start/1`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            studentId,
          }),
        },
      );

      const data = await response.json();

      console.log(
        "SESSION:",
        data,
      );

      if (
        !response.ok ||
        !data?.session?.id
      ) {
        console.error(
          "START PRACTICE ERROR:",
          data,
        );

        alert(
          data?.message ||
            "خطا در شروع تمرین هوشمند",
        );

        return;
      }

      setSessionId(
        data.session.id,
      );

      await loadNextQuestion(
        data.session.id,
      );
    } catch (error) {
      console.error(
        "START ERROR:",
        error,
      );

      alert(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // دریافت سوال بعدی
  // =====================================================

  const loadNextQuestion = async (
    id: number,
  ) => {
    const token = getToken();

    if (!token) {
      alert(
        "لطفاً دوباره وارد حساب کاربری شوید.",
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/adaptive-learning/next-question/${id}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      console.log(
        "QUESTION:",
        data,
      );

      if (!response.ok) {
        console.error(
          "QUESTION ERROR:",
          data,
        );

        alert(
          data?.message ||
            "خطا در دریافت سوال",
        );

        return;
      }

      if (data.finished) {
        await loadReport(id);
        return;
      }

      if (!data?.question) {
        alert(
          "سوالی برای نمایش وجود ندارد.",
        );

        return;
      }

      setQuestion({
        ...data.question,
        adaptive:
          data.adaptive,
        progress:
          data.progress,
      });

      setSelectedAnswer("");

      setAnswerResult(null);

      setWrittenImage(null);
      setWrittenResult(null);
      setWrittenError("");
    } catch (error) {
      console.error(
        "LOAD QUESTION ERROR:",
        error,
      );

      alert(
        "خطا در دریافت سوال",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ارسال پاسخ چهارگزینه‌ای
  // =====================================================

  const submitAnswer = async () => {
    if (!sessionId || !question) {
      return;
    }

    if (!selectedAnswer) {
      alert(
        "لطفاً یک گزینه انتخاب کنید.",
      );

      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "لطفاً دوباره وارد حساب کاربری شوید.",
      );

      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/adaptive-learning/submit-answer`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            sessionId,
            studentId,
            questionId:
              question.id,

            answer:
              selectedAnswer.toUpperCase(),
          }),
        },
      );

      const data =
        await response.json();

      console.log(
        "ANSWER:",
        data,
      );

      if (!response.ok) {
        console.error(
          "SUBMIT ERROR:",
          data,
        );

        alert(
          data?.message ||
            "خطا در ثبت پاسخ",
        );

        return;
      }

      setAnswerResult({
        correct:
          data.correct,
      });

      if (data.finished) {
        await loadReport(
          sessionId,
        );

        return;
      }

      setTimeout(() => {
        loadNextQuestion(
          sessionId,
        );
      }, 800);
    } catch (error) {
      console.error(
        "SUBMIT ERROR:",
        error,
      );

      alert(
        "خطا در ثبت پاسخ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // گزارش نهایی
  // =====================================================

  const loadReport = async (
    id: number,
  ) => {
    const token = getToken();

    if (!token) {
      alert(
        "لطفاً دوباره وارد حساب کاربری شوید.",
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/adaptive-learning/session-report/${id}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      const data =
        await response.json();

      console.log(
        "REPORT:",
        data,
      );

      if (!response.ok) {
        console.error(
          "REPORT ERROR:",
          data,
        );

        alert(
          data?.message ||
            "خطا در دریافت گزارش",
        );

        return;
      }

      setResult(
        data.report,
      );

      setQuestionsReview(
        Array.isArray(
          data.questions,
        )
          ? data.questions
          : [],
      );

      setFinished(true);
      setQuestion(null);
      setAnswerResult(null);
      setSelectedAnswer("");

      setWrittenImage(null);
      setWrittenResult(null);
      setWrittenError("");
    } catch (error) {
      console.error(
        "REPORT ERROR:",
        error,
      );

      alert(
        "خطا در دریافت گزارش نهایی",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // شروع اولیه
  // =====================================================

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    startPractice();
  }, []);

  // =====================================================
  // Loading
  // =====================================================

  if (
    loading &&
    !question &&
    !finished
  ) {
    return (
      <div style={styles.page}>
        <div
          style={styles.loadingCard}
        >
          <div
            style={styles.loadingIcon}
          >
            🧠
          </div>

          <h2>
            تمرین هوشمند MathVerse
          </h2>

          <p>
            در حال آماده‌سازی تمرین اختصاصی شما...
          </p>

          <div
            style={styles.loadingText}
          >
            Adaptive Engine در حال انتخاب سوال است
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // نتیجه نهایی
  // =====================================================

  if (
    finished &&
    result
  ) {
    return (
      <div style={styles.page}>
        <div
          style={
            styles.resultContainer
          }
        >
          <div
            style={
              styles.resultHeader
            }
          >
            <div
              style={
                styles.successIcon
              }
            >
              🎉
            </div>

            <h1>
              تمرین هوشمند تمام شد
            </h1>

            <p>
              عملکرد شما توسط Adaptive Engine تحلیل شد.
            </p>
          </div>

          <div
            style={
              styles.accuracyCard
            }
          >
            <div
              style={
                styles.accuracyLabel
              }
            >
              دقت پاسخ‌گویی
            </div>

            <div
              style={
                styles.accuracyNumber
              }
            >
              {
                result.accuracyPercentage
              }%
            </div>

            <div
              style={
                styles.levelBadge
              }
            >
              {
                result.level ||
                "نیاز به تمرین"
              }
            </div>
          </div>

          <div
            style={styles.statsGrid}
          >
            <StatCard
              icon="✅"
              title="پاسخ صحیح"
              value={
                result.correct
              }
            />

            <StatCard
              icon="❌"
              title="پاسخ غلط"
              value={
                result.wrong
              }
            />

            <StatCard
              icon="📝"
              title="تعداد سوال"
              value={
                result.totalQuestions
              }
            />

            <StatCard
              icon="⭐"
              title="امتیاز"
              value={
                result.score
              }
            />
          </div>

          <div
            style={styles.aiCard}
          >
            <div
              style={
                styles.aiTitle
              }
            >
              🤖 تحلیل هوشمند MathVerse
            </div>

            <p
              style={
                styles.aiMessage
              }
            >
              {
                result.aiMessage ||
                "عملکرد شما توسط سیستم هوشمند بررسی شد."
              }
            </p>

            {Array.isArray(
              result.strengths,
            ) &&
              result.strengths
                .length > 0 && (
                <div
                  style={
                    styles.analysisSection
                  }
                >
                  <h3>
                    💪 نقاط قوت
                  </h3>

                  {result.strengths.map(
                    (
                      item: string,
                      index: number,
                    ) => (
                      <div
                        key={index}
                        style={
                          styles.strengthItem
                        }
                      >
                        ✓{" "}
                        {item}
                      </div>
                    ),
                  )}
                </div>
              )}

            {Array.isArray(
              result.weaknesses,
            ) &&
              result.weaknesses
                .length > 0 && (
                <div
                  style={
                    styles.analysisSection
                  }
                >
                  <h3>
                    📌 نیاز به مرور
                  </h3>

                  {result.weaknesses.map(
                    (
                      item: string,
                      index: number,
                    ) => (
                      <div
                        key={index}
                        style={
                          styles.weaknessItem
                        }
                      >
                        •{" "}
                        {item}
                      </div>
                    ),
                  )}
                </div>
              )}
          </div>

          <div
            style={
              styles.reviewContainer
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              📚 بررسی سوالات
            </h2>

            <p
              style={
                styles.sectionDescription
              }
            >
              در این بخش می‌توانید سوالاتی را که اشتباه پاسخ داده‌اید بررسی کنید و راه‌حل آموزشی MathVerse را ببینید.
            </p>

            {questionsReview.length ===
            0 ? (
              <div
                style={
                  styles.emptyReview
                }
              >
                🎯 همه سوالات را درست پاسخ دادید!
              </div>
            ) : (
              questionsReview.map(
                (
                  item: any,
                  index: number,
                ) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.questionReview,
                      borderRight:
                        item.correct
                          ? "5px solid #22c55e"
                          : "5px solid #ef4444",
                    }}
                  >
                    <div
                      style={
                        styles.questionNumber
                      }
                    >
                      سوال{" "}
                      {index + 1}
                    </div>

                    <h3
                      style={
                        styles.reviewQuestionTitle
                      }
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p
                        style={
                          styles.description
                        }
                      >
                        {
                          item.description
                        }
                      </p>
                    )}

                    <div
                      style={
                        styles.answerRow
                      }
                    >
                      <span>
                        پاسخ شما:
                      </span>

                      <strong>
                        {
                          item.answer
                        }
                      </strong>
                    </div>

                    <div
                      style={
                        styles.answerRow
                      }
                    >
                      <span>
                        پاسخ صحیح:
                      </span>

                      <strong>
                        {
                          item.correctAnswer
                        }
                      </strong>
                    </div>

                    {item.correct ? (
                      <div
                        style={
                          styles.correctBox
                        }
                      >
                        ✅ پاسخ شما صحیح بود
                      </div>
                    ) : (
                      <div>
                        <div
                          style={
                            styles.wrongBox
                          }
                        >
                          ❌ این سوال نیاز به مرور دارد.
                        </div>

                        <button
                          onClick={() => {
                            if (
                              showSolution ===
                              item.id
                            ) {
                              setShowSolution(
                                null,
                              );
                            } else {
                              setShowSolution(
                                item.id,
                              );
                            }
                          }}
                          style={
                            styles.solutionButton
                          }
                        >
                          {showSolution ===
                          item.id
                            ? "▲ بستن راه‌حل"
                            : "🤖 نمایش راه‌حل MathVerse"}
                        </button>

                        {showSolution ===
                          item.id && (
                          <div
                            style={
                              styles.solutionBox
                            }
                          >
                            <h4>
                              🤖 راه‌حل آموزشی MathVerse
                            </h4>

                            <div
                              style={
                                styles.solutionText
                              }
                            >
                              {
                                item.explanation ||
                                item.solution ||
                                "برای این سوال هنوز راه‌حل آموزشی ثبت نشده است."
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ),
              )
            )}
          </div>

          <button
            onClick={() => {
              startedRef.current =
                false;

              setSessionId(null);
              setQuestion(null);
              setResult(null);
              setFinished(false);
              setQuestionsReview([]);
              setAnswerResult(null);
              setSelectedAnswer("");
              setShowSolution(null);

              setWrittenImage(null);
              setWrittenResult(null);
              setWrittenError("");

              startedRef.current =
                true;

              startPractice();
            }}
            style={
              styles.newPracticeButton
            }
          >
            🔄 شروع تمرین هوشمند جدید
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // اگر سوال وجود ندارد
  // =====================================================

  if (!question) {
    return (
      <div style={styles.page}>
        <div
          style={styles.emptyCard}
        >
          <div
            style={styles.emptyIcon}
          >
            🧠
          </div>

          <h2>
            سوالی وجود ندارد
          </h2>

          <p>
            در حال آماده‌سازی تمرین جدید هستیم.
          </p>

          <button
            onClick={() => {
              startedRef.current =
                false;

              startPractice();
            }}
            style={
              styles.retryButton
            }
          >
            🔄 تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // صفحه سوال
  // =====================================================

  return (
    <div style={styles.page}>
      <div
        style={
          styles.practiceContainer
        }
      >
        <div
          style={
            styles.practiceHeader
          }
        >
          <div>
            <div
              style={styles.logoText}
            >
              MathVerse
            </div>

            <h1>
              🧠 تمرین هوشمند
            </h1>
          </div>

          {question.progress && (
            <div
              style={
                styles.progressBox
              }
            >
              <div>
                سوال{" "}
                {
                  question.progress
                    .answered + 1
                }{" "}
                از{" "}
                {
                  question.progress
                    .total
                }
              </div>

              <div
                style={
                  styles.progressBar
                }
              >
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min(
                      question.progress
                        .percentage +
                        10,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {question.adaptive && (
          <div
            style={
              styles.adaptiveCard
            }
          >
            <div>
              🎯 سطح فعلی:{" "}
              <strong>
                {
                  question.adaptive
                    .currentDifficulty
                }
              </strong>
            </div>

            <div>
              📊 سطح سوال:{" "}
              <strong>
                {
                  question.adaptive
                    .questionDifficulty
                }
              </strong>
            </div>
          </div>
        )}

        {answerResult && (
          <div
            style={{
              ...styles.answerStatus,
              background:
                answerResult.correct
                  ? "#dcfce7"
                  : "#fee2e2",
              borderColor:
                answerResult.correct
                  ? "#86efac"
                  : "#fca5a5",
            }}
          >
            {answerResult.correct
              ? "✅ پاسخ ثبت شد"
              : "❌ پاسخ ثبت شد"}

            <span
              style={
                styles.statusHint
              }
            >
              در حال آماده‌سازی سوال بعدی...
            </span>
          </div>
        )}

        <div
          style={
            styles.questionCard
          }
        >
          <div
            style={
              styles.questionTag
            }
          >
            سوال
          </div>

          <h2
            style={
              styles.questionTitle
            }
          >
            {question.title}
          </h2>

          {question.description && (
            <p
              style={
                styles.questionDescription
              }
            >
              {
                question.description
              }
            </p>
          )}

          <Option
            text={
              question.optionA
            }
            code="A"
            selected={
              selectedAnswer
            }
            set={
              setSelectedAnswer
            }
            disabled={
              submitting ||
              !!answerResult
            }
          />

          <Option
            text={
              question.optionB
            }
            code="B"
            selected={
              selectedAnswer
            }
            set={
              setSelectedAnswer
            }
            disabled={
              submitting ||
              !!answerResult
            }
          />

          <Option
            text={
              question.optionC
            }
            code="C"
            selected={
              selectedAnswer
            }
            set={
              setSelectedAnswer
            }
            disabled={
              submitting ||
              !!answerResult
            }
          />

          <Option
            text={
              question.optionD
            }
            code="D"
            selected={
              selectedAnswer
            }
            set={
              setSelectedAnswer
            }
            disabled={
              submitting ||
              !!answerResult
            }
          />

          <button
            disabled={
              !selectedAnswer ||
              submitting ||
              !!answerResult
            }
            onClick={
              submitAnswer
            }
            style={{
              ...styles.submitButton,
              opacity:
                !selectedAnswer ||
                submitting ||
                answerResult
                  ? 0.6
                  : 1,
            }}
          >
            {submitting
              ? "⏳ در حال بررسی..."
              : "ثبت پاسخ ➜"}
          </button>

          <div
            style={
              styles.writtenAnswerCard
            }
          >
            <div
              style={
                styles.writtenAnswerTitle
              }
            >
              ✍️ پاسخ تشریحی
            </div>

            <p
              style={
                styles.writtenAnswerDescription
              }
            >
              اگر این سوال را به صورت تشریحی حل کرده‌اید، می‌توانید عکس دست‌نویس خود را ارسال کنید تا MathVerse آن را بررسی کند.
            </p>

            <label
              style={
                styles.fileLabel
              }
            >
              📷 انتخاب تصویر پاسخ
              <input
                type="file"
                accept="image/*"
                onChange={
                  handleWrittenImageChange
                }
                disabled={
                  writtenLoading
                }
                style={
                  styles.fileInput
                }
              />
            </label>

            {writtenImage && (
              <div
                style={
                  styles.selectedFile
                }
              >
                📎{" "}
                {writtenImage.name}
              </div>
            )}

            {writtenError && (
              <div
                style={
                  styles.writtenError
                }
              >
                ❌{" "}
                {writtenError}
              </div>
            )}

            <button
              type="button"
              onClick={
                analyzeWrittenAnswer
              }
              disabled={
                !writtenImage ||
                writtenLoading
              }
              style={{
                ...styles.analyzeWrittenButton,
                opacity:
                  !writtenImage ||
                  writtenLoading
                    ? 0.6
                    : 1,
              }}
            >
              {writtenLoading
                ? "⏳ در حال تحلیل پاسخ..."
                : "🔍 تحلیل پاسخ تشریحی"}
            </button>

            {writtenResult && (
              <WrittenAnswerResult
                result={
                  writtenResult
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// نتیجه پاسخ تشریحی
// =====================================================

function WrittenAnswerResult({
  result,
}: any) {
  const analysis =
    result?.analysis ||
    result?.result ||
    result;

  const isCorrect =
    analysis?.isCorrect ??
    analysis?.correct ??
    analysis?.is_correct;

  const errorType =
    analysis?.errorType ||
    analysis?.error_type;

  const explanation =
    analysis?.explanation ||
    analysis?.feedback ||
    analysis?.message;

  const solution =
    analysis?.solution ||
    analysis?.correctSolution;

  return (
    <div
      style={
        styles.writtenResult
      }
    >
      <div
        style={
          styles.writtenResultTitle
        }
      >
        🤖 نتیجه تحلیل MathVerse
      </div>

      {typeof isCorrect ===
        "boolean" && (
        <div
          style={{
            ...styles.writtenStatus,
            background:
              isCorrect
                ? "#dcfce7"
                : "#fee2e2",
            color:
              isCorrect
                ? "#166534"
                : "#991b1b",
          }}
        >
          {isCorrect
            ? "✅ پاسخ تشریحی صحیح است"
            : "❌ پاسخ تشریحی نیاز به اصلاح دارد"}
        </div>
      )}

      {errorType && (
        <div
          style={
            styles.writtenResultRow
          }
        >
          <strong>
            🔎 نوع خطا:
          </strong>

          <span>
            {errorType}
          </span>
        </div>
      )}

      {explanation && (
        <div
          style={
            styles.writtenExplanation
          }
        >
          <strong>
            💡 توضیح آموزشی
          </strong>

          <p>
            {explanation}
          </p>
        </div>
      )}

      {solution && (
        <div
          style={
            styles.writtenExplanation
          }
        >
          <strong>
            📚 راه‌حل صحیح
          </strong>

          <p>
            {solution}
          </p>
        </div>
      )}

      <div
        style={
          styles.writtenSaved
        }
      >
        📈 نتیجه این تحلیل در سیستم یادگیری MathVerse ثبت شد.
      </div>
    </div>
  );
}

// =====================================================
// Option Component
// =====================================================

function Option({
  text,
  code,
  selected,
  set,
  disabled,
}: any) {
  return (
    <button
      disabled={disabled}
      onClick={() =>
        set(code)
      }
      style={{
        ...styles.option,
        ...(selected === code
          ? styles.selectedOption
          : {}),
      }}
    >
      <span
        style={
          styles.optionCode
        }
      >
        {code}
      </span>

      <span>
        {text}
      </span>
    </button>
  );
}

// =====================================================
// Stat Card
// =====================================================

function StatCard({
  icon,
  title,
  value,
}: any) {
  return (
    <div
      style={
        styles.statCard
      }
    >
      <div
        style={
          styles.statIcon
        }
      >
        {icon}
      </div>

      <div
        style={
          styles.statTitle
        }
      >
        {title}
      </div>

      <div
        style={
          styles.statValue
        }
      >
        {value}
      </div>
    </div>
  );
}

// =====================================================
// Styles
// =====================================================

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc, #eef2ff)",
    padding: "30px 15px",
    direction: "rtl",
    fontFamily:
      "Arial, Tahoma, sans-serif",
    boxSizing: "border-box",
  },

  loadingCard: {
    maxWidth: "600px",
    margin: "100px auto",
    background: "white",
    padding: "50px 30px",
    borderRadius: "24px",
    textAlign: "center",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.08)",
  },

  loadingIcon: {
    fontSize: "60px",
    marginBottom: "15px",
  },

  loadingText: {
    marginTop: "20px",
    color: "#64748b",
    fontSize: "14px",
  },

  practiceContainer: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  practiceHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  logoText: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#4f46e5",
  },

  progressBox: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    minWidth: "180px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
    fontSize: "13px",
  },

  progressBar: {
    height: "7px",
    background: "#e5e7eb",
    borderRadius: "20px",
    marginTop: "8px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background:
      "linear-gradient(90deg, #06b6d4, #6366f1)",
    borderRadius: "20px",
    transition:
      "width 0.3s",
  },

  adaptiveCard: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "15px",
    background: "#eef2ff",
    border:
      "1px solid #c7d2fe",
    padding: "15px 20px",
    borderRadius: "14px",
    marginBottom: "20px",
    color: "#3730a3",
  },

  answerStatus: {
    padding: "15px 20px",
    borderRadius: "12px",
    border: "1px solid",
    marginBottom: "20px",
    fontWeight: "bold",
  },

  statusHint: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    fontWeight: "normal",
    color: "#64748b",
  },

  questionCard: {
    background: "white",
    padding: "35px",
    borderRadius: "22px",
    boxShadow:
      "0 10px 35px rgba(0,0,0,0.07)",
  },

  questionTag: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "13px",
    marginBottom: "15px",
  },

  questionTitle: {
    lineHeight: 1.8,
    marginTop: 0,
  },

  questionDescription: {
    color: "#64748b",
    marginBottom: "25px",
  },

  option: {
    width: "100%",
    padding: "17px",
    marginTop: "12px",
    textAlign: "right",
    borderRadius: "12px",
    border:
      "2px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition:
      "all 0.2s",
  },

  selectedOption: {
    border:
      "2px solid #4f46e5",
    background: "#eef2ff",
  },

  optionCode: {
    minWidth: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontWeight: "bold",
  },

  submitButton: {
    width: "100%",
    padding: "17px",
    marginTop: "25px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, #4f46e5, #7c3aed)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  writtenAnswerCard: {
    marginTop: "30px",
    padding: "25px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #f8fafc, #eef2ff)",
    border:
      "1px solid #c7d2fe",
  },

  writtenAnswerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#3730a3",
  },

  writtenAnswerDescription: {
    color: "#64748b",
    lineHeight: 1.9,
  },

  fileLabel: {
    display: "block",
    padding: "14px",
    borderRadius: "12px",
    border:
      "2px dashed #818cf8",
    background: "white",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#4338ca",
  },

  fileInput: {
    display: "block",
    width: "100%",
    marginTop: "10px",
  },

  selectedFile: {
    marginTop: "12px",
    padding: "10px",
    background: "#e0e7ff",
    borderRadius: "8px",
    color: "#3730a3",
    fontSize: "14px",
  },

  writtenError: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#fee2e2",
    color: "#991b1b",
  },

  analyzeWrittenButton: {
    width: "100%",
    marginTop: "15px",
    padding: "15px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, #0891b2, #4f46e5)",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },

  writtenResult: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "14px",
    background: "white",
    border:
      "1px solid #cbd5e1",
  },

  writtenResultTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#4338ca",
    marginBottom: "15px",
  },

  writtenStatus: {
    padding: "13px",
    borderRadius: "10px",
    fontWeight: "bold",
  },

  writtenResultRow: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "8px",
  },

  writtenExplanation: {
    marginTop: "15px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "10px",
    lineHeight: 1.9,
  },

  writtenSaved: {
    marginTop: "15px",
    padding: "12px",
    background: "#ecfdf5",
    color: "#166534",
    borderRadius: "10px",
    fontSize: "13px",
  },

  resultContainer: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  resultHeader: {
    background: "white",
    padding: "35px",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow:
      "0 10px 35px rgba(0,0,0,0.06)",
  },

  successIcon: {
    fontSize: "60px",
  },

  accuracyCard: {
    marginTop: "20px",
    background:
      "linear-gradient(135deg, #312e81, #4f46e5)",
    color: "white",
    borderRadius: "22px",
    padding: "35px",
    textAlign: "center",
  },

  accuracyLabel: {
    fontSize: "15px",
    opacity: 0.9,
  },

  accuracyNumber: {
    fontSize: "65px",
    fontWeight: "bold",
    margin: "10px 0",
  },

  levelBadge: {
    display: "inline-block",
    padding: "8px 18px",
    background:
      "rgba(255,255,255,0.18)",
    borderRadius: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "20px",
  },

  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.05)",
  },

  statIcon: {
    fontSize: "25px",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "8px",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "5px",
  },

  aiCard: {
    background: "white",
    marginTop: "20px",
    padding: "25px",
    borderRadius: "18px",
    border:
      "1px solid #e0e7ff",
  },

  aiTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#4338ca",
  },

  aiMessage: {
    lineHeight: 1.9,
    color: "#475569",
  },

  analysisSection: {
    marginTop: "20px",
  },

  strengthItem: {
    padding: "10px",
    marginTop: "7px",
    background: "#f0fdf4",
    borderRadius: "8px",
    color: "#166534",
  },

  weaknessItem: {
    padding: "10px",
    marginTop: "7px",
    background: "#fff7ed",
    borderRadius: "8px",
    color: "#9a3412",
  },

  reviewContainer: {
    marginTop: "30px",
  },

  sectionTitle: {
    marginBottom: "5px",
  },

  sectionDescription: {
    color: "#64748b",
    marginBottom: "20px",
  },

  questionReview: {
    background: "white",
    padding: "25px",
    marginBottom: "18px",
    borderRadius: "16px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.05)",
  },

  questionNumber: {
    color: "#6366f1",
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "10px",
  },

  reviewQuestionTitle: {
    lineHeight: 1.8,
  },

  description: {
    color: "#64748b",
  },

  answerRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    padding: "10px",
    background: "#f8fafc",
    borderRadius: "8px",
  },

  correctBox: {
    marginTop: "15px",
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "10px",
  },

  wrongBox: {
    marginTop: "15px",
    padding: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "10px",
  },

  solutionButton: {
    marginTop: "15px",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  solutionBox: {
    marginTop: "15px",
    padding: "20px",
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  solutionText: {
    whiteSpace: "pre-wrap",
    lineHeight: 2,
    color: "#334155",
  },

  emptyReview: {
    background: "#f0fdf4",
    color: "#166534",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
  },

  newPracticeButton: {
    width: "100%",
    padding: "17px",
    marginTop: "25px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(90deg, #0891b2, #4f46e5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  emptyCard: {
    maxWidth: "600px",
    margin: "80px auto",
    background: "white",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "50px",
  },

  retryButton: {
    marginTop: "20px",
    padding: "13px 25px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    cursor: "pointer",
  },
};

