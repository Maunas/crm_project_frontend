import type { Lead, LeadDetailed, LeadTag, LeadTagDetailed, LeadTagPost } from "src/types/leads";
import type { DeleteResponse, ListParams, Paginable } from "src/types/shared";
import axiosCRM from "src/lib/axios";

export const getTags = async <T extends ListParams>(params?: T)
    : Promise<Paginable<T["detailed"] extends true ? LeadTagDetailed : LeadTag>> => {
    const tags = await axiosCRM.get(`tags`, { params });
    return tags.data;
};

export const createTag = async (body: LeadTagPost): Promise<LeadTagDetailed> => {
    const tag = await axiosCRM.post(`tags`, body);
    return tag.data;
};

export const updateTag = async (body: LeadTagPost, id: number): Promise<LeadTagDetailed> => {
    const tag = await axiosCRM.put(`tags/${id}`, body);
    return tag.data;
};

export const deleteTag = async (id: number): Promise<DeleteResponse> => {
    const tag = await axiosCRM.delete(`tags/${id}`);
    return tag.data;
};

export const updateLeadTags = async (ids: number[], leadId: number): Promise<Lead> => {
    const lead = await axiosCRM.put(`leads/${leadId}`, { tag_ids: ids });
    return lead.data;
};

export const changeFlowState = async (leadId: number, newStateId: number): Promise<LeadDetailed> => {
    const response = await axiosCRM.post(`/leads/${leadId}/change_state`, { new_state_id: newStateId })
    return response.data
}

export const changeContactState = async (leadId: number, newStateId: number): Promise<Lead> => {
    const response = await axiosCRM.put(`/leads/${leadId}`, { contact_state_id: newStateId })
    return response.data
}