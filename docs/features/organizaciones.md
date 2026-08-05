# Organizaciones (`src/features/organizations/`)

## Estructura
```
organizations/
  InviteDialog.tsx           → InviteDialog (modal de invitación)
  OrganizationDetail.tsx     → OrganizationDetail (sidebar)
  OrganizationForm.tsx       → OrganizationForm (crear/editar)
  OrganizationList.tsx       → OrganizationList (página principal)
  organizationServices.ts    → servicios API
```

## Componentes

### `OrganizationList` — `OrganizationList.tsx`
Página principal de organizaciones. Ruta: `/organizations/`.
- Solo accesible para superadmins
- Lista de organizaciones con `ResponsiveListItem`
- Sidebar de detalle, CRUD completo
- Búsqueda y orden

### `OrganizationDetail` — `OrganizationDetail.tsx`
Sidebar de detalle de organización:
- Metadata completa (creación, modificación, creador)
- Estados de contacto disponibles
- Workspaces asociados
- Botones de acción: editar, eliminar, invitar usuarios

### `OrganizationForm` — `OrganizationForm.tsx`
Formulario de creación/edición de organización:
- Nombre, descripción

### `InviteDialog` — `InviteDialog.tsx`
Modal para invitar usuarios a una organización:
- Email del usuario a invitar
- Rol (admin, agent, viewer)

## Servicios (`organizationServices.ts`)
```tsx
getOrganizations(params?) → Paginable<Organization>
getOrganization(id) → OrganizationDetailed
createOrganization(data) → Organization
updateOrganization(id, data) → Organization
deleteOrganization(id) → DeleteResponse
inviteUser(orgId, data) → void
```

## Rutas
- `/organizations/` → `OrganizationList`
