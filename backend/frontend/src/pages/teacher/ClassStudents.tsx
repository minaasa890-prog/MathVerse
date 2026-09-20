import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import api from "../../api/axios";



export default function ClassStudents(){


const {id}=useParams();

const navigate=useNavigate();


const [students,setStudents]=useState<any[]>([]);

const [loading,setLoading]=useState(true);




useEffect(()=>{


async function load(){


try{


const res=await api.get(

`/teacher/class/${id}/students`

);


setStudents(res.data);



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

return(

<div className="p-6">

در حال دریافت اطلاعات...

</div>

)

}





return(


<div className="p-6">


<h1 className="text-2xl font-bold mb-6">

دانش‌آموزان کلاس

</h1>




{

students.length===0 ?


<p>

دانش‌آموزی پیدا نشد

</p>



:


<div className="grid md:grid-cols-2 gap-5">


{

students.map(student=>(


<div

key={student.id}

className="
bg-white
shadow
rounded-xl
p-5
"


>


<h2 className="text-xl font-bold">

{student.name}

</h2>



<p>

{student.email}

</p>



<p className="mt-3">

🎯 سطح:

<b>

{" "}

{student.level || 1}

</b>

</p>




<p>

⭐ XP:

<b>

{" "}

{student.xp || 0}

</b>

</p>




<button


className="
mt-4
bg-green-600
text-white
px-4
py-2
rounded-lg
"



onClick={()=>


navigate(

`/teacher/student/${student.id}/analysis`

)


}


>


تحلیل دانش‌آموز


</button>




</div>



))


}


</div>



}



</div>


);


}