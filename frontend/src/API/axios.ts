import axios from "axios";
import { API } from "./ApiBaseUrl";

const axiosClient = axios.create({
    baseURL: API,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

let isRefreshing = false;
let refreshPromise: any = null;

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh' && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = new Promise(async (resolve, reject) => {
                    try {
                        const response = await axios.post(`${API}/auth/refresh`, {}, {
                            withCredentials: true,
                        });
                        const newAccessToken = response.data.accessToken;
                        isRefreshing = false;
                        resolve(newAccessToken);
                    } catch (refreshError) {
                        isRefreshing = false;
                        refreshPromise = null;
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('auth:logout'));
                        }
                        reject(refreshError);
                    }
                });
            }

            return refreshPromise.then(() => axiosClient(originalRequest));
        }

        return Promise.reject(error);
    }
);

export default axiosClient;