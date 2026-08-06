import type { LeadAudit, LeadComment, LeadCommentPost } from "src/types/leads";
import type { DeleteResponse, ListParams, Paginable } from "src/types/shared";
import axiosCRM from "src/lib/axios";

interface CommentParams extends ListParams {
    // FK a Lead: public_uuid desde Fase 3 (el backend ya resuelve este filtro en el GET genérico,
    // y LeadCommentPost.lead_id -- usado en create/update -- también espera este mismo uuid
    // desde el fix de la deuda urgente, ver backend/AGENTS.md §18).
    lead_id: string
}

export const getComments = async (params?: CommentParams): Promise<Paginable<LeadComment>> => {
    const com = await axiosCRM.get("lead_comments", { params })
    return com.data
}

export const createComment = async (data: LeadCommentPost) => {
    const com = await axiosCRM.post("lead_comments", data)
    return com.data
}

// id es el public_uuid del comentario (rutas genéricas de BaseController, ver backend/AGENTS.md §17-18).
export const updateComment = async (data: LeadCommentPost, id: string): Promise<LeadComment> => {
    const com = await axiosCRM.put(`lead_comments/${id}`, data)
    return com.data
}
export const deleteComment = async (id: string): Promise<DeleteResponse> => {
    const com = await axiosCRM.delete(`lead_comments/${id}`)
    return com.data
}

export const getAudit = async (params?: CommentParams): Promise<Paginable<LeadAudit>> => {
    const aud = await axiosCRM.get("lead-activity-histories", { params })
    return aud.data
}