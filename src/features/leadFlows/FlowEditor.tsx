import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import GenericModal from 'shared/layout/container/GenericModal';
import StateForm, { FlowEditorHeader } from './LeadFlowForms';
import { StateNode } from './StateNode';
import CustomEdge from './CustomEdge';
import { Sidebar } from './Sidebar';
import type { StateCategory, FlowEditorState, FlowEditorTransition } from 'src/types/leadFlow';
import type { SimpleErrorBody } from 'src/types/shared'
import { DEFAULT_STATE_COLORS } from './leadFlowServices/leadFlowUtils';
import ReactFlow, { useNodesState, useEdgesState, Controls, Background, BackgroundVariant, MarkerType, ConnectionMode, MiniMap, } from 'reactflow';
import type { Connection, Edge, Node, NodeChange, ReactFlowInstance } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import 'reactflow/dist/style.css';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { showToast } from 'src/utils/feedback';
import { useUserContext } from 'src/stores/UserContext';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { customEdge: CustomEdge };

interface FlowEditorProps {
  initialFlowName?: string;
  initialFlowDescription?: string;
  initialStates?: FlowEditorState[];
  initialTransitions?: FlowEditorTransition[];
  onSave: (flowName: string, flowDescription: string, states: FlowEditorState[], transitions: FlowEditorTransition[]) => Promise<void>;
}

