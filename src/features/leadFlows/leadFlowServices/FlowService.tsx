import type { LeadFlowParams, DeleteResponse, Paginable, FlowStateParams, EnableResponse, ListParams } from "src/types/shared"
import type { LeadFlowDetailed, LeadFlow, LeadFlowPost, LeadState, LeadStateDetailed, LeadStateTransition, LeadStateTransitionDetailed, LeadStatePost, LeadTransitionBulkPost, FlowEditorTransition } from 'src/types/leadFlow'
import { axiosCRM } from "src/lib/axios"


/******************************** Lead Flows ************************************/
export const getLeadFlows = async<T extends LeadFlowParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadFlowDetailed : LeadFlow>> => {
    const leadFlows = await axiosCRM.get(`/lead_flows`, { params })
    return leadFlows.data
}

export const getLeadFlow = async (id: string): Promise<LeadFlowDetailed> => {
    const leadFlow = await axiosCRM.get(`/lead_flows/${id}`)
    return leadFlow.data
}

export const postLeadFlow = async (leadFlow: LeadFlowPost): Promise<LeadFlow> => {
    const response = await axiosCRM.post(`/lead_flows`, leadFlow)
    return response.data
}

export const updateLeadFlow = async (flowId: string, flowData: LeadFlowPost): Promise<LeadFlow> => {
    const response = await axiosCRM.put(`/lead_flows/${flowId}`, flowData)
    return response.data
}

export const deleteLeadFlow = async (id: string): Promise<DeleteResponse> => {
    const response = await axiosCRM.delete(`/lead_flows/${id}`)
    return response.data
}

export const enableLeadFlow = async (id: string): Promise<EnableResponse> => {
    const response = await axiosCRM.put(`/lead_flows/active/${id}`)
    return response.data
}

export const getLeadFlowStates = async <T extends FlowStateParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? LeadStateDetailed : LeadState>> => {
    const response = await axiosCRM.get(`/lead_states`, { params })
    return response.data
}

/** Obtiene todas las etapas de ciclo de vida de la organización sin filtrar por ciclo de vida */
export const getLeadStates = async (params?: ListParams): Promise<Paginable<LeadState>> => {
    const response = await axiosCRM.get(`/lead_states`, { params })
    return response.data
}

export const postLeadState = async (state: LeadStatePost): Promise<LeadState> => {
    const response = await axiosCRM.post(`/lead_states`, state)
    return response.data
}

export const updateLeadState = async (stateId: string, stateData: LeadStatePost): Promise<LeadState> => {
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

// El id devuelto es el uuid del flujo guardado, para usarlo en la URL del editor.
export const saveLeadFlowGraph = async (payload: unknown): Promise<{ message: string, id: string }> => {
    const response = await axiosCRM.post(`/lead_flows/graph`, payload);
    return response.data;
};

export const getNextFlowState = async (stateId: string): Promise<{ data: LeadState[] }> => {
    const leadFlows = await axiosCRM.get(`/lead_states/${stateId}/next-states`)
    return leadFlows.data
}
