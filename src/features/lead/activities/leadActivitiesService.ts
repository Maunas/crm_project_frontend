import type { DeleteResponse, ListParams, Paginable } from "../../../types/shared";
import type { LeadAudit, LeadComment, LeadCommentPost } from "../../../types/leads";
import axiosCRM from "src/lib/axios";

interface CommentParams extends ListParams {
    lead_id: number
}

export const getComments = async (params?: CommentParams): Promise<Paginable<LeadComment>> => {
    const com = await axiosCRM.get("lead_comments", { params })
    return com.data
}

export const createComment = async (data: LeadCommentPost) => {
    const com = await axiosCRM.post("lead_comments", data)
    return com.data
}

export const updateComment = async (data: LeadCommentPost, id: number): Promise<LeadComment> => {
    const com = await axiosCRM.put(`lead_comments/${id}`, data)
    return com.data
}
export const deleteComment = async (id: number): Promise<DeleteResponse> => {
    const com = await axiosCRM.delete(`lead_comments/${id}`)
    return com.data
}


export const getAudit = async (params?: CommentParams): Promise<Paginable<LeadAudit>> => {
    const aud = await axiosCRM.get("lead-activity-histories", { params })
    return aud.data
}