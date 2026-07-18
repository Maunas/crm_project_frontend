import axiosCRM from "src/lib/axios";
import type { LeadFieldSection, LeadFieldSectionDetailed, LeadFieldSectionPost } from "src/types/orgProperties";
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared";

export const getFieldSections = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldSectionDetailed : LeadFieldSection
>> => {
    const sections = await axiosCRM.get(`lead_field_sections`, { params });
    return sections.data;
};

export const getFieldSection = async (id: number): Promise<LeadFieldSectionDetailed> => {
    const section = await axiosCRM.get(`lead_field_sections/${id}`);
    return section.data;
};

export const createFieldSection = async (body: LeadFieldSectionPost): Promise<LeadFieldSectionDetailed> => {
    const section = await axiosCRM.post(`lead_field_sections`, body);
    return section.data;
};

export const updateFieldSection = async (body: LeadFieldSectionPost, id: number): Promise<LeadFieldSectionDetailed> => {
    const section = await axiosCRM.put(`lead_field_sections/${id}`, body);
    return section.data;
};

export const enableFieldSection = async (id: number): Promise<EnableResponse> => {
    const section = await axiosCRM.put(`lead_field_sections/active/${id}`);
    return section.data;
};
export const disableFieldSection = async (id: number): Promise<DeleteResponse> => {
    const section = await axiosCRM.delete(`lead_field_sections/${id}`);
    return section.data;
};