import { useState } from "react";
import axios from "axios";


export default function StudentAdaptivePractice() {

  const studentId = 1;

  const API = "http://localhost:4000";


  const [session,setSession] = useState<any>(null);

  const [question,setQuestion] = useState<any>(null);

  const [selected,setSelected] = useState("");

  const [result,setResult] = useState<any>(null);

  const [report,setReport] = useState<any>(null);

  const [, setLoading] = useState(false);



  // شروع تمرین
  async function startPractice(){

    setLoading(true);

    try {

      const res = await axios.post(
        `${API}/adaptive-learning/start/${studentId}`
      );


      console.log("SESSION:",res.data);


      setSession(
        res.data.session
      );


      loadQuestion(
        res.data.session.id
      );


    } catch(err){

      console.log(err);

    }


    setLoading(false);

  }





  // دریافت سوال
  async function loadQuestion(sessionId:number){


    try {


      const res = await axios.get(

        `${API}/adaptive-learning/next-question/${sessionId}`

      );
      console.log("NEXT QUESTION RESPONSE:", res.data);


      console.log("QUESTION:",res.data);



      if(res.data.finished){

        loadReport(sessionId);

        return;

      }



      setQuestion(
        res.data.question
      );


    }

    catch(err){

      console.log(err);

    }


  }





  // ارسال پاسخ
  async function submitAnswer(){


    if(!selected)
      return;



    const res = await axios.post(

      `${API}/adaptive-learning/submit-answer`,

      {

        sessionId: session.id,

        studentId,

        questionId: question.id,

        answer:selected

      }

    );


    console.log("ANSWER:",res.data);


    setResult(
      res.data
    );


  }





  // سوال بعدی
  function nextQuestion(){


    setSelected("");

    setResult(null);


    loadQuestion(
      session.id
    );


  }





  // گزارش نهایی
  async function loadReport(id:number){


    const res = await axios.get(

      `${API}/adaptive-learning/session-report/${id}`

    );


    console.log("REPORT:",res.data);


    setReport(
      res.data
    );


  }





  return (

    <div
      style={{
        padding:"30px",
        direction:"rtl"
      }}
    >


      <h1>
        🤖 تمرین هوشمند MathVerse
      </h1>



      {
        !session &&

        <button
          onClick={startPractice}
        >

          شروع تمرین هوشمند

        </button>

      }





      {
        session && !report &&

        <div>


          <h3>

            سوالات:
            {session.answeredQuestions}
            /
            {session.totalQuestions}

          </h3>



          <h3>

            سطح:
            {session.difficulty}

          </h3>



        </div>

      }





      {
        question &&


        <div
          style={{
            marginTop:"30px"
          }}
        >


          <h2>

            {question.title}

          </h2>



          <p>

            {question.description}

          </p>





          {
            [

              ["A",question.optionA],

              ["B",question.optionB],

              ["C",question.optionC],

              ["D",question.optionD]


            ].map((item:any)=>(


              <div
                key={item[0]}
              >

                <button

                  onClick={()=>setSelected(item[0])}

                  style={{

                    margin:"8px",

                    padding:"10px",

                    background:

                    selected===item[0]
                    ?
                    "#90caf9"
                    :
                    ""

                  }}

                >

                  {item[0]}
                  )
                  {item[1]}


                </button>


              </div>


            ))

          }





          <button

            onClick={submitAnswer}

            disabled={!selected}

          >

            ثبت پاسخ

          </button>



        </div>


      }







      {
        result &&


        <div>


          <h2>

          {
            result.correct

            ?

            "✅ پاسخ صحیح"

            :

            "❌ پاسخ غلط"

          }


          </h2>


          <p>

          پاسخ صحیح:

          {result.correctAnswer}

          </p>



          {
            question.explanation &&

            <p>

            {question.explanation}

            </p>

          }




          <button

            onClick={nextQuestion}

          >

            سوال بعدی

          </button>


        </div>


      }








      {
        report &&


        <div>


          <h2>
            🎉 نتیجه تمرین
          </h2>


          <p>

          امتیاز:
          {report.report.score}

          </p>


          <p>

          دقت:
          {report.report.accuracyPercentage}%

          </p>


          <h3>

          {report.report.aiMessage}

          </h3>


        </div>


      }



    </div>


  );


}