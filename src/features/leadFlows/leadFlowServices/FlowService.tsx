import type { LeadFlowParams, DeleteResponse, Paginable, FlowStateParams } from "src/types/shared"
import type { LeadFlowDetailed, LeadFlow, LeadFlowPost, LeadState, LeadStateDetailed, LeadStateTransition, LeadStateTransitionDetailed, LeadStatePost, LeadTransitionBulkPost, FlowEditorTransition } from '../../types/leadFlow'
import { axiosCRM } from "src/lib/axios"


/******************************** Lead Flows ************************************/
export const getLeadFlows = async<T extends LeadFlowParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadFlowDetailed : LeadFlow>> => {
    const leadFlows = await axiosCRM.get(`/lead_flows`, { params })
    return leadFlows.data
}

export const getLeadFlow = async (id: number): Promise<LeadFlowDetailed> => {
    const leadFlow = await axiosCRM.get(`/lead_flows/${id}`)
    return leadFlow.data
}

export const postLeadFlow = async (leadFlow: LeadFlowPost): Promise<LeadFlow> => {
    const response = await axiosCRM.post(`/lead_flows`, leadFlow)
    return response.data
}

export const updateLeadFlow = async (flowId: number, flowData: LeadFlowPost): Promise<LeadFlow> => {
    const response = await axiosCRM.put(`/lead_flows/${flowId}`, flowData)
    return response.data
}

export const deleteLeadFlow = async (id: number): Promise<DeleteResponse> => {
    const response = await axiosCRM.delete(`/lead_flows/${id}`)
    return response.data
}

export const getLeadFlowStates = async <T extends FlowStateParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadStateDetailed : LeadState>> => {
    const response = await axiosCRM.get(`/lead_states`, { params })
    return response.data
}

export const postLeadState = async (state: LeadStatePost): Promise<LeadState> => {
    const response = await axiosCRM.post(`/lead_states`, state)
    return response.data
}

export const updateLeadState = async (stateId: number, stateData: LeadStatePost): Promise<LeadState> => {
    const response = await axiosCRM.put(`/lead_states/${stateId}`, stateData)
    return response.data
}

export const getLeadFlowTransitions = async  <T extends FlowStateParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadStateTransitionDetailed : LeadStateTransition>> => {
    const response = await axiosCRM.get(`/lead_state_transitions`, { params })
    return response.data
}

export const postLeadStateTransitionsBulk = async (data: LeadTransitionBulkPost): Promise<unknown> => {
    const response = await axiosCRM.post(`/lead_state_transitions/bulk`, data)
    return response.data
}


export const updateLeadStateTransitionBulk = async (data: LeadTransitionBulkPost): Promise<FlowEditorTransition> => {
    const response = await axiosCRM.put(`/lead_state_transitions/bulk`, data)
    return response.data
}

export const saveLeadFlowGraph = async (payload: unknown): Promise<{ message: string, id: number }> => {
    const response = await axiosCRM.post(`/lead_flows/graph`, payload);
    return response.data;
};