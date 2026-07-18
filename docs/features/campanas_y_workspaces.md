# Campañas y Workspaces

## Campañas (`src/features/campaigns/`)

### Estructura
```
campaigns/
  CampaignDetails.tsx   → CampaignDetails (página)
  CampaignForms.tsx     → CampaignForm (crear/editar)
  CampaignList.tsx      → CampaignList (lista en sidebar de campaña)
  campaignServices.ts   → servicios API
```

### Componentes

#### `CampaignDetails` — `CampaignDetails.tsx`
Página de detalle de campaña. Ruta: `/campaigns/:id`.
- Muestra metadata, campos personalizados, automatizaciones, flujo de leads, leads asociados
- Pestañas/secciones para navegar la información

#### `CampaignForm` — `CampaignForms.tsx`
Formulario de creación/edición de campaña:
- Nombre, workspace, lead flow
- Tipo de audiencia (B2B/B2C) que determina campos por defecto
- Se abre como sidebar desde `WorkspaceDetails`

#### `CampaignList` — `CampaignList.tsx`
Lista de campañas dentro de un workspace. Usa `ResponsiveListItem` con acciones.

### Servicios (`campaignServices.ts`)
```tsx
getCampaigns(params?) → Paginable<Campaign>
getCampaign(id) → CampaignDetailed
createCampaign(data) → Campaign
updateCampaign(id, data) → Campaign
deleteCampaign(id) → DeleteResponse
setActiveCampaign(id, data?) → Campaign
```

---

## Workspaces (`src/features/workspaces/`)

### Estructura
```
workspaces/
  WorkspaceDetails.tsx   → WorkspaceDetail (sidebar)
  WorkspaceForms.tsx     → WorkspaceForm (crear/editar)
  WorkspaceList.tsx      → WorkspaceList (página principal)
  workspaceServices.tsx  → servicios API
```

### Componentes

#### `WorkspaceList` — `WorkspaceList.tsx`
Página principal de campañas/workspaces. Ruta: `/campaigns/`.
- Lista de workspaces con sus campañas anidadas
- Sidebar de detalle al seleccionar un workspace
- CRUD de workspaces y campañas desde la misma página
- Usa `useSidebar` para manejar el panel lateral

#### `WorkspaceDetail` — `WorkspaceDetails.tsx`
Sidebar de detalle de workspace:
- Muestra metadata del workspace
- Lista de campañas del workspace con acciones
- Botones para crear/editar campañas

#### `WorkspaceForm` — `WorkspaceForms.tsx`
Formulario de creación/edición de workspace:
- Nombre, organización (predefinida)
- Se abre como modal desde `WorkspaceList`

### Servicios (`workspaceServices.tsx`)
```tsx
getWorkspaces(params?) → Paginable<Workspace>
getWorkspace(id) → WorkspaceDetailed
createWorkspace(data) → Workspace
updateWorkspace(id, data) → Workspace
deleteWorkspace(id) → DeleteResponse
```

## Rutas
- `/campaigns/` → `WorkspaceList`
- `/campaigns/:id` → `CampaignDetails`
