import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlowEditor from './FlowEditor';
import type { FlowState, FlowTransition } from '../../types/leadFlow';
import { getLeadFlow, getLeadFlowStates, getLeadFlowTransitions, saveLeadFlowGraph } from './FlowService';
import { Box, CircularProgress, colors } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

export const LeadFlowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editFlowId = id ? parseInt(id, 10) : undefined;

  const [currentLeadFlowId, setCurrentLeadFlowId] = useState<number | null>(editFlowId || null);
  const [isLoading, setIsLoading] = useState(!!editFlowId);
  const [initialData, setInitialData] = useState<{
    name: string;
    description: string;
    states: FlowState[];
    transitions: FlowTransition[];
  }>({ name: '', description: '', states: [], transitions: [] });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (editFlowId) {
      const fetchFlow = async () => {
        try {
          const [flowDb, statesRes, transRes] = await Promise.all([
            getLeadFlow(editFlowId),
            getLeadFlowStates(editFlowId),
            getLeadFlowTransitions(editFlowId)
          ]);

          const mappedStates: FlowState[] = (statesRes.items || []).map((s: any) => ({
            tempId: s.id.toString(),
            name: s.name,
            category: s.category,
            is_initial: s.is_initial,
            color: s.color || '#3b82f6',
            order: s.order,
            position: { x: s.position_x ?? 0, y: s.position_y ?? 0 },
          }));

          const mappedTransitions: FlowTransition[] = (transRes.items || []).map((t: any) => ({
            tempId: uuidv4(),
            fromStateId: t.from_state_id.toString(),
            toStateId: t.to_state_id.toString(),
          }));

          setInitialData({
            name: flowDb.name || '',
            description: flowDb.description || '',
            states: mappedStates,
            transitions: mappedTransitions
          });
        } catch (error) {
          console.error("Error cargando grafo:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFlow();
    }
  }, [editFlowId]);

  // --- GUARDADO ATÓMICO (TRANSACCIONAL) ---
  const handleSave = async (flowName: string, flowDescription: string, states: FlowState[], transitions: FlowTransition[]) => {
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
        backendId = parseInt(s.tempId, 10);
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
      const fromId = uuidToBackendIdMap.get(t.fromStateId || '') ?? parseInt(t.fromStateId || '0', 10);
      const toId = uuidToBackendIdMap.get(t.toStateId || '') ?? parseInt(t.toStateId || '0', 10);

      return {
        from_state_id: fromId,
        to_state_id: toId
      };
    }).filter(t => t.from_state_id !== 0 && t.to_state_id !== 0);

    // 4. Construir el Payload Final
    const finalPayload = {
      id: currentLeadFlowId, // null si es nuevo
      name: flowName,
      description: flowDescription || null,
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

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <FlowEditor
      leadFlowId={currentLeadFlowId}
      initialFlowName={initialData.name}
      initialFlowDescription={initialData.description}
      initialStates={initialData.states}
      initialTransitions={initialData.transitions}
      onSave={handleSave}
    />
  );
};