export default function FlowEditor({ initialFlowName = '', initialFlowDescription = '',
  initialStates = [], initialTransitions = [], onSave }: FlowEditorProps) {

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [states, setStates] = useState<FlowEditorState[]>([]);
  const [transitions, setTransitions] = useState<FlowEditorTransition[]>([]);

  const [isLocked, setIsLocked] = useState(false)

  // Sin permiso de edición, el editor se comporta como si estuviera siempre bloqueado
  // (no se puede agregar/editar/borrar etapas ni transiciones, ni guardar).
  const { hasPermission } = useUserContext()
  const canEdit = hasPermission("lead_flow:update")
  const locked = isLocked || !canEdit

  const theme = useTheme();

  //Efecto para cargar los datos cuando vienen del backend
  useEffect(() => {
    // Dibuja los nodos
    setStates(initialStates);
    syncNodesToStates(initialStates);
    // Dibuja las flechas
    setTransitions(initialTransitions);
    syncEdgesToTransitions(initialTransitions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStates, initialTransitions]);

  const [editingState, setEditingState] = useState<FlowEditorState | null>(null);

  const hasInitialState = useMemo(() => (
    states.some(s => s.is_initial && s.tempId !== editingState?.tempId)
  ), [states, editingState]);

  // Asigna isLocked a las transiciones al bloquear. Deesaparece el botón de eliminar.
  useEffect(() => {
    setEdges(edges =>
      edges.map(edge => ({
        ...edge,
        data: { ...edge.data, isLocked: locked },
      }))
    )
  }, [locked, setEdges])

  // 1. Sincronizar States
  const syncNodesToStates = useCallback((updatedStates: FlowEditorState[]) => {
    const newNodes: Node[] = updatedStates.map(state => ({
      id: state.tempId,
      type: 'stateNode',
      position: state.position,
      data: {
        label: state.name,
        category: state.category,
        isInitial: state.is_initial,
        color: state.color,
        onEdit: locked ? undefined : () => handleEditState(state),
        onDelete: locked ? undefined : () => handleDeleteState(state.tempId),
      },
    }));
    setNodes(newNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNodes, locked]);

  // 2. Sincronizar Flechas Bidireccionales
  const syncEdgesToTransitions = useCallback((updatedTransitions: FlowEditorTransition[]) => {
    const edgesMap = new Map<string, Edge>();

    updatedTransitions.forEach(t => {
      const sourceId = t.fromStateId || '';
      const targetId = t.toStateId || '';
      const pairId = [sourceId, targetId].sort().join("-");

      if (edgesMap.has(pairId)) {
        const existingEdge = edgesMap.get(pairId)!;
        existingEdge.markerStart = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: theme.palette.contrast.lighter, orient: 'auto-start-reverse' };
        const deleteFirst = existingEdge.data.onDelete;
        existingEdge.data = {
          onDelete: () => { deleteFirst(); handleDeleteTransition(t.tempId); },
          isLocked: locked
        };
      } else {
        edgesMap.set(pairId, {
          id: t.tempId,
          source: sourceId,
          target: targetId,
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: theme.palette.contrast.lighter },
          data: { onDelete: () => handleDeleteTransition(t.tempId), isLocked: locked },
        });
      }
    });
    setEdges(Array.from(edgesMap.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, setEdges, theme.palette.contrast.lighter]);

  // --- Lógica de Drag & Drop ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (locked) return;
    const dataStr = event.dataTransfer.getData('application/reactflow');
    if (!dataStr) return;

    const { category, isInitial } = JSON.parse(dataStr);
    if (isInitial && states.some(s => s.is_initial)) {
      showToast("Solo puede haber una etapa inicial", "error")
      return;
    }

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const newState: FlowEditorState = {
      tempId: uuidv4(),
      isNew: true,
      name: isInitial ? 'Inicial' : 'Nueva Etapa',
      category,
      is_initial: isInitial,
      color: isInitial ? DEFAULT_STATE_COLORS.INITIAL :
        (DEFAULT_STATE_COLORS[category as StateCategory] || DEFAULT_STATE_COLORS.OPEN),
      order: states.length,
      position,
    };

    setStates(prev => {
      const updated = [...prev, newState];
      syncNodesToStates(updated);
      return updated;
    });
  },
    [reactFlowInstance, states, syncNodesToStates, locked]
  );

  // --- Operaciones CRUD locales ---
  const handleEditState = (state: FlowEditorState) => setEditingState(state);

  const handleSaveState = (stateData: Partial<FlowEditorState>) => {
    if (locked) return;
    if (editingState) {
      setStates(prev => {
        const updated = prev.map(s => s.tempId === editingState.tempId ? { ...s, ...stateData } : s);
        syncNodesToStates(updated);
        return updated;
      });
      setEditingState(null);
    }
    else {
      const newState: FlowEditorState = {
        tempId: uuidv4(),
        isNew: true,
        name: stateData.name ?? (stateData.is_initial ? 'Inicial' : 'Nueva Etapa'),
        category: stateData.category ?? "OPEN",
        is_initial: stateData.is_initial ?? false,
        color: stateData.color ?? DEFAULT_STATE_COLORS.OPEN,
        order: states.length,
        position: { x: 0, y: 0 }
      }

      setStates(prev => {
        const updated = [...prev, newState];
        syncNodesToStates(updated);
        return updated;
      });
    }
  };

  const handleDeleteState = (tempId: string) => {
    if (locked) return;
    setStates(prev => {
      const updated = prev.filter(s => s.tempId !== tempId);
      syncNodesToStates(updated);
      return updated;
    });
    setTransitions(prev => {
      const updated = prev.filter(t => t.fromStateId !== tempId && t.toStateId !== tempId);
      syncEdgesToTransitions(updated);
      return updated;
    });
  };

  const handleDeleteTransition = (tempId: string) => {
    if (locked) return;
    setTransitions(prev => {
      const updated = prev.filter(t => t.tempId !== tempId);
      syncEdgesToTransitions(updated);
      return updated;
    });
  };

  const onConnect = useCallback((connection: Connection) => {
    if (locked) return;
    const source = connection.source
    const target = connection.target
    if (!source || !target) return;
    const newTransition: FlowEditorTransition = { tempId: uuidv4(), isNew: true, fromStateId: source, toStateId: target };
    const newReverseTransition: FlowEditorTransition = { tempId: uuidv4(), isNew: true, fromStateId: target, toStateId: source };
    setTransitions(prev => {
      //Si no encuentra una igual, se crea
      if (!prev.find(t => t.fromStateId === source && t.toStateId === target)) {
        const updated = [...prev, newTransition];
        syncEdgesToTransitions(updated);
        return updated;
      }
      //Si está repetida, se crea la relación inversa
      if (!prev.find(t => t.fromStateId === target && t.toStateId === source)) {
        const updated = [...prev, newReverseTransition];
        syncEdgesToTransitions(updated);
        return updated;
      }
      //Si está repetida, y ya tiene inversa, no se crea
      return prev

    });
  }, [syncEdgesToTransitions, locked]);

  const onNodesChangeWrapper = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        setStates(prev => prev.map(
          s => s.tempId === change.id ? { ...s, position: change.position! } : s
        ));
      }
    });
  }, [onNodesChange]);

  const handleSaveFlow = async (flowName: string, flowDescription: string) => {
    if (!canEdit) return
    if (!flowName.trim()) { showToast("Debe ingresar un nombre para el ciclo de vida", "error"); return }
    const initialStates = states.filter(s => s.is_initial);
    if (initialStates.length !== 1) { showToast("Debe haber exactamente una etapa inicial", "error"); return }
    try {
      await onSave(flowName, flowDescription, states, transitions);
      showToast(`Ciclo de Vida "${flowName}" guardado con éxito`)
      return
    } catch (error) {
      const errorMsgBody = error as SimpleErrorBody
      console.error("Error del servidor:", errorMsgBody.response?.data);

      const data = errorMsgBody.response?.data;
      let finalMessage = 'Error al guardar el ciclo de vida';

      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          // Caso 1: Es una lista de errores. Mapeamos cada error para obtener su mensaje
          finalMessage = data.detail
            .map(err => err.message || 'Error de validación')
            .join(' | '); // Los unimos con una barra para que entren en el Snackbar
        } else if (typeof data.detail === 'string') {
          // Caso 2: Es un string simple (errores lanzados con HTTPException)
          finalMessage = data.detail;
        }
      } else if (data?.message) {
        finalMessage = data.message;
      }
      showToast(finalMessage, "error")
    }
  };

  return (
    // Contenedor principal que previene el scroll vertical de la ventana entera
    <Stack sx={{ height: '100%', backgroundColor: 'background.default' }}>
      {/* Header Superior con el Input y Botón Guardar */}
      <FlowEditorHeader initialName={initialFlowName} initialDescription={initialFlowDescription}
        handleSaveFlow={handleSaveFlow} statesLength={states?.length} />

      <Stack direction="row" sx={{ flex: 1 }}>
        {/* Barra lateral de Drag & Drop */}
        <Sidebar
          isLocked={locked}
          onAddState={handleSaveState}
          hasInitialState={hasInitialState}
        />

        {/* Lienzo de React Flow */}
        <Box sx={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWrapper}
            onEdgesChange={onEdgesChange}
            onConnect={locked ? undefined : onConnect}
            onDragOver={onDragOver}
            nodesConnectable={!locked}
            nodesDraggable={!locked}
            onDrop={locked ? undefined : onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            onInit={setReactFlowInstance}
            style={{ backgroundColor: 'transparent' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme.palette.contrast.main} />
            <Controls style={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary
            }} onInteractiveChange={isInteractive => setIsLocked(!isInteractive)} />
            <MiniMap
              style={{ backgroundColor: theme.palette.background.paper }}
              nodeColor={node => (node.data).color || theme.palette.primary.main}
              maskColor={theme.palette.mode === 'light' ? theme.palette.contrast["300"] : theme.palette.contrast.dark}
            />
          </ReactFlow>
        </Box>

      </Stack>
      {/* Diálogo de Edición */}
      <GenericModal idModal='update-state' open={Boolean(editingState)} maxWidth="xs" fullWidth
        handleClose={() => setEditingState(null)} showButton={false} >
        <StateForm
          existingState={editingState}
          hasInitialState={hasInitialState}
          onSave={handleSaveState}
          onClose={() => setEditingState(null)}
        />
      </GenericModal>
    </Stack>
  );
}