import axios from "axios";
import { type FieldValidationRule, type FieldValidationRuleTemplate, type FieldValidationRulePost, fieldValidationRulePostFields } from "../../types/leadFields";
import { API_BASE_URL, setFormErrors } from "../../generalService";
import type { FieldValidationListPost, FieldValidationListPostInstance } from "../validations/ValidationForm";
import type { Path, UseFormSetError } from "react-hook-form";
import type { DeleteResponse, ErrorBody, ErrorMessage } from "../../types/common";

/****************************************** Validation **************************************** */
export const getValidationTemplates = async (): Promise<FieldValidationRuleTemplate[]> => {
    const val = await axios.get(`${API_BASE_URL}/templates/validation_rules`);
    return val.data;
};

export const createValidation = async (body: FieldValidationRulePost): Promise<FieldValidationRule> => {
    const val = await axios.post(`${API_BASE_URL}/validation_rules`, body);
    return val.data;
};

export const updateValidation = async (body: FieldValidationRulePost, id: number): Promise<FieldValidationRule> => {
    const val = await axios.put(`${API_BASE_URL}/validation_rules/${id}`, body);
    return val.data;
};

export const deleteValidation = async (id: number): Promise<DeleteResponse> => {
    const val = await axios.delete(`${API_BASE_URL}/validation_rules/${id}`);
    return val.data;
};

//Organiza los datos de Validation, para evitar enviar campos incompatibles con el método de creación (template/manual)
export const getValidationDataByType = (data: FieldValidationListPostInstance, isTemplate = false): FieldValidationRulePost => {

    const requiredData: FieldValidationRulePost = {
        name: data.name,
        error_message: data.error_message,
        field_id: data.field_id,
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
    } else {
        //Si es manual, solo devuelve la expresión.
        return { ...requiredData, expression: data.expression };
    }
};

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
            //Aseguro que el error.field sea un campo válido del formulario
            if (fieldValidationRulePostFields.includes(error.field)) {
                return setError((`validation_rules.${idx}.${error.field}` as Path<FieldValidationListPost>), { message: error.message })
            }
            return setError(`root`, { message: error.message });
        })
    }
    setFormErrors(error, setError, valErrorMapping)
}