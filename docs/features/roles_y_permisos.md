# Roles y permisos

Módulo para gestionar los roles del sistema y sus permisos asociados por organización.

## Componentes

### `RoleList` — `features/roles/RoleList.tsx`
Listado paginado de roles con sidebar de detalle/creación/edición.

- Pantalla única con sidebar lateral (`ContainerWithSidebar`)
- Orden alfabético o por código (`OrderSearchMenu`)
- Búsqueda por nombre o código
- Acciones por rol: detalle, editar, habilitar/deshabilitar (con `DisableConfirmDialog`)
- Protegido por permisos (`role:view`, `role:create`, `role:update`, `role:delete`)
- Filtro de visibilidad por organización activa

### `RoleFormSidebar` — `features/roles/RoleForms.tsx`
Sidebar para crear o editar un rol.

### `RoleDetails` — `features/roles/RoleDetails.tsx`
Sidebar de detalle con información del rol y lista de permisos asignados.

## Ruta
`/roles` — visible en navbar de org normal y Panel Global, ícono `ROUTE_ICONS.ROLES` (LockIcon).
