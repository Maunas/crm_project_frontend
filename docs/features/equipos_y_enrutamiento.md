# Equipos y políticas de enrutamiento

## Equipos (`src/features/teams/`)

### Estructura
```
teams/
  TeamAccessPanel.tsx     → TeamAccessPanel (panel de acceso)
  TeamDetails.tsx         → TeamDetail (sidebar)
  TeamForm.tsx            → TeamForm (crear/editar)
  TeamList.tsx            → TeamList (lista)
  TeamMemberForm.tsx      → TeamMemberForm (agregar miembro)
  TeamMemberList.tsx      → TeamMemberList (lista de miembros)
  teamServices.ts         → servicios API
  TeamsPage.tsx           → TeamsPage (página principal)
```

### Componentes

#### `TeamsPage` — `TeamsPage.tsx`
Página principal de equipos. Ruta: `/teams/`.
- Lista de equipos
- Sidebar de detalle al seleccionar uno
- CRUD completo de equipos y miembros

#### `TeamList` — `TeamList.tsx`
Lista de equipos con `ResponsiveListItem`.

#### `TeamDetail` — `TeamDetails.tsx`
Sidebar de detalle de equipo:
- Metadata del equipo
- Lista de miembros con roles (MANAGER/AGENT)
- Acceso a workspaces/campañas

#### `TeamForm` — `TeamForm.tsx`
Formulario de creación/edición de equipo:
- Nombre, workspace asignado

#### `TeamMemberList` — `TeamMemberList.tsx`
Lista de miembros de un equipo con acciones para remover/cambiar rol.

#### `TeamMemberForm` — `TeamMemberForm.tsx`
Formulario para agregar miembro a un equipo:
- Selector de usuario
- Rol (MANAGER/AGENT)

#### `TeamAccessPanel` — `TeamAccessPanel.tsx`
Panel de configuración de acceso a workspaces/campañas para un equipo.

### Servicios (`teamServices.ts`)
```tsx
getTeams(params?) → Paginable<Team>
getTeam(id) → TeamDetailed
createTeam(data) → Team
updateTeam(id, data) → Team
deleteTeam(id) → DeleteResponse
getTeamMembers(teamId) → TeamMember[]
addTeamMember(teamId, data) → TeamMember
updateTeamMember(teamId, memberId, data) → TeamMember
removeTeamMember(teamId, memberId) → void
grantWorkspaceAccess(teamId, workspaceId) → void
grantCampaignAccess(teamId, campaignId) → void
```

---

## Políticas de enrutamiento (`src/features/routingPolicies/`)

### Estructura
```
routingPolicies/
  RoutingConditionRow.tsx      → RoutingConditionRow
  RoutingPolicyDetails.tsx     → RoutingPolicyDetail (sidebar)
  RoutingPolicyForm.tsx        → RoutingPolicyForm (crear/editar)
  RoutingPolicyList.tsx        → RoutingPolicyList
  routingPolicyServices.ts     → servicios API
```

### Componentes

#### `RoutingPolicyList` — `RoutingPolicyList.tsx`
Lista de políticas de enrutamiento para una campaña.

#### `RoutingPolicyForm` — `RoutingPolicyForm.tsx`
Formulario de creación/edición:
- Prioridad, equipo destino
- Condiciones de matching (campo, operador, valor)

#### `RoutingPolicyDetail` — `RoutingPolicyDetails.tsx`
Detalle de política con condiciones.

#### `RoutingConditionRow` — `RoutingConditionRow.tsx`
Fila de condición de enrutamiento: campo, operador, valor, conector AND/OR.

### Servicios (`routingPolicyServices.ts`)
```tsx
getRoutingPolicies(campaignId) → LeadRoutingPolicy[]
getRoutingPolicy(id) → LeadRoutingPolicyDetailed
createRoutingPolicy(data) → LeadRoutingPolicy
updateRoutingPolicy(id, data) → LeadRoutingPolicy
deleteRoutingPolicy(id) → DeleteResponse
```

## Rutas
- `/teams/` → `TeamsPage`
