import type { Metadata } from "./shared"

export type StateCategory = 'OPEN' | 'WON' | 'LOST'

export interface LeadFlowPost {
  name: string
  description?: string
}

export interface LeadFlow extends LeadFlowPost {
  id: string
  organization_id: number | null
}

export interface LeadFlowDetailed extends LeadFlow, Metadata { }

export interface LeadStatePost {
  name: string
  lead_flow_id: string
  category: StateCategory
  is_initial: boolean
  order?: number
  color?: string,
  position_x?: number,
  position_y?: number,
}

export interface LeadState extends Omit<LeadStatePost, "order" | "lead_flow_id"> {
  id: string,
  lead_flow_id: number, // FK embebida: la respuesta trae el id interno, no el public_uuid
  organization_id: number | null,
  order: number | null,
  active: boolean
}

export interface LeadStateDetailed extends LeadState, Metadata { }

export interface LeadStateTransitionPost {
  lead_flow_id: string
  from_state_id: string | null
  to_state_id: string
}

export interface LeadStateTransition extends Omit<LeadStateTransitionPost, "lead_flow_id" | "from_state_id" | "to_state_id"> {
  id: string
  // FKs embebidas: la respuesta trae el id interno, no el public_uuid. Por eso
  // mapFlowTransitions necesita traducirlas al tempId (uuid) del estado correspondiente
  // en vez de usarlas directo.
  lead_flow_id: number
  from_state_id: number | null
  to_state_id: number
}

export interface LeadStateTransitionDetailed extends LeadStateTransition, Metadata {
  from_state: LeadStateDetailed
  to_state: LeadStateDetailed
}
export interface LeadTransitionBulkPost {
  lead_flow_id: string
  transitions: {
    from_state_id: string | null
    to_state_id: string
  }[]
}

/**
 * Internal state for the flow editor (with temp IDs before saving)
 */

export interface FlowEditorState {
  tempId: string
  // true si fue creado en el lienzo (aún no guardado), false si vino de mapFlowStates
  // (ya existe). Reemplaza la detección anterior por guiones en tempId, que dejó de servir
  // cuando LeadState.id pasó a ser uuid: antes un tempId con guion = nuevo (uuidv4), sin
  // guion = existente (id numérico); ahora un estado existente TAMBIÉN tiene guiones en su
  // tempId (es su uuid), así que esa detección ya no distingue nada.
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
