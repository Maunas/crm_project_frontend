import type { Metadata } from "./shared"

export type StateCategory = 'OPEN' | 'WON' | 'LOST'

export interface LeadFlowPost {
  name: string
  description?: string
}

export interface LeadFlow extends LeadFlowPost {
  id: string // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  organization_id: number | null
}

export interface LeadFlowDetailed extends LeadFlow, Metadata { }

export interface LeadStatePost {
  name: string
  lead_flow_id: string // public_uuid de LeadFlow (Fase 3, ya resuelto en el backend)
  category: StateCategory
  is_initial: boolean
  order?: number
  color?: string,
  position_x?: number,
  position_y?: number,
}

export interface LeadState extends Omit<LeadStatePost, "order" | "lead_flow_id"> {
  id: string, // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  lead_flow_id: number, // FK embebida: sigue siendo el id interno viejo (sin migrar)
  organization_id: number | null,
  order: number | null,
  active: boolean
}

export interface LeadStateDetailed extends LeadState, Metadata { }

export interface LeadStateTransitionPost {
  lead_flow_id: string // public_uuid de LeadFlow (Fase 3, ya resuelto en el backend)
  from_state_id: string | null // public_uuid de LeadState
  to_state_id: string // public_uuid de LeadState
}

export interface LeadStateTransition extends Omit<LeadStateTransitionPost, "lead_flow_id" | "from_state_id" | "to_state_id"> {
  id: string // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  // FKs embebidas: siguen siendo el id interno viejo (sin migrar, deuda catalogada en
  // backend/AGENTS.md §18). Por eso mapFlowTransitions necesita traducirlas al tempId (uuid)
  // del estado correspondiente en vez de usarlas directo.
  lead_flow_id: number
  from_state_id: number | null
  to_state_id: number
}

export interface LeadStateTransitionDetailed extends LeadStateTransition, Metadata {
  from_state: LeadStateDetailed
  to_state: LeadStateDetailed
}
export interface LeadTransitionBulkPost {
  lead_flow_id: string // public_uuid de LeadFlow (Fase 3, ya resuelto en el backend)
  transitions: {
    from_state_id: string | null // public_uuid de LeadState
    to_state_id: string // public_uuid de LeadState
  }[]
}

/**
 * Internal state for the flow editor (with temp IDs before saving)
 */

export interface FlowEditorState {
  tempId: string
  // true si fue creado en el lienzo (todavía no existe en el backend), false si vino de
  // mapFlowStates (ya existe). Reemplaza la detección anterior por guiones en tempId, que
  // dejó de servir cuando LeadState.id pasó a ser un uuid (Fase 3, ver backend/AGENTS.md §18):
  // antes un tempId con guion = nuevo (uuidv4), sin guion = existente (id numérico); ahora
  // un estado existente TAMBIÉN tiene guiones en su tempId (es su uuid), así que esa
  // detección ya no distingue nada.
  isNew: boolean
  id?: number
  name: string
  category: StateCategory
  is_initial: boolean
  order?: number | null
  color: string
  position: { x: number; y: number }
}

export interface FlowEditorTransition {
  tempId: string
  // Mismo motivo que FlowEditorState.isNew.
  isNew: boolean
  id?: number
  fromStateId: string | null // tempId of the from state
  toStateId: string // tempId of the to state
}
