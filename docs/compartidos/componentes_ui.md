# Componentes UI (`src/components/ui/`)

---

## Botones (`buttons/`)

### `ACTION_ICONS` (default export) — `buttons/ActionIcons.tsx`
Mapa de `ActionType` a iconos de MUI. Tipos disponibles:
`NONE`, `MODIFY`, `CLOSE`, `CREATE`, `DISABLE`, `ENABLE`, `DETAILS`, `SAVE`, `FILTER`, `OPTIONS`, `SETTINGS`, `RETURN`, `LOGIN`, `SIGNUP`, `LIST`, `CHECK`, `LOADING`, `MINUS`, `REORDER`, `OPEN_LIST`, `CLOSE_LIST`, `DRAG`, `RENAME`, `DUPLICATE`, `AUTOMATE`, `DOWNLOAD`, `IMPORT`, `PARAMETERS`

### `CommonButton` (default export) + `CommonAvatar` — `buttons/CommonButton.tsx`
Botón con ícono automático según `actionType`:
```tsx
<CommonButton actionType="CREATE" onClick={handleCreate}>Nuevo</CommonButton>
<CommonButton actionType="SAVE" loading={loading}>Guardar</CommonButton>
<CommonButton actionType="RETURN" variant="outlined" color="secondary">Volver</CommonButton>
```
- Props: todas las de `Button` + `actionType`, `loading`, `onlyTooltip` (solo icono con tooltip)
- En dark mode, outlined usa colores más claros para legibilidad
- Cuando `loading=true`, muestra spinner y texto "Cargando"

### `CommonIconButton` + `CommonIcon` — `buttons/CommonIconButton.tsx`
IconButton con tooltip incorporado:
```tsx
<CommonIconButton actionType="MODIFY" title="Editar" onClick={handleEdit} />
<CommonIconButton actionType="DISABLE" color="error" size="small" title="Eliminar" />
```
- Props: `actionType`, `title` (tooltip), `size`, `tooltipSize`, `color`, `loading`, `noTooltip`, `border`
- `CommonIcon` es la versión solo ícono (sin botón)

### `HandleActiveButton` (default export) — `buttons/HandleActiveButton.tsx`
Botón que alterna entre "Habilitar" y "Deshabilitar" según el estado activo:
```tsx
<HandleActiveButton active={item.active} handleActive={() => toggleActive(item)} />
```
- Props: `active`, `handleActive`, `disableColor` (default `"error"`), `enableColor` (default `"success"`), `disableText`, `enableText`

---

## Formularios (`forms/`)

### `ControlledTextInput` — `forms/CustomInputs.tsx`
Input de texto controlado por React Hook Form:
```tsx
<ControlledTextInput control={control} name="nombre" label="Nombre" required errorMessage={errors.nombre?.message} />
```
- Props: `control`, `name`, `label`, `required`, `errorMessage`, `size`, `startAdornment`, más todas las de `TextField`

### `RegisteredTextInput` — `forms/CustomInputs.tsx`
Versión con `register` en vez de `control`:
```tsx
<RegisteredTextInput register={register} name="email" label="Email" required errorMessage={errors.email?.message} />
```

### `RegisteredDateInput` — `forms/CustomInputs.tsx`
Input de fecha con soporte de formatos:
```tsx
<RegisteredDateInput register={register} name="fecha" dateType="DATE_TIME" label="Fecha" />
```
- `dateType`: `"DATE"`, `"DATE_TIME"`, `"TIME"`
- Filtro de calendario invertido en dark mode

### `PasswordField` — `forms/CustomInputs.tsx`
Campo de contraseña con toggle de visibilidad:
```tsx
<PasswordField register={register} name="password" label="Contraseña" required errorMessage={errors.password?.message} />
```

### `ControlledSlider` — `forms/CustomInputs.tsx`
Slider o Rating controlado con spinner numérico:
```tsx
<ControlledSlider control={control} name="puntaje" label="Puntaje" min={0} max={10} step={1} />
<ControlledSlider control={control} name="estrellas" type="rating" max={5} step={0.5} label="Rating" />
```

### `ControlledNumber` — `forms/CustomInputs.tsx`
Campo numérico controlado:
```tsx
<ControlledNumber control={control} name="edad" label="Edad" min={0} max={150} type="spinner" />
<ControlledNumber control={control} name="monto" label="Monto" startAdornment={<span>$</span>} />
```
- `type`: `"field"` (NumberField completo) o `"spinner"` (solo spinner)

