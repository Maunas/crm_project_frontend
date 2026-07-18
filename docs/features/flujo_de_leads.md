# Flujo de leads (`src/features/leadFlows/`)

## Estructura
```
leadFlows/
  CustomEdge.tsx            → CustomEdge (arista personalizada de React Flow)
  FlowEditor.tsx            → FlowEditor (editor visual con React Flow)
  FlowEditorPage.tsx        → LeadFlowEditor (página completa)
  LeadFlowForms.tsx         → LeadFlowForm, LeadStateForm, LeadTransitionForm
  LeadFlowList.tsx          → LeadFlowList (lista)
  Sidebar.tsx               → FlowEditorSidebar (panel lateral del editor)
  StateNode.tsx             → StateNode (nodo personalizado de React Flow)
  leadFlowServices/         → servicios API
```

## Componentes

### `LeadFlowEditor` — `FlowEditorPage.tsx`
Página del editor visual de flujo de leads. Ruta: `/lead-flow-editor/:id?`.
- Integra React Flow (reactflow) para editar estados y transiciones
- Sidebar con formularios de estado/transición
- Renderiza el grafo dirigido de estados

### `FlowEditor` — `FlowEditor.tsx`
Editor visual basado en React Flow:
- Usa `StateNode` como nodo personalizado y `CustomEdge` como arista
- Drag & drop desde `FlowEditorSidebar` para agregar nuevos estados
- Conexión entre nodos para crear transiciones
- Soporta selección de estado inicial

### `StateNode` — `StateNode.tsx`
Nodo personalizado de React Flow que representa un estado de lead:
- Muestra nombre del estado, color, categoría
- Indicador visual de estado inicial

### `CustomEdge` — `CustomEdge.tsx`
Arista personalizada de React Flow que representa una transición entre estados:
- Label con nombre de la transición
- Estilo según tipo/categoría

### `FlowEditorSidebar` — `Sidebar.tsx`
Panel lateral del editor:
- Botón para agregar nuevo estado
- Lista de estados existentes
- Al seleccionar un estado/transición en el grafo, muestra el formulario de edición

### `LeadFlowForm`, `LeadStateForm`, `LeadTransitionForm` — `LeadFlowForms.tsx`
Formularios para CRUD de flujos, estados y transiciones:
- `LeadFlowForm`: nombre del flujo
- `LeadStateForm`: nombre, color, categoría, es inicial
- `LeadTransitionForm`: nombre, origen/destino

### `LeadFlowList` — `LeadFlowList.tsx`
Lista de flujos de leads.

## Servicios (`leadFlowServices/`)
```tsx
getLeadFlows(params?) → Paginable<LeadFlow>
getLeadFlow(id) → LeadFlowDetailed
createLeadFlow(data) → LeadFlow
updateLeadFlow(id, data) → LeadFlow
deleteLeadFlow(id) → DeleteResponse
getLeadStates(flowId, params?) → Paginable<LeadState>
createLeadState(data) → LeadState
updateLeadState(id, data) → LeadState
getLeadTransitions(flowId) → LeadStateTransition[]
createLeadTransition(data) → LeadStateTransition
updateBulkTransition(id, data) → LeadStateTransition
deleteLeadTransition(id) → DeleteResponse
getGraph(flowId) → GraphData
postGraph(flowId, data) → void
```

## Rutas
- `/lead-flow-editor/:id?` → `LeadFlowEditor`
