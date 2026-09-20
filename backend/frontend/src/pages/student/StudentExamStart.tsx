import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

export default function StudentExamStart() {
  const { examId } = useParams();

  const { user } = useAuth();

  const studentId = user?.id;

  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [solutions, setSolutions] = useState<any>({});
  const [loadingSolution, setLoadingSolution] =
    useState<number | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    loadExam();
  }, [studentId, examId]);

  // =====================================================
  // LOAD EXAM
  // =====================================================

  async function loadExam() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/exams/${examId}/start/${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const errorText = await res.text();

        console.error(
          "LOAD EXAM ERROR:",
          res.status,
          errorText,
        );

        throw new Error("خطا در دریافت آزمون");
      }

      const data = await res.json();

      console.log("EXAM DATA:", data);

      setExam(data);
    } catch (err) {
      console.error(err);
      setExam(null);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  function selectAnswer(
    questionId: number,
    answer: string,
  ) {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  }

  // =====================================================
  // SUBMIT EXAM
  // =====================================================

  async function submitExam() {
    if (!studentId) {
      alert("کاربر وارد نشده است");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/exams/${examId}/submit`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            studentId,
            answers,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();

        console.error(
          "SUBMIT EXAM ERROR:",
          res.status,
          errorText,
        );

        throw new Error("خطا در ارسال آزمون");
      }

      const data = await res.json();

      console.log("EXAM RESULT:", data);
      console.log("XP FROM API:", data.earnedXP);

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("ارسال آزمون ناموفق بود");
    }
  }

  // =====================================================
  // AI SOLUTION
  // =====================================================

  async function getAiSolution(
    questionId: number,
  ) {
    try {
      setLoadingSolution(questionId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/ai-question/solution/${questionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(
          "خطا در دریافت راه‌حل AI",
        );
      }

      const data = await res.json();

      console.log(
        "AI SOLUTION:",
        data,
      );

      setSolutions({
        ...solutions,
        [questionId]: data.solution,
      });
    } catch (err) {
      console.error(err);

      alert(
        "دریافت راه‌حل AI ناموفق بود",
      );
    } finally {
      setLoadingSolution(null);
    }
  }

  // =====================================================
  // GET RESULT DETAIL FOR QUESTION
  // =====================================================

  function getQuestionResult(
    questionId: number,
  ) {
    if (!result?.details) {
      return null;
    }

    return result.details.find(
      (item: any) =>
        Number(item.questionId) ===
        Number(questionId),
    );
  }

  // =====================================================
  // NO USER
  // =====================================================

  if (!studentId) {
    return (
      <div
        dir="rtl"
        style={{
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h2>
          کاربر وارد نشده است
        </h2>

        <p>
          لطفاً ابتدا وارد حساب کاربری شوید.
        </p>
      </div>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          padding: "30px",
        }}
      >
        <h2>
          در حال دریافت امتحان...
        </h2>
      </div>
    );
  }

  // =====================================================
  // EXAM NOT FOUND
  // =====================================================

  if (!exam) {
    return (
      <div
        dir="rtl"
        style={{
          padding: "30px",
        }}
      >
        <h2>
          امتحان پیدا نشد
        </h2>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      dir="rtl"
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* ================================================= */}
      {/* EXAM HEADER */}
      {/* ================================================= */}

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          borderRadius: "12px",
          background: "#f5f5f5",
        }}
      >
        <h1>
          {exam.title}
        </h1>

        <p>
          مدت آزمون:{" "}
          {exam.duration} دقیقه
        </p>

        <p>
          تعداد سوالات:{" "}
          {exam.questions?.length ?? 0}
        </p>
      </div>

      {/* ================================================= */}
      {/* QUESTIONS */}
      {/* ================================================= */}

      {exam.questions?.map(
        (
          q: any,
          index: number,
        ) => {
          const questionResult =
            getQuestionResult(q.id);

          const isSubmitted =
            !!result;

          const isCorrect =
            questionResult?.isCorrect ===
            true;

          return (
            <div
              key={q.id}
              style={{
                marginBottom: "25px",
                padding: "25px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#fff",
              }}
            >
              <h3>
                {index + 1} -{" "}
                {q.title}
              </h3>

              {q.description && (
                <p
                  style={{
                    color: "#666",
                  }}
                >
                  {q.description}
                </p>
              )}

              {["A", "B", "C", "D"].map(
                (op) => (
                  <label
                    key={op}
                    style={{
                      display: "block",
                      padding: "10px",
                      marginTop: "8px",
                      borderRadius: "8px",
                      background:
                        answers[q.id] === op
                          ? "#eef2ff"
                          : "#fafafa",
                      cursor: isSubmitted
                        ? "default"
                        : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={
                        answers[q.id] ===
                        op
                      }
                      disabled={isSubmitted}
                      onChange={() =>
                        selectAnswer(
                          q.id,
                          op,
                        )
                      }
                    />

                    {" "}

                    {op}){" "}
                    {q[
                      `option${op}`
                    ]}
                  </label>
                ),
              )}

              {isSubmitted &&
                questionResult && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      borderRadius: "10px",
                      background:
                        isCorrect
                          ? "#e8f5e9"
                          : "#ffebee",
                    }}
                  >
                    {isCorrect ? (
                      <p
                        style={{
                          color:
                            "green",
                          fontWeight:
                            "bold",
                        }}
                      >
                        ✅ پاسخ صحیح
                      </p>
                    ) : (
                      <>
                        <p
                          style={{
                            color:
                              "red",
                            fontWeight:
                              "bold",
                          }}
                        >
                          ❌ پاسخ اشتباه
                        </p>

                        <button
                          onClick={() =>
                            getAiSolution(
                              q.id,
                            )
                          }
                          disabled={
                            loadingSolution ===
                            q.id
                          }
                          style={{
                            marginTop:
                              "10px",
                            padding:
                              "10px 16px",
                            border:
                              "none",
                            borderRadius:
                              "8px",
                            background:
                              "#673ab7",
                            color:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          {loadingSolution ===
                          q.id
                            ? "در حال تولید راه‌حل..."
                            : "🧠 مشاهده راه‌حل AI"}
                        </button>

                        {solutions[
                          q.id
                        ] && (
                          <div
                            style={{
                              marginTop:
                                "15px",
                              padding:
                                "15px",
                              borderRadius:
                                "8px",
                              background:
                                "#f3e5f5",
                              lineHeight:
                                "1.8",
                            }}
                          >
                            <h4>
                              راه‌حل
                              آموزشی:
                            </h4>

                            <div>
                              {
                                solutions[
                                  q.id
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
            </div>
          );
        },
      )}

      {/* ================================================= */}
      {/* SUBMIT BUTTON */}
      {/* ================================================= */}

      {!result && (
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <button
            onClick={submitExam}
            style={{
              padding:
                "14px 30px",
              border: "none",
              borderRadius:
                "10px",
              background:
                "#1976d2",
              color: "white",
              fontSize:
                "18px",
              cursor:
                "pointer",
            }}
          >
            ارسال امتحان
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* FINAL RESULT */}
      {/* ================================================= */}

      {result && (
        <div
          style={{
            marginTop: "40px",
            padding: "25px",
            borderRadius: "15px",
            background: "#f5f5f5",
            textAlign: "center",
          }}
        >
          <h2>
            🎯 نتیجه امتحان
          </h2>

          <p>
            تعداد سوالات:{" "}
            {result.total}
          </p>

          <p>
            پاسخ صحیح:{" "}
            {result.correct}
          </p>

          <p>
            درصد:{" "}
            {result.percentage}%
          </p>

          <p>
            امتیاز:{" "}
            {result.earnedScore}
          </p>

          <p>
            XP این تلاش:{" "}
            {result.earnedXP}
          </p>

          {result.earnedXP === 0 && (
            <p
              style={{
                marginTop: "10px",
                color: "#666",
                fontSize: "14px",
              }}
            >
              ℹ️ پاداش XP این سؤال قبلاً دریافت شده است.
            </p>
          )}
        </div>
      )}
    </div>
  );
}