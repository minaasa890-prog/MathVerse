import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://192.168.43.167:4000";

export default function TeacherClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const classroomId = Number(id);

  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [classAnalysis, setClassAnalysis] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [examDetailsLoading, setExamDetailsLoading] = useState(false);
  const [examDetailsError, setExamDetailsError] = useState("");

  const [examStatistics, setExamStatistics] = useState<any>(null);
  const [examStatisticsLoading, setExamStatisticsLoading] =
    useState(false);
  const [examStatisticsError, setExamStatisticsError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentExamResult, setStudentExamResult] = useState<any>(null);
  const [studentExamResultLoading, setStudentExamResultLoading] =
    useState(false);
  const [studentExamResultError, setStudentExamResultError] =
    useState("");

  useEffect(() => {
    if (!classroomId || Number.isNaN(classroomId)) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [
          studentsResponse,
          resultsResponse,
          rankingResponse,
          analysisResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/teacher/class/${classroomId}/students`,
            {
              headers,
            },
          ),
          fetch(
            `${API_URL}/teacher/class/${classroomId}/results`,
            {
              headers,
            },
          ),
          fetch(
            `${API_URL}/teacher/class/${classroomId}/ranking`,
            {
              headers,
            },
          ),
          fetch(
            `${API_URL}/teacher/class/${classroomId}/ai-analysis`,
            {
              headers,
            },
          ),
        ]);

        const studentsData = await studentsResponse.json();
        const resultsData = await resultsResponse.json();
        const rankingData = await rankingResponse.json();
        const analysisData = await analysisResponse.json();

        const studentsArray = Array.isArray(studentsData)
          ? studentsData
          : [];

        const resultsArray = Array.isArray(resultsData)
          ? resultsData
          : [];

        const rankingArray = Array.isArray(rankingData)
          ? rankingData
          : [];

        setStudents(studentsArray);
        setRanking(rankingArray);
        setClassAnalysis(analysisData);

        /*
         * نتایج آزمون‌ها را با جزئیات آزمون ترکیب می‌کنیم
         * تا تعداد واقعی شرکت‌کنندگان مشخص شود.
         */
        const enrichedResults = await Promise.all(
          resultsArray.map(async (exam: any) => {
            try {
              const detailsResponse = await fetch(
                `${API_URL}/teacher/class/${classroomId}/exam/${exam.examId}/details`,
                {
                  headers,
                },
              );

              if (!detailsResponse.ok) {
                return {
                  ...exam,
                  students: Number(exam.students ?? 0),
                  participants: Number(exam.participants ?? 0),
                  examStudents: [],
                };
              }

              const details = await detailsResponse.json();

              const examStudents = Array.isArray(details?.students)
                ? details.students
                : [];

              const participatedStudents =
                examStudents.filter(
                  (student: any) =>
                    student?.status === "PARTICIPATED",
                );

              const studentsWithScores =
                participatedStudents.length > 0
                  ? participatedStudents
                  : examStudents.filter(
                      (student: any) =>
                        student?.score !== undefined &&
                        student?.score !== null &&
                        student?.status !== "ABSENT",
                    );

              const scores = studentsWithScores
                .map((student: any) =>
                  Number(student?.score ?? 0),
                )
                .filter((score: number) =>
                  Number.isFinite(score),
                );

              if (scores.length === 0) {
                return {
                  ...exam,
                  students: 0,
                  participants: 0,
                  averageScore: 0,
                  highestScore: 0,
                  lowestScore: 0,
                  examStudents,
                };
              }

              const averageScore =
                scores.reduce(
                  (sum: number, score: number) =>
                    sum + score,
                  0,
                ) / scores.length;

              const highestScore = Math.max(...scores);
              const lowestScore = Math.min(...scores);

              return {
                ...exam,
                students: scores.length,
                participants: scores.length,
                averageScore,
                highestScore,
                lowestScore,
                examStudents,
              };
            } catch {
              return {
                ...exam,
                students: Number(exam.students ?? 0),
                participants: Number(
                  exam.participants ?? 0,
                ),
                examStudents: [],
              };
            }
          }),
        );

        setResults(enrichedResults);
      } catch (error) {
        console.error(
          "Teacher class detail error:",
          error,
        );

        setStudents([]);
        setResults([]);
        setRanking([]);
        setClassAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classroomId]);

  const getStudentName = (student: any) => {
    return (
      student?.name ||
      student?.fullName ||
      student?.username ||
      student?.email ||
      `دانش‌آموز ${student?.id ?? ""}`
    );
  };

  const getAverageScore = (student: any) => {
    const value =
      student?.averageScore ??
      student?.avgScore ??
      student?.average ??
      student?.score ??
      0;

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const getExamAverage = (exam: any) => {
    const value =
      exam?.averageScore ??
      exam?.avgScore ??
      exam?.average ??
      0;

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const getHighestScore = (exam: any) => {
    const value =
      exam?.highestScore ??
      exam?.highest ??
      exam?.maxScore ??
      0;

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const getLowestScore = (exam: any) => {
    const value =
      exam?.lowestScore ??
      exam?.lowest ??
      exam?.minScore ??
      0;

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const getExamParticipants = (exam: any) => {
    const value = Number(
      exam?.participants ??
        exam?.students ??
        0,
    );

    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, value);
  };

  const getExamTitle = (exam: any) => {
    return (
      exam?.examTitle ||
      exam?.title ||
      `آزمون ${exam?.examId ?? ""}`
    );
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "#16a34a";
    if (score >= 5) return "#f59e0b";
    return "#dc2626";
  };

  const scoreBackground = (score: number) => {
    if (score >= 8) return "#dcfce7";
    if (score >= 5) return "#fef3c7";
    return "#fee2e2";
  };

  const getStudentExamCount = (student: any) => {
    const directCount =
      student?.examCount ??
      student?.examsCount ??
      student?.totalExams ??
      student?.attemptCount ??
      student?.attemptsCount;

    if (
      directCount !== undefined &&
      directCount !== null &&
      !Number.isNaN(Number(directCount))
    ) {
      return Number(directCount);
    }

    if (Array.isArray(student?.exams)) {
      return student.exams.length;
    }

    if (Array.isArray(student?.attempts)) {
      return student.attempts.length;
    }

    if (Array.isArray(student?.examResults)) {
      return student.examResults.length;
    }

    if (Array.isArray(student?.results)) {
      return student.results.length;
    }

    return 0;
  };

  const loadExamDetails = async (exam: any) => {
    try {
      setSelectedExam(exam);
      setExamDetails(null);
      setExamStatistics(null);

      setExamDetailsLoading(true);
      setExamStatisticsLoading(true);

      setExamDetailsError("");
      setExamStatisticsError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [detailsResponse, statisticsResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/teacher/class/${classroomId}/exam/${exam.examId}/details`,
            {
              headers,
            },
          ),
          fetch(
            `${API_URL}/attempts/exam/${exam.examId}/statistics`,
            {
              headers,
            },
          ),
        ]);

      if (!detailsResponse.ok) {
        throw new Error(
          `خطا در دریافت جزئیات آزمون: ${detailsResponse.status}`,
        );
      }

      const detailsData =
        await detailsResponse.json();

      setExamDetails(detailsData);

      if (statisticsResponse.ok) {
        const statisticsData =
          await statisticsResponse.json();

        setExamStatistics(statisticsData);
      } else {
        setExamStatisticsError(
          `خطا در دریافت آمار آزمون: ${statisticsResponse.status}`,
        );
      }
    } catch (error: any) {
      console.error(
        "Exam details error:",
        error,
      );

      setExamDetailsError(
        error?.message ||
          "خطا در دریافت جزئیات آزمون",
      );
    } finally {
      setExamDetailsLoading(false);
      setExamStatisticsLoading(false);
    }
  };

  const loadStudentExamResult = async (
    student: any,
    examId: number,
  ) => {
    try {
      setSelectedStudent(student);
      setStudentExamResult(null);
      setStudentExamResultError("");
      setStudentExamResultLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/attempts/student/${student.id}/exam/${examId}/result`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `خطا در دریافت نتیجه دانش‌آموز: ${response.status}`,
        );
      }

      const data = await response.json();

      setStudentExamResult(data);
    } catch (error: any) {
      console.error(
        "Student exam result error:",
        error,
      );

      setStudentExamResultError(
        error?.message ||
          "نتیجه این آزمون برای دانش‌آموز پیدا نشد.",
      );
    } finally {
      setStudentExamResultLoading(false);
    }
  };

  const closeStudentExamResult = () => {
    setSelectedStudent(null);
    setStudentExamResult(null);
    setStudentExamResultError("");
  };

  const closeExamDetails = () => {
    setSelectedExam(null);
    setExamDetails(null);
    setExamStatistics(null);
    setExamDetailsError("");
    setExamStatisticsError("");

    closeStudentExamResult();
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          padding: 40,
          textAlign: "center",
          fontFamily: "Tahoma",
        }}
      >
        <h2>در حال دریافت اطلاعات کلاس...</h2>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
        fontFamily: "Tahoma",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* BACK */}
        <button
          onClick={() => navigate("/teacher")}
          style={{
            marginBottom: 20,
            padding: "10px 18px",
            border: "none",
            borderRadius: 10,
            background: "#1e293b",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← بازگشت به داشبورد معلم
        </button>

        {/* TITLE */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
            }}
          >
            جزئیات کلاس
          </h1>

          <p
            style={{
              marginTop: 10,
              color: "#64748b",
            }}
          >
            شناسه کلاس: {classroomId}
          </p>
        </div>

        {/* AI ANALYSIS */}
        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2>🤖 تحلیل هوشمند کلاس</h2>

          {!classAnalysis ? (
            <p>
              اطلاعات تحلیل هوشمند در دسترس نیست.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  background: "#eff6ff",
                  padding: 18,
                  borderRadius: 14,
                }}
              >
                <strong>
                  میانگین کلاس
                </strong>

                <div
                  style={{
                    fontSize: 28,
                    marginTop: 8,
                  }}
                >
                  {Number(
                    classAnalysis?.averageScore ??
                      classAnalysis?.classAverage ??
                      0,
                  ).toFixed(1)}
                </div>
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  padding: 18,
                  borderRadius: 14,
                }}
              >
                <strong>
                  دانش‌آموزان قوی
                </strong>

                <div
                  style={{
                    fontSize: 28,
                    marginTop: 8,
                  }}
                >
                  {Array.isArray(
                    classAnalysis?.strongStudents,
                  )
                    ? classAnalysis.strongStudents.length
                    : 0}
                </div>
              </div>

              <div
                style={{
                  background: "#fff7ed",
                  padding: 18,
                  borderRadius: 14,
                }}
              >
                <strong>
                  دانش‌آموزان نیازمند توجه
                </strong>

                <div
                  style={{
                    fontSize: 28,
                    marginTop: 8,
                  }}
                >
                  {Array.isArray(
                    classAnalysis?.weakStudents,
                  )
                    ? classAnalysis.weakStudents.length
                    : 0}
                </div>
              </div>

              <div
                style={{
                  background: "#faf5ff",
                  padding: 18,
                  borderRadius: 14,
                }}
              >
                <strong>
                  موضوعات ضعیف کلاس
                </strong>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  {Array.isArray(
                    classAnalysis?.commonWeakTopics,
                  ) &&
                  classAnalysis.commonWeakTopics
                    .length > 0 ? (
                    classAnalysis.commonWeakTopics.map(
                      (topic: any, index: number) => (
                        <span
                          key={index}
                          style={{
                            display: "inline-block",
                            background: "#ede9fe",
                            padding:
                              "5px 10px",
                            borderRadius: 20,
                            margin:
                              "3px",
                            fontSize: 13,
                          }}
                        >
                          {typeof topic ===
                          "string"
                            ? topic
                            : topic?.topic ||
                              topic?.name ||
                              "موضوع"}
                        </span>
                      ),
                    )
                  ) : (
                    <span>
                      اطلاعاتی ثبت نشده است.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {classAnalysis?.recommendations && (
            <div
              style={{
                marginTop: 20,
                padding: 18,
                background: "#f8fafc",
                borderRadius: 14,
              }}
            >
              <strong>
                💡 پیشنهادهای هوشمند
              </strong>

              <div
                style={{
                  marginTop: 10,
                  lineHeight: 1.9,
                }}
              >
                {Array.isArray(
                  classAnalysis.recommendations,
                ) ? (
                  <ul>
                    {classAnalysis.recommendations.map(
                      (
                        recommendation: any,
                        index: number,
                      ) => (
                        <li key={index}>
                          {typeof recommendation ===
                          "string"
                            ? recommendation
                            : recommendation?.text ||
                              recommendation?.message ||
                              "پیشنهاد"}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  String(
                    classAnalysis.recommendations,
                  )
                )}
              </div>
            </div>
          )}
        </section>

        {/* STUDENTS */}
        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2>دانش‌آموزان</h2>

          {students.length === 0 ? (
            <div
              style={{
                padding: 20,
                background: "#f8fafc",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              دانش‌آموزی در این کلاس ثبت نشده است.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginTop: 20,
              }}
            >
              {students.map((student: any) => {
                const average =
                  getAverageScore(student);

                return (
                  <div
                    key={student.id}
                    style={{
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 18,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <strong>
                        {getStudentName(student)}
                      </strong>

                      <span
                        style={{
                          padding:
                            "5px 9px",
                          borderRadius: 20,
                          background:
                            scoreBackground(
                              average,
                            ),
                          color:
                            scoreColor(
                              average,
                            ),
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {average.toFixed(1)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        color: "#64748b",
                        fontSize: 13,
                        lineHeight: 2,
                      }}
                    >
                      آزمون‌ها:{" "}
                      {getStudentExamCount(
                        student,
                      )}
                      <br />
                      شناسه: {student.id}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* STUDENT PERFORMANCE */}
        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2>
            📈 عملکرد دانش‌آموزان کلاس
          </h2>

          {students.length === 0 ? (
            <p>
              داده‌ای برای نمایش وجود ندارد.
            </p>
          ) : (
            <div
              style={{
                marginTop: 20,
              }}
            >
              {students.map((student: any) => {
                const average =
                  getAverageScore(student);

                return (
                  <div
                    key={student.id}
                    style={{
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: 7,
                      }}
                    >
                      <span>
                        {getStudentName(student)}
                      </span>

                      <strong>
                        {average.toFixed(1)} / 10
                      </strong>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: 14,
                        background: "#e2e8f0",
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              average * 10,
                            ),
                          )}%`,
                          height: "100%",
                          background:
                            scoreColor(
                              average,
                            ),
                          borderRadius: 20,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* EXAM PERFORMANCE */}
        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2>
            📊 تحلیل عملکرد آزمون‌ها
          </h2>

          {results.length === 0 ? (
            <p>
              هنوز آزمونی برای این کلاس ثبت نشده است.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 18,
                marginTop: 20,
              }}
            >
              {results.map((exam: any) => {
                const average =
                  getExamAverage(exam);

                const highest =
                  getHighestScore(exam);

                const lowest =
                  getLowestScore(exam);

                const participants =
                  getExamParticipants(exam);

                const noParticipants =
                  participants === 0;

                return (
                  <div
                    key={exam.examId}
                    style={{
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 20,
                      background:
                        noParticipants
                          ? "#f8fafc"
                          : "#fff",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: 14,
                      }}
                    >
                      {getExamTitle(exam)}
                    </h3>

                    {noParticipants ? (
                      <div
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: "#f1f5f9",
                          color: "#64748b",
                        }}
                      >
                        <strong>
                          بدون شرکت‌کننده
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                          }}
                        >
                          هیچ دانش‌آموزی هنوز
                          در این آزمون شرکت نکرده
                          است.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(3, 1fr)",
                            gap: 8,
                            marginBottom: 18,
                          }}
                        >
                          <div
                            style={{
                              padding: 10,
                              background:
                                "#eff6ff",
                              borderRadius: 10,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color:
                                  "#64748b",
                              }}
                            >
                              میانگین
                            </div>

                            <strong>
                              {average.toFixed(
                                1,
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              padding: 10,
                              background:
                                "#f0fdf4",
                              borderRadius: 10,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color:
                                  "#64748b",
                              }}
                            >
                              بیشترین
                            </div>

                            <strong>
                              {highest.toFixed(
                                1,
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              padding: 10,
                              background:
                                "#fff7ed",
                              borderRadius: 10,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color:
                                  "#64748b",
                              }}
                            >
                              کمترین
                            </div>

                            <strong>
                              {lowest.toFixed(
                                1,
                              )}
                            </strong>
                          </div>
                        </div>

                        <div
                          style={{
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              marginBottom: 6,
                              fontSize: 13,
                            }}
                          >
                            <span>
                              میانگین کلاس
                            </span>

                            <strong>
                              {average.toFixed(
                                1,
                              )}{" "}
                              / 10
                            </strong>
                          </div>

                          <div
                            style={{
                              height: 12,
                              background:
                                "#e2e8f0",
                              borderRadius: 20,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    average *
                                      10,
                                  ),
                                )}%`,
                                height: "100%",
                                background:
                                  scoreColor(
                                    average,
                                  ),
                              }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 13,
                          }}
                        >
                          👥 شرکت‌کننده:{" "}
                          <strong>
                            {participants}
                          </strong>
                        </div>
                      </>
                    )}

                    <button
                      onClick={() =>
                        loadExamDetails(exam)
                      }
                      style={{
                        width: "100%",
                        marginTop: 18,
                        padding: 11,
                        border: "none",
                        borderRadius: 10,
                        background: "#2563eb",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      👁 مشاهده جزئیات آزمون
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* EXAM RESULTS */}
        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2>📋 نتایج آزمون‌ها</h2>

          {results.length === 0 ? (
            <p>
              هنوز نتیجه‌ای ثبت نشده است.
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
                marginTop: 18,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth: 700,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    <th
                      style={{
                        padding: 12,
                        textAlign: "right",
                      }}
                    >
                      آزمون
                    </th>

                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                      }}
                    >
                      شرکت‌کننده
                    </th>

                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                      }}
                    >
                      میانگین
                    </th>

                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                      }}
                    >
                      بیشترین
                    </th>

                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                      }}
                    >
                      جزئیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((exam: any) => {
                    const participants =
                      getExamParticipants(
                        exam,
                      );

                    const average =
                      getExamAverage(exam);

                    const highest =
                      getHighestScore(exam);

                    const noParticipants =
                      participants === 0;

                    return (
                      <tr
                        key={exam.examId}
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <td
                          style={{
                            padding: 12,
                          }}
                        >
                          {getExamTitle(exam)}
                        </td>

                        <td
                          style={{
                            padding: 12,
                            textAlign:
                              "center",
                          }}
                        >
                          {noParticipants ? (
                            <span
                              style={{
                                color:
                                  "#94a3b8",
                              }}
                            >
                              0
                            </span>
                          ) : (
                            participants
                          )}
                        </td>

                        <td
                          style={{
                            padding: 12,
                            textAlign:
                              "center",
                          }}
                        >
                          {noParticipants ? (
                            <span
                              style={{
                                color:
                                  "#94a3b8",
                              }}
                            >
                              —
                            </span>
                          ) : (
                            `${average.toFixed(
                              1,
                            )} / 10`
                          )}
                        </td>

                        <td
                          style={{
                            padding: 12,
                            textAlign:
                              "center",
                          }}
                        >
                          {noParticipants ? (
                            <span
                              style={{
                                color:
                                  "#94a3b8",
                              }}
                            >
                              —
                            </span>
                          ) : (
                            `${highest.toFixed(
                              1,
                            )} / 10`
                          )}
                        </td>

                        <td
                          style={{
                            padding: 12,
                            textAlign:
                              "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              loadExamDetails(
                                exam,
                              )
                            }
                            style={{
                              border: "none",
                              background:
                                "#dbeafe",
                              color:
                                "#1d4ed8",
                              padding:
                                "8px 12px",
                              borderRadius: 8,
                              cursor:
                                "pointer",
                            }}
                          >
                            مشاهده
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RANKING */}
        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2>🏆 رتبه‌بندی</h2>

          {ranking.length === 0 ? (
            <p>
              رتبه‌بندی هنوز اطلاعاتی ندارد.
            </p>
          ) : (
            <div
              style={{
                marginTop: 18,
              }}
            >
              {ranking.map(
                (student: any, index: number) => {
                  const score =
                    getAverageScore(student);

                  return (
                    <div
                      key={
                        student?.id ??
                        student?.studentId ??
                        index
                      }
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        padding: 14,
                        marginBottom: 10,
                        borderRadius: 12,
                        background:
                          index === 0
                            ? "#fef9c3"
                            : "#f8fafc",
                      }}
                    >
                      <div>
                        <strong>
                          {index === 0
                            ? "🥇"
                            : index === 1
                              ? "🥈"
                              : index === 2
                                ? "🥉"
                                : `#${index + 1}`}
                        </strong>

                        <span
                          style={{
                            marginRight: 12,
                          }}
                        >
                          {getStudentName(
                            student,
                          )}
                        </span>
                      </div>

                      <strong>
                        {score.toFixed(1)}
                      </strong>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>

      {/* EXAM DETAILS MODAL */}
      {selectedExam && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "min(1000px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 15,
              }}
            >
              <div>
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  📋 جزئیات آزمون
                </h2>

                <div
                  style={{
                    color: "#64748b",
                  }}
                >
                  {getExamTitle(
                    selectedExam,
                  )}
                </div>
              </div>

              <button
                onClick={closeExamDetails}
                style={{
                  border: "none",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>

            {examDetailsLoading ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                }}
              >
                در حال دریافت جزئیات آزمون...
              </div>
            ) : examDetailsError ? (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: 12,
                }}
              >
                {examDetailsError}
              </div>
            ) : examDetails ? (
              <>
                {/* SUMMARY */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  <div
                    style={{
                      background: "#eff6ff",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      کل دانش‌آموزان
                    </div>

                    <strong
                      style={{
                        fontSize: 25,
                      }}
                    >
                      {examDetails.totalStudents ??
                        0}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f0fdf4",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      شرکت‌کنندگان
                    </div>

                    <strong
                      style={{
                        fontSize: 25,
                      }}
                    >
                      {examDetails.participants ??
                        0}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#fff7ed",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      غایبان
                    </div>

                    <strong
                      style={{
                        fontSize: 25,
                      }}
                    >
                      {examDetails.absent ??
                        0}
                    </strong>
                  </div>
                </div>

                {/* STATISTICS */}
                <div
                  style={{
                    marginTop: 24,
                    padding: 20,
                    borderRadius: 16,
                    background: "#f8fafc",
                  }}
                >
                  <h3>
                    📊 آمار پاسخ‌ها
                  </h3>

                  {examStatisticsLoading ? (
                    <p>
                      در حال دریافت آمار...
                    </p>
                  ) : examStatisticsError ? (
                    <div
                      style={{
                        padding: 12,
                        background:
                          "#fee2e2",
                        color:
                          "#991b1b",
                        borderRadius: 10,
                      }}
                    >
                      {examStatisticsError}
                    </div>
                  ) : examStatistics ? (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(160px, 1fr))",
                          gap: 12,
                          marginTop: 14,
                        }}
                      >
                        <div
                          style={{
                            background:
                              "#fff",
                            padding: 14,
                            borderRadius: 12,
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 12,
                            }}
                          >
                            تعداد تلاش
                          </div>

                          <strong>
                            {examStatistics.totalAttempts ??
                              0}
                          </strong>
                        </div>

                        <div
                          style={{
                            background:
                              "#fff",
                            padding: 14,
                            borderRadius: 12,
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 12,
                            }}
                          >
                            پاسخ صحیح
                          </div>

                          <strong
                            style={{
                              color:
                                "#16a34a",
                            }}
                          >
                            {examStatistics.correct ??
                              0}
                          </strong>
                        </div>

                        <div
                          style={{
                            background:
                              "#fff",
                            padding: 14,
                            borderRadius: 12,
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 12,
                            }}
                          >
                            پاسخ غلط
                          </div>

                          <strong
                            style={{
                              color:
                                "#dc2626",
                            }}
                          >
                            {examStatistics.wrong ??
                              0}
                          </strong>
                        </div>

                        <div
                          style={{
                            background:
                              "#fff",
                            padding: 14,
                            borderRadius: 12,
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 12,
                            }}
                          >
                            درصد موفقیت
                          </div>

                          <strong>
                            {(
                              Number(
                                examStatistics.correct ??
                                  0,
                              ) /
                                Math.max(
                                  1,
                                  Number(
                                    examStatistics.totalAttempts ??
                                      0,
                                  ),
                                ) *
                                100
                            ).toFixed(0)}
                            %
                          </strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>
                      آماری برای این آزمون
                      ثبت نشده است.
                    </p>
                  )}
                </div>

                {/* STUDENTS */}
                <div
                  style={{
                    marginTop: 24,
                  }}
                >
                  <h3>
                    👥 وضعیت دانش‌آموزان
                  </h3>

                  {Array.isArray(
                    examDetails.students,
                  ) &&
                  examDetails.students.length >
                    0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 14,
                        marginTop: 15,
                      }}
                    >
                      {examDetails.students.map(
                        (
                          student: any,
                          index: number,
                        ) => {
                          const participated =
                            student?.status ===
                            "PARTICIPATED";

                          const score =
                            Number(
                              student?.score ??
                                0,
                            );

                          return (
                            <div
                              key={
                                student?.id ??
                                student?.studentId ??
                                index
                              }
                              style={{
                                border:
                                  "1px solid #e2e8f0",
                                borderRadius:
                                  14,
                                padding: 16,
                                background:
                                  participated
                                    ? "#f0fdf4"
                                    : "#f8fafc",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap: 10,
                                }}
                              >
                                <strong>
                                  {getStudentName(
                                    student,
                                  )}
                                </strong>

                                <span
                                  style={{
                                    fontSize: 12,
                                    padding:
                                      "4px 8px",
                                    borderRadius:
                                      20,
                                    background:
                                      participated
                                        ? "#dcfce7"
                                        : "#e2e8f0",
                                    color:
                                      participated
                                        ? "#166534"
                                        : "#64748b",
                                  }}
                                >
                                  {participated
                                    ? "شرکت کرده"
                                    : "غایب"}
                                </span>
                              </div>

                              {participated ? (
                                <div
                                  style={{
                                    marginTop: 12,
                                    color:
                                      "#475569",
                                    lineHeight:
                                      1.9,
                                    fontSize: 13,
                                  }}
                                >
                                  پاسخ داده شده:{" "}
                                  {
                                    student?.answeredQuestions ??
                                      student?.answeredCount ??
                                      0
                                  }
                                  <br />
                                  نمره:{" "}
                                  <strong
                                    style={{
                                      color:
                                        scoreColor(
                                          score,
                                        ),
                                    }}
                                  >
                                    {score} / 10
                                  </strong>

                                  <button
                                    onClick={() =>
                                      loadStudentExamResult(
                                        student,
                                        Number(
                                          selectedExam.examId,
                                        ),
                                      )
                                    }
                                    style={{
                                      width:
                                        "100%",
                                      marginTop:
                                        12,
                                      padding:
                                        9,
                                      border:
                                        "none",
                                      borderRadius:
                                        9,
                                      background:
                                        "#2563eb",
                                      color:
                                        "#fff",
                                      cursor:
                                        "pointer",
                                    }}
                                  >
                                    مشاهده پاسخ‌های دانش‌آموز
                                  </button>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    marginTop: 12,
                                    color:
                                      "#94a3b8",
                                    fontSize: 13,
                                  }}
                                >
                                  این دانش‌آموز
                                  در آزمون شرکت
                                  نکرده است.
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 15,
                        padding: 18,
                        background:
                          "#f8fafc",
                        borderRadius: 12,
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      دانش‌آموزی برای این
                      آزمون ثبت نشده است.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                جزئیات آزمون در دسترس نیست.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT EXAM RESULT MODAL */}
      {selectedStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1100,
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  👤 نتیجه آزمون دانش‌آموز
                </h2>

                <div
                  style={{
                    color: "#64748b",
                  }}
                >
                  {getStudentName(
                    selectedStudent,
                  )}
                </div>
              </div>

              <button
                onClick={
                  closeStudentExamResult
                }
                style={{
                  border: "none",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>

            {studentExamResultLoading ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                }}
              >
                در حال دریافت نتیجه...
              </div>
            ) : studentExamResultError ? (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: 12,
                }}
              >
                {studentExamResultError}
              </div>
            ) : studentExamResult ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  <div
                    style={{
                      background: "#eff6ff",
                      padding: 15,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      تعداد سوال
                    </div>

                    <strong>
                      {studentExamResult.totalQuestions ??
                        0}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f0fdf4",
                      padding: 15,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      صحیح
                    </div>

                    <strong
                      style={{
                        color: "#16a34a",
                      }}
                    >
                      {studentExamResult.correctAnswers ??
                        0}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#fee2e2",
                      padding: 15,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      غلط
                    </div>

                    <strong
                      style={{
                        color: "#dc2626",
                      }}
                    >
                      {studentExamResult.wrongAnswers ??
                        0}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#fef3c7",
                      padding: 15,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      نمره
                    </div>

                    <strong>
                      {studentExamResult.score ??
                        0}{" "}
                      / 10
                    </strong>
                  </div>
                </div>

                {studentExamResult.level && (
                  <div
                    style={{
                      marginTop: 18,
                      padding: 14,
                      background: "#f8fafc",
                      borderRadius: 12,
                    }}
                  >
                    سطح:{" "}
                    <strong>
                      {studentExamResult.level}
                    </strong>
                  </div>
                )}

                {Array.isArray(
                  studentExamResult.questions,
                ) &&
                  studentExamResult.questions
                    .length > 0 && (
                    <div
                      style={{
                        marginTop: 24,
                      }}
                    >
                      <h3>
                        📝 جزئیات پاسخ‌ها
                      </h3>

                      <div
                        style={{
                          marginTop: 15,
                        }}
                      >
                        {studentExamResult.questions.map(
                          (
                            question: any,
                            index: number,
                          ) => {
                            const isCorrect =
                              question?.isCorrect ??
                              question?.correct ??
                              false;

                            return (
                              <div
                                key={
                                  question?.id ??
                                  index
                                }
                                style={{
                                  padding: 16,
                                  marginBottom: 12,
                                  borderRadius: 14,
                                  border:
                                    "1px solid #e2e8f0",
                                  background:
                                    isCorrect
                                      ? "#f0fdf4"
                                      : "#fef2f2",
                                }}
                              >
                                <strong>
                                  سوال{" "}
                                  {index + 1}
                                </strong>

                                {question?.questionText && (
                                  <div
                                    style={{
                                      marginTop: 10,
                                      lineHeight:
                                        1.8,
                                    }}
                                  >
                                    {
                                      question.questionText
                                    }
                                  </div>
                                )}

                                <div
                                  style={{
                                    marginTop: 10,
                                    fontSize: 13,
                                    color:
                                      "#475569",
                                    lineHeight:
                                      1.9,
                                  }}
                                >
                                  پاسخ دانش‌آموز:{" "}
                                  <strong>
                                    {question?.studentAnswer ??
                                      question?.answer ??
                                      "—"}
                                  </strong>

                                  <br />

                                  پاسخ صحیح:{" "}
                                  <strong>
                                    {question?.correctAnswer ??
                                      "—"}
                                  </strong>

                                  <br />

                                  وضعیت:{" "}
                                  <strong
                                    style={{
                                      color:
                                        isCorrect
                                          ? "#16a34a"
                                          : "#dc2626",
                                    }}
                                  >
                                    {isCorrect
                                      ? "صحیح"
                                      : "غلط"}
                                  </strong>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                نتیجه‌ای برای این دانش‌آموز
                پیدا نشد.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}