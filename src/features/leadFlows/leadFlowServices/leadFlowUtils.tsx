import type { FlowEditorState, FlowEditorTransition, LeadState, LeadStateTransition, StateCategory } from "src/types/leadFlow";
import { v4 as uuidv4 } from 'uuid';

export const mapFlowStates = (states: LeadState[]) => {
  return states.map(s => ({
    tempId: s.id !== undefined ? s.id.toString() : uuidv4(),
    name: s.name,
    category: s.category,
    is_initial: s.is_initial,
    color: s.color || '#3b82f6',
    order: s.order,
    position: { x: s.position_x ?? 0, y: s.position_y ?? 0 },
  })) as FlowEditorState[]
}

export const mapFlowTransitions = (transitions: LeadStateTransition[]) => {
  return transitions.map(t => ({
    tempId: t.id !== undefined ? t.id.toString() : uuidv4(),
    fromStateId: t.from_state_id ? t.from_state_id.toString() : null,
    toStateId: t.to_state_id.toString(),
  })) as FlowEditorTransition[]
}

/*----------------------------------Constantes----------------------------------*/

export const CATEGORY_CONFIG: Record<StateCategory, { label: string; color: string; bgColor: string }> = {
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

export const DEFAULT_STATE_COLORS: Record<StateCategory | "INITIAL", string> = {
  OPEN: CATEGORY_CONFIG.OPEN.color,
  WON: CATEGORY_CONFIG.WON.color,
  LOST: CATEGORY_CONFIG.LOST.color,
  INITIAL: "#0ee9de",
};