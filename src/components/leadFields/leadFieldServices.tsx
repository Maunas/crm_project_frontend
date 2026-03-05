import type {
    LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldType, LeadFieldTypeDetailed, LeadFieldTemplate, Nomenclator, LeadFieldSection, LeadFieldSectionDetailed, NomenclatorDetailed, NomenclatorItem, NomenclatorItemDetailed,
} from "../../types/leadFields";
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "../../types/common";
import { API_BASE_URL, axiosCRM, orderList } from "../../generalService";

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
    const leadField = await axiosCRM.get(`${API_BASE_URL}/lead_fields`, { params });
    return { ...leadField.data, items: orderList(leadField.data.items, "order") };
};

export const getLeadField = async (id: number): Promise<LeadFieldDetailed> => {
    const leadField = await axiosCRM.get(`${API_BASE_URL}/lead_fields/${id}`);
    return leadField.data;
};

export const createLeadField = async (body: LeadFieldPost): Promise<LeadFieldDetailed> => {
    const leadField = await axiosCRM.post(`${API_BASE_URL}/lead_fields`, body);
    return leadField.data;
};

export const updateLeadField = async (body: LeadFieldPost, id: number): Promise<LeadFieldDetailed> => {
    const leadField = await axiosCRM.put(`${API_BASE_URL}/lead_fields/${id}`, body);
    return leadField.data;
};

export const disableLeadField = async (id: number): Promise<DeleteResponse> => {
    const leadField = await axiosCRM.delete(`${API_BASE_URL}/lead_fields/${id}`);
    return leadField.data;
};

export const enableLeadField = async (id: number): Promise<EnableResponse> => {
    const leadField = await axiosCRM.put(`${API_BASE_URL}/lead_fields/active/${id}`);
    return leadField.data;
};

export const getFieldTemplates = async (): Promise<LeadFieldTemplate[]> => {
    const tmp = await axiosCRM.get(`${API_BASE_URL}/templates/lead_fields`);
    return tmp.data;
};

export const getFieldTypes = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldTypeDetailed : LeadFieldType
>> => {
    const tmp = await axiosCRM.get(`${API_BASE_URL}/lead_field_types`, { params });
    return { ...tmp.data, items: orderList(tmp.data.items, "id") };
};

export const getNomenclators = async <T extends NomenclatorParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorDetailed : Nomenclator
>> => {
    const noms = await axiosCRM.get(`${API_BASE_URL}/nomenclators`, { params });
    return { ...noms.data, items: orderList(noms.data.items) };
};

export const getNomenclatorItems = async <T extends NomenclatorItemParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorItemDetailed : NomenclatorItem
>> => {
    const leadField = await axiosCRM.get(`${API_BASE_URL}/nomenclator_items`, { params });
    return { ...leadField.data, items: orderList(leadField.data.items, "id") };
};

export const getFieldSections = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldSectionDetailed : LeadFieldSection
>> => {
    const sections = await axiosCRM.get(`${API_BASE_URL}/lead_field_sections`, { params });
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
