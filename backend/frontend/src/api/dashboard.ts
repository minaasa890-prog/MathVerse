import axios from "axios";
import { API_URL } from "./config";

export async function getStudentDashboard(
  studentId: number
) {
  const response = await axios.get(
    `${API_URL}/dashboard/student/${studentId}`
  );

  return response.data;
}