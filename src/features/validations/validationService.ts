import type { FieldValidationListPost, FieldValidationListPostInstance } from "./ValidationForm";
import type { DeleteResponse, ErrorBody, ErrorMessage } from "../../types/shared";
import { type FieldValidationRule, type FieldValidationRuleTemplate, type FieldValidationRulePost, fieldValidationRulePostFields } from "../../types/leadFields";
import { setFormErrors } from "src/utils/forms";
import type { Path, UseFormSetError } from "react-hook-form";
import axiosCRM from "src/lib/axios";

/****************************************** Validation **************************************** */
export const getValidationTemplates = async (): Promise<FieldValidationRuleTemplate[]> => {
    const val = await axiosCRM.get(`templates/validation_rules`);
    return val.data;
};

export const createValidation = async (body: FieldValidationRulePost): Promise<FieldValidationRule> => {
    const val = await axiosCRM.post(`validation_rules`, body);
    return val.data;
};

export const updateValidation = async (body: FieldValidationRulePost, id: number): Promise<FieldValidationRule> => {
    const val = await axiosCRM.put(`validation_rules/${id}`, body);
    return val.data;
};

export const deleteValidation = async (id: number): Promise<DeleteResponse> => {
    const val = await axiosCRM.delete(`validation_rules/${id}`);
    return val.data;
};

//Organiza los datos de Validation, para evitar enviar campos incompatibles con el método de creación (template/manual)
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