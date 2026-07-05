import type { Lead, LeadDetailed } from "src/types/leads";
import axiosCRM from "src/lib/axios";

export const changeFlowState = async (leadId: number, newStateId: number): Promise<LeadDetailed> => {
    const response = await axiosCRM.post(`/leads/${leadId}/change_state`, { new_state_id: newStateId })
    return response.data
}

export const changeContactState = async (leadId: number, newStateId: number): Promise<Lead> => {
    const response = await axiosCRM.put(`/leads/${leadId}`, { contact_state_id: newStateId })
    return response.data
}