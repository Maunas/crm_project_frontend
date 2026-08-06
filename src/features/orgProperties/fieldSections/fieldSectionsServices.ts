import axiosCRM from "src/lib/axios";
import type { LeadFieldSection, LeadFieldSectionDetailed, LeadFieldSectionPost } from "src/types/orgProperties";
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared";

export const getFieldSections = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldSectionDetailed : LeadFieldSection
>> => {
    const sections = await axiosCRM.get(`lead_field_sections`, { params });
    return sections.data;
};

// id es el public_uuid de la sección (rutas genéricas de BaseController, ver backend/AGENTS.md §17-18).
export const getFieldSection = async (id: string): Promise<LeadFieldSectionDetailed> => {
    const section = await axiosCRM.get(`lead_field_sections/${id}`);
    return section.data;
};

export const createFieldSection = async (body: LeadFieldSectionPost): Promise<LeadFieldSectionDetailed> => {
    const section = await axiosCRM.post(`lead_field_sections`, body);
    return section.data;
};

export const updateFieldSection = async (body: LeadFieldSectionPost, id: string): Promise<LeadFieldSectionDetailed> => {
    const section = await axiosCRM.put(`lead_field_sections/${id}`, body);
    return section.data;
};

export const enableFieldSection = async (id: string): Promise<EnableResponse> => {
    const section = await axiosCRM.put(`lead_field_sections/active/${id}`);
    return section.data;
};
export const disableFieldSection = async (id: string): Promise<DeleteResponse> => {
    const section = await axiosCRM.delete(`lead_field_sections/${id}`);
    return section.data;
};