import type { DeleteResponse, ListParams, Paginable } from "src/types/shared";
import axiosCRM from "src/lib/axios";
import type { LeadTag, LeadTagDetailed, LeadTagPost } from "src/types/orgProperties";

export const getTags = async <T extends ListParams>(params?: T)
    : Promise<Paginable<T["detailed"] extends true ? LeadTagDetailed : LeadTag>> => {
    const tags = await axiosCRM.get(`tags`, { params });
    return tags.data;
};

export const createTag = async (body: LeadTagPost): Promise<LeadTagDetailed> => {
    const tag = await axiosCRM.post(`tags`, body);
    return tag.data;
};

// id es el public_uuid del tag (rutas genéricas de BaseController, ver backend/AGENTS.md §17-18).
export const updateTag = async (body: LeadTagPost, id: string): Promise<LeadTagDetailed> => {
    const tag = await axiosCRM.put(`tags/${id}`, body);
    return tag.data;
};

export const deleteTag = async (id: string): Promise<DeleteResponse> => {
    const tag = await axiosCRM.delete(`tags/${id}`);
    return tag.data;
};