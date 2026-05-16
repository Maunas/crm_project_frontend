import type { FlowEditorState, FlowEditorTransition, LeadState, LeadStateTransition } from "src/types/leadFlow";
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