import axios from "axios"
import type { Organization } from "src/types/campaigns";

export const API_BASE_URL = "http://localhost:8000";

export const axiosCRM = axios.create({
    baseURL: API_BASE_URL,
})

export default axiosCRM

axiosCRM.interceptors.request.use(config => {
    const storageOrg = window.localStorage.getItem("selected_org")
    if (!storageOrg) return config;
    const org: Organization = JSON.parse(storageOrg)
    if (org && org.id !== 0) {
        config.headers["X-Organization-Id"] = org.id
    }
    return config
}, function (error) {
    // Haz algo con el error de la petición
    alert("Error de conexión.")
    return Promise.reject(error);
});
