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

### `LeadBoardPresentation` — `leadList/board/LeadBoardPresentation.tsx`
Vista kanban (board) de leads agrupados por estado.
- Columnas: `LeadBoardColumn` (un estado de lead)
- Cards: `LeadBoardCard` (info resumida del lead)

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

### `LeadFilters` / `LeadFilterItem` — `leadListOptions/`
Filtros avanzados para el listado de leads.
- Filtros por campo, operador y valor
- Múltiples filtros combinables

### `LeadViewMenu` — `leadListOptions/LeadViewMenu.tsx`
Gestión de vistas guardadas (combinación de filtros + columnas + orden).

### `LeadTitleConfigPreview` / `LeadTitleConfigSidebar` — `leadTitleConfig/`
Configuración de cómo se muestra el título de cada lead en el listado.
- Sidebar para seleccionar campos que componen el título

### `LeadCommentForm` / `LeadComments` — `activities/`
Sistema de comentarios en el detalle del lead.
- `LeadCommentForm`: formulario para agregar comentarios
- `LeadComments`: lista de comentarios

### `LeadActivities` / `LeadAudit` — `activities/`
Historial de actividades y auditoría del lead.

## Servicios (`leadService.ts`)
```tsx
getLeads(params?: LeadListParams) → Paginable<Lead>
getLead(id: number) → LeadDetailed
createLead(data: LeadPost) → Lead
updateLead(id: number, data: Partial<LeadPost>) → Lead
deleteLead(id: number) → DeleteResponse
simulateLead(data: LeadPost) → ValidationResult
```

## Rutas
- `/leads/` → `LeadListPage`
- `/leads/new` → `CreateLeadFormPage`
- `/leads/modify/:id` → `UpdateLeadFormPage`
- `/leads/:id` → `LeadDetailsLayout`
- `/leads/import` → `ImportLeadsPage`