### `ControlledCheckbox` / `ControlledSwitch` — `forms/CustomInputs.tsx`
Checkbox o Switch controlado con tooltip opcional:
```tsx
<ControlledCheckbox control={control} name="activo" label="Activo" tooltip="Indica si está habilitado" />
<ControlledSwitch control={control} name="notificar" label="Notificar" />
```

### `SingleFileField` — `forms/CustomInputs.tsx`
Campo de archivo simple (nativo):
```tsx
<SingleFileField register={register} name="archivo" label="Archivo" />
```

### `ControlledAutocomplete` + `AutocompleteLoader` — `forms/CustomMultipleInputs.tsx`
Autocomplete controlado con soporte de selección simple/múltiple y retorno de campo específico:
```tsx
const options = [{ id: 1, name: "Opción 1" }, { id: 2, name: "Opción 2" }]
<ControlledAutocomplete control={control} name="seleccion" label="Elegir"
  options={options} getOptionLabel={(o) => o.name} getOptionKey={(o) => String(o.id)}
  returnField="id" multiple />
```
- Props clave: `options`, `getOptionLabel`, `getOptionKey`, `returnField` (null para devolver el objeto completo), `multiple`, `disableClearable`, `onChangeBefore`, `renderOption`, `renderValue`
- Muestra `AutocompleteLoader` (loading spinner) si no hay options y no está disabled

### `ControlledRadio` — `forms/CustomMultipleInputs.tsx`
Grupo de radios controlado:
```tsx
<ControlledRadio control={control} name="tipo" label="Tipo"
  options={[{ code: "A", label: "Tipo A" }]}
  returnField="code" keyField="code" getRadioLabel={(o) => o.label} />
```

### `ControlledGroupedCheckbox` — `forms/CustomMultipleInputs.tsx`
Grupo de checkboxes que devuelve un arreglo de valores seleccionados:
```tsx
<ControlledGroupedCheckbox control={control} name="roles" label="Roles"
  options={roles} returnField="id" keyField="id" getCheckboxLabel={(r) => r.name} />
```

### `ControlledColorPicker` + `ColorPickerButton` + `ColorPickerMenu` — `forms/ColorPicker.tsx`
Selector de color con botones predefinidos del theme + selector HEX libre:
```tsx
<ControlledColorPicker control={control} name="color" />
```
- Muestra botones circulares para cada `colorTypesArray` del theme
- Botón adicional que abre `HexColorPicker` (react-colorful) con input HEX
- Props: `size`, `row`, `onBeforeChange`

### `ChipSelect` (default export) — `forms/ChipSelect.tsx`
Select estilizado como chip. Para selectores pequeños inline:
```tsx
<ChipSelect value={value} onChange={handleChange} size="small" chipColor="primary">
  <MenuItem value="op1">Opción 1</MenuItem>
</ChipSelect>
```

### `NumberField` (default export) + `NumberSpinner` — `forms/NumberField.tsx`
Campo numérico MUI-based con botones +/- y scrub area:
```tsx
<NumberField label="Cantidad" min={0} max={100} />
<NumberSpinner label="Edad" min={0} max={150} />
```
- Implementado con `@base-ui/react/number-field`
- Soporta `startAdornment`, `endAdornment`

### `SearchInput` — `forms/SearchInput.tsx`
Input de búsqueda con selector de campo y debounce:
```tsx
<SearchInput onSearch={(q, field) => fetch({ search: q, search_fields: field })}
  options={[{ name: "name", label: "Nombre" }]} size="small" />
```
- Usa `useDebounce` (1 segundo por defecto)
- Soporta opciones con subopciones (`searchOptions` para autocomplete)
- Incluye selector de campo estilizado como `ChipSelect`

### `FileInput` (default export) — `forms/FileInput.tsx`
Input de archivo drag & drop con preview:
```tsx
<FileInput control={control} name="archivo" label="Subir archivo"
  accept=".pdf,.jpg" multiple showPreview />
```
- Drag & drop + click para seleccionar
- Preview de imágenes vía `FileReader`
- Validación de tipo de archivo contra `accept`
- Muestra cards con nombre, tamaño y tipo
- Soporta reemplazo de archivo existente

### `FormErrorMessage` — `forms/FormFeedback.tsx`
`FormHelperText` estilizado para mensajes de error:
```tsx
<FormErrorMessage>Campo requerido</FormErrorMessage>
```

---

## Detalles y chips (`details/`)

