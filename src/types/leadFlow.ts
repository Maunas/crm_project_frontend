import type { Metadata } from "./shared"

export type StateCategory = 'OPEN' | 'WON' | 'LOST'

export interface LeadFlowPost {
  name: string
  description?: string
}

export interface LeadFlow extends LeadFlowPost {
  id: number
  organization_id: number | null
}

export interface LeadFlowDetailed extends LeadFlow, Metadata { }

export interface LeadStatePost {
  name: string
  lead_flow_id: number
  category: StateCategory
  is_initial: boolean
  order?: number
  color?: string,
  position_x?: number,
  position_y?: number,
}

export interface LeadState extends Omit<LeadStatePost, "order"> {
  id: number,
  organization_id: number | null,
  order: number | null,
  active: boolean
}

export interface LeadStateDetailed extends LeadState, Metadata { }

export interface LeadStateTransitionPost {
  lead_flow_id: number
  from_state_id: number | null
  to_state_id: number
}

export interface LeadStateTransition extends LeadStateTransitionPost {
  id: number
}

export interface LeadStateTransitionDetailed extends LeadStateTransition, Metadata {
  from_state: LeadStateDetailed
  to_state: LeadStateDetailed
}
export interface LeadTransitionBulkPost {
  lead_flow_id: number
  transitions: {
    from_state_id: number | null
    to_state_id: number
  }[]
}

/**
 * Internal state for the flow editor (with temp IDs before saving)
 */

export interface FlowEditorState {
  tempId: string
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
  id?: number
  fromStateId: string | null // tempId of the from state
  toStateId: string // tempId of the to state
}
