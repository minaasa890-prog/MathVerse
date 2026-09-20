import axios from "axios";


const API = "http://localhost:4000";


export async function getStudentDashboard(
  studentId:number
){

  const response =
    await axios.get(
      `${API}/dashboard/student/${studentId}`
    );


  return response.data;

}