# Leads (`src/features/lead/`)

Es el módulo más grande del frontend. Maneja CRUD de leads, listado con dos vistas (tabla/board), formulario dinámico, detalle, actividades, comentarios, filtros, columnas seleccionables y título configurable.

## Estructura
```
lead/
  leadList/             → Listado de leads
    board/              → Vista kanban
      LeadBoardCard.tsx
      LeadBoardColumn.tsx
      LeadBoardPresentation.tsx
    LeadListCellValue.tsx
    LeadListContent.tsx
    LeadListPage.tsx
    LeadSidebar.tsx
    LeadTablePresentation.tsx
  leadForm/             → Formulario de lead
    LeadForm.tsx         → LeadPostForm (tipos + lógica)
    LeadFormWraper.tsx  → CreateLeadFormPage, UpdateLeadFormPage
  details/              → Detalle del lead
    LeadDetails.tsx      → LeadDetailsLayout
    LeadDetailsSections.tsx
    LeadDetailsService.ts
    LeadDetailsState.tsx
    LeadPartialUpdate.tsx
  leadListOptions/      → Opciones del listado
    LeadColumnSelector.tsx
    LeadFilterItem.tsx
    LeadFilters.tsx
    LeadListOptions.tsx
    LeadViewMenu.tsx
  leadTitleConfig/      → Configuración de título
    LeadTitleConfigPreview.tsx
    LeadTitleConfigSidebar.tsx
  activities/           → Actividades y comentarios
    LeadActivities.tsx
    leadActivitiesService.ts
    LeadAudit.tsx
    LeadCommentForm.tsx
    LeadComments.tsx
  shared/               → Componentes compartidos del módulo lead
    LeadFormFields.tsx
    LeadFormMultipleFields.tsx
    LeadValueComponents.tsx
  stores/
    LeadNavigationContext.tsx
  ImportLeadsPage.tsx
  leadService.ts
  leadUtils.ts
  nativeLeadFields.ts
  teamService.ts
```

## Componentes principales

### `LeadListPage` — `leadList/LeadListPage.tsx`
Página principal del listado. Ruta: `/leads/`.
- Obtiene leads con filtros, orden y paginación
- Muestra `LeadListOptions` (búsqueda, filtros, columnas, vistas)
- Alterna entre `LeadTablePresentation` y `LeadBoardPresentation`
- Usa `useOrderSearchList`, `useListPagination`, `LeadNavigationContext`

### `LeadTablePresentation` — `leadList/LeadTablePresentation.tsx`
Tabla de leads con columnas dinámicas según campos seleccionados.
- Usa `LeadListCellValue` para renderizar cada celda según el tipo de campo
- Acciones por fila: detalle, modificar, eliminar
- Soporta `SelectableTableRow` con hover actions
- Soporta los campos nativos `created_by`/`updated_by` como columnas (nombre completo con email en tooltip)

### `LeadBoardPresentation` — `leadList/board/LeadBoardPresentation.tsx`
Vista kanban (board) de leads agrupados por estado.
- Columnas: `LeadBoardColumn` (un estado de lead)
- Cards: `LeadBoardCard` (info resumida del lead)

### `LeadSidebar` — `leadList/LeadSidebar.tsx`
Sidebar izquierdo del listado de leads con controles de vista, filtros y paginación.
- Selector de vista (tabla/board)
- Gestión de vistas guardadas (crear, editar, eliminar)
- Filtros avanzados (`LeadFilters`)
- Paginación (`PaginationComponent`)

### `CreateLeadFormPage` / `UpdateLeadFormPage` — `leadForm/LeadFormWraper.tsx`
Páginas de creación/edición de leads. Rutas: `/leads/new`, `/leads/modify/:id`.
- Usa `LeadForm` internamente
- `LeadForm` construye el formulario dinámicamente según los campos definidos en la campaña
- Los campos se renderizan con `LeadFormFields` y `LeadFormMultipleFields`

### `LeadDetailsLayout` — `details/LeadDetails.tsx`
Página de detalle del lead. Ruta: `/leads/:id`.
- Muestra todas las secciones del lead
- `LeadDetailsSections`: renderiza valores agrupados por sección
- `LeadDetailsState`: timeline de cambios de estado
- `LeadPartialUpdate`: sidebar para edición rápida de campos individuales
- Incluye pestañas de actividades (`LeadActivities`), comentarios (`LeadComments`) y auditoría (`LeadAudit`)
- `LeadMetaInfo`: usuario/equipo asignado **editables** vía selectores (Autocomplete con opción "Sin asignar") que llaman a `PATCH leads/bulk-assign` (mismo permiso que el detalle, `lead:update`; sin permiso se muestra el valor como texto simple), más `<DetailsMetadata entity={lead}/>` para creador/modificador (email en tooltip) y fechas. Layout en 2 columnas (Usuario asignado / Equipo asignado), pedido explícitamente por el usuario
- Permisos en el detalle (mismo criterio que el backend): edición inline de valores, cambio de etapa/estado y reasignación exigen `lead:update`; "Configurar título" exige `lead_field:update`; eliminar/restaurar exige `lead:delete`/`lead:update`; renombrar sección exige `lead_field_section:update`

