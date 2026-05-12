import { type FieldValidationRulePost } from "src/types/leadFields";
import type { FieldValidationListPost, FieldValidationListPostInstance } from "./ValidationForm";
import type { ErrorBody, ErrorMessage } from "src/types/shared";
import type { Path, UseFormSetError } from "react-hook-form";
import { setFormErrors } from "src/utils/forms";

const fieldValidationRulePostFields = ["name", "error_message", "template_code", "template_params", "expression", "field_id"]

/** 
 * Organiza los datos de Validation, para evitar enviar campos incompatibles con el método de creación (template/manual)
 */
export const getValidationDataByType = (data: FieldValidationListPostInstance, isTemplate = false): FieldValidationRulePost => {

    const requiredData: FieldValidationRulePost = {
        name: data.name,
        error_message: data.error_message,
        field_id: data.field_id,
        expression: data.expression
    };
    //Si es por template, devuelve el código de template y sus parametros
    if (isTemplate) {
        //Asegura que, de no haber llenado template o sus params, no sean undefined, si no vacío.
        const params = data.template_params ?? {};
        const required = data.required_params ?? [];

        //Convierte los parametros recibidos a un arreglo, y filtra para dejar solo los requeridos.
        const filteredParams = Object.entries(params).filter(([key]) =>
            required.includes(key),
        );
        return {
            ...requiredData,
            template_code: data?.template_code,
            //Luego vuelve a convertir a objeto con Object.fromEntries
            template_params: Object.fromEntries(filteredParams),
        };
    };
    return { ...requiredData, };
}

/**
 * Función personalizada para ubicar los mensajes de error a su campo corrspondiente.
 */
export const setValFormErrors = (idx: number, isTemplate: boolean, error: ErrorBody<FieldValidationListPost>, setError: UseFormSetError<FieldValidationListPost>) => {

    const valErrorMapping = (errorArray: ErrorMessage<FieldValidationListPost>[]) => {
        errorArray.forEach(error => {
            //Busca el template_param específico del error
            if (["template_params"].includes(error.field)) {
                const param = error.message.split("'")[1]
                return setError(`validation_rules.${idx}.template_params.${param}`, { message: error.message });
            }
            //Muestra el error en template_code o expression, dependiendo del método de creación
            if (["body"].includes(error.field)) {
                return setError(`validation_rules.${idx}.${isTemplate ? "template_code" : "expression"}`, { message: error.message });
            }
            //Asegura que el error.field sea un campo válido del formulario
            if (fieldValidationRulePostFields.includes(error.field)) {
                return setError((`validation_rules.${idx}.${error.field}` as Path<FieldValidationListPost>), { message: error.message })
            }
            return setError(`root`, { message: error.message });
        })
    }
    setFormErrors(error, setError, valErrorMapping, `validation_rules.${idx}.name`)
}