# Auditoría del sistema (`src/features/audit/`)

## Estructura
```
audit/
  SystemAuditLogs.tsx     → SystemAuditList (página)
  SystemAuditServices.ts  → servicios API
```

## Componentes

### `SystemAuditList` — `SystemAuditLogs.tsx`
Página de registro de auditoría. Ruta: `/audit-logs/`.
- Tabla de eventos de auditoría con:
  - Fecha/hora, usuario, acción, entidad, detalle
- Filtros por:
  - Rango de fechas (start_date, end_date)
  - Tipo de acción
  - Entidad
  - Usuario
- Paginación y orden

## Servicios (`SystemAuditServices.ts`)
```tsx
getAuditLogs(params?: SystemAuditParams) → Paginable<SystemAuditLog>
```

## Rutas
- `/audit-logs/` → `SystemAuditList`
