import axios from "axios"

export const API_BASE_URL = "http://localhost:8000";

export const axiosCRM = axios.create({
    baseURL: API_BASE_URL,
})

export default axiosCRM

axiosCRM.interceptors.request.use(config => {
    // Haz algo antes que la petición se ha enviada+
    const org = window.localStorage.getItem("selected_org")
    if (org) config.headers["X-Organization-Id"] = JSON.parse(org).id
    return config;
}, function (error) {
    // Haz algo con el error de la petición
    alert("Error de conexión.")
    return Promise.reject(error);
});
