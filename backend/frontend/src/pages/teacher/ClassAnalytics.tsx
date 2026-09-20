import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";


export default function ClassAnalytics(){

  const { id } = useParams();


  const [data,setData] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);



  useEffect(()=>{


    async function load(){


      try{


        const res = await api.get(
          `/teacher/class/${id}/results`
        );


        setData(res.data);


      }catch(error){

        console.log(error);

      }
      finally{

        setLoading(false);

      }


    }


    load();


  },[id]);





  if(loading){

    return (

      <div className="p-6">
        در حال دریافت نتایج...
      </div>

    );

  }




  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">

        📊 تحلیل کلاس

      </h1>



      <div className="bg-white shadow rounded-xl p-6">


        {

          data.length === 0 ?

          (

            <p>
              نتیجه‌ای پیدا نشد
            </p>

          )

          :

          (

            data.map((item:any,index:number)=>(


              <div

                key={index}

                className="
                border
                rounded-xl
                p-5
                mb-4
                "

              >


                <h2 className="font-bold text-xl">

                  آزمون {index + 1}

                </h2>



                <p className="mt-2">

                  دانش‌آموز:
                  {" "}
                  {item.student?.name || "-"}

                </p>



                <p>

                  امتیاز:
                  {" "}
                  {item.score || 0}

                </p>



                <p>

                  درصد:
                  {" "}
                  {item.percentage || 0}%

                </p>



              </div>


            ))

          )


        }



      </div>



    </div>

  );


}