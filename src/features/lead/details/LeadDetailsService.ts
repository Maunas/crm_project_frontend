import type { LeadDetailed } from "src/types/leads";
import axiosCRM from "src/lib/axios";

// leadId es el public_uuid del lead (Fase 3). newStateId sigue el id de LeadState (Ciclo de
// Vida), todavía sin migrar en types/leadFlow.ts -- pendiente junto con FlowEditorPage.tsx
// (ver backend/AGENTS.md §18). string | number porque el backend ya acepta ambos.
export const changeFlowState = async (leadId: string, newStateId: string | number, notes?: string): Promise<LeadDetailed> => {
    const response = await axiosCRM.post(`/leads/${leadId}/change_state`, { new_state_id: newStateId, notes })
    return response.data
}

// leadId y newContactStateId son public_uuid (Lead y LeadContactState, ambos migrados).
export const changeContactState = async (leadId: string, newContactStateId: string, notes?: string): Promise<LeadDetailed> => {
    const response = await axiosCRM.post(`/leads/${leadId}/change_contact_state`, { new_contact_state_id: newContactStateId, notes })
    return response.data
}