import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { StateNode } from './StateNode';
import StateDialog from './StateDialog';
import CustomEdge from './CustomEdge';
import { Sidebar } from './Sidebar';
import CommonButton from 'src/components/ui/buttons/CommonButton';
import { DEFAULT_STATE_COLORS, type StateCategory, type FlowEditorState, type FlowEditorTransition } from 'src/types/leadFlow';
import type { SimpleErrorBody } from 'src/types/shared'
import ReactFlow, { useNodesState, useEdgesState, Controls, Background, BackgroundVariant, MarkerType, ConnectionMode, MiniMap, } from 'reactflow'; // O '@xyflow/react'
import type { Connection, Edge, Node, NodeChange, ReactFlowInstance } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import 'reactflow/dist/style.css';
import { Box, Paper, Typography, Snackbar, Alert, TextField, Stack, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  const hasInitialState = useMemo(() => (
    states.some(s => s.is_initial && s.tempId !== editingState?.tempId)
  ), [states, editingState]);

  // Asigna isLocked a las transiciones al bloquear. Deesaparece el botón de eliminar.
  useEffect(() => {
    setEdges(edges =>
      edges.map(edge => ({
        ...edge,
        data: { ...edge.data, isLocked },
      }))
    )
  }, [isLocked, setEdges])

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
        onEdit: () => handleEditState(state),
        onDelete: () => handleDeleteState(state.tempId),
      },
    }));
    setNodes(newNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNodes]);

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
          isLocked
        };
      } else {
        edgesMap.set(pairId, {
          id: t.tempId,
          source: sourceId,
          target: targetId,
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: theme.palette.contrast.lighter },
          data: { onDelete: () => handleDeleteTransition(t.tempId), isLocked },
        });
      }
    });
    setEdges(Array.from(edgesMap.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, setEdges, theme.palette.contrast.lighter]);

  // --- Lógica de Drag & Drop ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const dataStr = event.dataTransfer.getData('application/reactflow');
    if (!dataStr) return;

    const { category, isInitial } = JSON.parse(dataStr);
    if (isInitial && states.some(s => s.is_initial)) {
      setSnackbar({ open: true, message: 'Solo puede haber un estado inicial', severity: 'error' });
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
      name: isInitial ? 'Inicial' : 'Nuevo Estado',
      category,
      is_initial: isInitial,
      color: DEFAULT_STATE_COLORS[category as StateCategory] || '#3b82f6',
      order: states.length,
      position,
    };

    setStates(prev => {
      const updated = [...prev, newState];
      syncNodesToStates(updated);
      return updated;
    });
  },
    [reactFlowInstance, states, syncNodesToStates]
  );

  // --- Operaciones CRUD locales ---
  const handleEditState = (state: FlowEditorState) => setEditingState(state);

  const handleSaveState = (stateData: Partial<FlowEditorState>) => {
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
        name: stateData.name ?? (stateData.is_initial ? 'Inicial' : 'Nuevo Estado'),
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
    setTransitions(prev => {
      const updated = prev.filter((t) => t.tempId !== tempId);
      syncEdgesToTransitions(updated);
      return updated;
    });
  };

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const newTransition: FlowEditorTransition = { tempId: uuidv4(), fromStateId: connection.source, toStateId: connection.target };
    setTransitions(prev => {
      const updated = [...prev, newTransition];
      syncEdgesToTransitions(updated);
      return updated;
    });
  }, [syncEdgesToTransitions]);

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
    if (!flowName.trim()) return setSnackbar({ open: true, message: 'Debe ingresar un nombre para el flujo', severity: 'error' });
    const initialStates = states.filter(s => s.is_initial);
    if (initialStates.length !== 1) return setSnackbar({ open: true, message: 'Debe haber exactamente un estado inicial', severity: 'error' });
    try {
      await onSave(flowName, flowDescription, states, transitions);
      setSnackbar({ open: true, message: 'Flujo guardado correctamente', severity: 'success' });
    } catch (error) {
      const errorMsgBody = error as SimpleErrorBody
      console.error("Error del servidor:", errorMsgBody.response?.data);

      const data = errorMsgBody.response?.data;
      let finalMessage = 'Error al guardar el flujo';

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
      setSnackbar({
        open: true,
        message: finalMessage,
        severity: 'error'
      });
    }
  };

  return (
    // Contenedor principal que previene el scroll vertical de la ventana entera
    <Stack sx={{ height: '100%', backgroundColor: 'background.default' }}>
      {/* Header Superior con el Input y Botón Guardar */}
      <FlowEditorHeader initialName={initialFlowName} initialDescription={initialFlowDescription} handleSaveFlow={handleSaveFlow} statesLength={states?.length} />

      <Stack direction="row" sx={{ flex: 1 }}>
        {/* Barra lateral de Drag & Drop */}
        <Sidebar
          isLocked={isLocked}
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
            onConnect={isLocked ? undefined : onConnect}
            onDragOver={onDragOver}
            nodesConnectable={!isLocked}
            onDrop={isLocked ? undefined : onDrop}
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
      <StateDialog
        open={Boolean(editingState)}
        onClose={() => setEditingState(null)}
        onSave={handleSaveState}
        state={editingState}
        hasInitialState={hasInitialState}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Stack>
  );
}

import React from 'react'
import { useLoading } from 'src/hooks/useLoading';

interface HeaderProps {
  initialName: string,
  initialDescription: string,
  handleSaveFlow: (flowName: string, flowDescription: string) => Promise<void>,
  statesLength: number
}

export const FlowEditorHeader = ({ initialName, initialDescription, statesLength, handleSaveFlow }: HeaderProps) => {

  const [flowName, setFlowName] = useState<string>('')
  const [flowDescription, setFlowDescription] = useState<string>('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlowDescription(initialDescription)
    setFlowName(initialName)
  }, [initialName, initialDescription])

  const navigate = useNavigate();

  const { loading, fnWithLoading } = useLoading(() => handleSaveFlow(flowName, flowDescription))

  // Vuelve al formulario, con los datos guardados del sessionStorage.
  const handleBack = () => {
    const returnUrl = sessionStorage.getItem('flow_return_url');
    if (returnUrl) {
      sessionStorage.removeItem('flow_return_url');
      navigate(returnUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <Stack component={Paper} direction="row" spacing={4} useFlexGap
      sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between', borderRadius: 0, flexWrap: "wrap" }}>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
        <IconButton onClick={handleBack} sx={{ color: 'text.secondary' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1" sx={{ fontWeight: "bold" }} color="text.primary">
          Editor de Flujo
        </Typography>
      </Stack>

      <Stack spacing={1} direction="row" useFlexGap sx={{ flex: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Nombre"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          sx={{ flex: 1, minWidth: "10rem" }}
        />
        <TextField
          size="small"
          label="Descripción (Opcional)"
          value={flowDescription}
          onChange={(e) => setFlowDescription(e.target.value)}
          sx={{ flex: 2, minWidth: "10rem" }}
        />
      </Stack>

      <CommonButton actionType={loading ? "LOADING" : "SAVE"} onClick={fnWithLoading} disabled={loading || statesLength === 0} sx={{ ml: "auto" }}>
        {loading ? 'Guardando...' : 'Guardar Flujo'}
      </CommonButton>
    </Stack>
  )
}
