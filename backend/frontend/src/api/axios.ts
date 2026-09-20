import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.43.167:4000",
});

export default api;