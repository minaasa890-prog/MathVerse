import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";


export default function ClassroomDetails() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {


    async function loadData() {

      try {


        const studentsResponse = await api.get(
          `/teacher/class/${id}/students`
        );


        const resultsResponse = await api.get(
          `/teacher/class/${id}/results`
        );


        setStudents(studentsResponse.data);

        setResults(resultsResponse.data);



      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    }



    loadData();


  }, [id]);





  if (loading) {

    return (

      <div className="p-6">

        در حال دریافت اطلاعات کلاس...

      </div>

    );

  }





  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">

        کلاس شماره {id}

      </h1>





      <div className="bg-white shadow rounded-xl p-6 mb-6">


        <h2 className="text-2xl font-bold mb-5">

          👨‍🎓 دانش‌آموزان

        </h2>




        {

          students.length === 0 ?

          (

            <p>
              دانش‌آموزی پیدا نشد
            </p>

          )

          :

          (

            students.map((student:any)=>(


              <div

                key={student.id}

                className="
                border
                rounded-xl
                p-5
                mb-4
                "

              >


                <h3 className="text-xl font-bold">

                  {student.name}

                </h3>



                <p>

                  {student.email}

                </p>



                <p className="mt-2">

                  سطح:
                  {" "}
                  {student.level}

                </p>



                <p>

                  XP:
                  {" "}
                  {student.xp}

                </p>




                <button

                  onClick={()=>

                    navigate(
                      `/teacher/student/${student.id}/analysis`
                    )

                  }


                  className="
                  mt-4
                  bg-purple-600
                  text-white
                  px-5
                  py-2
                  rounded-lg
                  "

                >

                  تحلیل دانش‌آموز

                </button>



              </div>


            ))

          )

        }



      </div>






      <div className="bg-white shadow rounded-xl p-6">


        <h2 className="text-2xl font-bold mb-5">

          📝 نتایج آزمون‌ها

        </h2>




        {

          results.length === 0 ?

          (

            <p>

              نتیجه‌ای پیدا نشد

            </p>

          )

          :

          (

            results.map((item:any,index:number)=>(


              <div

                key={index}

                className="
                border
                rounded-lg
                p-4
                mb-3
                "

              >

                <pre>

                  {JSON.stringify(
                    item,
                    null,
                    2
                  )}

                </pre>


              </div>


            ))

          )


        }



      </div>




    </div>


  );


}