import type { LeadDetailed } from "src/types/leads";
import axiosCRM from "src/lib/axios";

// newStateId es el id de LeadState (Ciclo de Vida), que en types/leadFlow.ts sigue declarado
// como number -- por eso el tipo es string | number (la API acepta ambos).
export const changeFlowState = async (leadId: string, newStateId: string | number, notes?: string): Promise<LeadDetailed> => {
    const response = await axiosCRM.post(`/leads/${leadId}/change_state`, { new_state_id: newStateId, notes })
    return response.data
}

export const changeContactState = async (leadId: string, newContactStateId: string, notes?: string): Promise<LeadDetailed> => {
    const response = await axiosCRM.post(`/leads/${leadId}/change_contact_state`, { new_contact_state_id: newContactStateId, notes })
    return response.data
}