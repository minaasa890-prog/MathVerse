import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import api from "../../api/axios";

interface Exam {
  id: number;
  title: string;
  description?: string;
  status?: string;
  duration?: number;
  classroomId?: number;
  questionCount?: number;
  questionsCount?: number;
  questions?: any[];
}

export default function ExamManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] =
    useState(false);

  const [selectedExam, setSelectedExam] =
    useState<Exam | null>(null);

  const [showQuestionModal, setShowQuestionModal] =
    useState(false);

  const [showAiModal, setShowAiModal] =
    useState(false);

  const [aiExam, setAiExam] =
    useState<Exam | null>(null);

  const [aiChapter, setAiChapter] =
    useState("Algebra");

  const [aiDifficulty, setAiDifficulty] =
    useState(2);

  const [aiCount, setAiCount] =
    useState(3);

  const [aiLoading, setAiLoading] =
    useState(false);

  // ==========================================
  // AI GENERATED QUESTIONS
  // ==========================================

  const [aiGeneratedQuestions, setAiGeneratedQuestions] =
    useState<any[]>([]);

  const [showCreateExamModal, setShowCreateExamModal] =
    useState(false);

  const [newExamTitle, setNewExamTitle] =
    useState("");

  const [newExamDescription, setNewExamDescription] =
    useState("");

  const [newExamDuration, setNewExamDuration] =
    useState(20);

  const [createExamLoading, setCreateExamLoading] =
    useState(false);

  const [teacherClassrooms, setTeacherClassrooms] =
    useState<any[]>([]);

  const [selectedClassroomIds, setSelectedClassroomIds] =
    useState<number[]>([]);

  const [classroomsLoading, setClassroomsLoading] =
    useState(false);

  const [showNewQuestionForm, setShowNewQuestionForm] =
    useState(false);

  const [newQuestionTitle, setNewQuestionTitle] =
    useState("");

  const [newQuestionDescription, setNewQuestionDescription] =
    useState("");

  const [newQuestionChapter, setNewQuestionChapter] =
    useState("Algebra");

  const [newQuestionDifficulty, setNewQuestionDifficulty] =
    useState(1);

  const [newQuestionType, setNewQuestionType] =
    useState("MULTIPLE_CHOICE");

  const [newOptionA, setNewOptionA] =
    useState("");

  const [newOptionB, setNewOptionB] =
    useState("");

  const [newOptionC, setNewOptionC] =
    useState("");

  const [newOptionD, setNewOptionD] =
    useState("");

  const [newCorrectAnswer, setNewCorrectAnswer] =
    useState("A");

  const [createQuestionLoading, setCreateQuestionLoading] =
    useState(false);

  async function loadExams() {
    try {
      setLoading(true);

      const response = await api.get(
        `/exams/classroom/${id}`,
      );

      setExams(response.data || []);
    } catch (error) {
      console.error("LOAD EXAMS ERROR:", error);
      alert("خطا در دریافت آزمون‌ها");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions() {
    try {
      setQuestionsLoading(true);

      const response = await api.get("/questions");

      setQuestions(response.data || []);
    } catch (error) {
      console.error("LOAD QUESTIONS ERROR:", error);
      alert("خطا در دریافت بانک سؤال");
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function loadTeacherClassrooms() {
    try {
      setClassroomsLoading(true);

      const response = await api.get(
        "/teacher/dashboard/37",
      );

      const dashboardData = response.data;

      const classrooms = Array.isArray(dashboardData)
        ? dashboardData
        : dashboardData?.classrooms ||
          dashboardData?.classes ||
          [];

      setTeacherClassrooms(classrooms);

      const currentId = Number(id);

      if (
        currentId &&
        classrooms.some(
          (classroom: any) =>
            Number(classroom.id) === currentId,
        )
      ) {
        setSelectedClassroomIds([currentId]);
      }
    } catch (error) {
      console.error(
        "LOAD TEACHER CLASSROOMS ERROR:",
        error,
      );

      const currentId = Number(id);

      if (currentId) {
        setSelectedClassroomIds([currentId]);
      }
    } finally {
      setClassroomsLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadExams();
      loadQuestions();
      loadTeacherClassrooms();
    }
  }, [id]);

  /*
   * =====================================================
   * OPEN QUESTION MODAL FROM EXAM PREVIEW
   * =====================================================
   *
   * Example:
   * /teacher/class/2/exams?addQuestion=20
   *
   * After exams are loaded, find the requested exam
   * and automatically open the existing question modal.
   */
  useEffect(() => {
    const addQuestionExamId = Number(
      searchParams.get("addQuestion"),
    );

    if (
      !addQuestionExamId ||
      exams.length === 0
    ) {
      return;
    }

    const exam = exams.find(
      (item) =>
        Number(item.id) === addQuestionExamId,
    );

    if (!exam) {
      return;
    }

    if (exam.status !== "DRAFT") {
      alert(
        "آزمون منتشر شده و امکان تغییر سؤال‌های آن وجود ندارد.",
      );
    } else {
      setSelectedExam(exam);
      setShowQuestionModal(true);
      setShowNewQuestionForm(false);
    }

    setSearchParams(
      {},
      {
        replace: true,
      },
    );
  }, [
    exams,
    searchParams,
    setSearchParams,
  ]);

  function toggleClassroom(
    classroomId: number,
  ) {
    setSelectedClassroomIds((previous) => {
      if (previous.includes(classroomId)) {
        return previous.filter(
          (item) => item !== classroomId,
        );
      }

      return [...previous, classroomId];
    });
  }

  async function createDraftExam() {
    if (!newExamTitle.trim()) {
      alert("عنوان آزمون را وارد کنید");
      return;
    }

    if (selectedClassroomIds.length === 0) {
      alert("حداقل یک کلاس را انتخاب کنید");
      return;
    }

    try {
      setCreateExamLoading(true);

      const response = await api.post(
        "/teacher/exam/create",
        {
          teacherId: 37,
          classroomIds: selectedClassroomIds,
          title: newExamTitle.trim(),
          description:
            newExamDescription.trim(),
          duration: Number(newExamDuration),
          questionCount: 10,
        },
      );

      if (response.data?.success === false) {
        alert(
          response.data?.message ||
            "خطا در ساخت آزمون",
        );
        return;
      }

      const createdCount = Number(
        response.data?.classroomCount ||
          response.data?.exams?.length ||
          selectedClassroomIds.length,
      );

      alert(
        createdCount > 1
          ? `آزمون با موفقیت برای ${createdCount} کلاس ساخته شد`
          : "آزمون با موفقیت ساخته شد",
      );

      setNewExamTitle("");
      setNewExamDescription("");
      setNewExamDuration(20);

      setSelectedClassroomIds([Number(id)]);
      setShowCreateExamModal(false);

      await loadExams();
    } catch (error: any) {
      console.error(
        "CREATE EXAM ERROR:",
        error,
      );

      const message =
        error?.response?.data?.message ||
        "خطا در ساخت آزمون";

      alert(message);
    } finally {
      setCreateExamLoading(false);
    }
  }

  function openQuestionModal(exam: Exam) {
    if (exam.status !== "DRAFT") {
      alert(
        "آزمون منتشر شده و امکان تغییر سؤال‌های آن وجود ندارد.",
      );
      return;
    }

    setSelectedExam(exam);
    setShowQuestionModal(true);
    setShowNewQuestionForm(false);
  }

  function closeQuestionModal() {
    setShowQuestionModal(false);
    setSelectedExam(null);
    setShowNewQuestionForm(false);
    resetNewQuestionForm();
  }

  async function addQuestionToExam(
    examId: number,
    questionId: number,
  ) {
    try {
      await api.post(
        `/exams/${examId}/question/${questionId}`,
      );

      alert("سؤال به آزمون اضافه شد");

      await loadExams();
      await loadQuestions();
    } catch (error: any) {
      console.error(
        "ADD QUESTION ERROR:",
        error,
      );

      const message =
        error?.response?.data?.message ||
        "خطا در افزودن سؤال";

      alert(message);
    }
  }

  function resetNewQuestionForm() {
    setNewQuestionTitle("");
    setNewQuestionDescription("");
    setNewQuestionChapter("Algebra");
    setNewQuestionDifficulty(1);
    setNewQuestionType(
      "MULTIPLE_CHOICE",
    );

    setNewOptionA("");
    setNewOptionB("");
    setNewOptionC("");
    setNewOptionD("");

    setNewCorrectAnswer("A");
  }

  async function createManualQuestion() {
    if (!selectedExam) {
      alert("آزمون انتخاب نشده است");
      return;
    }

    if (!newQuestionTitle.trim()) {
      alert("متن سؤال را وارد کنید");
      return;
    }

    if (
      newQuestionType ===
      "MULTIPLE_CHOICE"
    ) {
      if (
        !newOptionA.trim() ||
        !newOptionB.trim() ||
        !newOptionC.trim() ||
        !newOptionD.trim()
      ) {
        alert("هر چهار گزینه را وارد کنید");
        return;
      }
    }

    try {
      setCreateQuestionLoading(true);

      const response = await api.post(
        "/questions",
        {
          title: newQuestionTitle,
          description:
            newQuestionDescription ||
            "سؤال ساخته شده توسط معلم",
          subject: "Math",
          chapter: newQuestionChapter,
          difficulty: Number(
            newQuestionDifficulty,
          ),
          creatorId: 37,
          questionType: newQuestionType,
          correctAnswer:
            newQuestionType ===
            "MULTIPLE_CHOICE"
              ? newCorrectAnswer
              : newQuestionTitle,
          optionA:
            newQuestionType ===
            "MULTIPLE_CHOICE"
              ? newOptionA
              : null,
          optionB:
            newQuestionType ===
            "MULTIPLE_CHOICE"
              ? newOptionB
              : null,
          optionC:
            newQuestionType ===
            "MULTIPLE_CHOICE"
              ? newOptionC
              : null,
          optionD:
            newQuestionType ===
            "MULTIPLE_CHOICE"
              ? newOptionD
              : null,
          score: 10,
        },
      );

      const createdQuestion =
        response.data;

      if (!createdQuestion?.id) {
        throw new Error(
          "شناسه سؤال ساخته شده دریافت نشد",
        );
      }

      await api.post(
        `/exams/${selectedExam.id}/question/${createdQuestion.id}`,
      );

      alert(
        "سؤال جدید ساخته شد و به آزمون اضافه شد",
      );

      resetNewQuestionForm();
      setShowNewQuestionForm(false);

      await loadQuestions();
      await loadExams();
    } catch (error: any) {
      console.error(
        "CREATE MANUAL QUESTION ERROR:",
        error,
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "خطا در ساخت سؤال جدید";

      alert(message);
    } finally {
      setCreateQuestionLoading(false);
    }
  }

  async function publishExam(
    examId: number,
  ) {
    const confirmPublish =
      window.confirm(
        "آیا مطمئن هستید که می‌خواهید این آزمون را منتشر کنید؟\nبعد از انتشار امکان تغییر سؤال‌ها محدود می‌شود.",
      );

    if (!confirmPublish) {
      return;
    }

    try {
      await api.post(
        `/exams/${examId}/publish`,
      );

      alert(
        "آزمون با موفقیت منتشر شد",
      );

      await loadExams();
    } catch (error: any) {
      console.error(
        "PUBLISH EXAM ERROR:",
        error,
      );

      const message =
        error?.response?.data?.message ||
        "خطا در انتشار آزمون";

      alert(message);
    }
  }

  function openAiModal(exam: Exam) {
    if (exam.status !== "DRAFT") {
      alert(
        "فقط به آزمون DRAFT می‌توان سؤال AI اضافه کرد.",
      );
      return;
    }

    setAiExam(exam);
    setAiGeneratedQuestions([]);
    setShowAiModal(true);
  }

  function closeAiModal() {
    setShowAiModal(false);
    setAiExam(null);
    setAiGeneratedQuestions([]);
  }

  // ==========================================
  // ADD AI QUESTIONS TO EXAM
  // ==========================================

  async function addAiQuestionsToExam() {
    if (!aiExam) {
      return;
    }

    try {
      setAiLoading(true);

      const response = await api.post(
        `/ai-exam/add-to-exam/${aiExam.id}`,
        {
          subject: "Math",
          chapter: aiChapter,
          difficulty: Number(
            aiDifficulty,
          ),
          count: Number(aiCount),
          teacherId: 37,
        },
      );

      const generatedQuestions =
        Array.isArray(response.data?.questions)
          ? response.data.questions
          : [];

      setAiGeneratedQuestions(
        generatedQuestions,
      );

      alert(
        generatedQuestions.length > 0
          ? `${generatedQuestions.length} سؤال AI به آزمون اضافه شد`
          : "سؤال‌های AI به آزمون اضافه شدند",
      );

      await loadExams();
      await loadQuestions();
    } catch (error: any) {
      console.error(
        "ADD AI QUESTIONS ERROR:",
        error,
      );

      const message =
        error?.response?.data?.message ||
        "خطا در افزودن سؤال‌های AI";

      alert(message);
    } finally {
      setAiLoading(false);
    }
  }

  // ==========================================
  // SAVE AI QUESTION TO QUESTION BANK
  // ==========================================

  async function saveAiQuestionToBank(
    questionId: number,
  ) {
    try {
      await api.patch(
        `/questions/${questionId}/save-to-bank`,
      );

      setAiGeneratedQuestions(
        (previous) =>
          previous.map((question) =>
            Number(question.id) ===
            Number(questionId)
              ? {
                  ...question,
                  isInQuestionBank: true,
                }
              : question,
          ),
      );

      await loadQuestions();

      alert(
        "سؤال با موفقیت در بانک سؤال ذخیره شد",
      );
    } catch (error: any) {
      console.error(
        "SAVE AI QUESTION TO BANK ERROR:",
        error,
      );

      const message =
        error?.response?.data?.message ||
        "خطا در ذخیره سؤال در بانک";

      alert(message);
    }
  }

  function getExamQuestionCount(
    exam: Exam,
  ) {
    if (
      Array.isArray(exam?.questions)
    ) {
      return exam.questions.length;
    }

    return (
      exam?.questionCount ??
      exam?.questionsCount ??
      0
    );
  }

  function getClassroomName(
    classroom: any,
  ) {
    return (
      classroom?.name ||
      classroom?.title ||
      `کلاس ${classroom?.id}`
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
        padding:
          "28px 20px 50px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
        }}
      >
        {/* HERO */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #6366f1 100%)",
            borderRadius: "24px",
            padding:
              "28px 30px",
            color: "#fff",
            marginBottom: "24px",
            boxShadow:
              "0 15px 40px rgba(79, 70, 229, 0.20)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.07)",
              left: "-80px",
              top: "-120px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.8,
                  marginBottom:
                    "7px",
                }}
              >
                پنل مدیریت آموزشی
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "29px",
                  fontWeight: 800,
                }}
              >
                📝 مدیریت آزمون‌ها
              </h1>

              <p
                style={{
                  margin:
                    "9px 0 0",
                  opacity: 0.9,
                  fontSize: "14px",
                }}
              >
                ساخت، مدیریت سؤال‌ها و انتشار آزمون‌های کلاس
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  `/teacher/class/${id}`,
                )
              }
              style={{
                border:
                  "1px solid rgba(255,255,255,0.25)",
                background:
                  "rgba(255,255,255,0.12)",
                color: "#fff",
                borderRadius:
                  "12px",
                padding:
                  "11px 17px",
                cursor:
                  "pointer",
                fontWeight: 700,
                backdropFilter:
                  "blur(8px)",
              }}
            >
              ← بازگشت به کلاس
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          {/* CREATE EXAM */}
          <button
            onClick={() =>
              setShowCreateExamModal(
                true,
              )
            }
            style={{
              textAlign: "right",
              border:
                "1px solid #c7d2fe",
              borderRadius:
                "18px",
              padding: "20px",
              background:
                "linear-gradient(135deg, #eef2ff, #ffffff)",
              cursor: "pointer",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius:
                  "14px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#e0e7ff",
                fontSize: "23px",
                marginBottom:
                  "12px",
              }}
            >
              ➕
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#312e81",
              }}
            >
              ساخت آزمون جدید
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "5px",
              }}
            >
              ایجاد آزمون برای یک یا چند کلاس
            </div>
          </button>

          {/* AI EXAM */}
          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}/create-exam`,
              )
            }
            style={{
              textAlign: "right",
              border:
                "1px solid #ddd6fe",
              borderRadius:
                "18px",
              padding: "20px",
              background:
                "linear-gradient(135deg, #f5f3ff, #ffffff)",
              cursor: "pointer",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius:
                  "14px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#ede9fe",
                fontSize: "23px",
                marginBottom:
                  "12px",
              }}
            >
              🤖
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#7c3aed",
              }}
            >
              ساخت آزمون با هوش مصنوعی
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "5px",
              }}
            >
              تولید خودکار سؤال با DeepSeek
            </div>
          </button>

          {/* MANUAL QUESTION */}
          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}/create-question`,
              )
            }
            style={{
              textAlign: "right",
              border:
                "1px solid #bbf7d0",
              borderRadius:
                "18px",
              padding: "20px",
              background:
                "linear-gradient(135deg, #ecfdf5, #ffffff)",
              cursor: "pointer",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius:
                  "14px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#d1fae5",
                fontSize: "23px",
                marginBottom:
                  "12px",
              }}
            >
              ✍️
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#047857",
              }}
            >
              ساخت سؤال دستی
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "5px",
              }}
            >
              طراحی سؤال اختصاصی برای کلاس
            </div>
          </button>

          {/* CLASS EXAMS */}
          <div
            style={{
              border:
                "1px solid #fed7aa",
              borderRadius:
                "18px",
              padding: "20px",
              background:
                "linear-gradient(135deg, #fff7ed, #ffffff)",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius:
                  "14px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#fed7aa",
                fontSize: "23px",
                marginBottom:
                  "12px",
              }}
            >
              📝
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#c2410c",
              }}
            >
              آزمون‌های این کلاس
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "5px",
              }}
            >
              {exams.length} آزمون در این کلاس
            </div>
          </div>
        </div>

        {/* SECTION HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom:
              "18px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "23px",
                fontWeight: 800,
              }}
            >
              آزمون‌های کلاس
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              آزمون‌ها را مشاهده و سؤال‌های آن‌ها را مدیریت کنید.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "10px",
              padding:
                "8px 13px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            {exams.length} آزمون
          </div>
        </div>

        {/* EXAMS */}
        {loading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding:
                "50px 20px",
              textAlign: "center",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: "35px",
                marginBottom:
                  "12px",
              }}
            >
              ⏳
            </div>

            در حال دریافت آزمون‌ها...
          </div>
        ) : exams.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding:
                "55px 25px",
              textAlign: "center",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom:
                  "12px",
              }}
            >
              📭
            </div>

            <h3
              style={{
                margin:
                  "0 0 8px",
                fontSize: "20px",
              }}
            >
              هنوز آزمونی ساخته نشده است
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              برای شروع، از گزینه «ساخت آزمون جدید» استفاده کنید.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(330px, 1fr))",
              gap: "20px",
            }}
          >
            {exams.map((exam) => {
              const isPublished =
                exam.status ===
                "PUBLISHED";

              return (
                <div
                  key={exam.id}
                  style={{
                    background: "#fff",
                    borderRadius:
                      "20px",
                    padding: "22px",
                    border:
                      "1px solid #e2e8f0",
                    boxShadow:
                      "0 8px 25px rgba(15,23,42,0.06)",
                    transition:
                      "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-4px)";

                    e.currentTarget.style.boxShadow =
                      "0 18px 38px rgba(15,23,42,0.10)";

                    e.currentTarget.style.borderColor =
                      "#c7d2fe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(0)";

                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(15,23,42,0.06)";

                    e.currentTarget.style.borderColor =
                      "#e2e8f0";
                  }}
                >
                  {/* CARD HEADER */}
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "12px",
                      marginBottom:
                        "18px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "12px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          flexShrink: 0,
                          borderRadius:
                            "14px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          background:
                            isPublished
                              ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                              : "linear-gradient(135deg, #fff7ed, #fed7aa)",
                          fontSize:
                            "23px",
                        }}
                      >
                        📝
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize:
                              "17px",
                            fontWeight:
                              800,
                            color:
                              "#0f172a",
                          }}
                        >
                          {exam.title}
                        </h3>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#94a3b8",
                            marginTop:
                              "5px",
                          }}
                        >
                          آزمون شماره{" "}
                          {exam.id}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        flexShrink: 0,
                        padding:
                          "6px 10px",
                        borderRadius:
                          "999px",
                        fontSize:
                          "11px",
                        fontWeight:
                          800,
                        background:
                          isPublished
                            ? "#dcfce7"
                            : "#ffedd5",
                        color:
                          isPublished
                            ? "#15803d"
                            : "#c2410c",
                      }}
                    >
                      {isPublished
                        ? "● منتشر شده"
                        : "● پیش‌نویس"}
                    </span>
                  </div>

                  {exam.description && (
                    <p
                      style={{
                        margin:
                          "0 0 18px",
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.8,
                      }}
                    >
                      {
                        exam.description
                      }
                    </p>
                  )}

                  {/* STATS */}
                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(3, 1fr)",
                      gap: "10px",
                      marginBottom:
                        "18px",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "#f8fafc",
                        borderRadius:
                          "13px",
                        padding:
                          "12px 8px",
                        textAlign:
                          "center",
                        border:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "20px",
                        }}
                      >
                        📝
                      </div>

                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            "20px",
                          marginTop:
                            "3px",
                        }}
                      >
                        {getExamQuestionCount(
                          exam,
                        )}
                      </strong>

                      <span
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#64748b",
                        }}
                      >
                        سؤال
                      </span>
                    </div>

                    <div
                      style={{
                        background:
                          "#f8fafc",
                        borderRadius:
                          "13px",
                        padding:
                          "12px 8px",
                        textAlign:
                          "center",
                        border:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "20px",
                        }}
                      >
                        ⏱️
                      </div>

                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            "20px",
                          marginTop:
                            "3px",
                        }}
                      >
                        {exam.duration ||
                          20}
                      </strong>

                      <span
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#64748b",
                        }}
                      >
                        دقیقه
                      </span>
                    </div>

                    <div
                      style={{
                        background:
                          "#f8fafc",
                        borderRadius:
                          "13px",
                        padding:
                          "12px 8px",
                        textAlign:
                          "center",
                        border:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "20px",
                        }}
                      >
                        👥
                      </div>

                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            "20px",
                          marginTop:
                            "3px",
                        }}
                      >
                        {exam.classroomId ||
                          id}
                      </strong>

                      <span
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#64748b",
                        }}
                      >
                        کلاس
                      </span>
                    </div>
                  </div>

                  {/* PREVIEW */}
                  <button
                    onClick={() =>
                      navigate(
                        `/teacher/class/${id}/exam/${exam.id}/preview`,
                      )
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius:
                        "12px",
                      padding: "12px",
                      background:
                        "linear-gradient(135deg, #4f46e5, #6366f1)",
                      color: "#fff",
                      fontWeight: 800,
                      cursor:
                        "pointer",
                      boxShadow:
                        "0 6px 15px rgba(79,70,229,0.18)",
                      marginBottom:
                        "10px",
                    }}
                  >
                    ⚙️ مدیریت سؤال‌ها و پیش‌نمایش
                  </button>

                  {/* DRAFT ACTIONS */}
                  {exam.status ===
                    "DRAFT" && (
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(3, 1fr)",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          openQuestionModal(
                            exam,
                          )
                        }
                        style={{
                          border:
                            "1px solid #bbf7d0",
                          borderRadius:
                            "10px",
                          padding:
                            "9px 5px",
                          background:
                            "#ecfdf5",
                          color:
                            "#047857",
                          fontWeight:
                            700,
                          cursor:
                            "pointer",
                          fontSize:
                            "11px",
                        }}
                      >
                        ➕ سؤال
                      </button>

                      <button
                        onClick={() =>
                          openAiModal(
                            exam,
                          )
                        }
                        style={{
                          border:
                            "1px solid #ddd6fe",
                          borderRadius:
                            "10px",
                          padding:
                            "9px 5px",
                          background:
                            "#f5f3ff",
                          color:
                            "#7c3aed",
                          fontWeight:
                            700,
                          cursor:
                            "pointer",
                          fontSize:
                            "11px",
                        }}
                      >
                        🤖 سؤال AI
                      </button>

                      <button
                        onClick={() =>
                          publishExam(
                            exam.id,
                          )
                        }
                        style={{
                          border:
                            "1px solid #fed7aa",
                          borderRadius:
                            "10px",
                          padding:
                            "9px 5px",
                          background:
                            "#fff7ed",
                          color:
                            "#c2410c",
                          fontWeight:
                            700,
                          cursor:
                            "pointer",
                          fontSize:
                            "11px",
                        }}
                      >
                        🚀 انتشار
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE EXAM MODAL
      ===================================================== */}
      {showCreateExamModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,0.60)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "16px",
            zIndex: 1000,
            backdropFilter:
              "blur(5px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth:
                "600px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              borderRadius:
                "22px",
              padding: "25px",
              boxShadow:
                "0 25px 70px rgba(15,23,42,0.25)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "22px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "22px",
                    fontWeight:
                      800,
                  }}
                >
                  ➕ ساخت آزمون جدید
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "#64748b",
                    fontSize:
                      "13px",
                  }}
                >
                  مشخصات اولیه آزمون را وارد کنید.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateExamModal(
                    false,
                  )
                }
                style={{
                  width:
                    "38px",
                  height:
                    "38px",
                  border:
                    "none",
                  borderRadius:
                    "10px",
                  background:
                    "#f1f5f9",
                  cursor:
                    "pointer",
                  fontSize:
                    "20px",
                }}
              >
                ×
              </button>
            </div>

            <label
              style={{
                display:
                  "block",
                fontWeight:
                  700,
                marginBottom:
                  "7px",
              }}
            >
              عنوان آزمون
            </label>

            <input
              value={
                newExamTitle
              }
              onChange={(e) =>
                setNewExamTitle(
                  e.target.value,
                )
              }
              placeholder="مثلاً آزمون فصل اول"
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                border:
                  "1px solid #dbe3ef",
                borderRadius:
                  "12px",
                padding:
                  "12px",
                marginBottom:
                  "16px",
                outline:
                  "none",
              }}
            />

            <label
              style={{
                display:
                  "block",
                fontWeight:
                  700,
                marginBottom:
                  "7px",
              }}
            >
              توضیحات
            </label>

            <textarea
              value={
                newExamDescription
              }
              onChange={(e) =>
                setNewExamDescription(
                  e.target.value,
                )
              }
              placeholder="توضیحات آزمون"
              rows={3}
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                border:
                  "1px solid #dbe3ef",
                borderRadius:
                  "12px",
                padding:
                  "12px",
                marginBottom:
                  "16px",
                resize:
                  "vertical",
              }}
            />

            <label
              style={{
                display:
                  "block",
                fontWeight:
                  700,
                marginBottom:
                  "7px",
              }}
            >
              مدت آزمون، به دقیقه
            </label>

            <input
              type="number"
              min={1}
              value={
                newExamDuration
              }
              onChange={(e) =>
                setNewExamDuration(
                  Number(
                    e.target.value,
                  ),
                )
              }
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                border:
                  "1px solid #dbe3ef",
                borderRadius:
                  "12px",
                padding:
                  "12px",
                marginBottom:
                  "20px",
              }}
            />

            {/* CLASSROOMS */}
            <div
              style={{
                border:
                  "1px solid #c7d2fe",
                borderRadius:
                  "17px",
                padding:
                  "17px",
                background:
                  "linear-gradient(135deg, #eef2ff, #ffffff)",
                marginBottom:
                  "20px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "10px",
                  marginBottom:
                    "13px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        "16px",
                      fontWeight:
                        800,
                      color:
                        "#312e81",
                    }}
                  >
                    👥 کلاس‌های مقصد
                  </h3>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                    }}
                  >
                    آزمون برای کلاس‌های انتخاب‌شده ساخته می‌شود.
                  </p>
                </div>

                <span
                  style={{
                    background:
                      "#4f46e5",
                    color:
                      "#fff",
                    borderRadius:
                      "999px",
                    padding:
                      "5px 10px",
                    fontSize:
                      "11px",
                    fontWeight:
                      800,
                  }}
                >
                  {
                    selectedClassroomIds.length
                  }{" "}
                  کلاس
                </span>
              </div>

              {classroomsLoading ? (
                <div
                  style={{
                    background:
                      "#fff",
                    borderRadius:
                      "12px",
                    padding:
                      "18px",
                    textAlign:
                      "center",
                    color:
                      "#64748b",
                  }}
                >
                  در حال دریافت کلاس‌ها...
                </div>
              ) : teacherClassrooms.length ===
                0 ? (
                <div
                  style={{
                    background:
                      "#fff",
                    borderRadius:
                      "12px",
                    padding:
                      "18px",
                    textAlign:
                      "center",
                    color:
                      "#64748b",
                    fontSize:
                      "13px",
                  }}
                >
                  کلاس دیگری برای انتخاب پیدا نشد.
                </div>
              ) : (
                <div
                  style={{
                    display:
                      "grid",
                    gap:
                      "8px",
                  }}
                >
                  {teacherClassrooms.map(
                    (classroom) => {
                      const classroomId =
                        Number(
                          classroom.id,
                        );

                      const checked =
                        selectedClassroomIds.includes(
                          classroomId,
                        );

                      return (
                        <label
                          key={
                            classroomId
                          }
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            padding:
                              "11px",
                            border:
                              checked
                                ? "1px solid #818cf8"
                                : "1px solid #e2e8f0",
                            background:
                              checked
                                ? "#eef2ff"
                                : "#fff",
                            cursor:
                              "pointer",
                            borderRadius:
                              "12px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleClassroom(
                                classroomId,
                              )
                            }
                            style={{
                              width:
                                "18px",
                              height:
                                "18px",
                            }}
                          />

                          <div
                            style={{
                              flex:
                                1,
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  800,
                                fontSize:
                                  "13px",
                              }}
                            >
                              {getClassroomName(
                                classroom,
                              )}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "11px",
                                color:
                                  "#94a3b8",
                                marginTop:
                                  "3px",
                              }}
                            >
                              شناسه کلاس:{" "}
                              {
                                classroomId
                              }
                            </div>
                          </div>

                          {checked && (
                            <span
                              style={{
                                color:
                                  "#4f46e5",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  800,
                              }}
                            >
                              ✓ انتخاب شد
                            </span>
                          )}
                        </label>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                onClick={
                  createDraftExam
                }
                disabled={
                  createExamLoading ||
                  selectedClassroomIds.length ===
                    0
                }
                style={{
                  border:
                    "none",
                  borderRadius:
                    "12px",
                  padding:
                    "12px",
                  background:
                    "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color:
                    "#fff",
                  fontWeight:
                    800,
                  cursor:
                    "pointer",
                  opacity:
                    createExamLoading ||
                    selectedClassroomIds.length ===
                      0
                      ? 0.5
                      : 1,
                }}
              >
                {createExamLoading
                  ? "در حال ساخت..."
                  : "ساخت آزمون"}
              </button>

              <button
                onClick={() =>
                  setShowCreateExamModal(
                    false,
                  )
                }
                style={{
                  border:
                    "none",
                  borderRadius:
                    "12px",
                  padding:
                    "12px",
                  background:
                    "#f1f5f9",
                  color:
                    "#475569",
                  fontWeight:
                    700,
                  cursor:
                    "pointer",
                }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          QUESTION MODAL
      ===================================================== */}
      {showQuestionModal &&
        selectedExam && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(15,23,42,0.60)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "16px",
              zIndex: 1000,
              backdropFilter:
                "blur(5px)",
            }}
          >
            <div
              style={{
                background:
                  "#fff",
                width:
                  "100%",
                maxWidth:
                  "900px",
                maxHeight:
                  "92vh",
                overflowY:
                  "auto",
                borderRadius:
                  "22px",
                padding:
                  "25px",
                boxShadow:
                  "0 25px 70px rgba(15,23,42,0.25)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap:
                    "15px",
                  marginBottom:
                    "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginBottom:
                        "5px",
                    }}
                  >
                    مدیریت سؤال
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        "22px",
                      fontWeight:
                        800,
                    }}
                  >
                    ➕ افزودن سؤال به آزمون
                  </h2>

                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      color:
                        "#64748b",
                      fontSize:
                        "13px",
                    }}
                  >
                    {
                      selectedExam.title
                    }
                  </p>
                </div>

                <button
                  onClick={
                    closeQuestionModal
                  }
                  style={{
                    width:
                      "38px",
                    height:
                      "38px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#f1f5f9",
                    cursor:
                      "pointer",
                    fontSize:
                      "20px",
                  }}
                >
                  ×
                </button>
              </div>

              {!showNewQuestionForm && (
                <button
                  onClick={() =>
                    setShowNewQuestionForm(
                      true,
                    )
                  }
                  style={{
                    width:
                      "100%",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius:
                      "14px",
                    padding:
                      "13px",
                    background:
                      "linear-gradient(135deg, #ecfdf5, #ffffff)",
                    color:
                      "#047857",
                    fontWeight:
                      800,
                    cursor:
                      "pointer",
                    marginBottom:
                      "18px",
                  }}
                >
                  ✍️ نوشتن سؤال جدید توسط معلم
                </button>
              )}

              {showNewQuestionForm && (
                <div
                  style={{
                    border:
                      "1px solid #bbf7d0",
                    background:
                      "linear-gradient(135deg, #ecfdf5, #ffffff)",
                    borderRadius:
                      "18px",
                    padding:
                      "18px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        color:
                          "#047857",
                        fontSize:
                          "18px",
                      }}
                    >
                      ✍️ ساخت سؤال جدید
                    </h3>

                    <button
                      onClick={() => {
                        setShowNewQuestionForm(
                          false,
                        );
                        resetNewQuestionForm();
                      }}
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "#64748b",
                        cursor:
                          "pointer",
                      }}
                    >
                      بستن
                    </button>
                  </div>

                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        700,
                      marginBottom:
                        "7px",
                    }}
                  >
                    متن سؤال *
                  </label>

                  <textarea
                    value={
                      newQuestionTitle
                    }
                    onChange={(e) =>
                      setNewQuestionTitle(
                        e.target.value,
                      )
                    }
                    rows={3}
                    placeholder="مثلاً حاصل 5 × 6 چند است؟"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      border:
                        "1px solid #dbe3ef",
                      borderRadius:
                        "12px",
                      padding:
                        "12px",
                      marginBottom:
                        "14px",
                    }}
                  />

                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        700,
                      marginBottom:
                        "7px",
                    }}
                  >
                    توضیحات
                  </label>

                  <textarea
                    value={
                      newQuestionDescription
                    }
                    onChange={(e) =>
                      setNewQuestionDescription(
                        e.target.value,
                      )
                    }
                    rows={2}
                    placeholder="توضیح اختیاری"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      border:
                        "1px solid #dbe3ef",
                      borderRadius:
                        "12px",
                      padding:
                        "12px",
                      marginBottom:
                        "14px",
                    }}
                  />

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap:
                        "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            700,
                          marginBottom:
                            "7px",
                        }}
                      >
                        فصل
                      </label>

                      <input
                        value={
                          newQuestionChapter
                        }
                        onChange={(e) =>
                          setNewQuestionChapter(
                            e.target.value,
                          )
                        }
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          border:
                            "1px solid #dbe3ef",
                          borderRadius:
                            "12px",
                          padding:
                            "11px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            700,
                          marginBottom:
                            "7px",
                        }}
                      >
                        نوع سؤال
                      </label>

                      <select
                        value={
                          newQuestionType
                        }
                        onChange={(e) =>
                          setNewQuestionType(
                            e.target.value,
                          )
                        }
                        style={{
                          width:
                            "100%",
                          border:
                            "1px solid #dbe3ef",
                          borderRadius:
                            "12px",
                          padding:
                            "11px",
                          background:
                            "#fff",
                        }}
                      >
                        <option value="MULTIPLE_CHOICE">
                          چهارگزینه‌ای
                        </option>

                        <option value="TRUE_FALSE">
                          درست / غلط
                        </option>

                        <option value="FILL_BLANK">
                          جای خالی
                        </option>

                        <option value="DESCRIPTIVE">
                          تشریحی
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            700,
                          marginBottom:
                            "7px",
                        }}
                      >
                        سختی
                      </label>

                      <select
                        value={
                          newQuestionDifficulty
                        }
                        onChange={(e) =>
                          setNewQuestionDifficulty(
                            Number(
                              e.target.value,
                            ),
                          )
                        }
                        style={{
                          width:
                            "100%",
                          border:
                            "1px solid #dbe3ef",
                          borderRadius:
                            "12px",
                          padding:
                            "11px",
                          background:
                            "#fff",
                        }}
                      >
                        <option value={1}>
                          آسان
                        </option>

                        <option value={2}>
                          متوسط
                        </option>

                        <option value={3}>
                          سخت
                        </option>
                      </select>
                    </div>
                  </div>

                  {newQuestionType ===
                    "MULTIPLE_CHOICE" && (
                    <>
                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap:
                            "12px",
                          marginTop:
                            "15px",
                        }}
                      >
                        {[
                          [
                            "A",
                            newOptionA,
                            setNewOptionA,
                          ],
                          [
                            "B",
                            newOptionB,
                            setNewOptionB,
                          ],
                          [
                            "C",
                            newOptionC,
                            setNewOptionC,
                          ],
                          [
                            "D",
                            newOptionD,
                            setNewOptionD,
                          ],
                        ].map(
                          ([
                            letter,
                            value,
                            setter,
                          ]: any) => (
                            <div
                              key={
                                letter
                              }
                            >
                              <label
                                style={{
                                  display:
                                    "block",
                                  fontWeight:
                                    700,
                                  marginBottom:
                                    "7px",
                                }}
                              >
                                گزینه{" "}
                                {
                                  letter
                                }
                              </label>

                              <input
                                value={
                                  value
                                }
                                onChange={(
                                  e,
                                ) =>
                                  setter(
                                    e.target.value,
                                  )
                                }
                                style={{
                                  width:
                                    "100%",
                                  boxSizing:
                                    "border-box",
                                  border:
                                    "1px solid #dbe3ef",
                                  borderRadius:
                                    "12px",
                                  padding:
                                    "11px",
                                }}
                              />
                            </div>
                          ),
                        )}
                      </div>

                      <div
                        style={{
                          marginTop:
                            "15px",
                        }}
                      >
                        <label
                          style={{
                            display:
                              "block",
                            fontWeight:
                              700,
                            marginBottom:
                              "7px",
                          }}
                        >
                          پاسخ صحیح
                        </label>

                        <select
                          value={
                            newCorrectAnswer
                          }
                          onChange={(e) =>
                            setNewCorrectAnswer(
                              e.target.value,
                            )
                          }
                          style={{
                            width:
                              "100%",
                            border:
                              "1px solid #dbe3ef",
                            borderRadius:
                              "12px",
                            padding:
                              "11px",
                            background:
                              "#fff",
                          }}
                        >
                          <option value="A">
                            گزینه A
                          </option>

                          <option value="B">
                            گزینه B
                          </option>

                          <option value="C">
                            گزینه C
                          </option>

                          <option value="D">
                            گزینه D
                          </option>
                        </select>
                      </div>
                    </>
                  )}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "10px",
                      marginTop:
                        "18px",
                    }}
                  >
                    <button
                      onClick={
                        createManualQuestion
                      }
                      disabled={
                        createQuestionLoading
                      }
                      style={{
                        border:
                          "none",
                        borderRadius:
                          "12px",
                        padding:
                          "12px",
                        background:
                          "linear-gradient(135deg, #059669, #10b981)",
                        color:
                          "#fff",
                        fontWeight:
                          800,
                        cursor:
                          "pointer",
                        opacity:
                          createQuestionLoading
                            ? 0.6
                            : 1,
                      }}
                    >
                      {createQuestionLoading
                        ? "در حال ساخت..."
                        : "✅ ساخت و افزودن"}
                    </button>

                    <button
                      onClick={() => {
                        setShowNewQuestionForm(
                          false,
                        );
                        resetNewQuestionForm();
                      }}
                      style={{
                        border:
                          "none",
                        borderRadius:
                          "12px",
                        padding:
                          "12px",
                        background:
                          "#f1f5f9",
                        color:
                          "#475569",
                        fontWeight:
                          700,
                        cursor:
                          "pointer",
                      }}
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}

              {/* QUESTION BANK */}
              <div>
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "14px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        "18px",
                      fontWeight:
                        800,
                    }}
                  >
                    📚 بانک سؤال
                  </h3>

                  <span
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                    }}
                  >
                    {
                      questions.length
                    }{" "}
                    سؤال
                  </span>
                </div>

                {questionsLoading ? (
                  <div
                    style={{
                      padding:
                        "30px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    در حال دریافت سؤال‌ها...
                  </div>
                ) : questions.length ===
                  0 ? (
                  <div
                    style={{
                      padding:
                        "30px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                      background:
                        "#f8fafc",
                      borderRadius:
                        "14px",
                    }}
                  >
                    هنوز سؤالی در بانک سؤال وجود ندارد.
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        "grid",
                      gap:
                        "10px",
                    }}
                  >
                    {questions.map(
                      (question) => (
                        <div
                          key={
                            question.id
                          }
                          style={{
                            border:
                              "1px solid #e2e8f0",
                            borderRadius:
                              "14px",
                            padding:
                              "14px",
                            background:
                              "#fff",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              gap:
                                "12px",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    800,
                                  fontSize:
                                    "14px",
                                  color:
                                    "#0f172a",
                                }}
                              >
                                {
                                  question.title
                                }
                              </div>

                              {question.description && (
                                <div
                                  style={{
                                    fontSize:
                                      "12px",
                                    color:
                                      "#64748b",
                                    marginTop:
                                      "5px",
                                  }}
                                >
                                  {
                                    question.description
                                  }
                                </div>
                              )}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexWrap:
                                    "wrap",
                                  gap:
                                    "6px",
                                  marginTop:
                                    "9px",
                                }}
                              >
                                <span
                                  style={{
                                    background:
                                      "#eef2ff",
                                    color:
                                      "#4338ca",
                                    padding:
                                      "4px 8px",
                                    borderRadius:
                                      "999px",
                                    fontSize:
                                      "10px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  {
                                    question.chapter ||
                                    "General"
                                  }
                                </span>

                                <span
                                  style={{
                                    background:
                                      "#f1f5f9",
                                    color:
                                      "#475569",
                                    padding:
                                      "4px 8px",
                                    borderRadius:
                                      "999px",
                                    fontSize:
                                      "10px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  سختی{" "}
                                  {
                                    question.difficulty ||
                                    1
                                  }
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                selectedExam &&
                                addQuestionToExam(
                                  selectedExam.id,
                                  question.id,
                                )
                              }
                              style={{
                                flexShrink:
                                  0,
                                border:
                                  "none",
                                borderRadius:
                                  "10px",
                                padding:
                                  "9px 13px",
                                background:
                                  "#ecfdf5",
                                color:
                                  "#047857",
                                fontWeight:
                                  800,
                                cursor:
                                  "pointer",
                              }}
                            >
                              ➕ افزودن
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={
                  closeQuestionModal
                }
                style={{
                  marginTop:
                    "20px",
                  border:
                    "none",
                  borderRadius:
                    "12px",
                  padding:
                    "11px 20px",
                  background:
                    "#f1f5f9",
                  color:
                    "#475569",
                  fontWeight:
                    700,
                  cursor:
                    "pointer",
                }}
              >
                بستن
              </button>
            </div>
          </div>
        )}

      {/* =====================================================
          AI MODAL
      ===================================================== */}
      {showAiModal &&
        aiExam && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(15,23,42,0.60)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "16px",
              zIndex: 1000,
              backdropFilter:
                "blur(5px)",
            }}
          >
            <div
              style={{
                background:
                  "#fff",
                width:
                  "100%",
                maxWidth:
                  "650px",
                maxHeight:
                  "92vh",
                overflowY:
                  "auto",
                borderRadius:
                  "22px",
                padding:
                  "25px",
                boxShadow:
                  "0 25px 70px rgba(15,23,42,0.25)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "20px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        "21px",
                      fontWeight:
                        800,
                    }}
                  >
                    🤖 افزودن سؤال با AI
                  </h2>

                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      color:
                        "#64748b",
                      fontSize:
                        "13px",
                    }}
                  >
                    {
                      aiExam.title
                    }
                  </p>
                </div>

                <button
                  onClick={
                    closeAiModal
                  }
                  style={{
                    width:
                      "38px",
                    height:
                      "38px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#f1f5f9",
                    cursor:
                      "pointer",
                    fontSize:
                      "20px",
                  }}
                >
                  ×
                </button>
              </div>

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    700,
                  marginBottom:
                    "7px",
                }}
              >
                فصل
              </label>

              <input
                value={
                  aiChapter
                }
                onChange={(e) =>
                  setAiChapter(
                    e.target.value,
                  )
                }
                placeholder="مثلاً Algebra"
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #dbe3ef",
                  borderRadius:
                    "12px",
                  padding:
                    "12px",
                  marginBottom:
                    "15px",
                }}
              />

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    700,
                  marginBottom:
                    "7px",
                }}
              >
                سختی
              </label>

              <select
                value={
                  aiDifficulty
                }
                onChange={(e) =>
                  setAiDifficulty(
                    Number(
                      e.target.value,
                    ),
                  )
                }
                style={{
                  width:
                    "100%",
                  border:
                    "1px solid #dbe3ef",
                  borderRadius:
                    "12px",
                  padding:
                    "12px",
                  background:
                    "#fff",
                  marginBottom:
                    "15px",
                }}
              >
                <option value={1}>
                  آسان
                </option>

                <option value={2}>
                  متوسط
                </option>

                <option value={3}>
                  سخت
                </option>
              </select>

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    700,
                  marginBottom:
                    "7px",
                }}
              >
                تعداد سؤال
              </label>

              <input
                type="number"
                min={1}
                max={20}
                value={
                  aiCount
                }
                onChange={(e) =>
                  setAiCount(
                    Number(
                      e.target.value,
                    ),
                  )
                }
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #dbe3ef",
                  borderRadius:
                    "12px",
                  padding:
                    "12px",
                  marginBottom:
                    "20px",
                }}
              />

              {/* ==========================================
                  AI GENERATED QUESTIONS
              ========================================== */}

              {aiGeneratedQuestions.length > 0 && (
                <div
                  style={{
                    marginBottom:
                      "20px",
                    border:
                      "1px solid #ddd6fe",
                    borderRadius:
                      "16px",
                    padding:
                      "15px",
                    background:
                      "linear-gradient(135deg, #faf5ff, #ffffff)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap:
                        "10px",
                      marginBottom:
                        "13px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize:
                          "16px",
                        fontWeight:
                          800,
                        color:
                          "#6d28d9",
                      }}
                    >
                      🤖 سؤال‌های تولیدشده
                    </h3>

                    <span
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#64748b",
                      }}
                    >
                      {
                        aiGeneratedQuestions.length
                      }{" "}
                      سؤال
                    </span>
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gap:
                        "10px",
                    }}
                  >
                    {aiGeneratedQuestions.map(
                      (
                        question,
                        index,
                      ) => (
                        <div
                          key={
                            question.id
                          }
                          style={{
                            border:
                              "1px solid #e2e8f0",
                            borderRadius:
                              "13px",
                            padding:
                              "13px",
                            background:
                              "#fff",
                          }}
                        >
                          <div
                            style={{
                              fontWeight:
                                800,
                              fontSize:
                                "13px",
                              color:
                                "#0f172a",
                              lineHeight:
                                1.8,
                            }}
                          >
                            سؤال{" "}
                            {index +
                              1}
                            :{" "}
                            {
                              question.title
                            }
                          </div>

                          {question.chapter && (
                            <div
                              style={{
                                fontSize:
                                  "11px",
                                color:
                                  "#64748b",
                                marginTop:
                                  "5px",
                              }}
                            >
                              مبحث:{" "}
                              {
                                question.chapter
                              }
                            </div>
                          )}

                          <div
                            style={{
                              marginTop:
                                "10px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              gap:
                                "10px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize:
                                  "11px",
                                fontWeight:
                                  700,
                                color:
                                  question.isInQuestionBank
                                    ? "#047857"
                                    : "#b45309",
                                background:
                                  question.isInQuestionBank
                                    ? "#ecfdf5"
                                    : "#fffbeb",
                                borderRadius:
                                  "999px",
                                padding:
                                  "5px 9px",
                              }}
                            >
                              {question.isInQuestionBank
                                ? "✓ در بانک سؤال"
                                : "در بانک سؤال نیست"}
                            </span>

                            {!question.isInQuestionBank && (
                              <button
                                onClick={() =>
                                  saveAiQuestionToBank(
                                    Number(
                                      question.id,
                                    ),
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #c4b5fd",
                                  borderRadius:
                                    "9px",
                                  padding:
                                    "8px 12px",
                                  background:
                                    "#f5f3ff",
                                  color:
                                    "#6d28d9",
                                  fontWeight:
                                    800,
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                💾 ذخیره در بانک سؤال
                              </button>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap:
                    "10px",
                }}
              >
                <button
                  onClick={
                    addAiQuestionsToExam
                  }
                  disabled={
                    aiLoading
                  }
                  style={{
                    border:
                      "none",
                    borderRadius:
                      "12px",
                    padding:
                      "12px",
                    background:
                      "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                    color:
                      "#fff",
                    fontWeight:
                      800,
                    cursor:
                      "pointer",
                    opacity:
                      aiLoading
                        ? 0.6
                        : 1,
                  }}
                >
                  {aiLoading
                    ? "در حال ساخت..."
                    : "🤖 ساخت و افزودن"}
                </button>

                <button
                  onClick={
                    closeAiModal
                  }
                  style={{
                    border:
                      "none",
                    borderRadius:
                      "12px",
                    padding:
                      "12px",
                    background:
                      "#f1f5f9",
                    color:
                      "#475569",
                    fontWeight:
                      700,
                    cursor:
                      "pointer",
                  }}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}