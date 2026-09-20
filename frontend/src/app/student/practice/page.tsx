"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = "http://localhost:4000";

type Question = {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  chapter?: string;
  difficulty?: number;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  score?: number;
  generatedBy?: string;
};

type AnswerResult = {
  success?: boolean;
  correct?: boolean;
  answer?: string;
  correctAnswer?: string;
  explanation?: string;
  finished?: boolean;
  session?: {
    answeredQuestions?: number;
    totalQuestions?: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    difficulty?: number;
  };
};

type ReviewQuestion = {
  questionId?: number;
  question?: Question;
  answer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  correct?: boolean;
  explanation?: string;
  needReview?: boolean;
  solution?: string;
};

type PracticeResult = {
  success?: boolean;
  session?: {
    answeredQuestions?: number;
    totalQuestions?: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    difficulty?: number;
  };
  accuracy?: number;
  score?: number;
  questions?: ReviewQuestion[];
  weakChapters?: string[];
  reviewChapters?: string[];
  message?: string;
};

export default function StudentPracticePage() {
  const searchParams = useSearchParams();

  const studentId =
    Number(searchParams.get("studentId")) || 1;

  const startedRef = useRef(false);

  const [sessionId, setSessionId] =
    useState<number | null>(null);

  const [question, setQuestion] =
    useState<Question | null>(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string>("");

  const [selectedOptionText, setSelectedOptionText] =
    useState<string>("");

  const [answerResult, setAnswerResult] =
    useState<AnswerResult | null>(null);

  const [result, setResult] =
    useState<PracticeResult | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [submitting, setSubmitting] =
    useState<boolean>(false);

  const [finished, setFinished] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  // --------------------------------------------------
  // START PRACTICE
  // --------------------------------------------------

  async function startPractice() {
    try {
      setLoading(true);
      setError("");
      setFinished(false);
      setResult(null);
      setAnswerResult(null);
      setSelectedAnswer("");
      setSelectedOptionText("");
      setQuestion(null);
      setSubmitting(false);

      const response = await fetch(
        `${API_URL}/adaptive-learning/start/${studentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Start practice failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "START PRACTICE RESPONSE:",
        data
      );

      const newSessionId =
        Number(
          data.sessionId ??
            data.session?.id ??
            data.id
        );

      if (!newSessionId) {
        throw new Error(
          "Session ID دریافت نشد."
        );
      }

      setSessionId(newSessionId);

      await loadNextQuestion(newSessionId);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطا در شروع تمرین"
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // LOAD NEXT QUESTION
  // --------------------------------------------------

  async function loadNextQuestion(
    currentSessionId: number
  ) {
    try {
      setLoading(true);
      setError("");

      setSelectedAnswer("");
      setSelectedOptionText("");
      setAnswerResult(null);

      const response = await fetch(
        `${API_URL}/adaptive-learning/next-question/${currentSessionId}`
      );

      if (!response.ok) {
        throw new Error(
          `Next question failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "NEXT QUESTION RESPONSE:",
        data
      );

      if (
        data.finished === true ||
        data.completed === true
      ) {
        setFinished(true);
        await loadReport(currentSessionId);
        return;
      }

      const nextQuestion =
        data.question ??
        data.nextQuestion ??
        data;

      if (
        !nextQuestion ||
        !nextQuestion.id
      ) {
        throw new Error(
          "سؤال جدید دریافت نشد."
        );
      }

      setQuestion(nextQuestion);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطا در دریافت سؤال بعدی"
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // GET OPTION TEXT
  // --------------------------------------------------

  function getSelectedOptionText(
    code: string
  ) {
    if (!question) {
      return "";
    }

    const optionMap: Record<
      string,
      string
    > = {
      A: question.optionA ?? "",
      B: question.optionB ?? "",
      C: question.optionC ?? "",
      D: question.optionD ?? "",
    };

    return optionMap[code] ?? "";
  }

  // --------------------------------------------------
  // SELECT OPTION
  // --------------------------------------------------

  function handleOptionSelect(
    code: string,
    text: string
  ) {
    console.log(
      "OPTION CLICKED:",
      {
        code,
        text,
      }
    );

    setSelectedAnswer(code);
    setSelectedOptionText(text);
    setAnswerResult(null);
  }

  // --------------------------------------------------
  // SUBMIT ANSWER
  // --------------------------------------------------

  async function submitAnswer() {
    if (
      !sessionId ||
      !question ||
      !selectedAnswer ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const answerValue =
        selectedOptionText ||
        getSelectedOptionText(
          selectedAnswer
        );

      console.log(
        "SUBMIT ANSWER DEBUG:",
        {
          sessionId,
          studentId,
          questionId: question.id,
          selectedAnswer,
          answerValue,
        }
      );

      const response = await fetch(
        `${API_URL}/adaptive-learning/submit-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            studentId,
            questionId: question.id,
            answer:
              selectedAnswer.toUpperCase(),
            answerValue,
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "SUBMIT ERROR:",
          errorText
        );

        throw new Error(
          `Submit answer failed: ${response.status}`
        );
      }

      const data: AnswerResult =
        await response.json();

      console.log(
        "SUBMIT ANSWER RESPONSE:",
        data
      );

      setAnswerResult(data);

      if (data.finished) {
        setFinished(true);

        await loadReport(
          sessionId
        );

        setSubmitting(false);
        return;
      }

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 700)
      );

      await loadNextQuestion(
        sessionId
      );

      setSubmitting(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطا در ثبت پاسخ"
      );

      setSubmitting(false);
    }
  }

  // --------------------------------------------------
  // LOAD FINAL REPORT
  // --------------------------------------------------

  async function loadReport(
    currentSessionId: number
  ) {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/adaptive-learning/session-report/${currentSessionId}`
      );

      if (!response.ok) {
        throw new Error(
          `Report failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "SESSION REPORT:",
        data
      );

      setResult(data);
      setFinished(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطا در دریافت گزارش"
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // START ON PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (
      !studentId ||
      startedRef.current
    ) {
      return;
    }

    startedRef.current = true;

    startPractice();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const answeredQuestions =
    answerResult?.session
      ?.answeredQuestions ??
    result?.session
      ?.answeredQuestions ??
    0;

  const totalQuestions =
    answerResult?.session
      ?.totalQuestions ??
    result?.session
      ?.totalQuestions ??
    10;

  const correctAnswers =
    answerResult?.session
      ?.correctAnswers ??
    result?.session
      ?.correctAnswers ??
    0;

  const wrongAnswers =
    answerResult?.session
      ?.wrongAnswers ??
    result?.session
      ?.wrongAnswers ??
    0;

  const currentDifficulty =
    answerResult?.session
      ?.difficulty ??
    result?.session
      ?.difficulty ??
    question?.difficulty ??
    1;

  const accuracy =
    result?.accuracy ??
    (answeredQuestions > 0
      ? Math.round(
          (correctAnswers /
            answeredQuestions) *
            100
        )
      : 0);

  const reviewQuestions =
    result?.questions ?? [];

  const weakChapters =
    result?.weakChapters ??
    result?.reviewChapters ??
    [];

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error && !question && !result) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <h2 style={styles.errorTitle}>
              خطا
            </h2>

            <p style={styles.errorText}>
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                startedRef.current =
                  false;

                startPractice();
              }}
              style={styles.primaryButton}
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (
    loading &&
    !question &&
    !result
  ) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingCard}>
            <div style={styles.spinner}>
              ⏳
            </div>

            <h2>
              در حال آماده‌سازی تمرین
            </h2>

            <p>
              سیستم Adaptive Learning
              در حال انتخاب سؤال مناسب
              برای شماست...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // FINAL RESULT
  // --------------------------------------------------

  if (finished && result) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div>
              <div style={styles.brand}>
                MathVerse 🚀
              </div>

              <h1 style={styles.mainTitle}>
                🏆 نتیجه تمرین هوشمند
              </h1>

              <p style={styles.subtitle}>
                گزارش نهایی جلسه
                Adaptive Learning
              </p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatCard
              title="تعداد سؤال"
              value={answeredQuestions}
              icon="📝"
            />

            <StatCard
              title="پاسخ صحیح"
              value={correctAnswers}
              icon="✅"
            />

            <StatCard
              title="پاسخ غلط"
              value={wrongAnswers}
              icon="❌"
            />

            <StatCard
              title="درصد موفقیت"
              value={`${accuracy}%`}
              icon="🎯"
            />
          </div>

          <div style={styles.resultCard}>
            <h2 style={styles.sectionTitle}>
              📊 عملکرد شما
            </h2>

            <div style={styles.progressOuter}>
              <div
                style={{
                  ...styles.progressInner,
                  width: `${Math.min(
                    Math.max(
                      accuracy,
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>

            <div style={styles.progressText}>
              {accuracy}% موفقیت
            </div>
          </div>

          {weakChapters.length >
            0 && (
            <div
              style={
                styles.reviewCard
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                📚 فصل‌های نیازمند
                مرور
              </h2>

              <div
                style={
                  styles.chapterList
                }
              >
                {weakChapters.map(
                  (
                    chapter,
                    index
                  ) => (
                    <div
                      key={`${chapter}-${index}`}
                      style={
                        styles.chapterItem
                      }
                    >
                      🔸 {chapter}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {reviewQuestions.length >
            0 && (
            <div
              style={
                styles.reviewCard
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                📖 مرور پاسخ‌ها
              </h2>

              {reviewQuestions.map(
                (
                  item,
                  index
                ) => (
                  <QuestionReview
                    key={
                      item.questionId ??
                      item.question?.id ??
                      index
                    }
                    item={item}
                    index={index}
                  />
                )
              )}
            </div>
          )}

          <div
            style={
              styles.resultActions
            }
          >
            <button
              type="button"
              onClick={() => {
                startedRef.current =
                  false;

                startPractice();
              }}
              style={
                styles.primaryButton
              }
            >
              🔄 شروع تمرین جدید
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // QUESTION PAGE
  // --------------------------------------------------

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.brand}>
              MathVerse 🚀
            </div>

            <h1 style={styles.mainTitle}>
              🧠 تمرین هوشمند
            </h1>

            <p style={styles.subtitle}>
              Adaptive Learning
            </p>
          </div>

          <div
            style={
              styles.sessionBadge
            }
          >
            Session #{sessionId}
          </div>
        </div>

        <div
          style={
            styles.questionProgress
          }
        >
          <div>
            سؤال{" "}
            <strong>
              {Math.min(
                answeredQuestions + 1,
                totalQuestions
              )}
            </strong>{" "}
            از{" "}
            <strong>
              {totalQuestions}
            </strong>
          </div>

          <div
            style={
              styles.miniProgressOuter
            }
          >
            <div
              style={{
                ...styles.miniProgressInner,
                width: `${Math.min(
                  ((answeredQuestions +
                    (answerResult
                      ? 1
                      : 0)) /
                    totalQuestions) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div style={styles.infoGrid}>
          <InfoBox
            icon="🎯"
            title="سطح فعلی دانش‌آموز"
            value={`${currentDifficulty}`}
          />

          <InfoBox
            icon="📊"
            title="سطح سؤال"
            value={`${question?.difficulty ?? 1}`}
          />

          <InfoBox
            icon="📚"
            title="فصل"
            value={
              question?.chapter ||
              "General"
            }
          />
        </div>

        <div
          style={
            styles.questionCard
          }
        >
          <div
            style={
              styles.questionHeader
            }
          >
            <span
              style={
                styles.questionNumber
              }
            >
              سؤال
            </span>

            <span
              style={
                styles.difficultyBadge
              }
            >
              سطح{" "}
              {question?.difficulty ??
                1}
            </span>
          </div>

          <h2
            style={
              styles.questionTitle
            }
          >
            {question?.title}
          </h2>

          {question?.description && (
            <p
              style={
                styles.description
              }
            >
              {question.description}
            </p>
          )}

          {question?.generatedBy && (
            <div
              style={
                styles.aiBadge
              }
            >
              🤖 {question.generatedBy}
            </div>
          )}

          <div
            style={
              styles.optionsGrid
            }
          >
            <Option
              code="A"
              text={
                question?.optionA ?? ""
              }
              selected={
                selectedAnswer ===
                "A"
              }
              disabled={
                submitting ||
                !!answerResult
              }
              set={
                handleOptionSelect
              }
            />

            <Option
              code="B"
              text={
                question?.optionB ?? ""
              }
              selected={
                selectedAnswer ===
                "B"
              }
              disabled={
                submitting ||
                !!answerResult
              }
              set={
                handleOptionSelect
              }
            />

            <Option
              code="C"
              text={
                question?.optionC ?? ""
              }
              selected={
                selectedAnswer ===
                "C"
              }
              disabled={
                submitting ||
                !!answerResult
              }
              set={
                handleOptionSelect
              }
            />

            <Option
              code="D"
              text={
                question?.optionD ?? ""
              }
              selected={
                selectedAnswer ===
                "D"
              }
              disabled={
                submitting ||
                !!answerResult
              }
              set={
                handleOptionSelect
              }
            />
          </div>

          {answerResult && (
            <div
              style={{
                ...styles.answerResult,
                backgroundColor:
                  answerResult.correct
                    ? "#ecfdf5"
                    : "#fef2f2",
                borderColor:
                  answerResult.correct
                    ? "#10b981"
                    : "#ef4444",
              }}
            >
              <div
                style={
                  styles.answerResultTitle
                }
              >
                {answerResult.correct
                  ? "✅ پاسخ صحیح است"
                  : "❌ پاسخ نادرست است"}
              </div>

              {!answerResult.correct &&
                answerResult.correctAnswer && (
                  <div
                    style={
                      styles.correctAnswer
                    }
                  >
                    پاسخ صحیح:{" "}
                    <strong>
                      {
                        answerResult.correctAnswer
                      }
                    </strong>
                  </div>
                )}

              {answerResult.explanation && (
                <div
                  style={
                    styles.explanation
                  }
                >
                  {answerResult.explanation}
                </div>
              )}

              {!answerResult.finished && (
                <div
                  style={
                    styles.nextText
                  }
                >
                  در حال آماده‌سازی
                  سؤال بعدی...
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              style={
                styles.inlineError
              }
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submitAnswer}
            disabled={
              !selectedAnswer ||
              submitting ||
              !!answerResult
            }
            style={{
              ...styles.submitButton,
              opacity:
                !selectedAnswer ||
                submitting ||
                !!answerResult
                  ? 0.6
                  : 1,
              cursor:
                !selectedAnswer ||
                submitting ||
                !!answerResult
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitting
              ? "در حال ثبت..."
              : "ثبت پاسخ ➜"}
          </button>
        </div>
      </div>
    </main>
  );
}

// --------------------------------------------------
// OPTION COMPONENT
// --------------------------------------------------

function Option({
  code,
  text,
  selected,
  disabled,
  set,
}: {
  code: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  set: (
    code: string,
    text: string
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        set(code, text)
      }
      disabled={disabled}
      style={{
        ...styles.option,
        ...(selected
          ? styles.optionSelected
          : {}),
        opacity: disabled
          ? selected
            ? 1
            : 0.75
          : 1,
        cursor: disabled
          ? "not-allowed"
          : "pointer",
      }}
    >
      <span
        style={{
          ...styles.optionLetter,
          ...(selected
            ? styles.optionLetterSelected
            : {}),
        }}
      >
        {code}
      </span>

      <span
        style={
          styles.optionText
        }
      >
        {text}
      </span>
    </button>
  );
}

// --------------------------------------------------
// INFO BOX
// --------------------------------------------------

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
    <div style={styles.infoBox}>
      <div style={styles.infoIcon}>
        {icon}
      </div>

      <div>
        <div
          style={
            styles.infoTitle
          }
        >
          {title}
        </div>

        <div
          style={
            styles.infoValue
          }
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>
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

// --------------------------------------------------
// QUESTION REVIEW
// --------------------------------------------------

function QuestionReview({
  item,
  index,
}: {
  item: ReviewQuestion;
  index: number;
}) {
  const question =
    item.question;

  // Backend ممکن است correct یا isCorrect برگرداند
  const isCorrect =
    item.isCorrect ??
    item.correct ??
    false;

  return (
    <div
      style={
        styles.reviewQuestion
      }
    >
      <div
        style={
          styles.reviewQuestionHeader
        }
      >
        <strong>
          سؤال {index + 1}
        </strong>

        <span
          style={{
            ...styles.reviewStatus,
            backgroundColor:
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
            ? "صحیح"
            : "غلط"}
        </span>
      </div>

      {question && (
        <div
          style={
            styles.reviewQuestionText
          }
        >
          {question.title}
        </div>
      )}

      <div
        style={
          styles.reviewAnswerRow
        }
      >
        <span>
          پاسخ شما:
        </span>

        <strong>
          {item.answer ?? "-"}
        </strong>
      </div>

      {!isCorrect &&
        item.correctAnswer && (
          <div
            style={
              styles.reviewAnswerRow
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
        )}

      {item.explanation && (
        <div
          style={
            styles.reviewExplanation
          }
        >
          <strong>
            توضیح:
          </strong>{" "}
          {item.explanation}
        </div>
      )}

      {item.needReview && (
        <div
          style={
            styles.needReview
          }
        >
          🔁 این مبحث نیاز به
          مرور بیشتر دارد.
        </div>
      )}

      {item.solution && (
        <div
          style={
            styles.solution
          }
        >
          <strong>
            راه‌حل:
          </strong>

          <div
            style={{
              whiteSpace:
                "pre-wrap",
              marginTop: 8,
            }}
          >
            {item.solution}
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "32px 16px",
    direction: "rtl",
    fontFamily:
      "Tahoma, Arial, sans-serif",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 28,
  },

  brand: {
    fontSize: 18,
    fontWeight: 800,
    color: "#2563eb",
    marginBottom: 8,
  },

  mainTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 16,
  },

  sessionBadge: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: "10px 16px",
    color: "#475569",
    fontWeight: 700,
  },

  questionProgress: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  miniProgressOuter: {
    height: 9,
    background: "#e2e8f0",
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 12,
  },

  miniProgressInner: {
    height: "100%",
    background:
      "linear-gradient(90deg, #2563eb, #7c3aed)",
    borderRadius: 99,
    transition:
      "width 0.3s ease",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 20,
  },

  infoBox: {
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.04)",
  },

  infoIcon: {
    fontSize: 28,
  },

  infoTitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 20,
    fontWeight: 900,
    color: "#0f172a",
  },

  questionCard: {
    background: "#ffffff",
    borderRadius: 24,
    padding: 28,
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.07)",
  },

  questionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  questionNumber: {
    fontSize: 15,
    fontWeight: 800,
    color: "#2563eb",
  },

  difficultyBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 13,
    fontWeight: 800,
  },

  questionTitle: {
    fontSize: 28,
    lineHeight: 1.8,
    margin: "0 0 10px",
    color: "#0f172a",
  },

  description: {
    color: "#64748b",
    marginBottom: 16,
  },

  aiBadge: {
    display: "inline-block",
    background: "#f5f3ff",
    color: "#6d28d9",
    padding: "8px 12px",
    borderRadius: 10,
    marginBottom: 22,
    fontSize: 13,
    fontWeight: 700,
  },

  optionsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: 14,
    marginTop: 10,
  },

  option: {
    border:
      "2px solid #e2e8f0",
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    minHeight: 72,
    display: "flex",
    alignItems: "center",
    gap: 14,
    textAlign: "right",
    fontSize: 17,
    transition:
      "all 0.2s ease",
  },

  optionSelected: {
    border:
      "2px solid #2563eb",
    background: "#eff6ff",
    boxShadow:
      "0 5px 18px rgba(37,99,235,0.12)",
  },

  optionLetter: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    color: "#475569",
    flexShrink: 0,
  },

  optionLetterSelected: {
    background: "#2563eb",
    color: "#ffffff",
  },

  optionText: {
    color: "#0f172a",
    fontWeight: 700,
    lineHeight: 1.6,
  },

  submitButton: {
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "16px 20px",
    marginTop: 22,
    background:
      "linear-gradient(90deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    fontSize: 17,
    fontWeight: 900,
  },

  answerResult: {
    border: "1px solid",
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },

  answerResultTitle: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 10,
  },

  correctAnswer: {
    marginBottom: 10,
    color: "#334155",
  },

  explanation: {
    lineHeight: 1.9,
    color: "#334155",
  },

  nextText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 13,
  },

  inlineError: {
    marginTop: 16,
    background: "#fef2f2",
    color: "#991b1b",
    border:
      "1px solid #fecaca",
    padding: 14,
    borderRadius: 12,
  },

  loadingCard: {
    background: "#ffffff",
    borderRadius: 24,
    padding: 50,
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.07)",
  },

  spinner: {
    fontSize: 40,
    marginBottom: 15,
  },

  errorCard: {
    background: "#ffffff",
    borderRadius: 24,
    padding: 40,
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.07)",
  },

  errorTitle: {
    color: "#dc2626",
    marginBottom: 10,
  },

  errorText: {
    color: "#64748b",
    marginBottom: 20,
  },

  primaryButton: {
    border: "none",
    borderRadius: 14,
    padding: "13px 22px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 20,
  },

  statCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    textAlign: "center",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.04)",
  },

  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  statTitle: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8,
  },

  statValue: {
    color: "#0f172a",
    fontSize: 27,
    fontWeight: 900,
  },

  resultCard: {
    background: "#ffffff",
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
    border:
      "1px solid #e2e8f0",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontSize: 21,
    color: "#0f172a",
  },

  progressOuter: {
    height: 18,
    background: "#e2e8f0",
    borderRadius: 99,
    overflow: "hidden",
  },

  progressInner: {
    height: "100%",
    background:
      "linear-gradient(90deg, #2563eb, #7c3aed)",
    borderRadius: 99,
    transition:
      "width 0.5s ease",
  },

  progressText: {
    textAlign: "center",
    marginTop: 12,
    fontWeight: 900,
    color: "#334155",
  },

  reviewCard: {
    background: "#ffffff",
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
    border:
      "1px solid #e2e8f0",
  },

  chapterList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  chapterItem: {
    background: "#fff7ed",
    border:
      "1px solid #fed7aa",
    color: "#9a3412",
    padding: 13,
    borderRadius: 12,
    fontWeight: 700,
  },

  reviewQuestion: {
    border:
      "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  reviewQuestionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  reviewStatus: {
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
  },

  reviewQuestionText: {
    fontSize: 17,
    fontWeight: 800,
    lineHeight: 1.8,
    marginBottom: 14,
  },

  reviewAnswerRow: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
    color: "#475569",
  },

  reviewExplanation: {
    background: "#f8fafc",
    borderRadius: 12,
    padding: 13,
    marginTop: 12,
    lineHeight: 1.8,
    color: "#334155",
  },

  needReview: {
    background: "#fff7ed",
    color: "#9a3412",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    fontWeight: 700,
  },

  solution: {
    background: "#eff6ff",
    color: "#1e3a8a",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    lineHeight: 1.8,
  },

  resultActions: {
    textAlign: "center",
    paddingBottom: 30,
  },
};