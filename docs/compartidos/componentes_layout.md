# Componentes de layout (`src/components/layout/`)

## Sidebar principal (`sidebar/`)

### `LayoutSidebar` (default export) — `sidebar/Sidebar.tsx`
Sidebar principal colapsable. Usa `Drawer` de MUI con variant `permanent`. Incluye `Header`, `Navbar` y el `<main>` donde se renderiza `children`.
```tsx
import LayoutSidebar from 'shared/layout/sidebar/Sidebar'
<LayoutSidebar>
  <Outlet /> {/* react-router */}
</LayoutSidebar>
```
- Estado de apertura local (`useState(false)`)
- Transiciones animadas de apertura/cierre
- Drawer width: `15rem`
- Usado en `app/mainLayout.tsx`

### `Header` — `sidebar/Header.tsx`
AppBar superior con menú hamburguesa, barra de búsqueda global (`HeaderSearchBar`) y menú de usuario (`UserInfo`/`HeaderMenu`).
- Props: `handleDrawerOpen`, `open`
- Estilo sticky, elevation 4, sin borde (`data-noborder`)

### `Navbar` (memo) — `sidebar/Navbar.tsx`
Lista de navegación del sidebar. Muestra distintas opciones según la org activa:
- **Org normal** (`activeOrg.id !== 1`): Dashboard, Leads, Campañas, Equipos, Organizaciones, Nomencladores, Propiedades de Org, Automatizaciones, Auditoría
- **Panel Global** (`activeOrg.id === 1`): Dashboard, Organizaciones, Usuarios, Auditoría
- Resalta la opción activa según `location.pathname`
- Tooltips cuando el sidebar está colapsado (via `ChipTooltip`)

### `HeaderMenu` — `sidebar/HeaderMenu.tsx`
Menú de usuario en la AppBar. Muestra avatar con iniciales, nombre y organization switcher.

### `ThemeSlider` — `sidebar/ThemeSlider.tsx`
Toggle para cambiar entre modo claro/oscuro (light/dark).

---

## Contenedores y modales (`container/`)

### `GenericPaper` (default export) — `container/GenericPaper.tsx`
`Paper` de MUI estilizado centralizadamente:
- Padding: `1.5rem 2rem`
- Elevation 0: shadow sutil + overlay en dark mode
- Elevation -1: sin shadow
- Acepta `data-noborder` para omitir el borde

### `GenericContainer` — `container/GenericContainer.tsx`
Wrapper que combina `Container` de MUI + `GenericPaper`:
```tsx
<GenericContainer containerSize="md" paperProps={{ sx: { mt: 2 } }}>
  {children}
</GenericContainer>
```
- Props: `children`, `paperProps`, `noPaper` (bool), `containerSize` (default `"lg"`)
- Si `noPaper=true`, renderiza solo el Container sin Paper

### `ContainerWithSidebar` (default export) — `container/GenericContainer.tsx`
Layout de contenido con sidebar lateral:
```tsx
<ContainerWithSidebar
  isSidebarOpen={!!sidebarMode}
  closeSidebar={closeSidebar}
  sidebarComponent={<SidebarContentWrapper title="..." icon={...}>
    {contenido}
  </SidebarContentWrapper>}
>
  {contenido principal}
</ContainerWithSidebar>
```
- El sidebar es un `Drawer` que se posiciona a la derecha (o abajo en mobile)
- Props: `isSidebarOpen`, `closeSidebar`, `sidebarComponent`, `sidebarWidth`, `sidebarProps`, `containerProps`, `noPaper`

### `GenericModal` (default export) — `container/GenericModal.tsx`
Modal reutilizable diseñado para usarse con `useModal()`:
```tsx
const { modalProps } = useModal()
<GenericModal idModal="mi-modal" {...modalProps} maxWidth="sm" fullWidth>
  {children}
</GenericModal>
```
- Props: `idModal`, `openModalId`, `handleOpen`, `handleClose`, `open` (bool, ignora idModal si true), `showButton`, `buttonText`, `btnProps`
- Paper interno usa `GenericPaper`
- backdrop con `stopPropagation`

### `ModalContentWrapper` — `container/GenericModal.tsx`
Wrapper para el contenido de un modal con header decorativo y footer de acciones:
```tsx
<ModalContentWrapper title="Editar" subtitle="Campaña" icon={<EditIcon />}
  iconColor="primary" onClose={handleClose}
  actions={<CommonButton>Guardar</CommonButton>}>
  {formulario}
</ModalContentWrapper>
```
- Header con avatar colorido + gradiente (via `GenericPaperColoredSection`)
- Footer sticky con borde superior si hay `actions`

### `ModalContentActionsWrapper` — `container/GenericModal.tsx`
Footer de acciones con flexbox, fondo semitransparente.

### `GenericSidebar` — `container/GenericSidebar.tsx`
Drawer lateral para paneles de detalle/edición:
```tsx
<GenericSidebar isSidebarOpen={open} closeSidebar={onClose} sidebarWidth="35rem">
  <SidebarContentWrapper title="..." subtitle="..." icon={...} actions={...}>
    {children}
  </SidebarContentWrapper>
</GenericSidebar>
```
- Anchor: `right` en desktop, `bottom` en mobile (< md)
- Botón de cerrar flotante

### `SidebarContentWrapper` — `container/GenericSidebar.tsx`
Header + contenido + footer opcional para un sidebar:
```tsx
<SidebarContentWrapper title="Nombre" subtitle="Detalle" icon={<PersonIcon />}
  iconColor="primary" actions={<CommonButton>Editar</CommonButton>}>
  {contenido}
</SidebarContentWrapper>
```
- Header con `GenericSidebarHeader` (gradiente + avatar)
- Contenido scrolleable
- Footer sticky si hay `actions`

### `SidebarContentActionsWrapper` — `container/GenericSidebar.tsx`
Contenedor para cuando hay acciones en el sidebar: contenido arriba, footer abajo.

---

## Headers decorativos (`container/ColoredHeaders.tsx`)

### `GenericSidebarHeader` (styled)
Header con gradiente de color (light/dark según theme). Usa `getColorShades`.

### `GenericSidebarContent` (styled)
Contenedor scrolleable con padding y footer sticky.

### `ColoredAccordionSummary` (styled)
`AccordionSummary` con gradiente de color. Props: `color`, `isFirst`, `isLast` (controlan bordes redondeados).

### `GenericPaperColoredSection` (styled)
Sección dentro de un Paper con fondo gradiente de color. Props adicionales: `pLeft`, `pRight`, `pTop`, `pBottom` para controlar márgenes negativos.
```tsx
<GenericPaperColoredSection color="primary" isFirst isLast>
  {children}
</GenericPaperColoredSection>
```
