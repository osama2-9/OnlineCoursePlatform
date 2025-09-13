import axios from "axios";
import { API } from "./ApiBaseUrl";

const axiosClient =axios.create({
    baseURL:API,
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    }
})


export default axiosClient