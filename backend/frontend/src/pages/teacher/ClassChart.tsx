import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";


export default function ClassChart() {

  const { id } = useParams();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadData() {

      try {

        const res = await api.get(
          `/teacher/class/${id}/results`
        );


        setData(res.data);


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
        در حال دریافت اطلاعات نمودار...
      </div>

    );

  }





  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">
        📈 نمودار عملکرد کلاس
      </h1>



      <div className="
        bg-white
        shadow
        rounded-xl
        p-6
      ">



        {
          data.length === 0 ?

          (

            <p>
              اطلاعاتی برای نمایش وجود ندارد
            </p>

          )

          :

          (

            data.map((item:any,index:number)=>{


              const score = item.score || 0;


              return (

                <div
                  key={index}
                  className="mb-6"
                >


                  <div className="
                    flex
                    justify-between
                    mb-2
                  ">


                    <span className="font-bold">

                      {
                        item.student?.name ||
                        `دانش‌آموز ${index+1}`
                      }

                    </span>



                    <span>

                      {score}%

                    </span>


                  </div>




                  <div className="
                    w-full
                    h-6
                    bg-gray-200
                    rounded-full
                    overflow-hidden
                  ">


                    <div

                      className="
                      h-6
                      bg-blue-600
                      rounded-full
                      "

                      style={{
                        width:`${score}%`
                      }}

                    />


                  </div>



                </div>

              );


            })

          )

        }



      </div>



    </div>

  );

}