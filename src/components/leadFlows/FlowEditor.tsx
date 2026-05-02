import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Connection, Edge, Node, ReactFlowInstance } from 'reactflow'
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  ConnectionMode,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Box,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import { v4 as uuidv4 } from 'uuid'

import StateNode from './StateNode'
import CustomEdge from './CustomEdge'
import StateDialog from './StateDialog'
import type { FlowState, FlowTransition, LeadStatePost, LeadStateTransitionPost } from '../../types/leadFlow'

const nodeTypes = {
  stateNode: StateNode,
}

const edgeTypes = {
  customEdge: CustomEdge,
}

interface FlowEditorProps {
  leadFlowId?: number | null
  onSave: (flowName: string, states: FlowState[], transitions: FlowTransition[]) => Promise<void>
}

export default function FlowEditor({ leadFlowId, onSave }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [flowName, setFlowName] = useState('')
  
  const [states, setStates] = useState<FlowState[]>([])
  const [transitions, setTransitions] = useState<FlowTransition[]>([])
  
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  // Efecto que reacciona a los cambios de tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance) {
        // Usamos requestAnimationFrame para asegurar que el renderizado sea fluido
        window.requestAnimationFrame(() => {
          // Centramos la vista con una pequeña animación y un margen
          reactFlowInstance.fitView({ padding: 0.2, duration: 500 })
        })
      }
    }

    // Agregamos el "oyente" a la ventana del navegador
    window.addEventListener('resize', handleResize)

    // Limpieza: quitamos el "oyente" cuando el componente se desmonta para evitar fugas de memoria
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [reactFlowInstance])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingState, setEditingState] = useState<FlowState | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  })
  const [saving, setSaving] = useState(false)

  const hasInitialState = useMemo(() => {
    return states.some((s) => s.is_initial && s.tempId !== editingState?.tempId)
  }, [states, editingState])

  // Sync states to nodes
  const syncNodesToStates = useCallback((updatedStates: FlowState[]) => {
    const newNodes: Node[] = updatedStates.map((state) => ({
      id: state.tempId,
      type: 'stateNode',
      position: state.position,
      data: {
        name: state.name,
        category: state.category,
        is_initial: state.is_initial,
        color: state.color,
        onEdit: () => handleEditState(state),
        onDelete: () => handleDeleteState(state.tempId),
      },
    }))
    setNodes(newNodes)
  }, [setNodes])

  // Sync transitions to edges
  const syncEdgesToTransitions = useCallback((updatedTransitions: FlowTransition[]) => {
    const edgesMap = new Map<string, Edge>();

    updatedTransitions.forEach((t) => {
      // Creamos un ID único que sea igual para la ida y la vuelta (ej: "estado1-estado2")
      const sourceId = t.fromStateId || '';
      const targetId = t.toStateId || '';
      const sortedIds = [sourceId, targetId].sort();
      const pairId = `${sortedIds[0]}-${sortedIds[1]}`;

      if (edgesMap.has(pairId)) {
        // Si el par ya existe, es bidireccional (A <-> B)
        const existingEdge = edgesMap.get(pairId)!;
        
        // 1. Le agregamos una flecha en el punto de inicio
        existingEdge.markerStart = {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#64748b',
          // orient invierte la dirección de la flecha para que apunte hacia el nodo
          orient: 'auto-start-reverse', 
        };

        // 2. Hacemos que el botón "X" borre AMBAS transiciones en los datos
        const deleteFirst = existingEdge.data.onDelete;
        existingEdge.data = {
          onDelete: () => {
            deleteFirst(); // Borra la ida
            handleDeleteTransition(t.tempId); // Borra la vuelta
          }
        };

      } else {
        // Es una conexión simple de ida, la creamos normalmente
        edgesMap.set(pairId, {
          id: t.tempId,
          source: sourceId,
          target: targetId,
          type: 'customEdge',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#64748b',
          },
          data: {
            onDelete: () => handleDeleteTransition(t.tempId),
          },
        });
      }
    });

    // Renderizamos solo las flechas únicas
    setEdges(Array.from(edgesMap.values()));
  }, [setEdges]);

  // Create new state
  const handleCreateState = () => {
    setEditingState(null)
    setDialogOpen(true)
  }

  // Edit existing state
  const handleEditState = (state: FlowState) => {
    setEditingState(state)
    setDialogOpen(true)
  }

  // Save state from dialog
  const handleSaveState = (stateData: Partial<FlowState>) => {
    if (editingState) {
      // Update existing
      const updatedStates = states.map((s) =>
        s.tempId === editingState.tempId
          ? { ...s, ...stateData }
          : s
      )
      setStates(updatedStates)
      syncNodesToStates(updatedStates)
    } else {
      // Create new
      const newState: FlowState = {
        tempId: uuidv4(),
        name: stateData.name || '',
        category: stateData.category || 'OPEN',
        is_initial: stateData.is_initial || false,
        color: stateData.color || '#2196f3',
        order: states.length,
        position: {
          x: 250,
          y: states.length * 150 + 50,
        },
      }
      const updatedStates = [...states, newState]
      setStates(updatedStates)
      syncNodesToStates(updatedStates)
    }
    setEditingState(null)
  }

  // Delete state
  const handleDeleteState = (tempId: string) => {
    // 1. Actualizamos los estados pidiendo la lista más reciente (prevStates)
    setStates((prevStates) => {
      const updatedStates = prevStates.filter((s) => s.tempId !== tempId);
      syncNodesToStates(updatedStates); // Sincronizamos el mapa
      return updatedStates;
    });

    // 2. Actualizamos las transiciones pidiendo la lista más reciente (prevTransitions)
    setTransitions((prevTransitions) => {
      const updatedTransitions = prevTransitions.filter(
        (t) => t.fromStateId !== tempId && t.toStateId !== tempId
      );
      syncEdgesToTransitions(updatedTransitions); // Sincronizamos el mapa
      return updatedTransitions;
    });
  }

  // Delete transition
  const handleDeleteTransition = (tempId: string) => {
    // Usamos 'prevTransitions' para asegurarnos de no borrar las demás flechas
    setTransitions((prevTransitions) => {
      const updatedTransitions = prevTransitions.filter((t) => t.tempId !== tempId);
      syncEdgesToTransitions(updatedTransitions); // Sincronizamos el mapa
      return updatedTransitions;
    });
  }

  // Handle connection (creating new transition)
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return; // 

    // Creamos la nueva transición con un ID único
    const newTransition: FlowTransition = {
      tempId: uuidv4(), // <-- ESTO ES CLAVE: ID único para cada flecha
      fromStateId: connection.source,
      toStateId: connection.target,
    };

    // Actualizamos el estado de las transiciones y sincronizamos
    setTransitions((prev) => {
      const updatedTransitions = [...prev, newTransition];
      syncEdgesToTransitions(updatedTransitions); // [cite: 35]
      return updatedTransitions;
    });
  }, [syncEdgesToTransitions]);

  // Handle node position change
  const onNodesChangeWrapper = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      
      // Update state positions
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          setStates((prev) =>
            prev.map((s) =>
              s.tempId === change.id
                ? { ...s, position: change.position }
                : s
            )
          )
        }
      })
    },
    [onNodesChange]
  )

  // Save to API
  const handleSave = async () => {

    // Validar nombre
    if (!flowName.trim()) {
      setSnackbar({ open: true, message: 'Debe ingresar un nombre para el flujo', severity: 'error' })
      return
    }

    // Validate
    const initialStates = states.filter((s) => s.is_initial)
    if (initialStates.length === 0) {
      setSnackbar({
        open: true,
        message: 'Debe haber un estado inicial',
        severity: 'error',
      })
      return
    }

    if (initialStates.length > 1) {
      setSnackbar({
        open: true,
        message: 'Solo puede haber un estado inicial',
        severity: 'error',
      })
      return
    }

    // Build API payloads
    const statesPayload: LeadStatePost[] = states.map((s, index) => ({
      name: s.name,
      lead_flow_id: leadFlowId,
      category: s.category,
      is_initial: s.is_initial,
      order: index,
      color: s.color,
    }))

    // Para las transiciones, necesitamos mapear tempIds a IDs reales
    // Por ahora, usamos el índice como referencia temporal
    const stateIndexMap = new Map<string, number>()
    states.forEach((s, index) => {
      stateIndexMap.set(s.tempId, index)
    })

    const transitionsPayload: LeadStateTransitionPost[] = transitions.map((t) => ({
      lead_flow_id: leadFlowId,
      // Estos IDs se resolverán en el backend después de crear los estados
      from_lead_state_id: t.fromStateId ? stateIndexMap.get(t.fromStateId) ?? null : null,
      to_state_id: stateIndexMap.get(t.toStateId) ?? 0,
    }))

    setSaving(true)
    try {
      await onSave(flowName, states, transitions)
      setSnackbar({
        open: true,
        message: 'Flujo guardado correctamente',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar el flujo',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ width: '100%', height: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Editor de Flujo de Estados
        </Typography>

        {/* 4. Agregamos el Input para el nombre entre el título y los botones */}
        <TextField 
          size="small"
          placeholder="Nombre del flujo de negocio..."
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          sx={{ flex: 1, mx: 4, bgcolor: 'background.paper' }} // mx: 4 le da margen a los lados
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateState}
          >
            Agregar Estado
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || states.length === 0}
          >
            {saving ? 'Guardando...' : 'Guardar Flujo'}
          </Button>
        </Box>
      </Paper>

      {/* Flow Canvas */}
      <Box sx={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapper}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          onInit={setReactFlowInstance}
          defaultEdgeOptions={{
            type: 'customEdge',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#64748b',
            },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <Panel position="bottom-center">
            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="body2" color="text.secondary">
                💡 Arrastra desde el círculo inferior de un estado al superior de otro para crear transiciones
              </Typography>
            </Paper>
          </Panel>
        </ReactFlow>
      </Box>

      {/* State Dialog */}
      <StateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveState}
        state={editingState}
        hasInitialState={hasInitialState}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
