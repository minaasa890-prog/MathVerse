import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";

const STUDENT_ID = 1;

type PracticeQuestion = {
  id: number;
  title: string;
  difficulty: string;
  subject: string;
};

type PracticeResponse = {
  studentId: number;
  type: string;
  focusTopic: string;
  questions: PracticeQuestion[];
  recommendations: string[];
};

type ReportResponse = {
  studentId: number;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  level: string;
  recommendations: string[];
};

type ChatResponse = {
  studentId: number;
  question: string;
  answer: string;
  suggestions: string[];
  message: string;
};

export default function StudentAI() {
  const [practice, setPractice] =
    useState<PracticeResponse | null>(null);

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [question, setQuestion] = useState("");

  const [chatAnswer, setChatAnswer] =
    useState<ChatResponse | null>(null);

  const [loadingPractice, setLoadingPractice] =
    useState(true);

  const [loadingReport, setLoadingReport] =
    useState(true);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadAIData();
  }, []);

  async function loadAIData() {
    setError("");

    try {
      const [practiceResponse, reportResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/ai-tutor/practice/${STUDENT_ID}`
          ),
          fetch(
            `${API_URL}/ai-tutor/report/${STUDENT_ID}`
          ),
        ]);

      if (!practiceResponse.ok) {
        throw new Error(
          "خطا در دریافت تمرین‌های پیشنهادی"
        );
      }

      if (!reportResponse.ok) {
        throw new Error(
          "خطا در دریافت گزارش عملکرد"
        );
      }

      const practiceData =
        await practiceResponse.json();

      const reportData =
        await reportResponse.json();

      setPractice(practiceData);
      setReport(reportData);
    } catch (err) {
      console.error(err);

      setError(
        "ارتباط با سرور AI Tutor برقرار نشد."
      );
    } finally {
      setLoadingPractice(false);
      setLoadingReport(false);
    }
  }

  async function sendQuestion() {
    if (!question.trim()) {
      return;
    }

    setChatLoading(true);
    setChatAnswer(null);

    try {
      const response = await fetch(
        `${API_URL}/ai-tutor/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: STUDENT_ID,
            question: question.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "خطا در ارتباط با AI Tutor"
        );
      }

      const data: ChatResponse =
        await response.json();

      setChatAnswer(data);
    } catch (err) {
      console.error(err);

      setChatAnswer({
        studentId: STUDENT_ID,
        question,
        answer:
          "در دریافت پاسخ مشکلی پیش آمد. دوباره تلاش کنید.",
        suggestions: [],
        message: "Error",
      });
    } finally {
      setChatLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      sendQuestion();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        direction: "rtl",
        fontFamily: "Tahoma, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            marginBottom: "20px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            🤖 دستیار هوشمند MathVerse
          </h1>

          <p
            style={{
              color: "#666",
              marginBottom: 0,
            }}
          >
            با کمک AI Tutor تمرین کن، عملکردت را
            ببین و سؤالات ریاضی خودت را بپرس.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div
            style={{
              background: "#ffe5e5",
              color: "#b00020",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Report */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div style={cardStyle}>
            <div style={iconStyle}>🎯</div>

            <h3>دقت عملکرد</h3>

            {loadingReport ? (
              <p>در حال دریافت...</p>
            ) : (
              <strong
                style={{
                  fontSize: "30px",
                }}
              >
                {report?.accuracy ?? 0}%
              </strong>
            )}
          </div>

          <div style={cardStyle}>
            <div style={iconStyle}>📝</div>

            <h3>تعداد تلاش‌ها</h3>

            {loadingReport ? (
              <p>در حال دریافت...</p>
            ) : (
              <strong
                style={{
                  fontSize: "30px",
                }}
              >
                {report?.totalAttempts ?? 0}
              </strong>
            )}
          </div>

          <div style={cardStyle}>
            <div style={iconStyle}>✅</div>

            <h3>پاسخ‌های صحیح</h3>

            {loadingReport ? (
              <p>در حال دریافت...</p>
            ) : (
              <strong
                style={{
                  fontSize: "30px",
                }}
              >
                {report?.correctAnswers ?? 0}
              </strong>
            )}
          </div>

          <div style={cardStyle}>
            <div style={iconStyle}>🏆</div>

            <h3>سطح فعلی</h3>

            {loadingReport ? (
              <p>در حال دریافت...</p>
            ) : (
              <strong
                style={{
                  fontSize: "22px",
                }}
              >
                {report?.level ?? "Beginner"}
              </strong>
            )}
          </div>
        </div>

        {/* AI Chat */}

        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <h2>💬 از AI Tutor سؤال بپرس</h2>

          <p
            style={{
              color: "#666",
            }}
          >
            سؤال ریاضی خودت را بنویس و پاسخ
            راهنمای هوشمند را دریافت کن.
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="مثلاً: ۲ + ۳ چند می‌شود؟"
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                direction: "rtl",
              }}
            />

            <button
              onClick={sendQuestion}
              disabled={
                chatLoading || !question.trim()
              }
              style={{
                padding: "14px 25px",
                border: "none",
                borderRadius: "10px",
                background: "#4f46e5",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {chatLoading
                ? "در حال بررسی..."
                : "پرسیدن سؤال"}
            </button>
          </div>

          {chatAnswer && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "12px",
                background: "#f1f5ff",
              }}
            >
              <h3>🤖 پاسخ AI Tutor</h3>

              <p
                style={{
                  fontSize: "17px",
                  lineHeight: 1.9,
                }}
              >
                {chatAnswer.answer}
              </p>

              {chatAnswer.suggestions.length >
                0 && (
                <>
                  <h4>
                    پیشنهادهای بعدی
                  </h4>

                  <ul>
                    {chatAnswer.suggestions.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Practice */}

        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <h2>📚 تمرین پیشنهادی هوشمند</h2>

          {loadingPractice ? (
            <p>
              در حال دریافت تمرین‌های پیشنهادی...
            </p>
          ) : (
            <>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              >
                <strong>
                  موضوع تمرکز:
                </strong>{" "}
                {practice?.focusTopic || "Math"}
              </div>

              {practice?.questions &&
              practice.questions.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {practice.questions.map(
                    (item, index) => (
                      <div
                        key={item.id}
                        style={{
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "16px",
                          background:
                            "white",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                            marginBottom:
                              "8px",
                          }}
                        >
                          <strong>
                            سؤال {index + 1}
                          </strong>

                          <span>
                            سطح:{" "}
                            {item.difficulty}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "16px",
                            lineHeight: 1.8,
                          }}
                        >
                          {item.title}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>
                  فعلاً تمرین پیشنهادی‌ای
                  پیدا نشد.
                </p>
              )}
            </>
          )}
        </div>

        {/* Recommendations */}

        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <h2>💡 پیشنهادهای AI Tutor</h2>

          <ul
            style={{
              lineHeight: 2.2,
            }}
          >
            {(
              report?.recommendations ||
              practice?.recommendations ||
              []
            ).map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "18px",
  padding: "22px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.06)",
};

const iconStyle: React.CSSProperties = {
  fontSize: "30px",
};