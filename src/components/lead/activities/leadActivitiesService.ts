import { axiosCRM } from "../../../generalService";
import type { LeadCommentPost } from "../../../types/leads";

export const createComment = async (data: LeadCommentPost) => {
    const com = await axiosCRM.post("lead_comments", data)
    return com.data
}