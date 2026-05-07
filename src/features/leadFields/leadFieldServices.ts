import type {
    LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldType, LeadFieldTypeDetailed, LeadFieldTemplate, LeadFieldSection, LeadFieldSectionDetailed,
    InputMaskTemplate
} from "../../types/leadFields";
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "../../types/shared";
import { orderListByField } from "src/utils/lists";
import axiosCRM from "src/lib/axios";

interface LeadFieldParams extends ListParams {
    campaign_id?: number;
}

export const getLeadFields = async <T extends LeadFieldParams>(
    params?: T,
): Promise<Paginable<T["detailed"] extends true ? LeadFieldDetailed : LeadField>> => {
    const leadField = await axiosCRM.get(`lead_fields`, { params });
    return { ...leadField.data, items: orderListByField(leadField.data.items, "order") };
};

export const getLeadField = async (id: number): Promise<LeadFieldDetailed> => {
    const leadField = await axiosCRM.get(`lead_fields/${id}`);
    return leadField.data;
};

export const createLeadField = async (body: LeadFieldPost): Promise<LeadFieldDetailed> => {
    const leadField = await axiosCRM.post(`lead_fields`, body);
    return leadField.data;
};

export const updateLeadField = async (body: LeadFieldPost, id: number): Promise<LeadFieldDetailed> => {
    const leadField = await axiosCRM.put(`lead_fields/${id}`, body);
    return leadField.data;
};

export const disableLeadField = async (id: number): Promise<DeleteResponse> => {
    const leadField = await axiosCRM.delete(`lead_fields/${id}`);
    return leadField.data;
};

export const enableLeadField = async (id: number): Promise<EnableResponse> => {
    const leadField = await axiosCRM.put(`lead_fields/active/${id}`);
    return leadField.data;
};

export const getFieldTemplates = async (): Promise<LeadFieldTemplate[]> => {
    const tmp = await axiosCRM.get(`templates/lead_fields`);
    return tmp.data;
};

export const getInputMaskTemplates = async (): Promise<InputMaskTemplate[]> => {
    const tmp = await axiosCRM.get(`templates/lead_fields/input_masks`);
    return tmp.data;
};

export const getFieldTypes = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldTypeDetailed : LeadFieldType
>> => {
    const tmp = await axiosCRM.get(`lead_field_types`, { params });
    return { ...tmp.data, items: orderListByField(tmp.data.items, "id") };
};

export const getFieldSections = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldSectionDetailed : LeadFieldSection
>> => {
    const sections = await axiosCRM.get(`lead_field_sections`, { params });
    return { ...sections.data, items: orderListByField(sections.data.items, "id") };
};

/****************************************Mapeo de Datos****************************************** */

//Organiza los datos de LeadField, para evitar enviar campos incompatibles con el método de creación (template/manual)
export const getFieldDataByType = (data: LeadFieldPost, isTemplate = false, isMaskTemplate = false): LeadFieldPost => {
    let requiredData: LeadFieldPost = {
        name: data.name,
        order: data.order,
        campaign_id: data.campaign_id,
        required: data.required,
        is_primary: data.is_primary,
        is_visible: data.is_visible,
        lead_field_section_id: data.lead_field_section_id,
        default_value: data.default_value,
    };

    //Si la máscara es por template, devuelve el código unicamente
    if (isMaskTemplate) {
        requiredData = { ...requiredData, mask_template_code: data.mask_template_code }
    } else {
        requiredData = { ...requiredData, input_mask: data.input_mask }
    }

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
