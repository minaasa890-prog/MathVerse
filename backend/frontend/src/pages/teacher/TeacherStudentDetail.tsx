import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://192.168.43.167:4000";

export default function TeacherStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<any>(null);
  const [practice, setPractice] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [practiceLoading, setPracticeLoading] = useState(true);

  const [error, setError] = useState("");
  const [practiceError, setPracticeError] = useState("");

  useEffect(() => {
    if (!studentId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("توکن ورود پیدا نشد.");
      setLoading(false);
      setPracticeLoading(false);
      return;
    }

    /* =========================
       AI Analysis
    ========================= */

    fetch(
      `${API_URL}/teacher/student/${studentId}/ai-analysis`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message ||
              "خطا در دریافت تحلیل دانش‌آموز"
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          "TEACHER STUDENT ANALYSIS:",
          data
        );

        setAnalysis(data);
      })
      .catch((err) => {
        console.error(
          "TEACHER STUDENT ANALYSIS ERROR:",
          err
        );

        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    /* =========================
       Practice
    ========================= */

    fetch(
      `${API_URL}/teacher/student/${studentId}/practice`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message ||
              "خطا در دریافت تمرین پیشنهادی"
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          "TEACHER STUDENT PRACTICE:",
          data
        );

        setPractice(data);
      })
      .catch((err) => {
        console.error(
          "TEACHER STUDENT PRACTICE ERROR:",
          err
        );

        setPracticeError(err.message);
      })
      .finally(() => {
        setPracticeLoading(false);
      });
  }, [studentId]);

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          direction: "rtl",
        }}
      >
        <h2>
          در حال دریافت تحلیل دانش‌آموز...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "30px",
          direction: "rtl",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ← بازگشت
        </button>

        <h2>خطا</h2>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        direction: "rtl",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* =========================
          Back
      ========================= */}

      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 18px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← بازگشت
      </button>

      {/* =========================
          Header
      ========================= */}

      <h1>تحلیل دانش‌آموز</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>
          {analysis?.name || "دانش‌آموز"}
        </h2>

        <p>
          شناسه دانش‌آموز:{" "}
          {analysis?.studentId}
        </p>

        <p>
          سطح یادگیری:{" "}
          {analysis?.level || "-"}
        </p>

        <p>
          میانگین عملکرد:{" "}
          {analysis?.average ?? 0}
        </p>
      </div>

      {/* =========================
          Weak Topics
      ========================= */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>🔴 نقاط ضعف</h2>

        {analysis?.weakTopics?.length ? (
          <ul>
            {analysis.weakTopics.map(
              (topic: any, index: number) => (
                <li key={index}>
                  {typeof topic === "string"
                    ? topic
                    : topic.topic ||
                      topic.name ||
                      topic.title ||
                      JSON.stringify(topic)}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            موردی ثبت نشده است.
          </p>
        )}
      </div>

      {/* =========================
          Strong Topics
      ========================= */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>🟢 نقاط قوت</h2>

        {analysis?.strongTopics?.length ? (
          <ul>
            {analysis.strongTopics.map(
              (topic: any, index: number) => (
                <li key={index}>
                  {typeof topic === "string"
                    ? topic
                    : topic.topic ||
                      topic.name ||
                      topic.title ||
                      JSON.stringify(topic)}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            موردی ثبت نشده است.
          </p>
        )}
      </div>

      {/* =========================
          Learning Plan
      ========================= */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>
          📚 برنامه یادگیری پیشنهادی
        </h2>

        {analysis?.learningPlan?.length ? (
          <ol>
            {analysis.learningPlan.map(
              (item: any, index: number) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  {typeof item === "string"
                    ? item
                    : item.title ||
                      item.name ||
                      item.description ||
                      JSON.stringify(item)}
                </li>
              )
            )}
          </ol>
        ) : (
          <p>
            برنامه‌ای ثبت نشده است.
          </p>
        )}
      </div>

      {/* =========================
          Practice
      ========================= */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>
          📝 تمرین پیشنهادی
        </h2>

        {practiceLoading ? (
          <p>
            در حال دریافت تمرین پیشنهادی...
          </p>
        ) : practiceError ? (
          <p>{practiceError}</p>
        ) : (
          <>
            <p>
              موضوع:{" "}
              <strong>
                {practice?.subject || "-"}
              </strong>
            </p>

            <p>
              سطح:{" "}
              <strong>
                {practice?.level || "-"}
              </strong>
            </p>

            {practice?.practice?.length ? (
              <ol>
                {practice.practice.map(
                  (item: any, index: number) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: "12px",
                      }}
                    >
                      {typeof item === "string"
                        ? item
                        : item.question ||
                          item.title ||
                          item.description ||
                          JSON.stringify(item)}
                    </li>
                  )
                )}
              </ol>
            ) : (
              <p>
                تمرین پیشنهادی‌ای ثبت نشده است.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}