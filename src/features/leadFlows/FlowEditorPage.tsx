import { useCallback, useEffect, useState } from 'react';
import FlowEditor from './FlowEditor';
import { useLoading } from 'src/hooks/useLoading';
import type { FlowEditorState, FlowEditorTransition } from 'src/types/leadFlow';
import { mapFlowStates, mapFlowTransitions } from './leadFlowServices/leadFlowUtils';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getLeadFlow, getLeadFlowStates, getLeadFlowTransitions, saveLeadFlowGraph } from './leadFlowServices/FlowService';
import { usePageTitle } from 'src/hooks/usePageTitle';

interface GraphData {
  id?: number | null,
  name: string;
  description?: string;
  states: FlowEditorState[];
  transitions: FlowEditorTransition[];
}

export const LeadFlowEditor = () => {
  const { id } = useParams();
  const editFlowId = id ? parseInt(id) : undefined;

  const [currentLeadFlowId, setCurrentLeadFlowId] = useState<number | null>(editFlowId || null);

  const [initialData, setInitialData] = useState<GraphData>(
    { name: '', description: '', states: [], transitions: [] }
  );

  // --- CARGA DE DATOS ---
  const fetchFlow = useCallback(async () => {
    if (!editFlowId) return
    try {
      const [flowRes, statesRes, transRes] = await Promise.all([
        getLeadFlow(editFlowId),
        getLeadFlowStates({ lead_flow_id: editFlowId }),
        getLeadFlowTransitions({ lead_flow_id: editFlowId })
      ]);

      const mappedStates = mapFlowStates(statesRes.items ?? []);
      const mappedTransitions = mapFlowTransitions(transRes.items ?? []);

      setInitialData({
        name: flowRes.name,
        description: flowRes.description ?? '',
        states: mappedStates,
        transitions: mappedTransitions
      });
    } catch (error) {
      console.error("Error cargando grafo:", error);
      throw error
    }
  }, [editFlowId])

  console.log(initialData)

  usePageTitle(initialData.name && `${initialData.name} | Editor de Flujo`)

  const { loading, fnWithLoading } = useLoading(fetchFlow)

  useEffect(() => {
    fnWithLoading();
  }, [fnWithLoading]);

  // --- GUARDADO ATÓMICO (TRANSACCIONAL) ---
  const handleSave = async (flowName: string, flowDescription: string, states: FlowEditorState[], transitions: FlowEditorTransition[]) => {
    // 1. Mapeo de UUIDs a IDs Negativos para el Backend
    let negativeIdCounter = -1;
    const uuidToBackendIdMap = new Map<string, number>();

    // 2. Preparar Estados
    const statesPayload = states.map(s => {
      let backendId: number;
      // Si el tempId tiene un guion, es un UUID (nuevo estado)
      if (s.tempId.includes('-')) {
        backendId = negativeIdCounter--;
        uuidToBackendIdMap.set(s.tempId, backendId);
      } else {
        // Si es un número, ya existe en la BD
        backendId = parseInt(s.tempId);
      }

      return {
        id: backendId,
        name: s.name,
        category: s.category,
        is_initial: s.is_initial,
        order: s.order,
        color: s.color,
        position_x: s.position.x,
        position_y: s.position.y
      };
    });

    // 3. Preparar Transiciones (usando el mapa de IDs)
    const transitionsPayload = transitions.map(t => {
      const fromId = uuidToBackendIdMap.get(t.fromStateId || '') ?? parseInt(t.fromStateId || '0');
      const toId = uuidToBackendIdMap.get(t.toStateId || '') ?? parseInt(t.toStateId || '0');

      return {
        from_state_id: fromId,
        to_state_id: toId
      };
    }).filter(t => t.from_state_id !== 0 && t.to_state_id !== 0);

    // 4. Construir el Payload Final
    const finalPayload = {
      id: currentLeadFlowId, // null si es nuevo
      name: flowName,
      description: flowDescription ?? null,
      states: statesPayload,
      transitions: transitionsPayload
    };

    try {
      const result = await saveLeadFlowGraph(finalPayload);

      // Si era una creación, actualizamos el ID y la URL sin recargar
      if (!currentLeadFlowId) {
        setCurrentLeadFlowId(result.id);
        window.history.replaceState(null, '', `/lead-flow-editor/${result.id}`);
      }
    } catch (error) {
      console.error('Error al guardar el grafo:', error);
      throw error;
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <FlowEditor
      initialFlowName={initialData.name}
      initialFlowDescription={initialData.description}
      initialStates={initialData.states}
      initialTransitions={initialData.transitions}
      onSave={handleSave}
    />
  );
};