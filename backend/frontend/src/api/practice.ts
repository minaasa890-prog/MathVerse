import { API_URL } from "./config";

export async function startPractice(studentId: number) {
  const res = await fetch(
    `${API_URL}/ai-practice/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
      }),
    }
  );

  return res.json();
}

export async function getNextQuestion(
  sessionId: number
) {
  const res = await fetch(
    `${API_URL}/ai-practice/next/${sessionId}`
  );

  return res.json();
}

export async function submitAnswer(
  sessionId: number,
  studentId: number,
  questionId: number,
  answer: string
) {
  const res = await fetch(
    `${API_URL}/ai-practice/submit-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        studentId,
        questionId,
        answer,
      }),
    }
  );

  return res.json();
}

export async function getReport(
  sessionId: number
) {
  const res = await fetch(
    `${API_URL}/ai-practice/report/${sessionId}`
  );

  return res.json();
}