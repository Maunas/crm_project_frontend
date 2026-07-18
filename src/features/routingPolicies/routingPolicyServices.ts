import type {
    LeadRoutingPolicy, LeadRoutingPolicyDetailed, LeadRoutingPolicyPost, LeadRoutingPolicyUpdate,
    LeadRoutingPolicyValidateRequest, LeadRoutingPolicyValidateResponse,
} from "src/types/routing"
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared"
import axiosCRM from "src/lib/axios"

interface RoutingPolicyParams extends ListParams {
    campaign_id?: number,
}

export const getRoutingPolicies = async <T extends RoutingPolicyParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadRoutingPolicyDetailed : LeadRoutingPolicy>> => {
    const policies = await axiosCRM.get(`/lead_routing_policies`, { params })
    return policies.data
}

export const getRoutingPolicy = async (id: number): Promise<LeadRoutingPolicyDetailed> => {
    const policy = await axiosCRM.get(`/lead_routing_policies/${id}`)
    return policy.data
}

export const createRoutingPolicy = async (body: LeadRoutingPolicyPost): Promise<LeadRoutingPolicyDetailed> => {
    const policy = await axiosCRM.post(`/lead_routing_policies`, body)
    return policy.data
}

export const updateRoutingPolicy = async (body: LeadRoutingPolicyUpdate, id: number): Promise<LeadRoutingPolicyDetailed> => {
    const policy = await axiosCRM.put(`/lead_routing_policies/${id}`, body)
    return policy.data
}

/**
 * Deshabilita la política SIN eliminarla (active=false).
 * Usa el endpoint de desactivación explícita, no el DELETE simple:
 * la política tiene delete_strategy=HARD_DELETE_WITH_TOGGLE, así que el
 * DELETE simple borra para siempre (ver deleteRoutingPolicyForever).
 */
export const disableRoutingPolicy = async (id: number): Promise<DeleteResponse> => {
    const policy = await axiosCRM.delete(`/lead_routing_policies/active/${id}`)
    return policy.data
}

/** Reactiva (active=true) una política previamente deshabilitada. */
export const enableRoutingPolicy = async (id: number): Promise<EnableResponse> => {
    const policy = await axiosCRM.put(`/lead_routing_policies/active/${id}`)
    return policy.data
}

/**
 * Elimina la política DEFINITIVAMENTE (borrado físico, irreversible).
 * No confundir con disableRoutingPolicy.
 */
export const deleteRoutingPolicyForever = async (id: number): Promise<DeleteResponse> => {
    const policy = await axiosCRM.delete(`/lead_routing_policies/${id}`)
    return policy.data
}

export const validateRoutingPolicy = async (body: LeadRoutingPolicyValidateRequest): Promise<LeadRoutingPolicyValidateResponse> => {
    const res = await axiosCRM.post(`/lead_routing_policies/validate`, body)
    return res.data
}
