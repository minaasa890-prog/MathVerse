import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ExamManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiExam, setAiExam] = useState<any>(null);
  const [aiChapter, setAiChapter] = useState("Algebra");
  const [aiDifficulty, setAiDifficulty] = useState(2);
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);

  /*
   * =========================
   * Create Exam
   * =========================
   */

  const [showCreateExamModal, setShowCreateExamModal] =
    useState(false);

  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamDescription, setNewExamDescription] = useState("");
  const [newExamDuration, setNewExamDuration] = useState(20);

  const [createExamLoading, setCreateExamLoading] =
    useState(false);

  const [teacherClassrooms, setTeacherClassrooms] =
    useState<any[]>([]);

  const [selectedClassroomIds, setSelectedClassroomIds] =
    useState<number[]>([]);

  const [classroomsLoading, setClassroomsLoading] =
    useState(false);

  /*
   * =========================
   * Manual Question Creation
   * =========================
   */

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

  const [newOptionA, setNewOptionA] = useState("");
  const [newOptionB, setNewOptionB] = useState("");
  const [newOptionC, setNewOptionC] = useState("");
  const [newOptionD, setNewOptionD] = useState("");

  const [newCorrectAnswer, setNewCorrectAnswer] =
    useState("A");

  const [createQuestionLoading, setCreateQuestionLoading] =
    useState(false);

  /*
   * =========================
   * Load Exams
   * =========================
   */

  async function loadExams() {
    try {
      setLoading(true);

      const response = await api.get(
        `/exams/classroom/${id}`
      );

      setExams(response.data || []);
    } catch (error) {
      console.error("LOAD EXAMS ERROR:", error);
      alert("خطا در دریافت آزمون‌ها");
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * Load Question Bank
   * =========================
   */

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

  /*
   * =========================
   * Load Teacher Classrooms
   * =========================
   */

  async function loadTeacherClassrooms() {
    try {
      setClassroomsLoading(true);

      const response = await api.get(
        `/teacher/dashboard/37`
      );

      const dashboardData = response.data;

      const classrooms =
        Array.isArray(dashboardData)
          ? dashboardData
          : dashboardData?.classrooms ||
            dashboardData?.classes ||
            [];

      setTeacherClassrooms(classrooms);

      /*
       * کلاس فعلی صفحه را به صورت پیش‌فرض انتخاب می‌کنیم.
       */

      const currentId = Number(id);

      if (
        currentId &&
        classrooms.some(
          (classroom: any) =>
            Number(classroom.id) === currentId
        )
      ) {
        setSelectedClassroomIds([currentId]);
      }
    } catch (error) {
      console.error(
        "LOAD TEACHER CLASSROOMS ERROR:",
        error
      );

      /*
       * اگر API داشبورد ساختار متفاوتی داشت،
       * حداقل کلاس فعلی صفحه را داریم.
       */

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
   * =========================
   * Classroom Selection
   * =========================
   */

  function toggleClassroom(classroomId: number) {
    setSelectedClassroomIds((previous) => {
      if (previous.includes(classroomId)) {
        return previous.filter(
          (item) => item !== classroomId
        );
      }

      return [
        ...previous,
        classroomId,
      ];
    });
  }

  /*
   * =========================
   * Create Multi-Class Exam
   * =========================
   */

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

          classroomIds:
            selectedClassroomIds,

          title:
            newExamTitle.trim(),

          description:
            newExamDescription.trim(),

          duration:
            Number(newExamDuration),

          questionCount: 10,
        }
      );

      console.log(
        "MULTI CLASS EXAM CREATED:",
        response.data
      );

      if (
        response.data?.success === false
      ) {
        alert(
          response.data?.message ||
            "خطا در ساخت آزمون"
        );

        return;
      }

      const createdCount =
        Number(
          response.data?.classroomCount ||
            response.data?.exams?.length ||
            selectedClassroomIds.length
        );

      alert(
        createdCount > 1
          ? `آزمون با موفقیت برای ${createdCount} کلاس ساخته شد`
          : "آزمون با موفقیت ساخته شد"
      );

      setNewExamTitle("");
      setNewExamDescription("");
      setNewExamDuration(20);

      setSelectedClassroomIds([
        Number(id),
      ]);

      setShowCreateExamModal(false);

      await loadExams();
    } catch (error: any) {
      console.error(
        "CREATE EXAM ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "خطا در ساخت آزمون";

      alert(message);
    } finally {
      setCreateExamLoading(false);
    }
  }

  /*
   * =========================
   * Question Modal
   * =========================
   */

  function openQuestionModal(exam: any) {
    if (exam.status !== "DRAFT") {
      alert(
        "آزمون منتشر شده و امکان تغییر سؤال‌های آن وجود ندارد."
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

  /*
   * =========================
   * Add Existing Question
   * =========================
   */

  async function addQuestionToExam(
    examId: number,
    questionId: number
  ) {
    try {
      await api.post(
        `/exams/${examId}/question/${questionId}`
      );

      alert("سؤال به آزمون اضافه شد");

      await loadExams();
      await loadQuestions();
    } catch (error: any) {
      console.error(
        "ADD QUESTION ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "خطا در افزودن سؤال";

      alert(message);
    }
  }

  /*
   * =========================
   * Create New Manual Question
   * =========================
   */

  function resetNewQuestionForm() {
    setNewQuestionTitle("");
    setNewQuestionDescription("");
    setNewQuestionChapter("Algebra");
    setNewQuestionDifficulty(1);
    setNewQuestionType(
      "MULTIPLE_CHOICE"
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
        alert(
          "هر چهار گزینه را وارد کنید"
        );

        return;
      }
    }

    try {
      setCreateQuestionLoading(true);

      const response = await api.post(
        "/questions",
        {
          title:
            newQuestionTitle,

          description:
            newQuestionDescription ||
            "سؤال ساخته شده توسط معلم",

          subject: "Math",

          chapter:
            newQuestionChapter,

          difficulty:
            Number(
              newQuestionDifficulty
            ),

          creatorId: 37,

          questionType:
            newQuestionType,

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
        }
      );

      const createdQuestion =
        response.data;

      if (!createdQuestion?.id) {
        throw new Error(
          "شناسه سؤال ساخته شده دریافت نشد"
        );
      }

      await api.post(
        `/exams/${selectedExam.id}/question/${createdQuestion.id}`
      );

      alert(
        "سؤال جدید ساخته شد و به آزمون اضافه شد"
      );

      resetNewQuestionForm();
      setShowNewQuestionForm(false);

      await loadQuestions();
      await loadExams();
    } catch (error: any) {
      console.error(
        "CREATE MANUAL QUESTION ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "خطا در ساخت سؤال جدید";

      alert(message);
    } finally {
      setCreateQuestionLoading(
        false
      );
    }
  }

  /*
   * =========================
   * Publish Exam
   * =========================
   */

  async function publishExam(
    examId: number
  ) {
    const confirmPublish =
      window.confirm(
        "آیا مطمئن هستید که می‌خواهید این آزمون را منتشر کنید؟\nبعد از انتشار امکان تغییر سؤال‌ها محدود می‌شود."
      );

    if (!confirmPublish) {
      return;
    }

    try {
      await api.post(
        `/exams/${examId}/publish`
      );

      alert(
        "آزمون با موفقیت منتشر شد"
      );

      await loadExams();
    } catch (error: any) {
      console.error(
        "PUBLISH EXAM ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "خطا در انتشار آزمون";

      alert(message);
    }
  }

  /*
   * =========================
   * AI Modal
   * =========================
   */

  function openAiModal(exam: any) {
    if (exam.status !== "DRAFT") {
      alert(
        "فقط به آزمون DRAFT می‌توان سؤال AI اضافه کرد."
      );

      return;
    }

    setAiExam(exam);
    setShowAiModal(true);
  }

  function closeAiModal() {
    setShowAiModal(false);
    setAiExam(null);
  }

  /*
   * =========================
   * Add AI Questions
   * =========================
   */

  async function addAiQuestionsToExam() {
    if (!aiExam) {
      return;
    }

    try {
      setAiLoading(true);

      await api.post(
        `/ai-exam/add-to-exam/${aiExam.id}`,
        {
          subject: "Math",
          chapter: aiChapter,
          difficulty:
            Number(aiDifficulty),
          count: Number(aiCount),
          teacherId: 37,
        }
      );

      alert(
        "سؤال‌های AI با موفقیت به آزمون اضافه شدند"
      );

      closeAiModal();

      await loadExams();
      await loadQuestions();
    } catch (error: any) {
      console.error(
        "ADD AI QUESTIONS ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "خطا در افزودن سؤال‌های AI";

      alert(message);
    } finally {
      setAiLoading(false);
    }
  }

  /*
   * =========================
   * Helpers
   * =========================
   */

  function getExamQuestionCount(
    exam: any
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

  function getStatusText(
    status: string
  ) {
    if (status === "PUBLISHED") {
      return "منتشر شده";
    }

    if (status === "DRAFT") {
      return "پیش‌نویس";
    }

    return status || "نامشخص";
  }

  function getClassroomName(
    classroom: any
  ) {
    return (
      classroom?.name ||
      classroom?.title ||
      `کلاس ${classroom?.id}`
    );
  }

  /*
   * =========================
   * Render
   * =========================
   */

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 p-6"
    >
      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📚 مدیریت آزمون‌ها
          </h1>

          <p className="text-gray-500 mt-2">
            مدیریت آزمون‌های کلاس و سؤال‌های آن‌ها
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setShowCreateExamModal(
                true
              )
            }
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            ➕ ساخت آزمون
          </button>

          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}/create-question`
              )
            }
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
          >
            ➕ ساخت سؤال دستی
          </button>

          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}`
              )
            }
            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
          >
            ↩️ بازگشت
          </button>
        </div>
      </div>

      {/* Exams */}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center shadow">
          در حال دریافت آزمون‌ها...
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow">
          <div className="text-5xl mb-4">
            📭
          </div>

          <p className="text-gray-600">
            هنوز آزمونی برای این کلاس ساخته نشده است.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl shadow p-6"
            >
              {/* Exam Header */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {exam.title}
                  </h2>

                  {exam.description && (
                    <p className="text-gray-500 mt-2">
                      {exam.description}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    exam.status ===
                    "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {getStatusText(
                    exam.status
                  )}
                </span>
              </div>

              {/* Info */}

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl">
                    📝
                  </div>

                  <div className="font-bold mt-1">
                    {getExamQuestionCount(
                      exam
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    سؤال
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl">
                    ⏱️
                  </div>

                  <div className="font-bold mt-1">
                    {exam.duration ||
                      20}
                  </div>

                  <div className="text-xs text-gray-500">
                    دقیقه
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl">
                    👥
                  </div>

                  <div className="font-bold mt-1">
                    {exam.classroomId ||
                      id}
                  </div>

                  <div className="text-xs text-gray-500">
                    کلاس
                  </div>
                </div>
              </div>

              {/* Buttons */}

              <div className="flex flex-wrap gap-2 mt-6">
                <button
                  onClick={() =>
                    navigate(
                      `/teacher/class/${id}/exam/${exam.id}/preview`
                    )
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  ⚙️ مدیریت سؤال‌ها
                </button>

                {exam.status ===
                  "DRAFT" && (
                  <>
                    <button
                      onClick={() =>
                        openQuestionModal(
                          exam
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      ➕ افزودن سؤال
                    </button>

                    <button
                      onClick={() =>
                        openAiModal(
                          exam
                        )
                      }
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      🤖 افزودن سؤال AI
                    </button>

                    <button
                      onClick={() =>
                        publishExam(
                          exam.id
                        )
                      }
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      🚀 انتشار آزمون
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          Create Exam Modal
      ========================= */}

      {showCreateExamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                ➕ ساخت آزمون جدید
              </h2>

              <button
                onClick={() =>
                  setShowCreateExamModal(
                    false
                  )
                }
                className="text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>

            <label className="block mb-2 font-medium">
              عنوان آزمون
            </label>

            <input
              value={newExamTitle}
              onChange={(e) =>
                setNewExamTitle(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 w-full mb-4"
              placeholder="مثلاً آزمون فصل اول"
            />

            <label className="block mb-2 font-medium">
              توضیحات
            </label>

            <textarea
              value={
                newExamDescription
              }
              onChange={(e) =>
                setNewExamDescription(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 w-full mb-4"
              placeholder="توضیحات آزمون"
              rows={3}
            />

            <label className="block mb-2 font-medium">
              مدت آزمون
            </label>

            <input
              type="number"
              value={newExamDuration}
              onChange={(e) =>
                setNewExamDuration(
                  Number(
                    e.target.value
                  )
                )
              }
              className="border rounded-lg p-3 w-full mb-6"
              min={1}
            />

            {/* Class Selection */}

            <div className="border-2 border-blue-100 rounded-2xl p-4 mb-6 bg-blue-50">

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-blue-900">
                    👥 کلاس‌های مقصد
                  </h3>

                  <p className="text-sm text-blue-700 mt-1">
                    آزمون برای کلاس‌های انتخاب‌شده ساخته می‌شود.
                  </p>
                </div>

                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {selectedClassroomIds.length} کلاس
                </span>
              </div>

              {classroomsLoading ? (
                <div className="bg-white rounded-xl p-4 text-center">
                  در حال دریافت کلاس‌ها...
                </div>
              ) : teacherClassrooms.length ===
                0 ? (
                <div className="bg-white rounded-xl p-4 text-center text-gray-500">
                  کلاس دیگری برای انتخاب پیدا نشد.
                  <br />

                  <span className="text-sm">
                    کلاس فعلی به صورت خودکار قابل انتخاب است.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">

                  {teacherClassrooms.map(
                    (classroom) => {
                      const classroomId =
                        Number(
                          classroom.id
                        );

                      const checked =
                        selectedClassroomIds.includes(
                          classroomId
                        );

                      return (
                        <label
                          key={
                            classroomId
                          }
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            checked
                              ? "bg-blue-100 border-blue-400"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleClassroom(
                                classroomId
                              )
                            }
                            className="w-5 h-5"
                          />

                          <div className="flex-1">
                            <div className="font-bold">
                              {getClassroomName(
                                classroom
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              شناسه کلاس:{" "}
                              {classroomId}
                            </div>
                          </div>

                          {checked && (
                            <span className="text-blue-600 font-bold">
                              ✓ انتخاب شد
                            </span>
                          )}
                        </label>
                      );
                    }
                  )}

                </div>
              )}
            </div>

            <div className="flex gap-3">

              <button
                onClick={
                  createDraftExam
                }
                disabled={
                  createExamLoading ||
                  selectedClassroomIds.length ===
                    0
                }
                className="bg-blue-600 text-white px-5 py-3 rounded-lg flex-1 disabled:opacity-50"
              >
                {createExamLoading
                  ? "در حال ساخت..."
                  : "ساخت آزمون"}
              </button>

              <button
                onClick={() =>
                  setShowCreateExamModal(
                    false
                  )
                }
                className="bg-gray-200 px-5 py-3 rounded-lg"
              >
                انصراف
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================
          Question Modal
      ========================= */}

      {showQuestionModal &&
        selectedExam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">

              <div className="flex justify-between items-center mb-6">

                <div>
                  <h2 className="text-2xl font-bold">
                    ➕ افزودن سؤال به آزمون
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {selectedExam.title}
                  </p>
                </div>

                <button
                  onClick={
                    closeQuestionModal
                  }
                  className="text-gray-500 text-2xl"
                >
                  ×
                </button>

              </div>

              {!showNewQuestionForm && (
                <button
                  onClick={() =>
                    setShowNewQuestionForm(
                      true
                    )
                  }
                  className="w-full bg-green-600 text-white py-3 rounded-xl mb-6 hover:bg-green-700"
                >
                  ✍️ نوشتن سؤال جدید توسط معلم
                </button>
              )}

              {showNewQuestionForm && (
                <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-5 mb-6">

                  <div className="flex justify-between items-center mb-5">

                    <h3 className="text-xl font-bold text-green-800">
                      ✍️ ساخت سؤال جدید
                    </h3>

                    <button
                      onClick={() => {
                        setShowNewQuestionForm(
                          false
                        );

                        resetNewQuestionForm();
                      }}
                      className="text-gray-500"
                    >
                      بستن
                    </button>

                  </div>

                  <label className="block font-medium mb-2">
                    متن سؤال *
                  </label>

                  <textarea
                    value={
                      newQuestionTitle
                    }
                    onChange={(e) =>
                      setNewQuestionTitle(
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3 w-full mb-4"
                    rows={3}
                    placeholder="مثلاً حاصل 5 × 6 چند است؟"
                  />

                  <label className="block font-medium mb-2">
                    توضیحات
                  </label>

                  <textarea
                    value={
                      newQuestionDescription
                    }
                    onChange={(e) =>
                      setNewQuestionDescription(
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3 w-full mb-4"
                    rows={2}
                    placeholder="توضیح اختیاری"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                    <div>
                      <label className="block font-medium mb-2">
                        فصل
                      </label>

                      <input
                        value={
                          newQuestionChapter
                        }
                        onChange={(e) =>
                          setNewQuestionChapter(
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-3 w-full"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">
                        نوع سؤال
                      </label>

                      <select
                        value={
                          newQuestionType
                        }
                        onChange={(e) =>
                          setNewQuestionType(
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-3 w-full"
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
                      <label className="block font-medium mb-2">
                        سختی
                      </label>

                      <select
                        value={
                          newQuestionDifficulty
                        }
                        onChange={(e) =>
                          setNewQuestionDifficulty(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="border rounded-lg p-3 w-full"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                          <label className="block font-medium mb-2">
                            گزینه A
                          </label>

                          <input
                            value={
                              newOptionA
                            }
                            onChange={(e) =>
                              setNewOptionA(
                                e.target.value
                              )
                            }
                            className="border rounded-lg p-3 w-full"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-2">
                            گزینه B
                          </label>

                          <input
                            value={
                              newOptionB
                            }
                            onChange={(e) =>
                              setNewOptionB(
                                e.target.value
                              )
                            }
                            className="border rounded-lg p-3 w-full"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-2">
                            گزینه C
                          </label>

                          <input
                            value={
                              newOptionC
                            }
                            onChange={(e) =>
                              setNewOptionC(
                                e.target.value
                              )
                            }
                            className="border rounded-lg p-3 w-full"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-2">
                            گزینه D
                          </label>

                          <input
                            value={
                              newOptionD
                            }
                            onChange={(e) =>
                              setNewOptionD(
                                e.target.value
                              )
                            }
                            className="border rounded-lg p-3 w-full"
                          />
                        </div>

                      </div>

                      <div className="mt-4">

                        <label className="block font-medium mb-2">
                          پاسخ صحیح
                        </label>

                        <select
                          value={
                            newCorrectAnswer
                          }
                          onChange={(e) =>
                            setNewCorrectAnswer(
                              e.target.value
                            )
                          }
                          className="border rounded-lg p-3 w-full"
                        >
                          <option value="A">
                            A
                          </option>

                          <option value="B">
                            B
                          </option>

                          <option value="C">
                            C
                          </option>

                          <option value="D">
                            D
                          </option>
                        </select>

                      </div>
                    </>
                  )}

                  <div className="flex gap-3 mt-6">

                    <button
                      onClick={
                        createManualQuestion
                      }
                      disabled={
                        createQuestionLoading
                      }
                      className="bg-green-600 text-white px-5 py-3 rounded-lg flex-1 hover:bg-green-700"
                    >
                      {createQuestionLoading
                        ? "در حال ساخت..."
                        : "✅ ساخت و افزودن به آزمون"}
                    </button>

                    <button
                      onClick={() => {
                        setShowNewQuestionForm(
                          false
                        );

                        resetNewQuestionForm();
                      }}
                      className="bg-gray-200 px-5 py-3 rounded-lg"
                    >
                      انصراف
                    </button>

                  </div>

                </div>
              )}

              {/* Question Bank */}

              <div>

                <h3 className="text-xl font-bold mb-4">
                  📚 انتخاب از بانک سؤال
                </h3>

                {questionsLoading ? (
                  <div className="text-center py-8">
                    در حال دریافت سؤال‌ها...
                  </div>
                ) : questions.length ===
                  0 ? (
                  <div className="text-center py-8 text-gray-500">
                    هنوز سؤالی در بانک سؤال وجود ندارد.
                  </div>
                ) : (
                  <div className="space-y-3">

                    {questions.map(
                      (question) => (
                        <div
                          key={
                            question.id
                          }
                          className="border rounded-xl p-4 hover:bg-gray-50"
                        >

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div className="flex-1">

                              <div className="font-bold text-gray-800">
                                {question.title}
                              </div>

                              {question.description && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {
                                    question.description
                                  }
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 mt-2 text-xs">

                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {question.chapter ||
                                    "General"}
                                </span>

                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  سختی:{" "}
                                  {question.difficulty ||
                                    1}
                                </span>

                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {question.questionType ||
                                    "MULTIPLE_CHOICE"}
                                </span>

                              </div>

                            </div>

                            <button
                              onClick={() =>
                                addQuestionToExam(
                                  selectedExam.id,
                                  question.id
                                )
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              ➕ افزودن
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              <div className="mt-6 text-left">

                <button
                  onClick={
                    closeQuestionModal
                  }
                  className="bg-gray-200 px-5 py-3 rounded-lg"
                >
                  بستن
                </button>

              </div>

            </div>
          </div>
        )}

      {/* =========================
          AI Question Modal
      ========================= */}

      {showAiModal &&
        aiExam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

              <div className="flex justify-between items-center mb-6">

                <div>
                  <h2 className="text-2xl font-bold">
                    🤖 افزودن سؤال با AI
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {aiExam.title}
                  </p>
                </div>

                <button
                  onClick={
                    closeAiModal
                  }
                  className="text-gray-500 text-2xl"
                >
                  ×
                </button>

              </div>

              <label className="block font-medium mb-2">
                فصل
              </label>

              <input
                value={aiChapter}
                onChange={(e) =>
                  setAiChapter(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full mb-4"
                placeholder="مثلاً Algebra"
              />

              <label className="block font-medium mb-2">
                سختی
              </label>

              <select
                value={aiDifficulty}
                onChange={(e) =>
                  setAiDifficulty(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="border rounded-lg p-3 w-full mb-4"
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

              <label className="block font-medium mb-2">
                تعداد سؤال
              </label>

              <input
                type="number"
                min={1}
                max={20}
                value={aiCount}
                onChange={(e) =>
                  setAiCount(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="border rounded-lg p-3 w-full mb-6"
              />

              <div className="flex gap-3">

                <button
                  onClick={
                    addAiQuestionsToExam
                  }
                  disabled={aiLoading}
                  className="bg-purple-600 text-white px-5 py-3 rounded-lg flex-1 hover:bg-purple-700"
                >
                  {aiLoading
                    ? "در حال ساخت..."
                    : "🤖 ساخت و افزودن"}
                </button>

                <button
                  onClick={
                    closeAiModal
                  }
                  className="bg-gray-200 px-5 py-3 rounded-lg"
                >
                  انصراف
                </button>

              </div>

            </div>

          </div>
        )}
    </div>
  );
}