import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";


interface Student {

  id:number;
  name:string;
  email:string;
  level:number;
  xp:number;

}



interface Exam {

  id:number;
  title:string;
  status:string;

}



interface Classroom {

  id:number;
  name:string;
  students:Student[];
  exams:Exam[];

}




export default function ClassDetails(){


  const {id} = useParams();

  const navigate = useNavigate();


  const [classroom,setClassroom] = useState<Classroom | null>(null);

  const [loading,setLoading] = useState(true);





  useEffect(()=>{


    async function loadClass(){


      try{


        const res = await api.get(
          "/dashboard/teacher/1"
        );



        const selectedClass =
          res.data.classrooms.find(
            (item:any)=>
              item.id === Number(id)
          );



        setClassroom(selectedClass);



      }catch(error){

        console.log(error);

      }
      finally{

        setLoading(false);

      }


    }



    loadClass();



  },[id]);







  if(loading){

    return (

      <div className="p-6">

        در حال دریافت اطلاعات...

      </div>

    );

  }






  if(!classroom){

    return (

      <div className="p-6">

        کلاس پیدا نشد

      </div>

    );

  }







  return (


    <div className="p-6 bg-gray-100 min-h-screen">



      <h1 className="text-3xl font-bold mb-8">

        {classroom.name}

      </h1>






      <h2 className="text-2xl font-bold mb-5">

        👨‍🎓 دانش‌آموزان

      </h2>





      <div className="grid md:grid-cols-2 gap-5">



      {
        classroom.students.map((student)=>(


          <div

          key={student.id}

          className="
          bg-white
          rounded-xl
          shadow
          p-5
          "

          >



            <h3 className="text-xl font-bold">

              {student.name}

            </h3>




            <p>

              {student.email}

            </p>




            <p className="mt-3">

              سطح:

              <b>

                {" "}{student.level}

              </b>

            </p>




            <p>

              XP:

              <b>

                {" "}{student.xp}

              </b>

            </p>






            <button


            onClick={()=>{

              navigate(
                `/teacher/student/${student.id}`
              );

            }}



            className="
            mt-5
            bg-green-600
            text-white
            px-4
            py-2
            rounded-lg
            "

            >


              تحلیل دانش‌آموز


            </button>



          </div>


        ))
      }



      </div>








      <h2 className="text-2xl font-bold mt-10 mb-5">

        📝 آزمون‌ها

      </h2>






      {
        classroom.exams.map((exam)=>(


          <div

          key={exam.id}

          className="
          bg-white
          rounded-lg
          shadow
          p-4
          mb-3
          "

          >


            {exam.title}

            -

            {exam.status}


          </div>



        ))
      }






    </div>


  );


}