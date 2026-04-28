import { API_BASE_URL, axiosCRM } from "../../../generalService";
import type { ListParams, Paginable } from "../../../types/common";
import type { Lead, LeadTag, LeadTagDetailed } from "../../../types/leads";

export const getTags = async <T extends ListParams>(params?: T)
    : Promise<Paginable<T["detailed"] extends true ? LeadTagDetailed : LeadTag>> => {
    const tags = await axiosCRM.get(`${API_BASE_URL}/tags`, { params });
    return tags.data;
};

export const updateLeadTags = async (ids: number[], leadId: number): Promise<Lead> => {
    const lead = await axiosCRM.put(`${API_BASE_URL}/leads/${leadId}`, { tag_ids: ids });
    return lead.data;
};