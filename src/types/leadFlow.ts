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