### `CustomChip` (default export, memo) — `details/CustomChip.tsx`
Chip estilizado con soporte de colores del theme y tamaño:
```tsx
<CustomChip label="Activo" chipColor="success" size="small" />
<CustomChip label="Ver" component={Link} to="/ruta" clickable />
```
- Colores derivados de `getColorShades` (soporta hex o color types)
- Backdrop blur y bordes redondeados (`.75rem`)
- Casteado a `OverridableComponent` para usar `component` y `to`

### `ChipTooltip` (memo) — `details/ChipTooltip.tsx`
Tooltip renderizado como chip (usa `CustomChip` como slot):
```tsx
<ChipTooltip title="Información adicional" color="info">
  <IconButton><InfoIcon /></IconButton>
</ChipTooltip>
```
- Props: `show`, `boxed`, `title`, `color`, `placement`, `size`
- Si `show=false`, renderiza solo children sin tooltip
- Si `boxed=true`, envuelve children en un Box inline-flex (útil para iconos)

### `CustomAvatar` (styled) — `details/CustomAvatar.tsx`
Avatar con color del theme, redondeado:
```tsx
<CustomAvatar color="primary"><EditIcon /></CustomAvatar>
```
- Tamaños: `small` (36px) / `medium` (50px)
- Color dinámico según el shade del theme (light/dark mode)

### `UserAvatar` — `details/UserAvatar.tsx`
Avatar de usuario con iniciales y color generado determinísticamente del nombre:
```tsx
<UserAvatar name="Juan Pérez" size={40} tooltip />
```
- Usa función hash para asignar siempre el mismo color al mismo nombre (HLS)
- Iniciales: primera letra del primer nombre + primera letra del apellido

### `DetailsMetadata` (default export) + `MetadataShort` — `details/DetailsMetadata.tsx`
Muestra fechas de creación/última modificación + usuario:
```tsx
<DetailsMetadata entity={campaign} />
<MetadataShort metadata={lead} onlyUser />
```

### `TitleAndActive` (default export) — `details/TitleAndActive.tsx`
Título con avatar que indica estado activo/inactivo:
```tsx
<TitleAndActive active={item.active}>
  <Typography variant="h2">{item.name}</Typography>
</TitleAndActive>
```

### `EnabledIcon` (memo) — `lists/Icons.tsx`
Icono que indica habilitado/deshabilitado (check/close):
```tsx
<EnabledIcon active={item.active} />
<EnabledIcon active={item.active} isAvatar />
```

### `CodeBox` (styled) — `details/CodeBox.tsx`
Caja oscura con fuente monospace para mostrar código:
```tsx
<CodeBox>{código}</CodeBox>
```

### `NewTabLink` (default export) — `details/NewTabLink.tsx`
Link que se abre en nueva pestaña, con validación de URL:
```tsx
<NewTabLink url="https://example.com" title="Ver sitio" />
```

### `CustomProgressBar` (default export, memo) — `details/CustomProgressBar.tsx`
Barra de progreso estilizada:
```tsx
<CustomProgressBar variant="determinate" value={75} color="success" />
```

---

## Feedback y diálogos (`feedback/`)

### `GenericConfirmDialog` (memo) — `feedback/ConfirmationDialog.tsx`
Diálogo de confirmación con timeout configurable de seguridad:
```tsx
<GenericConfirmDialog idModal="conf" handleClose={onClose}
  onConfirm={handleDelete} confirmTimeoutSec={3}>
  <Typography>¿Confirmar eliminación?</Typography>
</GenericConfirmDialog>
```
- Muestra botón "Confirmar" que inicia un conteo regresivo
- Durante el conteo, se muestra botón "Cancelar (N s.)" con barra de progreso
- Props: `onConfirm`, `confirmTimeoutSec`, `noTimeout`, `confirmText`, `closeText`

### `DisableConfirmDialog` — `feedback/ConfirmationDialog.tsx`
Confirmación específica para habilitar/deshabilitar entidades:
```tsx
<DisableConfirmDialog entity={item} clearEntity={() => setItem(null)}
  idModal="del-conf" entityTypeName="la campaña"
  onConfirm={() => handleToggle(item)} />
```
- Adapta el texto según `onlyDelete` y el estado `active` de la entidad

### `DisableBulkConfirmDialog` — `feedback/ConfirmationDialog.tsx`
Confirmación para habilitar/deshabilitar múltiples entidades:
```tsx
<DisableBulkConfirmDialog open={open} onClose={onClose}
  isDisabling={true} entityTypeName="las campañas seleccionadas"
  onConfirm={handleBulkAction} />
```

