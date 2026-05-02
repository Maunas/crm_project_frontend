import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  ConnectionMode,
  MiniMap,
} from 'reactflow'; // O '@xyflow/react'
import type { Connection, Edge, Node, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Paper, Typography, Snackbar, Alert, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { v4 as uuidv4 } from 'uuid';
import { FormControlLabel, Switch } from '@mui/material'
import { StateNode } from './StateNode';
import CustomEdge from './CustomEdge';
import StateDialog from './StateDialog';
import { Sidebar } from './Sidebar';
import type {Category} from '../../types/leadFlow'
import { DEFAULT_STATE_COLORS, type FlowState, type FlowTransition } from '../../types/leadFlow';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { customEdge: CustomEdge };

interface FlowEditorProps {
  leadFlowId?: number | null;
  onSave: (flowName: string, states: FlowState[], transitions: FlowTransition[]) => Promise<void>;
}

export default function FlowEditor({ leadFlowId, onSave }: FlowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const theme = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false)
  const [flowName, setFlowName] = useState('');
  const [states, setStates] = useState<FlowState[]>([]);
  const [transitions, setTransitions] = useState<FlowTransition[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<FlowState | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
  const [saving, setSaving] = useState(false);

  const hasInitialState = useMemo(() => states.some((s) => s.is_initial && s.tempId !== editingState?.tempId), [states, editingState]);

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: { ...edge.data, isLocked }, // Le pasamos el estado de bloqueo actual
      }))
    )
  }, [isLocked, setEdges])
  
  // 1. Sincronizar estados visuales
  const syncNodesToStates = useCallback((updatedStates: FlowState[]) => {
    const newNodes: Node[] = updatedStates.map((state) => ({
      id: state.tempId,
      type: 'stateNode',
      position: state.position,
      data: {
        label: state.name,
        category: state.category,
        isInitial: state.is_initial,
        color: state.color,
        onEdit: () => handleEditState(state), // Esto se dispara con el doble clic ahora
        onDelete: () => handleDeleteState(state.tempId),
      },
    }));
    setNodes(newNodes);
  }, [setNodes]);

  // 2. Sincronizar Flechas Bidireccionales (Mantenemos tu lógica)
  const syncEdgesToTransitions = useCallback((updatedTransitions: FlowTransition[]) => {
    const edgesMap = new Map<string, Edge>();

    updatedTransitions.forEach((t) => {
      const sourceId = t.fromStateId || '';
      const targetId = t.toStateId || '';
      const sortedIds = [sourceId, targetId].sort();
      const pairId = `${sortedIds[0]}-${sortedIds[1]}`;

      if (edgesMap.has(pairId)) {
        const existingEdge = edgesMap.get(pairId)!;
        existingEdge.markerStart = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#64748b', orient: 'auto-start-reverse' };
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
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#64748b' },
          data: { onDelete: () => handleDeleteTransition(t.tempId), isLocked },
        });
      }
    });
    setEdges(Array.from(edgesMap.values()));
  }, [isLocked, setEdges]);

  // --- Lógica de Drag & Drop (Integrada de v0) ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr) return;

      const { category, isInitial } = JSON.parse(dataStr);
      if (isInitial && states.some((s) => s.is_initial)) {
        setSnackbar({ open: true, message: 'Solo puede haber un estado inicial', severity: 'error' });
        return;
      }

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newState: FlowState = {
        tempId: uuidv4(),
        name: isInitial ? 'Inicial' : 'Nuevo Estado',
        category,
        is_initial: isInitial,
        color: DEFAULT_STATE_COLORS[category as Category] || '#3b82f6',
        order: states.length,
        position,
      };

      setStates((prev) => {
        const updated = [...prev, newState];
        syncNodesToStates(updated);
        return updated;
      });
    },
    [reactFlowInstance, states, syncNodesToStates]
  );

  // --- Operaciones CRUD locales ---
  const handleEditState = (state: FlowState) => { setEditingState(state); setDialogOpen(true); };
  
  const handleSaveState = (stateData: Partial<FlowState>) => {
    if (editingState) {
      setStates((prev) => {
        const updated = prev.map((s) => s.tempId === editingState.tempId ? { ...s, ...stateData } : s);
        syncNodesToStates(updated);
        return updated;
      });
    }
    setEditingState(null);
    setDialogOpen(false);
  };

  const handleDeleteState = (tempId: string) => {
    setStates((prev) => { const updated = prev.filter((s) => s.tempId !== tempId); syncNodesToStates(updated); return updated; });
    setTransitions((prev) => { const updated = prev.filter((t) => t.fromStateId !== tempId && t.toStateId !== tempId); syncEdgesToTransitions(updated); return updated; });
  };

  const handleDeleteTransition = (tempId: string) => {
    setTransitions((prev) => { const updated = prev.filter((t) => t.tempId !== tempId); syncEdgesToTransitions(updated); return updated; });
  };

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const newTransition: FlowTransition = { tempId: uuidv4(), fromStateId: connection.source, toStateId: connection.target };
    setTransitions((prev) => { const updated = [...prev, newTransition]; syncEdgesToTransitions(updated); return updated; });
  }, [syncEdgesToTransitions]);

  const onNodesChangeWrapper = useCallback((changes: any) => {
    onNodesChange(changes);
    changes.forEach((change: any) => {
      if (change.type === 'position' && change.position) {
        setStates((prev) => prev.map((s) => s.tempId === change.id ? { ...s, position: change.position } : s));
      }
    });
  }, [onNodesChange]);

  const handleSave = async () => {
    if (!flowName.trim()) return setSnackbar({ open: true, message: 'Debe ingresar un nombre para el flujo', severity: 'error' });
    const initialStates = states.filter((s) => s.is_initial);
    if (initialStates.length !== 1) return setSnackbar({ open: true, message: 'Debe haber exactamente un estado inicial', severity: 'error' });

    setSaving(true);
    try {
      await onSave(flowName, states, transitions);
      setSnackbar({ open: true, message: 'Flujo guardado correctamente', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al guardar el flujo', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    // Contenedor principal que previene el scroll vertical de la ventana entera
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'background.default' }}>
      
      {/* Barra lateral de Drag & Drop (El diseño de v0) */}
      {!isLocked && (
        <Sidebar 
          onAddState={(data) => { /* lógica de creación usando handleSaveState */ }} 
          hasInitialState={hasInitialState} 
        />
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Superior con el Input y Botón Guardar */}
        <Paper elevation={0} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 0, bgcolor: 'background.paper' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Editor de Flujos
          </Typography>

          <TextField 
            size="small"
            placeholder="Nombre del flujo de negocio..."
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            sx={{ flex: 1, mx: 4 }}
          />

          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving || states.length === 0}>
            {saving ? 'Guardando...' : 'Guardar Flujo'}
          </Button>
        </Paper>

        {/* Lienzo Oscuro de React Flow */}
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
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme.palette.divider}/>
            <Controls style={{ backgroundColor: theme.palette.background.paper, 
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary }} onInteractiveChange={(isInteractive) => setIsLocked(!isInteractive)}/>
            <MiniMap 
              style={{ backgroundColor: theme.palette.background.paper }} 
              nodeColor={(node) => (node.data as any).color || theme.palette.primary.main} 
              maskColor={theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
            />
          </ReactFlow>
        </Box>
      </Box>

      {/* Diálogo de Edición */}
      <StateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveState}
        state={editingState}
        hasInitialState={hasInitialState}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}