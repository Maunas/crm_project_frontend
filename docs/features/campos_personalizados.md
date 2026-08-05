# Campos personalizados (`src/features/leadFields/`)

## Estructura
```
leadFields/
  LeadFieldDetail.tsx       → LeadFieldDetail (sidebar)
  LeadFieldForm.tsx         → LeadFieldForm (crear/editar)
  LeadFieldList.tsx         → LeadFieldList (lista en CampaignDetails)
  leadFieldServices.ts      → servicios API
  LeadFieldTable.tsx        → LeadFieldTable (tabla drag & drop reordenable)
  LeadFieldTypeIcon.tsx     → LeadFieldTypeIcon (ícono por tipo de campo)
  leadFieldUtils.ts         → utilidades
```

## Componentes

### `LeadFieldList` — `LeadFieldList.tsx`
Lista de campos personalizados, usada dentro de `CampaignDetails`.
- Muestra campos agrupados por sección (`LeadFieldsBySection`)
- Cada sección es colapsable
- Drag & drop para reordenar campos dentro de una sección (usa `useDragAndDrop`)
- El botón "Reordenar" exige permiso `lead_field:update`

### `LeadFieldForm` — `LeadFieldForm.tsx`
Formulario de creación/edición de campo personalizado:
- Nombre, tipo de campo (con subtipo), sección, orden
- Configuraciones específicas por tipo:
  - SELECTOR/CHECKBOX: nomenclador, campo padre dependiente
  - RELATIONSHIP: campaña relacionada
  - CALCULATED: expresión de fórmula (con `FormulaHelperPanel`)
  - MASK: máscara de input
- Flags: requerido, primary, visible, título
- Valor por defecto
- Se abre como sidebar

### `LeadFieldDetail` — `LeadFieldDetail.tsx`
Sidebar de detalle de campo:
- Muestra todas las configuraciones del campo
- Reglas de validación asociadas
- Metadata

### `LeadFieldTable` — `LeadFieldTable.tsx`
Tabla de campos con drag & drop para reordenar.
- Columnas: orden, nombre, tipo, requerido, visible
- Indicador de campo primario
- Acciones inline
- Renombrar sección con doble clic exige permiso `lead_field_section:update` (modifica `LeadFieldSection`, no el campo)

### `LeadFieldTypeIcon` — `LeadFieldTypeIcon.tsx`
Ícono SVG/MUI correspondiente a cada tipo de campo:
```tsx
<LeadFieldTypeIcon fieldTypeCode="TEXT" />
```

## Servicios (`leadFieldServices.ts`)
```tsx
getLeadFields(campaignId, params?) → Paginable<LeadField>
getLeadField(id) → LeadFieldDetailed
createLeadField(data) → LeadField
updateLeadField(id, data) → LeadField
deleteLeadField(id) → DeleteResponse
reorderLeadFields(data: LeadFieldsReorderBody) → void
getLeadFieldTemplates() → LeadFieldTemplate[]
getFieldTypes() → LeadFieldTypeDetailed[]
getInputMasks() → InputMaskTemplate[]
```

## Utilidades (`leadFieldUtils.ts`)
- `getFieldTypeIcon(fieldTypeCode)` → icono correspondiente
- Helpers para determinar comportamiento según tipo de campo
- `getFieldSelectorGroupName(field)` → nombre de la sección con la que se agrupa un campo en selectores: para nativos (id < 0) la sección sintética (`getNativeFieldSectionName` en `nativeLeadFields.ts`), para custom el nombre de su `lead_field_section`, fallback "Otros"
- `groupFieldsForSelector(fields)` → agrupa campos (nativos + custom mezclados) en secciones contiguas preservando orden relativo y de aparición
- `flattenGroupedFields(groups)` → aplana los grupos de vuelta a lista (ya reordenada por sección)
