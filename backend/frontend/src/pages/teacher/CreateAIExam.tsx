import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";


export default function CreateAIExam(){


  const { id } = useParams();

  const navigate = useNavigate();


  const [title,setTitle] = useState("AI Generated Exam");
  const [subject,setSubject] = useState("Math");
  const [chapter,setChapter] = useState("Algebra");
  const [count,setCount] = useState(5);

  const [loading,setLoading] = useState(false);



  async function createExam(){


    try{


      setLoading(true);



      await api.post(
        "/ai-exam/create",
        {

          classroomId:Number(id),

          title,

          subject,

          chapter,

          count

        }
      );



      alert(
        "آزمون AI ساخته شد"
      );



      navigate(
        `/teacher/class/${id}/exams`
      );



    }catch(error){


      console.log(error);

      alert(
        "خطا در ساخت آزمون"
      );


    }
    finally{

      setLoading(false);

    }


  }




  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">

        🤖 ساخت آزمون با AI

      </h1>



      <div className="
      bg-white
      shadow
      rounded-xl
      p-6
      max-w-xl
      ">



        <label>
          عنوان آزمون
        </label>

        <input

          className="
          border
          p-3
          rounded
          w-full
          mb-4
          "

          value={title}

          onChange={
            e=>setTitle(e.target.value)
          }

        />



        <label>
          درس
        </label>


        <input

          className="
          border
          p-3
          rounded
          w-full
          mb-4
          "

          value={subject}

          onChange={
            e=>setSubject(e.target.value)
          }

        />



        <label>
          فصل
        </label>


        <input

          className="
          border
          p-3
          rounded
          w-full
          mb-4
          "

          value={chapter}

          onChange={
            e=>setChapter(e.target.value)
          }

        />




        <label>
          تعداد سوال
        </label>


        <input

          type="number"

          className="
          border
          p-3
          rounded
          w-full
          mb-5
          "

          value={count}

          onChange={
            e=>setCount(
              Number(e.target.value)
            )
          }

        />




        <button

          onClick={createExam}

          disabled={loading}

          className="
          bg-purple-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          {
            loading
            ?
            "در حال ساخت..."
            :
            "ساخت آزمون AI"
          }


        </button>



      </div>


    </div>

  );

}