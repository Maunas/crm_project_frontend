import axiosCRM from "src/lib/axios"
import type { LeadContactState, LeadContactStateDetailed, LeadContactStatePost } from "src/types/contactState"
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared"

export const getContactStates = async<T extends ListParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadContactStateDetailed : LeadContactState>> => {
    const leadStates = await axiosCRM.get(`/lead_contact_states`, { params })
    return leadStates.data
}

export const getContactState = async (id: number): Promise<LeadContactStateDetailed> => {
    const leadState = await axiosCRM.get(`/lead_contact_states/${id}`)
    return leadState.data
}

export const postLeadFlow = async (leadFlow: LeadContactStatePost): Promise<LeadContactStateDetailed> => {
    const leadStates = await axiosCRM.post(`/lead_contact_states`, leadFlow)
    return leadStates.data
}

export const updateLeadFlow = async (id: number, stateData: LeadContactStatePost): Promise<LeadContactStateDetailed> => {
    const response = await axiosCRM.put(`/lead_contact_states/${id}`, stateData)
    return response.data
}

export const deleteLeadFlow = async (id: number): Promise<DeleteResponse> => {
    const response = await axiosCRM.delete(`/lead_contact_states/${id}`)
    return response.data
}

export const enableLeadFlow = async (id: number): Promise<EnableResponse> => {
    const response = await axiosCRM.put(`/lead_contact_states/active/${id}`)
    return response.data
}