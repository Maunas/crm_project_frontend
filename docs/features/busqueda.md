# Búsqueda global (`src/features/search/`)

## Estructura
```
search/
  GeneralSearchBar.tsx     → HeaderSearchBar (barra en el header)
  SearchResults.tsx        → SearchResultsList (página de resultados)
  searchServices.ts        → servicios API
```

## Componentes

### `HeaderSearchBar` — `GeneralSearchBar.tsx`
Barra de búsqueda global ubicada en el `Header` de la aplicación.
- Input de texto con lupa
- Al hacer enter o click en buscar, navega a `/search?q=...`

### `SearchResultsList` — `SearchResults.tsx`
Página de resultados de búsqueda. Ruta: `/search`.
- Recibe el query de la URL (`searchParams.get("q")`)
- Muestra resultados agrupados por tipo:
  - Leads
  - Campañas
  - Workspaces
  - Nomencladores
  - Items de nomenclador
- Cada resultado es clickeable para navegar al detalle

## Servicios (`searchServices.ts`)
```tsx
globalSearch(query: string) → SearchResults
```

## Rutas
- `/search` → `SearchResultsList`
