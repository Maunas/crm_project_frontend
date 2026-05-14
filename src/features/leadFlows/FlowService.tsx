import type { LeadFlowParams, DeleteResponse, EnableResponse, Paginable } from "src/types/shared"
import type { LeadFlowDetailed, FlowState, FlowTransition, LeadFlow, LeadFlowPost } from '../../types/leadFlow'
import { API_BASE_URL, axiosCRM } from "src/lib/axios"


/******************************** Lead Flows ************************************/
export const getLeadFlows = async<T extends LeadFlowParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadFlowDetailed : LeadFlow>> => {
    const leadFlows = await axiosCRM.get(`${API_BASE_URL}/lead_flows`, { params })
    return leadFlows.data
}

export const getLeadFlow = async (id: number): Promise<LeadFlowDetailed> => {
    const leadFlow = await axiosCRM.get(`${API_BASE_URL}/lead_flows/${id}`)
    return leadFlow.data
}

export const postLeadFlow = async (leadFlow: Omit<LeadFlowPost, "id">): Promise<LeadFlow> => {
    const response = await axiosCRM.post(`${API_BASE_URL}/lead_flows`, leadFlow)
    return response.data
}

export const deleteLeadFlow = async (id: number): Promise<DeleteResponse> => {
    const response = await axiosCRM.delete(`${API_BASE_URL}/lead_flows/${id}`)
    return response.data
}

export const getLeadFlowStates = async (leadFlowId: number): Promise<Paginable<FlowState>> => {
    const response = await axiosCRM.get(`${API_BASE_URL}/lead_states?lead_flow_id=${leadFlowId}`)
    return response.data
}

export const getLeadFlowTransitions = async (leadFlowId: number): Promise<Paginable<FlowTransition>> => {
    const response = await axiosCRM.get(`${API_BASE_URL}/lead_state_transitions?lead_flow_id=${leadFlowId}`)
    return response.data
}

export const postLeadState = async (state: any): Promise<FlowState> => {
    const response = await axiosCRM.post(`${API_BASE_URL}/lead_states`, state)
    return response.data
}

export const postLeadStateTransitionsBulk = async (data: { lead_flow_id: number, transitions: any[] }): Promise<any> => {
    const response = await axiosCRM.post(`${API_BASE_URL}/lead_state_transitions/bulk`, data)
    return response.data
}

export const updateLeadState = async (stateId: number, stateData: any): Promise<FlowState> => {
    const response = await axiosCRM.put(`${API_BASE_URL}/lead_states/${stateId}`, stateData)
    return response.data
}

export const updateLeadStateTransitionBulk = async (transitionData: any): Promise<FlowTransition> => {
    const response = await axiosCRM.put(`${API_BASE_URL}/lead_state_transitions/bulk`, transitionData)
    return response.data
}

export const updateLeadFlow = async (flowId: number, flowData: any): Promise<LeadFlow> => {
    const response = await axiosCRM.put(`${API_BASE_URL}/lead_flows/${flowId}`, flowData)
    return response.data
}

export const saveLeadFlowGraph = async (payload: any): Promise<{ message: string, id: number }> => {
    const response = await axiosCRM.post(`${API_BASE_URL}/lead_flows/graph`, payload);
    return response.data;
};