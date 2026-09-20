"use client";

import { FormEvent, useState } from "react";

type AIResponse = {
  studentId?: number;
  question?: string;
  answer?: string;
  explanation?: string;
  finalAnswer?: string;
  topic?: string;
  difficulty?: string;
  suggestions?: string[];
  message?: string;
};

export default function StudentAIPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(event: FormEvent) {
    event.preventDefault();

    setError("");
    setResult(null);

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setError("لطفاً سؤال ریاضی خود را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/ai-tutor/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: 1,
            question: cleanQuestion,
          }),
        }
      );

      const data = await response.json();

      console.log("MathVerse AI Response:", data);

      if (!response.ok) {
        throw new Error(
          data?.message || "خطا در ارتباط با سرور MathVerse"
        );
      }

      if (data?.message === "DeepSeek API request failed") {
        setError(
          "ارتباط با سرویس DeepSeek برقرار نشد. لطفاً ترمینال Backend را بررسی کنید."
        );
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("MathVerse AI Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "خطایی در ارتباط با معلم هوشمند رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-blue-50 p-4 md:p-8"
    >
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl md:p-8">

        <h1 className="text-3xl font-bold text-blue-700">
          🤖 معلم هوشمند MathVerse
        </h1>

        <p className="mt-3 text-gray-600">
          سؤال ریاضی خود را وارد کنید تا معلم هوشمند آن را
          مرحله‌به‌مرحله برای شما حل کند.
        </p>

        <form onSubmit={handleAsk}>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="مثلاً: معادله 5x - 10 = 2x + 8 را مرحله به مرحله حل کن."
            rows={5}
            disabled={loading}
            className="mt-6 w-full rounded-2xl border border-gray-300 p-4 text-lg outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading
              ? "⏳ معلم هوشمند در حال پاسخ دادن..."
              : "🤖 پرسیدن از معلم هوشمند"}
          </button>

        </form>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-700">
            <div className="font-bold">
              ❌ خطا
            </div>

            <div className="mt-2">
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">

            {result.answer && (
              <div className="rounded-2xl bg-blue-50 p-5">
                <h2 className="text-xl font-bold text-blue-700">
                  💡 پاسخ معلم هوشمند
                </h2>

                <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-800">
                  {result.answer}
                </p>
              </div>
            )}

            {result.explanation && (
              <div className="rounded-2xl bg-green-50 p-5">
                <h2 className="text-xl font-bold text-green-700">
                  📚 توضیح مرحله‌به‌مرحله
                </h2>

                <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-800">
                  {result.explanation}
                </p>
              </div>
            )}

            {result.finalAnswer && (
              <div className="rounded-2xl bg-yellow-50 p-5">
                <h2 className="text-xl font-bold text-yellow-700">
                  ✅ جواب نهایی
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-lg font-bold text-gray-800">
                  {result.finalAnswer}
                </p>
              </div>
            )}

            {result.topic && (
              <div className="rounded-2xl bg-gray-50 p-4">
                <strong>موضوع:</strong> {result.topic}
              </div>
            )}

            {result.suggestions &&
              result.suggestions.length > 0 && (
                <div className="rounded-2xl bg-purple-50 p-5">
                  <h2 className="text-xl font-bold text-purple-700">
                    🎯 پیشنهادهای معلم
                  </h2>

                  <ul className="mt-3 list-disc space-y-2 pr-6">
                    {result.suggestions.map(
                      (suggestion, index) => (
                        <li key={index}>
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

          </div>
        )}

      </div>
    </main>
  );
}