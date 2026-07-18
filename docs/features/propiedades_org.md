# Propiedades de organización (`src/features/orgProperties/`)

## Estructura
```
orgProperties/
  orgPropertiesList.tsx     → OrgProperties (página principal)
  fieldSections/            → Secciones de campos de lead
  tags/                     → Tags
  contactState/             → Estados de contacto
```

## Componentes

### `OrgProperties` — `orgPropertiesList.tsx`
Página principal de propiedades de organización. Ruta: `/org-properties/`.
- Agrupa tres sub-módulos: secciones de campos, tags y estados de contacto
- Pestañas o secciones para navegar entre ellos

### `fieldSections/`
Gestión de secciones de campos de lead (agrupación visual de campos en el formulario):
- CRUD de secciones
- Orden de visualización

### `tags/`
Gestión de tags/etiquetas:
- CRUD de tags
- Asignación a leads

### `contactState/`
Gestión de estados de contacto:
- CRUD de estados de contacto
- Estado inicial (único)

## Servicios
Los servicios de estos sub-módulos se consumen desde `leadFieldServices` (para sections) y servicios específicos dentro de cada carpeta.

## Rutas
- `/org-properties/` → `OrgProperties`
