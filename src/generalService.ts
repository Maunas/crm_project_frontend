import type { ErrorBody, ErrorMessage } from "./types/common";
import axios from "axios"
import type { FieldValues, UseFormSetError } from "react-hook-form";
export const API_BASE_URL = "http://localhost:8000";

export const axiosCRM = axios.create({
  baseURL: 'http://localhost:8000/',
})

axiosCRM.interceptors.request.use(config => {
  // Haz algo antes que la petición se ha enviada+
  const orgId = window.localStorage.getItem("organization_id")
  if (orgId) config.headers["X-Organization-Id"] = orgId
  return config;
}, function (error) {
  // Haz algo con el error de la petición
  alert("Error de conexión.")
  return Promise.reject(error);
});

export const generalSearch = async (query: string) => {
  const res = await axiosCRM.get(`${API_BASE_URL}/search`, { params: { query } })
  return res.data
}

export const getFieldType = (
  fieldType: string,
  value: string | boolean | number,
) => {
  if (typeof value !== "string") return value;

  switch (fieldType) {
    case "INT":
    case "NUMBER":
      return parseInt(value);
    case "BOOL":
      return value === "1";
  }
  return value;
};

export function orderList(list: [{ [orderField]: number }], orderField: string = "id", desc = false) {
  const newList = [...list];
  return newList.sort((a, b) => {
    return desc
      ? (b?.[orderField] ?? 0) - (a?.[orderField] ?? 0)
      : (a?.[orderField] ?? 0) - (b?.[orderField] ?? 0);
  });
}

export const setFormErrors = <T extends FieldValues,>(error: ErrorBody<T>, setError: UseFormSetError<T>,
  mapFunction: null | ((error: ErrorMessage<T>[]) => void) = null) => {

  const errorDetail = error?.response?.data?.detail;
  //Si el error está en el cuerpo (Ej: Error de axios)
  if (!errorDetail) return setError("root", { message: error.message });
  //Si el error no tiene identificador
  if (typeof errorDetail === "string") return setError("root", { message: errorDetail });
  //Lista de errores de formulario
  if (Array.isArray(errorDetail)) {
    //Ejecuta una funcion personalizada
    if (mapFunction) return mapFunction(errorDetail);
    //Setea los errores en el formulario.
    else return errorDetail?.forEach((error: ErrorMessage<T>) => {
      if (error.field === "general") setError("root", { message: error.message });
      else {
        setError(error.field, { message: error.message });
      }
    })
  }
  //Un solo error de formulario
  if (errorDetail.field === "general") setError("root", { message: error.message });
  else {
    setError(errorDetail.field, { message: errorDetail.message });
  }
}