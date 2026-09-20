import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function ExamPreview() {
  const { id, examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingQuestionId, setRemovingQuestionId] =
    useState<number | null>(null);

  const [movingQuestionId, setMovingQuestionId] =
    useState<number | null>(null);

  useEffect(() => {
    loadExam();
  }, [id, examId]);

  // =========================
  // LOAD EXAM
  // =========================

  async function loadExam() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/exams/classroom/${id}`
      );

      const exams = response.data;

      const selectedExam = exams.find(
        (item: any) =>
          Number(item.id) === Number(examId)
      );

      if (!selectedExam) {
        setError("آزمون پیدا نشد.");
        return;
      }

      setExam(selectedExam);
    } catch (error) {
      console.error(
        "EXAM PREVIEW ERROR:",
        error
      );

      setError(
        "خطا در دریافت اطلاعات آزمون."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // GET QUESTION
  // =========================

  function getQuestion(item: any) {
    return item?.question ?? item;
  }

  // =========================
  // REMOVE QUESTION
  // =========================

  async function removeQuestion(
    questionId: number
  ) {
    if (!examId) {
      return;
    }

    const confirmed = window.confirm(
      "آیا مطمئن هستید این سؤال از آزمون حذف شود؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingQuestionId(questionId);

      await api.delete(
        `/exams/${examId}/question/${questionId}`
      );

      alert(
        "✅ سؤال از آزمون حذف شد."
      );

      await loadExam();
    } catch (error) {
      console.error(
        "REMOVE QUESTION ERROR:",
        error
      );

      alert(
        "❌ خطا در حذف سؤال از آزمون."
      );
    } finally {
      setRemovingQuestionId(null);
    }
  }

  // =========================
  // MOVE QUESTION UP
  // =========================

  async function moveQuestionUp(
    questionId: number
  ) {
    if (!examId) {
      return;
    }

    try {
      setMovingQuestionId(questionId);

      await api.post(
        `/exams/${examId}/question/${questionId}/move-up`
      );

      await loadExam();
    } catch (error) {
      console.error(
        "MOVE QUESTION UP ERROR:",
        error
      );

      alert(
        "❌ خطا در جابه‌جایی سؤال."
      );
    } finally {
      setMovingQuestionId(null);
    }
  }

  // =========================
  // MOVE QUESTION DOWN
  // =========================

  async function moveQuestionDown(
    questionId: number
  ) {
    if (!examId) {
      return;
    }

    try {
      setMovingQuestionId(questionId);

      await api.post(
        `/exams/${examId}/question/${questionId}/move-down`
      );

      await loadExam();
    } catch (error) {
      console.error(
        "MOVE QUESTION DOWN ERROR:",
        error
      );

      alert(
        "❌ خطا در جابه‌جایی سؤال."
      );
    } finally {
      setMovingQuestionId(null);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="p-6 text-center">
        در حال دریافت پیش‌نمایش آزمون...
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="p-6">

        <button
          onClick={() =>
            navigate(
              `/teacher/class/${id}/exams`
            )
          }
          className="bg-gray-200 px-4 py-2 rounded-lg mb-5"
        >
          ← بازگشت
        </button>

        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>

      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* =========================
          BACK
      ========================= */}

      <button
        onClick={() =>
          navigate(
            `/teacher/class/${id}/exams`
          )
        }
        className="mb-5 bg-gray-200 px-4 py-2 rounded-lg"
      >
        ← بازگشت به مدیریت آزمون‌ها
      </button>

      {/* =========================
          EXAM HEADER
      ========================= */}

      <div className="bg-white shadow rounded-xl p-6 mb-6">

        <h1 className="text-3xl font-bold mb-4">
          👁 پیش‌نمایش آزمون
        </h1>

        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          {exam.title}
        </h2>

        <div className="flex flex-wrap gap-3 text-sm">

          <span className="bg-gray-100 px-4 py-2 rounded-lg">
            وضعیت:{" "}
            <b>{exam.status}</b>
          </span>

          <span className="bg-gray-100 px-4 py-2 rounded-lg">
            تعداد سؤال:{" "}
            <b>
              {exam.questions?.length || 0}
            </b>
          </span>

          <span className="bg-gray-100 px-4 py-2 rounded-lg">
            مدت:{" "}
            <b>
              {exam.duration || 20} دقیقه
            </b>
          </span>

        </div>

      </div>

      {/* =========================
          NO QUESTIONS
      ========================= */}

      {(!exam.questions ||
        exam.questions.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">

          <h2 className="text-xl font-bold mb-2">
            ⚠️ هنوز سؤالی به این آزمون اضافه نشده است.
          </h2>

          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}/exams`
              )
            }
            className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            ➕ افزودن سؤال
          </button>

        </div>
      )}

      {/* =========================
          QUESTIONS
      ========================= */}

      {exam.questions?.length > 0 && (
        <div className="space-y-5">

          {exam.questions.map(
            (item: any, index: number) => {

              const question =
                getQuestion(item);

              const questionId =
                Number(
                  question?.id ??
                  item?.questionId ??
                  item?.id
                );

              const isMoving =
                movingQuestionId ===
                questionId;

              const isRemoving =
                removingQuestionId ===
                questionId;

              const isFirst =
                index === 0;

              const isLast =
                index ===
                exam.questions.length - 1;

              return (
                <div
                  key={
                    item.id ||
                    question.id ||
                    index
                  }
                  className="bg-white shadow rounded-xl p-6"
                >

                  {/* QUESTION HEADER */}

                  <div className="flex justify-between items-start gap-4 mb-4">

                    <h3 className="text-xl font-bold">
                      سؤال {index + 1}
                    </h3>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                      {question.questionType ||
                        "MULTIPLE_CHOICE"}
                    </span>

                  </div>

                  {/* QUESTION TEXT */}

                  <p className="text-lg font-semibold mb-5">
                    {question.title ||
                      "متن سؤال موجود نیست"}
                  </p>

                  {/* DESCRIPTION */}

                  {question.description && (
                    <p className="text-gray-600 mb-5">
                      {question.description}
                    </p>
                  )}

                  {/* MULTIPLE CHOICE */}

                  {question.questionType ===
                    "MULTIPLE_CHOICE" && (
                    <div className="space-y-3">

                      {question.optionA && (
                        <div className="border p-3 rounded-lg">
                          <b>A)</b>{" "}
                          {question.optionA}
                        </div>
                      )}

                      {question.optionB && (
                        <div className="border p-3 rounded-lg">
                          <b>B)</b>{" "}
                          {question.optionB}
                        </div>
                      )}

                      {question.optionC && (
                        <div className="border p-3 rounded-lg">
                          <b>C)</b>{" "}
                          {question.optionC}
                        </div>
                      )}

                      {question.optionD && (
                        <div className="border p-3 rounded-lg">
                          <b>D)</b>{" "}
                          {question.optionD}
                        </div>
                      )}

                    </div>
                  )}

                  {/* TRUE / FALSE */}

                  {question.questionType ===
                    "TRUE_FALSE" && (
                    <div className="space-y-3">

                      <div className="border p-3 rounded-lg">
                        ○ درست
                      </div>

                      <div className="border p-3 rounded-lg">
                        ○ غلط
                      </div>

                    </div>
                  )}

                  {/* FILL BLANK */}

                  {question.questionType ===
                    "FILL_BLANK" && (
                    <div className="border p-4 rounded-lg">
                      پاسخ:
                      {" "}
                      ____________________
                    </div>
                  )}

                  {/* DESCRIPTIVE */}

                  {question.questionType ===
                    "DESCRIPTIVE" && (
                    <div className="border p-4 rounded-lg">

                      <p className="mb-3">
                        پاسخ تشریحی:
                      </p>

                      <div className="h-24 border rounded-lg"></div>

                    </div>
                  )}

                  {/* METADATA */}

                  <div className="mt-5 pt-4 border-t">

                    <div className="text-sm text-gray-500 flex flex-wrap gap-4 mb-4">

                      <span>
                        فصل:{" "}
                        {question.chapter ||
                          "بدون فصل"}
                      </span>

                      <span>
                        سختی:{" "}
                        {question.difficulty ||
                          1}
                      </span>

                      <span>
                        نمره:{" "}
                        {question.score ||
                          1}
                      </span>

                    </div>

                    {/* CONTROLS */}

                    {exam.status ===
                      "DRAFT" && (
                      <div className="flex flex-wrap gap-2">

                        {/* MOVE UP */}

                        <button
                          onClick={() =>
                            moveQuestionUp(
                              questionId
                            )
                          }
                          disabled={
                            isFirst ||
                            isMoving ||
                            isRemoving
                          }
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-40"
                        >
                          {isMoving
                            ? "در حال جابه‌جایی..."
                            : "⬆️ بالا"}
                        </button>

                        {/* MOVE DOWN */}

                        <button
                          onClick={() =>
                            moveQuestionDown(
                              questionId
                            )
                          }
                          disabled={
                            isLast ||
                            isMoving ||
                            isRemoving
                          }
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-40"
                        >
                          {isMoving
                            ? "در حال جابه‌جایی..."
                            : "⬇️ پایین"}
                        </button>

                        {/* REMOVE */}

                        <button
                          onClick={() =>
                            removeQuestion(
                              questionId
                            )
                          }
                          disabled={
                            isMoving ||
                            isRemoving
                          }
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                        >
                          {isRemoving
                            ? "در حال حذف..."
                            : "🗑 حذف از آزمون"}
                        </button>

                      </div>
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

      {/* =========================
          OPERATIONS
      ========================= */}

      <div className="bg-white shadow rounded-xl p-6 mt-6">

        <h2 className="text-xl font-bold mb-4">
          ⚙️ عملیات آزمون
        </h2>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}/exams`
              )
            }
            className="bg-gray-600 text-white px-5 py-3 rounded-lg"
          >
            ✏️ ویرایش آزمون
          </button>

          <button
            onClick={() =>
              navigate(
                `/teacher/class/${id}/exams`
              )
            }
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            ➕ افزودن سؤال
          </button>

        </div>

      </div>

    </div>
  );
}