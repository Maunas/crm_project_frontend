# Nomencladores (`src/features/nomenclators/`)

## Estructura
```
nomenclators/
  NomenclatorDetails.tsx    → NomenclatorDetail (sidebar)
  NomenclatorForm.tsx       → NomenclatorForm (crear/editar)
  NomenclatorItemForm.tsx   → NomenclatorItemForm (crear/editar items)
  NomenclatorItemList.tsx   → NomenclatorItemList (lista de items)
  NomenclatorList.tsx       → NomenclatorList (página principal)
  nomenclatorService.ts     → servicios API
```

## Componentes

### `NomenclatorList` — `NomenclatorList.tsx`
Página principal de nomencladores. Ruta: `/nomenclators/`.
- Lista de nomencladores con `ResponsiveListItem`
- Sidebar de detalle al seleccionar uno
- Al seleccionar un nomenclador, muestra `NomenclatorItemList` en el panel principal
- CRUD completo con `useSidebar`, `useModal`, `useSelectCheckbox`
- Búsqueda y orden con `OrderSearchMenu`

### `NomenclatorDetail` — `NomenclatorDetails.tsx`
Sidebar de detalle de nomenclador:
- Muestra metadata, items del nomenclador
- Estadísticas: cantidad de items activos/inactivos

### `NomenclatorForm` — `NomenclatorForm.tsx`
Formulario de creación/edición de nomenclador:
- Nombre, descripción
- Se abre como modal

### `NomenclatorItemList` — `NomenclatorItemList.tsx`
Lista de items de un nomenclador específico:
- Tabla con nombre, código, estado activo
- Selección múltiple con `useSelectCheckbox`
- Acciones: crear, editar, habilitar/deshabilitar, bulk delete
- Drag & drop para reordenar items

### `NomenclatorItemForm` — `NomenclatorItemForm.tsx`
Formulario de creación/edición de item:
- Nombre, código
- Items padres (soporta M2M, selector múltiple)
- Se abre como sidebar o modal

## Servicios (`nomenclatorService.ts`)
```tsx
getNomenclators(params?) → Paginable<Nomenclator>
getNomenclator(id) → NomenclatorDetailed
createNomenclator(data) → Nomenclator
updateNomenclator(id, data) → Nomenclator
deleteNomenclator(id) → DeleteResponse
getNomenclatorItems(nomenclatorId, params?) → Paginable<NomenclatorItem>
getNomenclatorItem(id) → NomenclatorItemDetailed
createNomenclatorItem(data) → NomenclatorItem
updateNomenclatorItem(id, data) → NomenclatorItem
deleteNomenclatorItem(id) → DeleteResponse
bulkDeleteNomenclatorItems(ids) → BulkDeleteResponse
bulkSetActiveNomenclatorItems(ids, active) → BulkEnableResponse
```

## Rutas
- `/nomenclators/` → `NomenclatorList`
