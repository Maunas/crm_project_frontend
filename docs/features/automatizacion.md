# Automatización de campos (`src/features/fieldAutomation/`)

## Estructura
```
fieldAutomation/
  ActionBuilder.tsx             → ActionBuilder (constructor de acciones)
  ActionRow.tsx                 → ActionRow (fila de acción)
  AutomationFieldServices.ts    → servicios API
  AutomationForm.tsx            → AutomationForm (crear/editar)
  AutomationList.tsx            → AutomationList (página principal)
  AutomationPage.tsx            → AutomationPage (vista detalle con editor)
  ConditionBuilder.tsx          → ConditionBuilder (constructor de condiciones)
  ConditionRow.tsx              → ConditionRow (fila de condición)
```

## Componentes

### `AutomationList` — `AutomationList.tsx`
Página principal de automatizaciones. Ruta: `/automations/`.
- Lista de reglas de automatización
- Sidebar de detalle al seleccionar una
- CRUD completo

### `AutomationPage` — `AutomationPage.tsx`
Página de detalle/edición de una automatización. Ruta: `/automations/:id`.
- Editor visual de la regla: condiciones y acciones
- Builders para agregar/quitar condiciones y acciones

### `AutomationForm` — `AutomationForm.tsx`
Formulario de creación/edición de automatización:
- Nombre, campaña, trigger (ON_CREATE / ON_UPDATE), estado activo/inactivo

### `ConditionBuilder` — `ConditionBuilder.tsx`
Constructor de condiciones para reglas de automatización:
- Selección de campo, operador, valor
- Múltiples condiciones combinables (AND)

### `ConditionRow` — `ConditionRow.tsx`
Fila individual de condición dentro del builder:
- Campo, operador, valor
- Botón para eliminar la condición

### `ActionBuilder` — `ActionBuilder.tsx`
Constructor de acciones para reglas de automatización:
- Selección de campo, acción (SET_VALUE, CLEAR, COPY, CALCULATE, etc.), valor

### `ActionRow` — `ActionRow.tsx`
Fila individual de acción dentro del builder:
- Campo, tipo de acción, valor/expresión
- Botón para eliminar la acción

## Servicios (`AutomationFieldServices.ts`)
```tsx
getAutomations(params?) → Paginable<FieldAutomation>
getAutomation(id) → FieldAutomationDetailed
createAutomation(data) → FieldAutomation
updateAutomation(id, data) → FieldAutomation
deleteAutomation(id) → DeleteResponse
getCompatibilityMatrix() → AutomationCompatibility[]
```

## Rutas
- `/automations/` → `AutomationList`
- `/automations/:id` → `AutomationPage`
