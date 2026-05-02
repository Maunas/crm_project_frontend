export type Category = 'OPEN' | 'WON' | 'LOST'

export interface LeadFlowPost {
  name: String
  description?: String
}

export interface LeadFlow extends LeadFlowPost {
  id: number
  organization_id: number | null
}

export interface LeadFlowDetailed extends LeadFlow {}

export interface LeadStatePost {
  name: string
  lead_flow_id: number
  category: Category
  is_initial: boolean
  order?: number
  color?: string
}

export interface LeadState extends LeadStatePost {
  id: number
  organization_id: number | null
}

export interface LeadStateTransitionPost {
  lead_flow_id: number
  from_lead_state_id: number | null
  to_state_id: number
}

export interface LeadStateTransition extends LeadStateTransitionPost {
  id: number
}

// Internal state for the flow editor (with temp IDs before saving)
export interface FlowState {
  tempId: string
  id?: number
  name: string
  category: Category
  is_initial: boolean
  order: number
  color: string
  position: { x: number; y: number }
}

export interface FlowTransition {
  tempId: string
  id?: number
  fromStateId: string | null // tempId of the from state
  toStateId: string // tempId of the to state
}

// Category configuration for UI
export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bgColor: string }> = {
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

export const DEFAULT_STATE_COLORS: Record<Category, string> = {
  OPEN: '#3b82f6',
  WON: '#22c55e',
  LOST: '#ef4444',
};