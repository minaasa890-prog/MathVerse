import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TeacherClassDetail() {
  const { id } = useParams();

  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    fetch(
      `http://192.168.43.167:4000/teacher/class/${id}/students`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
      });

    fetch(
      `http://192.168.43.167:4000/teacher/class/${id}/results`
    )
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
      });

    fetch(
      `http://192.168.43.167:4000/teacher/class/${id}/ranking`
    )
      .then((res) => res.json())
      .then((data) => {
        setRanking(data);
      });
  }, [id]);

  return (
    <div
      style={{
        padding: "30px",
        direction: "rtl",
      }}
    >
      <h1>جزئیات کلاس</h1>

      <h2>دانش‌آموزان</h2>

      {students.map((s: any) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
          }}
        >
          <h3>{s.name}</h3>

          <p>
            تعداد آزمون: {s.totalExams}
          </p>

          <p>
            میانگین: {s.average}
          </p>
        </div>
      ))}

      <h2>نتایج آزمون‌ها</h2>

      {results.map((r: any) => (
        <div
          key={r.examId}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
          }}
        >
          <h3>{r.examTitle}</h3>

          <p>
            میانگین: {r.averageScore}
          </p>

          <p>
            بالاترین: {r.highestScore}
          </p>
        </div>
      ))}

      <h2>رتبه‌بندی</h2>

      {ranking.map((r: any) => (
        <div
          key={r.studentId}
          style={{
            padding: "10px",
          }}
        >
          🏆 رتبه {r.rank} - {r.name} - {r.averageScore}
        </div>
      ))}
    </div>
  );
}