import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://192.168.43.167:4000";

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY";

const questionTypes: {
  value: QuestionType;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "MULTIPLE_CHOICE",
    title: "چهارگزینه‌ای",
    description: "یک پاسخ صحیح از چهار گزینه",
    icon: "A",
  },
  {
    value: "TRUE_FALSE",
    title: "صحیح / غلط",
    description: "بررسی درستی یک عبارت",
    icon: "✓",
  },
  {
    value: "SHORT_ANSWER",
    title: "پاسخ کوتاه",
    description: "پاسخ عددی یا متنی",
    icon: "Aa",
  },
  {
    value: "ESSAY",
    title: "تشریحی",
    description: "حل کامل و مرحله‌به‌مرحله",
    icon: "✦",
  },
];

const difficultyOptions = [
  { value: "EASY", label: "آسان" },
  { value: "MEDIUM", label: "متوسط" },
  { value: "HARD", label: "سخت" },
];

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questionType, setQuestionType] =
    useState<QuestionType>("MULTIPLE_CHOICE");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [score, setScore] = useState(1);

  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");

  const [correctAnswer, setCorrectAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"error" | "success">("error");

  const isMultipleChoice =
    questionType === "MULTIPLE_CHOICE";

  const selectedType =
    questionTypes.find(
      (item) => item.value === questionType
    ) || questionTypes[0];

  const difficultyLabel =
    difficultyOptions.find(
      (item) => item.value === difficulty
    )?.label || "متوسط";

  const completion = useMemo(() => {
    const checks = [
      Boolean(title.trim()),
      Boolean(correctAnswer.trim()),
      Boolean(chapter.trim()),
      score >= 1,
    ];

    if (isMultipleChoice) {
      checks.push(
        Boolean(optionA.trim()),
        Boolean(optionB.trim()),
        Boolean(optionC.trim()),
        Boolean(optionD.trim())
      );
    }

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [
    title,
    correctAnswer,
    chapter,
    score,
    isMultipleChoice,
    optionA,
    optionB,
    optionC,
    optionD,
  ]);

  const isReady = Boolean(
    title.trim() &&
      correctAnswer.trim() &&
      chapter.trim() &&
      score >= 1 &&
      (!isMultipleChoice ||
        (optionA.trim() &&
          optionB.trim() &&
          optionC.trim() &&
          optionD.trim()))
  );

  const handleSave = async () => {
    setMessage("");

    if (!title.trim()) {
      setMessageType("error");
      setMessage("متن سؤال را وارد کنید.");
      return;
    }

    if (
      isMultipleChoice &&
      (!optionA.trim() ||
        !optionB.trim() ||
        !optionC.trim() ||
        !optionD.trim())
    ) {
      setMessageType("error");
      setMessage("هر چهار گزینه باید تکمیل شوند.");
      return;
    }

    if (!correctAnswer.trim()) {
      setMessageType("error");
      setMessage("پاسخ صحیح را مشخص کنید.");
      return;
    }

    if (!chapter.trim()) {
      setMessageType("error");
      setMessage("مبحث سؤال را مشخص کنید.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          subject: "Math",
          chapter: chapter.trim(),
          difficulty,
          questionType,
          optionA: isMultipleChoice
            ? optionA.trim()
            : null,
          optionB: isMultipleChoice
            ? optionB.trim()
            : null,
          optionC: isMultipleChoice
            ? optionC.trim()
            : null,
          optionD: isMultipleChoice
            ? optionD.trim()
            : null,
          correctAnswer: correctAnswer.trim(),
          score,
          creatorId: 37,
        }),
      });

      if (!response.ok) {
        let errorMessage =
          "ذخیره سؤال انجام نشد.";

        try {
          const data = await response.json();

          if (Array.isArray(data?.message)) {
            errorMessage =
              data.message.join("، ");
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } catch {
          // ignore
        }

        throw new Error(errorMessage);
      }

      setMessageType("success");
      setMessage("سؤال با موفقیت ذخیره شد.");

      setTimeout(() => {
        navigate(`/teacher/class/${id}/exams`);
      }, 700);
    } catch (error: any) {
      setMessageType("error");
      setMessage(
        error?.message ||
          "خطایی در ذخیره سؤال رخ داد."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionType("MULTIPLE_CHOICE");
    setTitle("");
    setDescription("");
    setChapter("");
    setDifficulty("MEDIUM");
    setScore(1);
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("");
    setMessage("");
  };

  return (
    <div className="modern-page" dir="rtl">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .modern-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(59,130,246,.10),
              transparent 28%
            ),
            radial-gradient(
              circle at 5% 25%,
              rgba(99,102,241,.07),
              transparent 25%
            ),
            #f7f9fc;
          color: #172033;
          font-family:
            Tahoma,
            Arial,
            sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font-family: inherit;
        }

        /* TOP NAV */

        .modern-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 72px;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(226,232,240,.8);
        }

        .nav-inner {
          max-width: 1480px;
          height: 100%;
          margin: auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          box-shadow:
            0 8px 20px rgba(37,99,235,.22);
        }

        .nav-title {
          font-size: 13px;
          font-weight: 900;
          color: #172033;
        }

        .nav-subtitle {
          color: #94a3b8;
          font-size: 9px;
          margin-top: 3px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .completion-mini {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 10px;
        }

        .completion-mini-text {
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
        }

        .completion-mini-value {
          color: #2563eb;
          font-size: 11px;
          font-weight: 900;
        }

        .nav-save {
          border: 0;
          color: white;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          border-radius: 10px;
          padding: 11px 19px;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          box-shadow:
            0 8px 18px rgba(37,99,235,.18);
          transition: .2s;
        }

        .nav-save:hover {
          transform: translateY(-1px);
          box-shadow:
            0 12px 24px rgba(37,99,235,.25);
        }

        .nav-save:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* PAGE */

        .modern-container {
          max-width: 1480px;
          margin: auto;
          padding: 28px;
        }

        /* HERO */

        .modern-hero {
          position: relative;
          overflow: hidden;
          min-height: 210px;
          border-radius: 24px;
          padding: 32px;
          background:
            linear-gradient(
              135deg,
              #111827 0%,
              #172554 48%,
              #1e40af 100%
            );
          color: white;
          box-shadow:
            0 20px 50px rgba(15,23,42,.13);
          margin-bottom: 22px;
        }

        .modern-hero:before {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          right: -110px;
          top: -220px;
          background:
            radial-gradient(
              circle,
              rgba(96,165,250,.28),
              transparent 70%
            );
        }

        .modern-hero:after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          left: 22%;
          bottom: -190px;
          background:
            rgba(99,102,241,.18);
        }

        .hero-content-modern {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }

        .hero-copy {
          max-width: 760px;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #bfdbfe;
          font-size: 9px;
          font-weight: 900;
          margin-bottom: 13px;
          padding: 6px 9px;
          border-radius: 7px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.08);
        }

        .hero-kicker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 10px #60a5fa;
        }

        .hero-title-modern {
          margin: 0;
          font-size: 31px;
          font-weight: 900;
          letter-spacing: -.6px;
        }

        .hero-text-modern {
          margin: 11px 0 0;
          color: #cbd5e1;
          font-size: 12px;
          line-height: 2;
          max-width: 680px;
        }

        .hero-progress {
          width: 245px;
          padding: 18px;
          border-radius: 17px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.1);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }

        .hero-progress-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .hero-progress-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
        }

        .hero-progress-value {
          color: white;
          font-size: 16px;
          font-weight: 900;
        }

        .hero-progress-track {
          height: 7px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .hero-progress-fill {
          height: 100%;
          background:
            linear-gradient(
              90deg,
              #60a5fa,
              #818cf8
            );
          border-radius: 20px;
          transition: width .3s;
        }

        /* WORKFLOW */

        .workflow {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 10px;
          margin-bottom: 22px;
        }

        .workflow-item {
          position: relative;
          min-height: 74px;
          border: 1px solid #e5eaf1;
          background: rgba(255,255,255,.9);
          border-radius: 15px;
          padding: 13px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .workflow-item.active {
          border-color: #bfdbfe;
          background: #f8fbff;
          box-shadow:
            0 8px 22px rgba(37,99,235,.06);
        }

        .workflow-number {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 900;
        }

        .workflow-item.active .workflow-number {
          color: white;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
        }

        .workflow-title {
          color: #172033;
          font-size: 10px;
          font-weight: 900;
        }

        .workflow-desc {
          color: #94a3b8;
          font-size: 8px;
          margin-top: 4px;
        }

        /* MAIN */

        .modern-grid {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            410px;
          gap: 22px;
          align-items: start;
        }

        .editor-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .side-column {
          position: sticky;
          top: 94px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* CARD */

        .modern-card {
          background: rgba(255,255,255,.94);
          border: 1px solid #e7ebf2;
          border-radius: 20px;
          padding: 24px;
          box-shadow:
            0 10px 30px rgba(15,23,42,.045);
        }

        .card-heading {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .heading-index {
          color: #2563eb;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 5px;
        }

        .heading-title {
          color: #172033;
          font-size: 17px;
          font-weight: 900;
          margin: 0;
        }

        .heading-text {
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.9;
          margin: 6px 0 0;
        }

        .selected-type {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 9px;
          padding: 8px 10px;
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        /* TYPE */

        .type-modern-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 9px;
        }

        .type-modern {
          position: relative;
          min-height: 128px;
          border: 1px solid #e5eaf1;
          background: white;
          border-radius: 15px;
          padding: 15px;
          cursor: pointer;
          text-align: right;
          transition: .2s;
        }

        .type-modern:hover {
          border-color: #bfdbfe;
          transform: translateY(-1px);
        }

        .type-modern.selected {
          border-color: #60a5fa;
          background:
            linear-gradient(
              180deg,
              #f8fbff,
              #eff6ff
            );
          box-shadow:
            0 10px 22px rgba(37,99,235,.08);
        }

        .type-modern-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .type-modern.selected .type-modern-icon {
          color: white;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
        }

        .type-modern-title {
          color: #172033;
          font-size: 10px;
          font-weight: 900;
        }

        .type-modern-desc {
          color: #94a3b8;
          font-size: 8px;
          line-height: 1.7;
          margin-top: 5px;
        }

        .type-check {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 900;
        }

        /* FIELDS */

        .field {
          margin-bottom: 18px;
        }

        .field:last-child {
          margin-bottom: 0;
        }

        .field-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .field-label-modern {
          color: #334155;
          font-size: 10px;
          font-weight: 900;
        }

        .field-hint {
          color: #cbd5e1;
          font-size: 8px;
        }

        .modern-input,
        .modern-textarea,
        .modern-select {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #fafbfc;
          color: #172033;
          padding: 12px 13px;
          outline: none;
          font-size: 11px;
          transition: .18s;
        }

        .modern-textarea {
          resize: vertical;
          line-height: 2;
        }

        .modern-input:hover,
        .modern-textarea:hover,
        .modern-select:hover {
          border-color: #cbd5e1;
        }

        .modern-input:focus,
        .modern-textarea:focus,
        .modern-select:focus {
          background: white;
          border-color: #60a5fa;
          box-shadow:
            0 0 0 4px rgba(37,99,235,.07);
        }

        /* ANSWERS */

        .answers {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 10px;
        }

        .answer-modern {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px;
          border: 1px solid #e5eaf1;
          border-radius: 13px;
          background: #fafbfc;
          transition: .18s;
        }

        .answer-modern.correct {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .answer-letter {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 9px;
          background: white;
          color: #2563eb;
          box-shadow: 0 2px 8px rgba(15,23,42,.06);
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
          flex-shrink: 0;
        }

        .answer-modern.correct .answer-letter {
          color: white;
          background: #16a34a;
        }

        .answer-input {
          min-width: 0;
          flex: 1;
          border: 0;
          background: transparent;
          outline: none;
          color: #172033;
          font-size: 10px;
        }

        .answer-status {
          color: #16a34a;
          font-size: 8px;
          font-weight: 900;
          white-space: nowrap;
        }

        /* SETTINGS */

        .settings-modern {
          display: grid;
          grid-template-columns: 1.5fr 1fr .7fr;
          gap: 11px;
        }

        /* ACTIONS */

        .editor-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 5px 2px;
        }

        .reset-modern {
          border: 0;
          background: transparent;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .reset-modern:hover {
          color: #ef4444;
        }

        .action-group {
          display: flex;
          gap: 9px;
        }

        .cancel-modern {
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          border-radius: 10px;
          padding: 11px 17px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .submit-modern {
          border: 0;
          color: white;
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          box-shadow:
            0 8px 18px rgba(37,99,235,.17);
        }

        /* PREVIEW */

        .preview-modern {
          overflow: hidden;
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 20px;
          box-shadow:
            0 10px 30px rgba(15,23,42,.05);
        }

        .preview-top {
          padding: 18px 20px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #172033,
              #1e3a8a
            );
        }

        .preview-top-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-kicker {
          color: #93c5fd;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .preview-main-title {
          color: white;
          font-size: 12px;
          font-weight: 900;
          margin-top: 4px;
        }

        .preview-badge {
          color: #dbeafe;
          background: rgba(255,255,255,.1);
          border-radius: 7px;
          padding: 6px 8px;
          font-size: 8px;
          font-weight: 900;
        }

        .preview-content {
          padding: 14px;
          background: #f7f9fc;
        }

        .paper-modern {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 15px;
          padding: 18px;
        }

        .paper-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 13px;
          margin-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }

        .paper-label {
          color: #94a3b8;
          font-size: 8px;
        }

        .paper-number {
          color: #172033;
          font-size: 10px;
          font-weight: 900;
          margin-top: 4px;
        }

        .paper-score {
          color: #2563eb;
          background: #eff6ff;
          border-radius: 7px;
          padding: 6px 8px;
          font-size: 8px;
          font-weight: 900;
        }

        .preview-question {
          min-height: 70px;
          color: #172033;
          font-size: 12px;
          font-weight: 900;
          line-height: 2;
          white-space: pre-wrap;
        }

        .preview-empty {
          color: #cbd5e1;
          font-weight: 400;
        }

        .preview-description {
          color: #64748b;
          font-size: 9px;
          line-height: 1.8;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
          margin-top: 10px;
        }

        .preview-answers {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 14px;
        }

        .preview-answer {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px;
          border: 1px solid #e8edf3;
          border-radius: 9px;
        }

        .preview-answer.correct {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .preview-answer-letter {
          width: 27px;
          height: 27px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .preview-answer.correct .preview-answer-letter {
          background: #2563eb;
          color: white;
        }

        .preview-answer-text {
          color: #475569;
          font-size: 9px;
        }

        .preview-answer-text.empty {
          color: #cbd5e1;
        }

        .preview-submit {
          width: 100%;
          border: 0;
          margin-top: 15px;
          border-radius: 8px;
          background: #172033;
          color: white;
          padding: 10px;
          font-size: 9px;
          font-weight: 900;
        }

        /* SIDE STATUS */

        .side-card {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 18px;
          padding: 19px;
          box-shadow:
            0 10px 30px rgba(15,23,42,.045);
        }

        .side-title {
          color: #172033;
          font-size: 12px;
          font-weight: 900;
        }

        .side-subtitle {
          color: #94a3b8;
          font-size: 8px;
          margin-top: 4px;
        }

        .status-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .status-badge-modern {
          padding: 5px 8px;
          border-radius: 7px;
          font-size: 8px;
          font-weight: 900;
        }

        .status-badge-modern.ready {
          color: #15803d;
          background: #dcfce7;
        }

        .status-badge-modern.draft {
          color: #b45309;
          background: #fef3c7;
        }

        .status-list {
          display: flex;
          flex-direction: column;
        }

        .status-line {
          min-height: 38px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .status-line:last-child {
          border-bottom: 0;
        }

        .status-line-label {
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
        }

        .status-ok {
          color: #16a34a;
          font-size: 8px;
          font-weight: 900;
        }

        .status-no {
          color: #cbd5e1;
          font-size: 8px;
          font-weight: 900;
        }

        /* TIP */

        .modern-tip {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          padding: 19px;
          background:
            linear-gradient(
              135deg,
              #eef6ff,
              #f5f3ff
            );
          border: 1px solid #dbeafe;
        }

        .modern-tip:after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          left: -40px;
          bottom: -55px;
          background: rgba(99,102,241,.09);
        }

        .tip-flex {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 11px;
        }

        .tip-symbol {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #6366f1
            );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .tip-heading {
          color: #1e3a8a;
          font-size: 10px;
          font-weight: 900;
        }

        .tip-description {
          color: #64748b;
          font-size: 8px;
          line-height: 1.9;
          margin: 5px 0 0;
        }

        /* SUMMARY */

        .summary-grid-modern {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 8px;
          margin-top: 13px;
        }

        .summary-modern-item {
          padding: 10px;
          border-radius: 10px;
          background: #f8fafc;
        }

        .summary-modern-label {
          color: #94a3b8;
          font-size: 7px;
        }

        .summary-modern-value {
          color: #172033;
          font-size: 9px;
          font-weight: 900;
          margin-top: 4px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        /* MESSAGE */

        .toast-modern {
          position: fixed;
          z-index: 100;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 30px);
          max-width: 450px;
          padding: 13px 15px;
          border-radius: 13px;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(15px);
          box-shadow:
            0 20px 45px rgba(15,23,42,.16);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 900;
        }

        .toast-modern.success {
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .toast-modern.error {
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .toast-icon {
          width: 31px;
          height: 31px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .success .toast-icon {
          background: #dcfce7;
        }

        .error .toast-icon {
          background: #fee2e2;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {

          .modern-grid {
            grid-template-columns: 1fr;
          }

          .side-column {
            position: static;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .preview-modern {
            grid-column: 1 / -1;
          }

        }

        @media (max-width: 800px) {

          .modern-container {
            padding: 17px;
          }

          .nav-inner {
            padding: 0 17px;
          }

          .completion-mini {
            display: none;
          }

          .hero-content-modern {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-progress {
            width: 100%;
          }

          .hero-title-modern {
            font-size: 24px;
          }

          .workflow {
            grid-template-columns: repeat(2,1fr);
          }

          .type-modern-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .answers {
            grid-template-columns: 1fr;
          }

          .settings-modern {
            grid-template-columns: 1fr;
          }

          .side-column {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 520px) {

          .modern-hero {
            padding: 23px;
            border-radius: 19px;
          }

          .modern-card {
            padding: 18px;
            border-radius: 17px;
          }

          .workflow {
            grid-template-columns: 1fr 1fr;
          }

          .workflow-desc {
            display: none;
          }

          .workflow-item {
            min-height: 62px;
          }

          .type-modern-grid {
            grid-template-columns: 1fr 1fr;
          }

          .type-modern {
            min-height: 115px;
          }

          .editor-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .action-group {
            width: 100%;
          }

          .action-group button {
            flex: 1;
          }

          .reset-modern {
            text-align: center;
          }

        }

      `}</style>

      {/* NAV */}
      <header className="modern-nav">

        <div className="nav-inner">

          <div className="nav-brand">

            <button
              onClick={() =>
                navigate(
                  `/teacher/class/${id}/exams`
                )
              }
              style={{
                border: 0,
                background: "transparent",
                color: "#64748b",
                fontSize: 20,
                cursor: "pointer",
                marginLeft: 5,
              }}
            >
              ←
            </button>

            <div className="nav-logo">
              MV
            </div>

            <div>
              <div className="nav-title">
                ساخت سؤال
              </div>

              <div className="nav-subtitle">
                استودیوی طراحی محتوای MathVerse
              </div>
            </div>

          </div>

          <div className="nav-actions">

            <div className="completion-mini">

              <span className="completion-mini-text">
                تکمیل فرم
              </span>

              <span className="completion-mini-value">
                {completion}٪
              </span>

            </div>

            <button
              className="nav-save"
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "در حال ذخیره..."
                : "ذخیره سؤال"}
            </button>

          </div>

        </div>

      </header>

      <main className="modern-container">

        {/* HERO */}

        <section className="modern-hero">

          <div className="hero-content-modern">

            <div className="hero-copy">

              <div className="hero-kicker">

                <span className="hero-kicker-dot" />

                محیط طراحی سؤال

              </div>

              <h1 className="hero-title-modern">
                یک سؤال حرفه‌ای بسازید
              </h1>

              <p className="hero-text-modern">
                سؤال، گزینه‌ها و تنظیمات آموزشی را تعریف کنید
                و هم‌زمان ببینید دانش‌آموز چگونه آن را خواهد دید.
              </p>

            </div>

            <div className="hero-progress">

              <div className="hero-progress-top">

                <span className="hero-progress-label">
                  پیشرفت طراحی
                </span>

                <span className="hero-progress-value">
                  {completion}٪
                </span>

              </div>

              <div className="hero-progress-track">

                <div
                  className="hero-progress-fill"
                  style={{
                    width: `${completion}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* WORKFLOW */}

        <section className="workflow">

          {[
            ["01", "نوع سؤال", "انتخاب قالب"],
            ["02", "محتوا", "نوشتن صورت سؤال"],
            ["03", "پاسخ", "تعیین پاسخ صحیح"],
            ["04", "مشخصات", "تنظیمات آموزشی"],
          ].map(
            ([number, title, description], index) => {

              const active =
                index === 0 ||
                (index === 1 &&
                  Boolean(title.trim())) ||
                (index === 2 &&
                  Boolean(correctAnswer.trim())) ||
                (index === 3 &&
                  Boolean(chapter.trim()));

              return (
                <div
                  key={number}
                  className={`workflow-item ${
                    active ? "active" : ""
                  }`}
                >

                  <div className="workflow-number">
                    {number}
                  </div>

                  <div>

                    <div className="workflow-title">
                      {title}
                    </div>

                    <div className="workflow-desc">
                      {description}
                    </div>

                  </div>

                </div>
              );
            }
          )}

        </section>

        {/* MAIN */}

        <div className="modern-grid">

          <section className="editor-column">

            {/* TYPE */}

            <div className="modern-card">

              <div className="card-heading">

                <div>

                  <div className="heading-index">
                    STEP 01
                  </div>

                  <h2 className="heading-title">
                    نوع سؤال
                  </h2>

                  <p className="heading-text">
                    نوع ارزیابی موردنظر را انتخاب کنید.
                  </p>

                </div>

                <div className="selected-type">
                  <span>●</span>
                  {selectedType.title}
                </div>

              </div>

              <div className="type-modern-grid">

                {questionTypes.map(
                  (type) => {

                    const selected =
                      type.value ===
                      questionType;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        className={`type-modern ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {

                          setQuestionType(
                            type.value
                          );

                          if (
                            type.value !==
                            "MULTIPLE_CHOICE"
                          ) {
                            setCorrectAnswer(
                              ""
                            );
                          }

                        }}
                      >

                        {selected && (
                          <span className="type-check">
                            ✓
                          </span>
                        )}

                        <div className="type-modern-icon">
                          {type.icon}
                        </div>

                        <div className="type-modern-title">
                          {type.title}
                        </div>

                        <div className="type-modern-desc">
                          {type.description}
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* CONTENT */}

            <div className="modern-card">

              <div className="card-heading">

                <div>

                  <div className="heading-index">
                    STEP 02
                  </div>

                  <h2 className="heading-title">
                    محتوای سؤال
                  </h2>

                  <p className="heading-text">
                    سؤال را دقیق و قابل فهم برای دانش‌آموز بنویسید.
                  </p>

                </div>

              </div>

              <div className="field">

                <div className="field-top">

                  <label className="field-label-modern">
                    صورت سؤال
                  </label>

                  <span className="field-hint">
                    {title.length} کاراکتر
                  </span>

                </div>

                <textarea
                  className="modern-textarea"
                  rows={5}
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="مثلاً: حاصل عبارت زیر را محاسبه کنید."
                />

              </div>

              <div className="field">

                <div className="field-top">

                  <label className="field-label-modern">
                    توضیح تکمیلی
                  </label>

                  <span className="field-hint">
                    اختیاری
                  </span>

                </div>

                <textarea
                  className="modern-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="در صورت نیاز راهنمایی یا دستور بیشتری اضافه کنید..."
                />

              </div>

            </div>

            {/* ANSWER */}

            <div className="modern-card">

              <div className="card-heading">

                <div>

                  <div className="heading-index">
                    STEP 03
                  </div>

                  <h2 className="heading-title">
                    پاسخ سؤال
                  </h2>

                  <p className="heading-text">
                    پاسخ صحیح برای ارزیابی خودکار را مشخص کنید.
                  </p>

                </div>

              </div>

              {isMultipleChoice ? (

                <div className="answers">

                  {[
                    {
                      letter: "A",
                      value: optionA,
                      setter: setOptionA,
                    },
                    {
                      letter: "B",
                      value: optionB,
                      setter: setOptionB,
                    },
                    {
                      letter: "C",
                      value: optionC,
                      setter: setOptionC,
                    },
                    {
                      letter: "D",
                      value: optionD,
                      setter: setOptionD,
                    },
                  ].map(
                    ({
                      letter,
                      value,
                      setter,
                    }) => {

                      const correct =
                        correctAnswer ===
                        letter;

                      return (
                        <div
                          key={letter}
                          className={`answer-modern ${
                            correct
                              ? "correct"
                              : ""
                          }`}
                        >

                          <button
                            type="button"
                            className="answer-letter"
                            onClick={() =>
                              setCorrectAnswer(
                                letter
                              )
                            }
                          >
                            {letter}
                          </button>

                          <input
                            className="answer-input"
                            value={value}
                            onChange={(e) =>
                              setter(
                                e.target.value
                              )
                            }
                            placeholder={`متن گزینه ${letter}`}
                          />

                          {correct && (
                            <span className="answer-status">
                              صحیح
                            </span>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="field">

                  <label className="field-label-modern">
                    پاسخ صحیح
                  </label>

                  <input
                    className="modern-input"
                    value={correctAnswer}
                    onChange={(e) =>
                      setCorrectAnswer(
                        e.target.value
                      )
                    }
                    placeholder="پاسخ صحیح را وارد کنید"
                  />

                </div>

              )}

            </div>

            {/* SETTINGS */}

            <div className="modern-card">

              <div className="card-heading">

                <div>

                  <div className="heading-index">
                    STEP 04
                  </div>

                  <h2 className="heading-title">
                    مشخصات آموزشی
                  </h2>

                  <p className="heading-text">
                    اطلاعاتی که برای تحلیل و شخصی‌سازی یادگیری استفاده می‌شوند.
                  </p>

                </div>

              </div>

              <div className="settings-modern">

                <div className="field">

                  <div className="field-top">
                    <label className="field-label-modern">
                      مبحث
                    </label>
                  </div>

                  <input
                    className="modern-input"
                    value={chapter}
                    onChange={(e) =>
                      setChapter(e.target.value)
                    }
                    placeholder="مثلاً معادلات"
                  />

                </div>

                <div className="field">

                  <div className="field-top">
                    <label className="field-label-modern">
                      سطح دشواری
                    </label>
                  </div>

                  <select
                    className="modern-select"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value
                      )
                    }
                  >
                    {difficultyOptions.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>

                </div>

                <div className="field">

                  <div className="field-top">
                    <label className="field-label-modern">
                      امتیاز
                    </label>
                  </div>

                  <input
                    className="modern-input"
                    type="number"
                    min={1}
                    value={score}
                    onChange={(e) =>
                      setScore(
                        Math.max(
                          1,
                          Number(
                            e.target.value
                          )
                        )
                      )
                    }
                  />

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="editor-actions">

              <button
                className="reset-modern"
                type="button"
                onClick={resetForm}
              >
                پاک کردن فرم
              </button>

              <div className="action-group">

                <button
                  className="cancel-modern"
                  type="button"
                  onClick={() =>
                    navigate(
                      `/teacher/class/${id}/exams`
                    )
                  }
                >
                  انصراف
                </button>

                <button
                  className="submit-modern"
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading
                    ? "در حال ذخیره..."
                    : "ذخیره سؤال"}
                </button>

              </div>

            </div>

          </section>

          {/* SIDEBAR */}

          <aside className="side-column">

            {/* PREVIEW */}

            <div className="preview-modern">

              <div className="preview-top">

                <div className="preview-top-line">

                  <div>

                    <div className="preview-kicker">
                      STUDENT PREVIEW
                    </div>

                    <div className="preview-main-title">
                      پیش‌نمایش دانش‌آموز
                    </div>

                  </div>

                  <div className="preview-badge">
                    سؤال ۱
                  </div>

                </div>

              </div>

              <div className="preview-content">

                <div className="paper-modern">

                  <div className="paper-top">

                    <div>

                      <div className="paper-label">
                        آزمون ریاضی
                      </div>

                      <div className="paper-number">
                        سؤال شماره ۱
                      </div>

                    </div>

                    <div className="paper-score">
                      {score} امتیاز
                    </div>

                  </div>

                  <div className="preview-question">

                    {title.trim() ? (
                      title
                    ) : (
                      <span className="preview-empty">
                        متن سؤال شما اینجا نمایش داده می‌شود...
                      </span>
                    )}

                  </div>

                  {description.trim() && (
                    <div className="preview-description">
                      {description}
                    </div>
                  )}

                  {isMultipleChoice ? (

                    <div className="preview-answers">

                      {[
                        {
                          letter: "A",
                          value: optionA,
                        },
                        {
                          letter: "B",
                          value: optionB,
                        },
                        {
                          letter: "C",
                          value: optionC,
                        },
                        {
                          letter: "D",
                          value: optionD,
                        },
                      ].map(
                        ({
                          letter,
                          value,
                        }) => {

                          const correct =
                            correctAnswer ===
                            letter;

                          return (
                            <div
                              key={letter}
                              className={`preview-answer ${
                                correct
                                  ? "correct"
                                  : ""
                              }`}
                            >

                              <div className="preview-answer-letter">
                                {letter}
                              </div>

                              <span
                                className={`preview-answer-text ${
                                  !value
                                    ? "empty"
                                    : ""
                                }`}
                              >
                                {value ||
                                  `گزینه ${letter}`}
                              </span>

                            </div>
                          );
                        }
                      )}

                    </div>

                  ) : (

                    <div
                      style={{
                        marginTop: 15,
                        padding: 22,
                        border:
                          "1px dashed #cbd5e1",
                        borderRadius: 9,
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: 9,
                        background: "#f8fafc",
                      }}
                    >
                      محل پاسخ دانش‌آموز
                    </div>

                  )}

                  <button
                    className="preview-submit"
                    type="button"
                  >
                    ثبت پاسخ
                  </button>

                </div>

              </div>

            </div>

            {/* STATUS */}

            <div className="side-card">

              <div className="status-head">

                <div>

                  <div className="side-title">
                    وضعیت سؤال
                  </div>

                  <div className="side-subtitle">
                    بررسی آمادگی قبل از ذخیره
                  </div>

                </div>

                <span
                  className={`status-badge-modern ${
                    isReady
                      ? "ready"
                      : "draft"
                  }`}
                >
                  {isReady
                    ? "آماده"
                    : "پیش‌نویس"}
                </span>

              </div>

              <div className="status-list">

                {[
                  [
                    "متن سؤال",
                    Boolean(title.trim()),
                  ],
                  [
                    "پاسخ صحیح",
                    Boolean(correctAnswer.trim()),
                  ],
                  [
                    "مبحث",
                    Boolean(chapter.trim()),
                  ],
                  [
                    "گزینه‌ها",
                    !isMultipleChoice ||
                      Boolean(
                        optionA.trim() &&
                          optionB.trim() &&
                          optionC.trim() &&
                          optionD.trim()
                      ),
                  ],
                ].map(
                  ([label, done]) => (

                    <div
                      className="status-line"
                      key={String(label)}
                    >

                      <span className="status-line-label">
                        {label}
                      </span>

                      <span
                        className={
                          done
                            ? "status-ok"
                            : "status-no"
                        }
                      >
                        {done
                          ? "✓ تکمیل"
                          : "○ ناقص"}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* TIP */}

            <div className="modern-tip">

              <div className="tip-flex">

                <div className="tip-symbol">
                  ✦
                </div>

                <div>

                  <div className="tip-heading">
                    پیشنهاد MathVerse
                  </div>

                  <p className="tip-description">
                    سؤال را مشخص و بدون ابهام بنویسید.
                    کیفیت صورت سؤال مستقیماً روی تحلیل عملکرد دانش‌آموز اثر می‌گذارد.
                  </p>

                </div>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="side-card">

              <div className="side-title">
                خلاصه سؤال
              </div>

              <div className="side-subtitle">
                مشخصات فعلی محتوای طراحی‌شده
              </div>

              <div className="summary-grid-modern">

                <div className="summary-modern-item">

                  <div className="summary-modern-label">
                    نوع
                  </div>

                  <div className="summary-modern-value">
                    {selectedType.title}
                  </div>

                </div>

                <div className="summary-modern-item">

                  <div className="summary-modern-label">
                    دشواری
                  </div>

                  <div className="summary-modern-value">
                    {difficultyLabel}
                  </div>

                </div>

                <div className="summary-modern-item">

                  <div className="summary-modern-label">
                    مبحث
                  </div>

                  <div className="summary-modern-value">
                    {chapter ||
                      "تعیین نشده"}
                  </div>

                </div>

                <div className="summary-modern-item">

                  <div className="summary-modern-label">
                    امتیاز
                  </div>

                  <div className="summary-modern-value">
                    {score}
                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {message && (

        <div
          className={`toast-modern ${
            messageType === "success"
              ? "success"
              : "error"
          }`}
        >

          <div className="toast-icon">
            {messageType === "success"
              ? "✓"
              : "!"}
          </div>

          <span>
            {message}
          </span>

        </div>

      )}

    </div>
  );
}