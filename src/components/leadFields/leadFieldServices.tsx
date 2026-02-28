import axios from "axios";
import type {
    LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldType, LeadFieldTypeDetailed, LeadFieldTemplate, Nomenclator, LeadFieldSection, LeadFieldSectionDetailed, NomenclatorDetailed, FieldValidationRule, FieldValidationRuleTemplate, FieldValidationRulePost, NomenclatorItem, NomenclatorItemDetailed,
} from "../../types/leadFields";
import type { ListParams, Paginable } from "../../types/common";
import type { FieldValidationRuleData } from "./LeadFieldForm";
import { API_BASE_URL, orderList } from "../../generalService";

interface LeadFieldParams extends ListParams {
    campaign_id?: number;
}
interface NomenclatorParams extends ListParams {
    campaign_id?: number;
    global_nomenclator?: boolean;
}
interface NomenclatorItemParams extends ListParams {
    nomenclator_id?: number;
    parent_item_id?: number;
}

export const getLeadFields = async <T extends LeadFieldParams>(
    params?: T,
): Promise<Paginable<T["detailed"] extends true ? LeadFieldDetailed : LeadField>> => {
    const leadField = await axios.get(`${API_BASE_URL}/lead_fields`, { params });
    return { ...leadField.data, items: orderList(leadField.data.items, "order") };
};

export const getLeadField = async (id: number): Promise<LeadFieldDetailed> => {
    const leadField = await axios.get(`${API_BASE_URL}/lead_fields/${id}`);
    return leadField.data;
};

export const createLeadField = async (body: LeadFieldPost): Promise<LeadFieldDetailed> => {
    const leadField = await axios.post(`${API_BASE_URL}/lead_fields`, body);
    return leadField.data;
};

export const updateLeadField = async (body: LeadFieldPost, id: number): Promise<LeadFieldDetailed> => {
    const leadField = await axios.put(`${API_BASE_URL}/lead_fields/${id}`, body);
    return leadField.data;
};

export const disableLeadField = async (id: number): Promise<{ action: string }> => {
    const leadField = await axios.delete(`${API_BASE_URL}/lead_fields/${id}`);
    return leadField.data;
};

export const enableLeadField = async (id: number): Promise<{ actived: boolean }> => {
    const leadField = await axios.put(`${API_BASE_URL}/lead_fields/active/${id}`);
    return leadField.data;
};

export const getFieldTemplates = async (): Promise<LeadFieldTemplate[]> => {
    const tmp = await axios.get(`${API_BASE_URL}/templates/lead_fields`);
    return tmp.data;
};

export const getFieldTypes = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldTypeDetailed : LeadFieldType
>> => {
    const tmp = await axios.get(`${API_BASE_URL}/lead_field_types`, { params });
    return { ...tmp.data, items: orderList(tmp.data.items, "id") };
};

export const getNomenclators = async <T extends NomenclatorParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorDetailed : Nomenclator
>> => {
    const noms = await axios.get(`${API_BASE_URL}/nomenclators`, { params });
    return { ...noms.data, items: orderList(noms.data.items) };
};

export const getNomenclatorItems = async <T extends NomenclatorItemParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorItemDetailed : NomenclatorItem
>> => {
    const leadField = await axios.get(`${API_BASE_URL}/nomenclator_items`, { params });
    return { ...leadField.data, items: orderList(leadField.data.items, "id") };
};

export const getValidationTemplates = async (): Promise<
    FieldValidationRuleTemplate[]
> => {
    const val = await axios.get(`${API_BASE_URL}/templates/validation_rules`);
    return val.data;
};

export const createValidation = async (
    body: FieldValidationRulePost,
): Promise<FieldValidationRule[]> => {
    const val = await axios.post(`${API_BASE_URL}/validation_rules`, body);
    return val.data;
};

export const updateValidation = async (
    body: FieldValidationRulePost,
    id: number,
): Promise<FieldValidationRule[]> => {
    const val = await axios.put(`${API_BASE_URL}/validation_rules/${id}`, body);
    return val.data;
};

export const getFieldSections = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldSectionDetailed : LeadFieldSection
>> => {
    const sections = await axios.get(`${API_BASE_URL}/lead_field_sections`, { params });
    return { ...sections.data, items: orderList(sections.data.items, "id") };
};

/****************************************Mapeo de Datos****************************************** */

//Organiza los datos de LeadField, para evitar enviar campos incompatibles con el método de creación (template/manual)
export const getFieldDataByType = (data: LeadFieldPost, isTemplate = false,): LeadFieldPost => {
    const requiredData: LeadFieldPost = {
        name: data.name,
        order: data.order,
        campaign_id: data.campaign_id,
        required: data.required,
        is_primary: data.is_primary,
        is_visible: data.is_visible,
        lead_field_section_id: data.lead_field_section_id,
        default_value: data.default_value,
        input_mask: data.input_mask,
    };
    //Si es por template, devuelve el código unicamente
    if (isTemplate)
        return { ...requiredData, field_template_code: data.field_template_code };
    //Si no se ha enviado el tipo, se recibe error de validación del backend
    if (!data.field_type_code) return requiredData;

    //Casos especiales por tipo de dato
    const manualData: LeadFieldPost = {
        ...requiredData,
        field_type_code: data.field_type_code,
        field_subtype_code: data.field_subtype_code,
    };

    switch (data.field_type_code) {
        case "SELECTOR":
        case "CHECKBOX":
            return { ...manualData, nomenclator_id: data.nomenclator_id };
        case "LEAD":
            return { ...manualData, related_campaign_id: data.related_campaign_id };
        case "CALCULATED":
            return {
                ...manualData,
                calculation_expression: data.calculation_expression,
            };
        default:
            return manualData;
    }
};

//Organiza los datos de Validation, para evitar enviar campos incompatibles con el método de creación (template/manual)
export const getValidationDataByType = (data: FieldValidationRuleData, isTemplate = false,): FieldValidationRulePost => {

    const requiredData: FieldValidationRuleData = {
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