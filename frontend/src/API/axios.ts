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
let failedQueue: any = [];

const processQueue = (error: any, token = null) => {
    failedQueue.forEach((prom: any) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${API}/auth/refresh`, {}, {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    processQueue(null, response.data.accessToken);
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;