import type { Metadata } from "./shared"

export type StateCategory = 'INITIAL' | 'OPEN' | 'WON' | 'LOST'

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
  id: number
  organization_id: number | null
  order: number | null
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

// Category configuration for UI
export const CATEGORY_CONFIG: Record<StateCategory, { label: string; color: string; bgColor: string }> = {
  INITIAL: {
    label: 'Inicial',
    color: '#0ee9e9',
    bgColor: '#0c6b6e',
  },
  OPEN: {
    label: 'Abierto',
    color: '#0ea5e9',
    bgColor: '#0c4a6e',
  },
  WON: {
    label: 'Éxito',
    color: '#22c55e',
    bgColor: '#14532d',
  },
  LOST: {
    label: 'Fracaso',
    color: '#ef4444',
    bgColor: '#7f1d1d',
  },
};

export const DEFAULT_STATE_COLORS: Record<StateCategory, string> = {
  INITIAL: '#3bdaf6',
  OPEN: '#3b82f6',
  WON: '#22c55e',
  LOST: '#ef4444',
};
