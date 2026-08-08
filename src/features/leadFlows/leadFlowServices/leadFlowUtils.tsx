import type { FlowEditorState, FlowEditorTransition, LeadState, LeadStateTransitionDetailed, StateCategory } from "src/types/leadFlow";
import { v4 as uuidv4 } from 'uuid';

// Todo lo que viene de acá ya está guardado -> isNew: false siempre. Ver FlowEditorState.isNew
// para el porqué (antes se detectaba por guiones en tempId, dejó de servir cuando LeadState.id
// pasó a ser uuid).
export const mapFlowStates = (states: LeadState[]) => {
  return states.map(s => ({
    tempId: s.id,
    isNew: false,
    name: s.name,
    category: s.category,
    is_initial: s.is_initial,
    color: s.color || '#3b82f6',
    order: s.order,
    position: { x: s.position_x ?? 0, y: s.position_y ?? 0 },
  })) as FlowEditorState[]
}

// Requiere que las transiciones se hayan pedido con detailed: true (getLeadFlowTransitions
// con from_state/to_state anidados). from_state_id/to_state_id (planos) siguen siendo el id
// interno viejo de LeadState (FK embebida sin migrar), así que ya no sirven para
// correlacionar contra el tempId (uuid) de los nodos. Los objetos anidados from_state/to_state
// sí tienen su .id como uuid, que es lo que necesita FlowEditor para conectar la transición
// al nodo correcto.
export const mapFlowTransitions = (transitions: LeadStateTransitionDetailed[]) => {
  return transitions.map(t => ({
    tempId: t.id,
    isNew: false,
    fromStateId: t.from_state ? t.from_state.id : null,
    toStateId: t.to_state.id,
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