### `LoadingScreenWrapper` (default export) — `feedback/LoadingScreen.tsx`
Wrapper que muestra un spinner si `loading=true`:
```tsx
<LoadingScreenWrapper loading={isFetching}>
  <div>contenido</div>
</LoadingScreenWrapper>
```

### `Toast` (default export) — `feedback/Toast.tsx`
Componente de toast personalizado para react-toastify. Usa `CustomAlert` internamente.

### `CustomAlert` (styled) — `feedback/CustomAlert.tsx`
Alert estilizado con backdrop blur y colores adaptados al theme:
```tsx
<CustomAlert severity="success">Operación exitosa</CustomAlert>
```

---

## Listas y tablas (`lists/`)

### `CustomListItem` (styled) — `lists/CustomListItem.tsx`
ListItem con selección visual y acciones visibles solo en hover:
```tsx
<CustomListItem isSelected={selectedId === item.id}>
  <ListItemText primary={item.name} />
</CustomListItem>
```
- Props: `isSelected`, `alwaysShowSecondary`, `color`
- Si `isSelected`, renderiza como Paper con elevation y borde de color

### `ResponsiveListItem` + `buildActions` + `ListItemAction` — `lists/CustomListItem.tsx`
ListItem responsivo: hover actions en desktop, menú contextual en táctil:
```tsx
<ResponsiveListItem actions={[
  { template: "DETAILS", onClick: () => handleDetail(item) },
  { template: "MODIFY", onClick: () => handleEdit(item) },
  !item.active && { template: "ENABLE", onClick: () => handleEnable(item) }
].filter(Boolean)}>
  <ListItemText primary={item.name} />
</ResponsiveListItem>
```
- `buildActions()` filtra valores falsy y completa templates (`DETAILS`, `MODIFY`, `ENABLE`, `DISABLE`, `DELETE`)
- En táctil (pointer: coarse) con más de 1 acción, muestra `MoreVertIcon` que abre `Menu`

### `CustomListItemAvatar` (styled) — `lists/CustomListItem.tsx`
ListItemAvatar con color del theme.

### `SelectableTableRow` (memo, styled) — `lists/CustomTableRow.tsx`
TableRow con hover pointer y acciones ocultas que aparecen en hover:
```tsx
<TableBody>
  <SelectableTableRow hover onClick={handleClick}>
    <td>contenido</td>
    <td className="table-actions"><IconButton>...</IconButton></td>
  </SelectableTableRow>
</TableBody>
```

### `CustomTimelineItem` — `lists/CustomTimelineItem.tsx`
Item de timeline con punto de color seleccionable:
```tsx
<CustomTimelineItem selected={isActive} last={isLast}>
  <Typography>{contenido}</Typography>
</CustomTimelineItem>
```

### `OrderMenu` — `lists/OrderMenu.tsx`
Menú emergente para ordenar listas:
```tsx
<OrderMenu onOrderChange={(field, asc, active) => fetch({ order_by: field, ascending: asc, only_active: active })}
  options={[{ name: "name", label: "Nombre" }]} />
```
- Incluye opciones de orden ascendente/descendente + filtro "Solo activos"

### `OrderSearchMenu` — `lists/OrderMenu.tsx`
Combinación de `SearchInput` + `OrderMenu` en un mismo row:
```tsx
<OrderSearchMenu handleSearchChange={handleSearchChange}
  searchOptions={searchOptions}
  handleOrderChange={handleOrderChange}
  orderOptions={orderOptions} size="small" />
```

### `PaginationComponent` (memo, default export) — `lists/PaginationComponent.tsx`
Componente de paginación MUI:
```tsx
<PaginationComponent totalPages={totalPages} page={page} handlePage={handlePage} />
```

### `NoItemsMessage` — `lists/NoItemsMessage.tsx`
Mensaje cuando no hay elementos:
```tsx
<NoItemsMessage search={query} emptyFetchMessage={<span>No hay campañas creadas</span>}>
  <CommonButton onClick={handleCreate}>Crear primera</CommonButton>
</NoItemsMessage>
```

---

## Modales (`modals/`)

### `FormulaHelperPanel` — `modals/FormulaHelperModal.tsx`
Panel colapsable de ayuda para fórmulas de Excel (campos CALCULATED):
```tsx
<FormulaHelperPanel open={showHelper} formulas={formulas}
  onInsert={(name) => insertFormula(name)} />
```
- Búsqueda por nombre (inglés/español) y descripción
- Agrupado por categoría en Accordions
- Muestra sintaxis, ejemplo y nota de cada fórmula
- Botón "Insertar" para cada fórmula
