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
- Filtra por campaña con el query param `campaign_id` (corregido: antes enviaba `campaign`)

### `AutomationPage` — `AutomationPage.tsx`
Página de detalle/edición de una automatización. Ruta: `/automations/:id`.
- Editor visual de la regla: condiciones y acciones
- Builders para agregar/quitar condiciones y acciones
- Carga los `NATIVE_LEAD_FIELDS` junto a los campos custom de la campaña y las **opciones reales** de los campos nativos (`NativeFieldOptions`: estados de contacto, etapas del flujo, equipos, usuarios) para poder usarlos en condiciones y acciones

### `AutomationForm` — `AutomationForm.tsx`
Formulario de creación/edición de automatización:
- Nombre, campaña, trigger (ON_CREATE / ON_UPDATE), estado activo/inactivo
- Recibe `nativeOptions` (`NativeFieldOptions`) para propagarlos a `ConditionBuilder`/`ActionBuilder`

### `ConditionBuilder` — `ConditionBuilder.tsx`
Constructor de condiciones para reglas de automatización:
- Selección de campo, operador, valor
- Múltiples condiciones combinables (AND)

### `ConditionRow` — `ConditionRow.tsx`
Fila individual de condición dentro del builder:
- Campo, operador, valor
- Botón para eliminar la condición
- El selector de campo es `FieldSelector` (agrupado por sección, ver `componentes_ui.md`)
- Soporta campos `NATIVE_ID` (estado, etapa, equipo, usuario asignado, creador/modificador): operadores eq/neq/is_empty/is_not_empty y valor con las opciones reales de `nativeOptions`

### `ActionBuilder` — `ActionBuilder.tsx`
Constructor de acciones para reglas de automatización:
- Selección de campo, acción (SET_VALUE, CLEAR, COPY, CALCULATE, etc.), valor

### `ActionRow` — `ActionRow.tsx`
Fila individual de acción dentro del builder:
- Campo, tipo de acción, valor/expresión
- Botón para eliminar la acción
- El selector de campo (destino y origen) es `FieldSelector` (agrupado por sección)
- Los campos nativos de solo lectura (fechas de creación/actualización, usuario creador/modificador) se pueden usar como origen de "Copiar de otro campo" y en condiciones, pero **no como destino** de acciones — solo los de `WRITABLE_NATIVE_KEYS` (`contact_state_id`, `current_state_id`, `team_id`, `assigned_to_user_id`, espejo de `backend/app/core/native_lead_fields.py`). El valor de un destino `NATIVE_ID` se elige con un Autocomplete de opciones reales

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
