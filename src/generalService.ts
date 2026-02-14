import type { UseFormSetError } from "react-hook-form";

export const API_BASE_URL = "http://localhost:8000";

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

export function orderList(list: object[], orderField: string = "id", desc = false) {
    const newList = [...list];
    return newList.sort((a, b) => {
      return desc
        ? (b?.[orderField] ?? 0) - (a?.[orderField] ?? 0)
        : (a?.[orderField] ?? 0) - (b?.[orderField] ?? 0);
    });
}

export const setFormErrors = (error, setError: UseFormSetError<object>,
  mapFunction: null | ((error: any) => void) = null) => {
  const errorDetail = error?.response?.data?.detail;
  if (!errorDetail) return setError("root", { message: error.message });
  if (typeof errorDetail === "string") return setError("root", { message: errorDetail });
  if (errorDetail?.length > 0) {
    if (mapFunction) return mapFunction(error);
    else return errorDetail?.map((error) => {
      setError(error.field, { message: error.message });
    })
  }
  setError(errorDetail.field, { message: errorDetail.message });
}