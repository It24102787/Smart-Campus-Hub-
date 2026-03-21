import axios from "axios";
import { getToken, clearAuthSession } from "../utils/authSession";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Normalize to backend host and append exactly one "/api".
const cleaned = rawBase.replace(/\/+$/, "");
const rootBase = cleaned.replace(/\/api$/, "");
const baseURL = `${rootBase}/api`;

const api = axios.create({
    baseURL,
    headers: { Accept: "application/json" },
});

console.log("API BASE URL:", api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFormData) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
    } else if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            clearAuthSession();
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