### `LeadFormFields` / `LeadFormMultipleFields` — `shared/`
Componentes compartidos para renderizar campos de lead según su tipo:
- TEXT, TEXTAREA, NUMBER, EMAIL, URL, PHONE, DATE, DATE_TIME, TIME → inputs estándar
- MONEY → NumberField con formato moneda
- SELECTOR / CHECKBOX → ControlledAutocomplete con opciones del nomenclador
- LEAD → selector de lead relacionado
- RATING → slider/rating
- ADDRESS → grupo de campos (calle, número, ciudad, etc.)
- PASSWORD → campo con máscara
- FILE → FileInput con drag & drop
- CALCULATED → solo lectura (se recalcula automáticamente)
- Soporta campos dependientes (SELECTOR/CHECKBOX que dependen de otro campo nomenclador)

### `LeadColumnSelector` — `leadListOptions/LeadColumnSelector.tsx`
Selector de columnas visibles en la tabla de leads.
- Arrastrar y soltar para reordenar
- Checkboxes para mostrar/ocultar
- Agrupa las listas (disponibles/seleccionadas) por sección con `FieldSectionHeader` cuando se pasa `getGroupName` (`getFieldSelectorGroupName` de `leadFieldUtils.ts`), reflejando el orden actual sin reordenar

### `LeadFilters` / `LeadFilterItem` — `leadListOptions/`
Filtros avanzados para el listado de leads.
- Filtros por campo, operador y valor
- Múltiples filtros combinables
- El selector de campo usa `ControlledFieldSelector` (agrupado por sección, `showTypeCaption={false}`)
- Soporta los campos nativos `created_by`/`updated_by` como filtros de usuario (nombre completo)

### `LeadViewMenu` — `leadListOptions/LeadViewMenu.tsx`
Gestión de vistas guardadas (combinación de filtros + columnas + orden).

### `LeadTitleConfigPreview` / `LeadTitleConfigSidebar` — `leadTitleConfig/`
Configuración de cómo se muestra el título de cada lead en el listado.
- Sidebar para seleccionar campos que componen el título

### `LeadCommentForm` / `LeadComments` — `activities/`
Sistema de comentarios en el detalle del lead.
- `LeadCommentForm`: formulario para agregar comentarios
- `LeadComments`: lista de comentarios
- Cada comentario se tiñe con el color determinístico de su autor (`nameToColor` de `UserAvatar`): borde izquierdo + fondo suave; mismo autor = mismo color

### `LeadActivities` / `LeadAudit` — `activities/`
Historial de actividades y auditoría del lead.
- `LeadAudit`: timeline de cambios; labels con la nueva terminología (etapas/estados, ciclo de vida)

### `LeadDetailsState` — `details/LeadDetailsState.tsx`
Selector de estado del lead en el detalle.
- Muestra el estado/etapa actual y los próximos estados (con flechas según `order`)
- Cambiar de estado/etapa exige permiso `lead:update` (el chip se muestra siempre, solo se gatea la posibilidad de cambiarlo)

## Servicios
### `leadService.ts`
```tsx
getLeads(params?: LeadListParams) → Paginable<Lead>
getLead(id: number) → LeadDetailed
createLead(data: LeadPost) → Lead
updateLead(id: number, data: Partial<LeadPost>) → Lead
deleteLead(id: number) → DeleteResponse
simulateLead(data: LeadPost) → ValidationResult
changeStateLead(lead_id, state_id) → Lead
changeContactStateLead(lead_id, state_id) → LeadDetailed
bulkAssignLeads(body: BulkAssignRequest) → Lead[]
```
- `bulkAssignLeads` → `PATCH leads/bulk-assign`: reasignación de equipo/usuario asignado en lotes. Es el único endpoint que puede tocar `team_id`/`assigned_to_user_id` (`LeadUpdate` no los incluye). `target_team_id`/`target_user_id` en `null`/`undefined` significa "no tocar"; para desasignar hay que mandar `clear_team`/`clear_user: true`

### `teamService.ts`
Servicio auxiliar dentro del módulo lead para asignación de equipos a leads.
```tsx
getLeadTeams() → Team[]
assignTeam(leadId: number, teamId: number) → void
```

## Utilidades

### `nativeLeadFields.ts`
Define los 8 campos nativos del modelo `Lead` que se tratan como campos virtuales (IDs negativos para no colisionar con campos custom): `contact_state_id` (−1, "Estado"), `current_state_id` (−2, "Etapa"), `team_id` (−3), `assigned_to_user_id` (−4), `created_at` (−5), `updated_at` (−6), `created_by` (−7, "Usuario Creador") y `updated_by` (−8, "Usuario Modificador"). Se inyectan en la lista de `leadFields` para filtros, columnas de tabla y automatizaciones.

Exports adicionales:
- `WRITABLE_NATIVE_KEYS: string[]` — nativeKeys de los campos nativos que se pueden setear por automatización (`contact_state_id`, `current_state_id`, `team_id`, `assigned_to_user_id`). Debe reflejar `WRITABLE_NATIVE_FIELD_IDS` de `backend/app/core/native_lead_fields.py`
- `NativeFieldOptions` — `{ contactStates, leadStates, teams, users }`, las opciones reales para los selectores de valor de los campos nativos tipo `NATIVE_ID`
- `getNativeFieldSectionName(fieldId)` — sección sintética de un campo nativo ("Datos del Lead"/"Creación"/"Modificación"), usada para agrupar selectores de campo (sin sección real en la base)

## Rutas
- `/leads/` → `LeadListPage`
- `/leads/new` → `CreateLeadFormPage`
- `/leads/modify/:id` → `UpdateLeadFormPage`
- `/leads/:id` → `LeadDetailsLayout`
- `/leads/import` → `ImportLeadsPage`
