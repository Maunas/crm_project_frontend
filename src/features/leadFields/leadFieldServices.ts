import type {
    LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldType, LeadFieldTypeDetailed, LeadFieldTemplate, LeadFieldSection, LeadFieldSectionDetailed,
    InputMaskTemplate,
    LeadFieldsReorderBody
} from "../../types/leadFields";
import type { BulkDeleteResponse, BulkEnableResponse, DeleteResponse, EnableResponse, ListParams, Paginable } from "../../types/shared";
import { orderListByField } from "src/utils/lists";
import axiosCRM from "src/lib/axios";

interface LeadFieldParams extends ListParams {
    campaign_id?: number;
}

export const getLeadFields = async <T extends LeadFieldParams>(
    params?: T,
): Promise<Paginable<T["detailed"] extends true ? LeadFieldDetailed : LeadField>> => {
    const leadField = await axiosCRM.get(`lead_fields`, { params });
    const sortedList = orderListByField(leadField.data.items, "order")
    return { ...leadField.data, items: sortedList };
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

export const reorderLeadFields = async (data: LeadFieldsReorderBody): Promise<{ message: string, campaign_id: number }> => {
    const response = await axiosCRM.patch("lead_fields/reorder/bulk", data)
    return response.data
}


export const disableBulkLeadField = async (ids: number[]): Promise<BulkDeleteResponse> => {
    const leadField = await axiosCRM.post(`/lead_fields/bulk-delete`, { ids });
    return leadField.data;
};

export const enableBulkLeadField = async (ids: number[]): Promise<BulkEnableResponse> => {
    const leadField = await axiosCRM.post(`/lead_fields/bulk-active`, { ids });
    return leadField.data;
};
