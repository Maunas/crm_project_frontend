# Convenciones generales del frontend

## Stack tecnológico
- **React 19** + **TypeScript 5** (strict: `true`, `noUnusedLocals/Parameters: true`, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`)
- **Vite** como build tool (SPA, sin SSR)
- **MUI 9.1.0** (Material UI) con `colorSchemes` (light/dark)
- **React Router 7** con `createBrowserRouter`
- **React Hook Form** para manejo de formularios
- **react-toastify** para notificaciones
- **dayjs** para fechas (locale `es`)
- **@base-ui/react** para NumberField
- **react-colorful** para ColorPicker
- **reactflow** para el editor de flujo de leads

## Archivos de entrada
- `src/app/main.tsx` → `ThemeProvider` + `CssBaseline` + `<App />`
- `src/app/App.tsx` → `UserProvider` + `RouterProvider` + `ToastContainer`
- `src/app/mainLayout.tsx` → Layout protegido (redirige a `/login` si no hay sesión, a `/onboarding` si no hay orgs)
- `src/routes.tsx` → Configuración central de rutas con `createBrowserRouter`

## Path aliases (vite.config.ts / tsconfig.app.json)
```ts
src/*      → ./src/*
features/* → ./src/features/*/
shared/*   → ./src/components/*
assets/*   → ./src/assets/*
```

## Arquitectura

### Capa de estado global
- **UserContext** (`src/stores/UserContext.tsx`): maneja autenticación (login/signup/logout/refresh), lista de organizaciones, organización activa (`selected_org` en localStorage). Expone `user`, `activeOrg`, `orgHeaderList`, `login`, `signup`, `logout`, `updateUser`, `refreshUser`.
- **LeadNavigationContext** (`src/features/lead/stores/LeadNavigationContext.tsx`): estado de paginación/selección del listado de leads.

### Capa de API
- **axiosCRM** (`src/lib/axios.ts`): instancia de Axios con interceptors que:
  - Agregan `Authorization: Bearer <token>` automáticamente
  - Agregan `X-Organization-Id` desde `localStorage.selected_org`
  - Refrescan el token automáticamente en 401 (con cola de requests en espera)
  - No reintentan en `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`
- **tokenStore** (`src/lib/tokenStore.ts`): maneja access/refresh tokens en localStorage con soporte de "recordar sesión"

### Convención de servicios
Cada feature tiene un archivo `*Service.ts` o `*Services.ts` que exporta funciones que llaman a `axiosCRM`. Ej: `leadService.ts`, `campaignServices.ts`, `nomenclatorService.ts`.

### Convención de tipos
Los tipos compartidos están en `src/types/`. Cada archivo corresponde a un dominio:
- `shared.ts` → `Paginable<T>`, `Metadata`, `OrderParams`, `SearchParams`, `ListParams`, `ErrorBody`, `ColorShades`
- `campaigns.ts` → `Campaign`, `Workspace`, `Organization`
- `leads.ts` → `Lead`, `LeadPost`
- `leadFields.ts` → `LeadField`, `LeadFieldDetailed`, `LeadFieldValue`, `FieldValidationRule`, `ExcelFormulaTemplate`
- `users.ts` → `UserData`, `UserLogin`, `UserSignup`
- Otros: `nomenclators.ts`, `automation.ts`, `leadFlow.ts`, `orgProperties.ts`, `routing.ts`, `teams.ts`, `systemAudit.ts`

### Convención de nomenclatura de archivos
- Componentes: `PascalCase.tsx`
- Servicios: `camelCaseService.ts` o `camelCaseServices.ts`
- Hooks: `useCamelCase.ts`
- Utilidades: `camelCase.ts`
- Tipos: `camelCase.ts`

## Patrones comunes

### Formularios con React Hook Form
Usar los wrappers controlados de `src/components/ui/forms/` en lugar de `register` manual:
- `ControlledTextInput` para inputs de texto
- `ControlledAutocomplete` para selects/autocompletes (soporta múltiple, `returnField`, `onChangeBefore`)
- `ControlledSlider` / `ControlledNumber` para números
- `ControlledCheckbox` / `ControlledSwitch` para booleanos
- `ControlledRadio` para radios
- `ControlledGroupedCheckbox` para grupos de checkboxes
- `ControlledColorPicker` para colores (colores del theme + selector HEX)
- `FileInput` para upload de archivos con drag & drop y preview
- `SearchInput` para búsqueda con selector de campo

Para errores de API, usar `setFormErrors` de `src/utils/forms.ts` que mapea `details` del backend a los campos del formulario.

### Manejo de modales
Usar `useModal()` hook + `GenericModal` componente:
```tsx
const { modalProps } = useModal()
// ...
<GenericModal idModal="mi-modal" {...modalProps}>
  <ModalContentWrapper title="Título" icon={<Icon />} actions={acciones}>
    {contenido}
  </ModalContentWrapper>
</GenericModal>
```

### Manejo de sidebars (detalles en panel lateral)
Usar `useSidebar` hook + `ContainerWithSidebar` + `GenericSidebar`:
```tsx
const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar()
// ...
<ContainerWithSidebar isSidebarOpen={!!sidebarMode} closeSidebar={closeSidebar}
  sidebarComponent={<GenericSidebar><SidebarContentWrapper title="..." ...>
    {contenido}
  </SidebarContentWrapper></GenericSidebar>}>
  <Button onClick={() => handleSidebar("detail", entity)}>Abrir detalle</Button>
</ContainerWithSidebar>
```

### Confirmaciones con timeout
Usar `GenericConfirmDialog` o `DisableConfirmDialog` para acciones destructivas:
```tsx
<DisableConfirmDialog entity={item} clearEntity={() => setItem(null)}
  idModal="del-conf" entityTypeName="la campaña"
  onConfirm={() => handleDelete(item!)} />
```

### Toasts
Usar helpers de `src/utils/feedback.ts`:
```tsx
showToast("Operación exitosa", "success")
showCommonErrorToast(error, "Error al guardar")
```

### Paginación + búsqueda + orden
Usar `useListPagination`, `useOrderSearchList`, y los componentes `PaginationComponent`, `SearchInput`, `OrderMenu`, `OrderSearchMenu`:
```tsx
const { fetchPage, pageSize, goToPageOne, pageComponentProps } = useListPagination(list)
const { fetchParams, handleOrderChange, handleSearchChange } = useOrderSearchList()
// fetch({ page: fetchPage, page_size: pageSize, ...fetchParams })
// ...
<OrderSearchMenu handleSearchChange={handleSearchChange} handleOrderChange={handleOrderChange} />
<PaginationComponent {...pageComponentProps} />
```

### Listas responsivas con acciones
Usar `ResponsiveListItem` para listas con hover actions (escritorio) que se convierten en menú contextual (táctil):
```tsx
<ResponsiveListItem actions={[
  { template: "DETAILS", onClick: () => handleDetail(item) },
  { template: "MODIFY", onClick: () => handleEdit(item) },
  (item.active ? { template: "DISABLE", ... } : { template: "ENABLE", ... })
]}>
  <ListItemText primary={item.name} />
</ResponsiveListItem>
```

### Drag & drop para reordenar
Usar `useDragAndDrop` hook que devuelve `dragEvents` y `dragStyles` para arrastrar elementos en una lista.

### Selección múltiple con checkboxes
Usar `useSelectCheckbox` hook para manejar selección de elementos con `checkedItemsArray`, `addItem`, `removeItem`, `removeAllItems`.

### Organización activa (multi-tenancy)
El header `X-Organization-Id` se toma de `localStorage.selected_org`. El `UserContext` sincroniza este valor con `setActiveOrg()`. Al cambiar de org, todos los GET/POST usan la nueva org. La org `id: 1` ("Panel Global") es especial — muestra el `GlobalDashboardPage` y navegación reducida.

## Convenciones de estilo

### MUI Theme
- Bordes redondeados: `.5em` (shape.borderRadius)
- Shadows: solo en elevation positiva; elevation 0 usa un shadow sutil
- Papers: padding `1.5rem 2rem`, con borde sutil y overlay gradiente en dark mode
- Botones: text-transform `none`, borderRadius 8px, sin box-shadow en contained

### Colores
- Usar `theme.palette` en vez de colores hardcodeados
- Para colores dinámicos del backend, usar `getColorShades(colorName | hex, theme)` que devuelve `{ LIGHTER, LIGHT, MAIN, DARK, DARKER }`
- Los componentes `CustomChip`, `ChipSelect`, `CustomAvatar`, `GenericPaperColoredSection` aceptan `color` como prop y derivan los shades automáticamente

### Texto en español
- Todo texto visible al usuario (labels, botones, toasts, mensajes de validación) va en español
- Código (nombres de variables, funciones, tipos) en inglés

## Dont's
- No instalar dependencias nuevas sin preguntar
- No usar `any` — arreglar el tipo subyacente
- No loguear access_token/refresh_token
- No usar patrones de Next.js (esto es una SPA Vite)
- No tocar `pnpm-lock.yaml` manualmente
