import { useState } from 'react'
import FlowEditor from './FlowEditor'
import type { FlowState, FlowTransition } from '../../types/leadFlow'
// Asegúrate de importar las funciones desde la ruta correcta de tu servicio
import { postLeadFlow, postLeadState, postLeadStateTransitionsBulk } from './FlowService' 

export const LeadFlowEditor = () => {
  // Inicialmente null porque estamos creando. Cuando edites, aquí cargarás el ID.
  const [currentLeadFlowId, setCurrentLeadFlowId] = useState<number | null>(null)

  const handleSave = async (flowName: string, states: FlowState[], transitions: FlowTransition[]) => {
    try {
      let flowIdToUse = currentLeadFlowId;

      // PASO 1: POST /lead_flows (Solo si es creación)
      if (!flowIdToUse) {
        // Usamos nuestro servicio
        const flowData = await postLeadFlow({ name: flowName });
        flowIdToUse = flowData.id;
        setCurrentLeadFlowId(flowIdToUse); // Lo guardamos por si vuelve a apretar "Guardar"
      }

      // PASO 2: POST /lead_states (Crear estados y armar el diccionario)
      const idMap = new Map<string, number>();

      for (const state of states) {
        // Ignoramos si el estado ya tiene un ID real (útil para el futuro en la edición)
        const statePayload = {
          lead_flow_id: flowIdToUse,
          name: state.name,
          color: state.color || "",
          category: state.category,
          is_initial: state.is_initial
        };

        // Usamos nuestro servicio
        const stateData = await postLeadState(statePayload);
        
        // Relacionamos el ID temporal (uuidv4) con el ID numérico real de la BD
        idMap.set(state.tempId, stateData.id);
      }

      // PASO 3: POST lead_state_transitions/bulk
      // Traducimos los tempIds de las conexiones visuales a IDs reales de la base de datos
      const bulkTransitions = transitions.map(t => ({
        from_state_id: idMap.get(t.fromStateId || ''),
        to_state_id: idMap.get(t.toStateId || '')
      })).filter(t => t.from_state_id && t.to_state_id); // Filtro para evitar errores

      if (bulkTransitions.length > 0) {
        // Usamos nuestro servicio
        await postLeadStateTransitionsBulk({
          lead_flow_id: flowIdToUse,
          transitions: bulkTransitions
        });
      }

      // Si todo sale bien, la promesa se resuelve y el FlowEditor mostrará el Snackbar de "Éxito"
    } catch (error) {
      console.error('Error guardando el flujo:', error);
      throw error; // Lanzamos el error para que FlowEditor muestre el Snackbar de "Error"
    }
  }

  return (
    <FlowEditor 
      leadFlowId={currentLeadFlowId} 
      onSave={handleSave} 
    />
  )
}