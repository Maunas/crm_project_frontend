import { axiosCRM } from "../../../generalService";
import type { DeleteResponse, ListParams, Paginable } from "../../../types/common";
import type { LeadComment, LeadCommentPost } from "../../../types/leads";

interface CommentParams extends ListParams {
    leadId: number
}

export const getComments = async (params?: CommentParams): Promise<Paginable<LeadComment>> => {
    const com = await axiosCRM.get("lead_comments", { params })
    return { ...com.data, items: com.data.items.filter((i: LeadComment) => i.lead_id === params?.leadId) }
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