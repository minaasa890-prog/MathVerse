"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://localhost:4000";

type Question = {
  id: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  chapter?: string | null;
  difficulty?: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

type Exam = {
  studentId: number;
  examId: number;
  title: string;
  duration: number;
  startTime: string;
  endTime: string;
  totalQuestions: number;
  questions: Question[];
  message?: string;
};

type ExamResult = {
  message: string;
  examId: number;
  studentId: number;
  totalScore: number;
  correctAnswers: number;
  xpEarned: number;
  newLevel: number;
};

export default function StudentExamPage() {

  const params = useParams();
  const router = useRouter();

  const examId = Number(params.examId);

  const studentId = 1;

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadExam() {

      try {

        const response = await fetch(
          `${API_URL}/exams/${examId}/start/${studentId}`
        );


        if (!response.ok) {
          throw new Error("خطا در دریافت آزمون");
        }


        const data = await response.json();

        console.log("EXAM DATA:", data);

        setExam(data);


      } catch (err:any) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }


    if(examId){
      loadExam();
    }


  },[examId]);



  function handleAnswer(
    questionId:number,
    answer:string
  ){

    setAnswers(prev=>({
      ...prev,
      [questionId]:answer
    }));

  }



  async function submitExam(){

    if(!exam) return;


    try{

      setSubmitting(true);


      const formattedAnswers =
        exam.questions.map(q=>({
          questionId:q.id,
          answer:answers[q.id] ?? null
        }));


      console.log("SUBMIT DATA:",{
        studentId,
        answers:formattedAnswers
      });



      const response = await fetch(
        `${API_URL}/exams/${examId}/submit`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            studentId,
            answers:formattedAnswers
          })
        }
      );


      const data = await response.json();


      console.log("RESULT:",data);



      if(!response.ok){

        throw new Error(
          data.message || "خطا در ارسال آزمون"
        );

      }


      setResult(data);



    }catch(err:any){

      setError(err.message);

    }finally{

      setSubmitting(false);

    }

  }



  if(loading){

    return (
      <main className="min-h-screen flex items-center justify-center">
        در حال دریافت آزمون...
      </main>
    );

  }



  if(error){

    return(
      <main className="min-h-screen flex items-center justify-center">

        <div className="bg-white shadow p-8 rounded-xl">

          <h1 className="text-red-600 text-xl">
            خطا
          </h1>

          <p>{error}</p>

        </div>

      </main>
    );

  }



  if(result && exam){

    return(

      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 p-6"
      >

        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-3xl shadow p-8 text-center">


            <div className="text-5xl mb-4">
              🎉
            </div>


            <h1 className="text-3xl font-bold">
              آزمون ارسال شد
            </h1>


            <p className="text-gray-500 mt-3">
              نتیجه آزمون شما:
            </p>



            <div className="grid grid-cols-2 gap-4 mt-8">


              <div className="bg-blue-50 rounded-2xl p-5">

                <p className="text-gray-500">
                  تعداد سوالات
                </p>

                <p className="text-3xl font-bold">
                  {exam.totalQuestions}
                </p>

              </div>



              <div className="bg-green-50 rounded-2xl p-5">

                <p className="text-gray-500">
                  پاسخ صحیح
                </p>

                <p className="text-3xl font-bold">
                  {result.correctAnswers}
                </p>

              </div>




              <div className="bg-yellow-50 rounded-2xl p-5">

                <p className="text-gray-500">
                  XP دریافت شده
                </p>

                <p className="text-3xl font-bold">
                  +{result.xpEarned}
                </p>

              </div>



              <div className="bg-purple-50 rounded-2xl p-5">

                <p className="text-gray-500">
                  Level جدید
                </p>

                <p className="text-3xl font-bold">
                  {result.newLevel}
                </p>

              </div>


            </div>



            <button
              onClick={()=>router.push("/student")}
              className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl"
            >
              داشبورد دانش‌آموز
            </button>


          </div>

        </div>


      </main>

    );

  }



  if(!exam) return null;



  return (

    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 p-6"
    >

      <div className="max-w-4xl mx-auto">


        <div className="bg-white rounded-3xl shadow p-6 mb-6">


          <h1 className="text-3xl font-bold">
            {exam.title}
          </h1>


          <p className="mt-3 text-gray-500">
            مدت آزمون: {exam.duration} دقیقه
          </p>


          <p>
            تعداد سوالات:
            <b> {exam.totalQuestions}</b>
          </p>


        </div>




        {
          exam.questions.map((q,index)=>(

            <div
              key={q.id}
              className="bg-white rounded-3xl shadow p-6 mb-6"
            >

              <h2 className="text-xl font-bold mb-4">
                {index+1}. {q.title}
              </h2>


              <p className="mb-5 text-gray-500">
                {q.description}
              </p>



              {
                [
                  ["A",q.optionA],
                  ["B",q.optionB],
                  ["C",q.optionC],
                  ["D",q.optionD],
                ].map(([key,value])=>(


                  <button
                    key={key}
                    onClick={()=>handleAnswer(q.id,key)}
                    className={`
                    w-full text-right p-4 rounded-xl border mb-3
                    ${
                      answers[q.id]===key
                      ?
                      "bg-blue-100 border-blue-600"
                      :
                      "bg-white"
                    }
                    `}
                  >

                    <b>{key}</b>
                    {" "}
                    {value}

                  </button>


                ))
              }



            </div>


          ))
        }



        <div className="bg-white rounded-3xl shadow p-6">


          <p className="text-center mb-4">
            {Object.keys(answers).length}
            {" "}
            از
            {" "}
            {exam.totalQuestions}
            {" "}
            سوال پاسخ داده شده
          </p>



          <button

            onClick={submitExam}

            disabled={submitting}

            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold"

          >

            {
              submitting
              ?
              "در حال ارسال..."
              :
              "ثبت و ارسال آزمون"
            }

          </button>


        </div>



      </div>


    </main>

  );

}