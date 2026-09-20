import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";


export default function TeacherClass(){

const {id}=useParams();

const [students,setStudents]=useState<any[]>([]);
const [loading,setLoading]=useState(true);



useEffect(()=>{


async function load(){


try{


const res = await api.get(
`/teacher/class/${id}/students`
);


console.log("API RESPONSE:",res.data);



if(Array.isArray(res.data)){

setStudents(res.data);

}
else if(res.data.students){

setStudents(res.data.students);

}
else{

setStudents([]);

}



}
catch(error){

console.log("API ERROR:",error);

}
finally{

setLoading(false);

}


}


load();


},[id]);





if(loading){

return (

<div className="p-10">

در حال دریافت اطلاعات...

</div>

)

}





return (

<div className="p-6">


<h1 className="text-3xl font-bold">

دانش‌آموزان کلاس

</h1>



{
students.length===0 &&

<p className="mt-5">

دانش‌آموزی پیدا نشد

</p>

}



{

students.map((student)=>(


<div

key={student.id}

className="
bg-white
shadow
rounded-xl
p-5
mt-5
"

>


<h2 className="text-xl font-bold">

{student.name}

</h2>


<p>

📧 {student.email}

</p>


<p>

⭐ XP : {student.xp}

</p>


<p>

🏆 Level : {student.level}

</p>


</div>


))


}



</div>


)

}