import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Classroom {

  id:number;

  name:string;

  students:any[];

  exams:any[];

}



export default function TeacherClasses(){


  const [classes,setClasses] = useState<Classroom[]>([]);

  const [loading,setLoading] = useState(true);



  useEffect(()=>{


    async function loadClasses(){


      try{


        const response = await api.get(
          "/dashboard/teacher/1"
        );


        console.log(response.data);


        setClasses(
          response.data.classrooms
        );


      }
      catch(error){


        console.log(
          "خطا در دریافت کلاس‌ها",
          error
        );


      }
      finally{


        setLoading(false);


      }


    }



    loadClasses();


  },[]);




  if(loading){

    return (

      <div className="p-6">

        در حال دریافت کلاس‌ها...

      </div>

    );

  }




  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">

        کلاس‌های من

      </h1>




      {
        classes.length === 0 && (

          <div className="text-red-500">

            هیچ کلاسی پیدا نشد

          </div>

        )
      }





      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-6
      ">


        {
          classes.map((cls)=>(


            <div

              key={cls.id}

              className="
                bg-white
                rounded-xl
                shadow
                p-6
              "

            >



              <h2 className="text-xl font-bold">

                {cls.name}

              </h2>




              <div className="mt-4">


                👨‍🎓 دانش‌آموز:

                <b>

                  {" "}

                  {cls.students?.length || 0}

                </b>


              </div>




              <div>


                📝 آزمون:

                <b>

                  {" "}

                  {cls.exams?.length || 0}

                </b>


              </div>




              <button

                className="
                  mt-5
                  bg-blue-600
                  text-white
                  px-5
                  py-2
                  rounded-lg
                "

              >

                مشاهده کلاس

              </button>



            </div>


          ))
        }


      </div>



    </div>

  );


}