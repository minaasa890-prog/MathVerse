import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";


export default function StudentAnalysis(){

  const { studentId } = useParams();

  const [data,setData] = useState<any>(null);
  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    async function load(){

      try{

        const res = await api.get(
          `/teacher/student/${studentId}/ai-analysis`
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


  },[studentId]);



  if(loading){

    return (
      <div className="p-6">
        در حال دریافت اطلاعات...
      </div>
    );

  }



  if(!data){

    return (
      <div className="p-6">
        اطلاعاتی پیدا نشد
      </div>
    );

  }



  return (

    <div className="p-6">


      <h1 className="text-2xl font-bold mb-6">
        تحلیل دانش‌آموز
      </h1>



      <div className="bg-white rounded-xl shadow p-6">


        <h2 className="text-xl font-bold">
          {data.name}
        </h2>


        <p className="mt-3">
          شناسه دانش‌آموز:
          {" "}
          {data.studentId}
        </p>



        <p>
          سطح:
          {" "}
          {data.level}
        </p>



        <p>
          میانگین:
          {" "}
          {data.average}
        </p>



        <hr className="my-5"/>



        <h3 className="text-lg font-bold">
          نقاط ضعف
        </h3>


        {

          data.weakTopics?.map(
            (item:any,index:number)=>(

              <div
                key={index}
                className="mt-2 bg-red-100 p-3 rounded"
              >

                {item.topic}

                {" - "}

                امتیاز:
                {item.score}

              </div>

            )

          )

        }



        <h3 className="text-lg font-bold mt-6">
          نقاط قوت
        </h3>


        {

          data.strongTopics?.map(
            (item:any,index:number)=>(

              <div
                key={index}
                className="mt-2 bg-green-100 p-3 rounded"
              >

                {item.topic}

                {" - "}

                امتیاز:
                {item.score}

              </div>

            )

          )

        }




        <h3 className="text-lg font-bold mt-6">
          برنامه یادگیری AI
        </h3>



        {

          data.learningPlan?.map(
            (item:string,index:number)=>(

              <div
                key={index}
                className="mt-2"
              >

                ✅ {item}

              </div>

            )

          )

        }



      </div>


    </div>

  );


}