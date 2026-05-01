import { API_BASE_URL, axiosCRM } from "../../../generalService";
import type { DeleteResponse, ListParams, Paginable } from "../../../types/common";
import type { Lead, LeadTag, LeadTagDetailed, LeadTagPost } from "../../../types/leads";

export const getTags = async <T extends ListParams>(params?: T)
    : Promise<Paginable<T["detailed"] extends true ? LeadTagDetailed : LeadTag>> => {
    const tags = await axiosCRM.get(`${API_BASE_URL}/tags`, { params });
    return tags.data;
};

export const createTag = async (body: LeadTagPost): Promise<LeadTagDetailed> => {
    const tag = await axiosCRM.post(`${API_BASE_URL}/tags`, body);
    return tag.data;
};

export const updateTag = async (body: LeadTagPost, id: number): Promise<LeadTagDetailed> => {
    const tag = await axiosCRM.put(`${API_BASE_URL}/tags/${id}`, body);
    return tag.data;
};

export const deleteTag = async (id: number): Promise<DeleteResponse> => {
    const tag = await axiosCRM.delete(`${API_BASE_URL}/tags/${id}`);
    return tag.data;
};

export const updateLeadTags = async (ids: number[], leadId: number): Promise<Lead> => {
    const lead = await axiosCRM.put(`${API_BASE_URL}/leads/${leadId}`, { tag_ids: ids });
    return lead.data;
};