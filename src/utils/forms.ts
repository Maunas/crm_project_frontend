import type { ErrorBody, ErrorMessage } from "src/types/shared";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Identifica los errores y los setea con su campo correspondiente.
 */
export const setFormErrors = <T extends FieldValues,>(error: ErrorBody<T>, setError: UseFormSetError<T>,
    mapFunction: null | ((error: ErrorMessage<T>[]) => void) = null, customRoot: Path<T> = "root" as Path<T>) => {

    const errorDetail = error?.response?.data?.detail;
    //Si el error está en el cuerpo (Ej: Error de axios)
    if (!errorDetail) return setError(customRoot, { message: error.message ?? error.detail });
    //Si el error no tiene identificador
    if (typeof errorDetail === "string") return setError(customRoot, { message: errorDetail });
    //Lista de errores de formulario
    if (Array.isArray(errorDetail)) {
        //Ejecuta una funcion personalizada
        if (mapFunction) return mapFunction(errorDetail);
        //Setea los errores en el formulario.
        else return errorDetail?.forEach((error: ErrorMessage<T>) => {
            if (error.field === "general") setError(customRoot, { message: error.message });
            else {
                setError(error.field, { message: error.message });
            }
        })
    }
    //Un solo error de formulario
    if (errorDetail.field === "general") setError(customRoot, { message: error.message });
    else {
        setError(errorDetail.field, { message: errorDetail.message });
    }
}