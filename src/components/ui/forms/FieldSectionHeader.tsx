import type { ReactNode } from 'react'
import { Box, Divider, ListSubheader, Typography } from '@mui/material'

interface FieldSectionHeaderProps {
    name: string
    /** El primer grupo no lleva línea divisora arriba (no hay nada de qué separarlo). */
    first?: boolean
}

/**
 * Encabezado de sección para selectores que agrupan campos (nativos + custom) por sección --
 * línea divisora suave + título en letra pequeña.
 */
export const FieldSectionHeader = ({ name, first = false }: FieldSectionHeaderProps) => (
    <Box sx={{ px: 1.5, pt: first ? 0.5 : 1.25, pb: 0.5 }}>
        {!first && <Divider sx={{ mb: 0.75, opacity: 0.5 }} />}
        <Typography
            variant="caption"
            sx={{
                display: 'block',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontSize: '0.7rem',
            }}>
            {name}
        </Typography>
    </Box>
)

/** Forma mínima de los params que pasa MUI a `renderGroup` de un Autocomplete. */
interface RenderGroupParams {
    key: string | number
    group: string
    children?: ReactNode
}

/**
 * Para pasar como `renderGroup` a un `ControlledAutocomplete`/`Autocomplete` con `groupBy` seteado
 * (ver `getFieldSelectorGroupName` en `leadFieldUtils.ts`). Reemplaza el `ListSubheader` en negrita
 * por defecto de MUI por `FieldSectionHeader`, manteniendo la misma estructura (`<li><header/><ul>`).
 */
export const renderFieldSectionGroup = (params: RenderGroupParams) => (
    <li key={params.key}>
        <FieldSectionHeader name={params.group} first={Number(params.key) === 0} />
        <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
    </li>
)

/**
 * Para armar los children de un `<Select>` agrupado por sección: intercala un header (no
 * seleccionable) antes de los `MenuItem` de cada grupo. `groups` viene de `groupFieldsForSelector`
 * (`leadFieldUtils.ts`); `renderItem` arma el `MenuItem` de cada campo.
 */
export const renderGroupedMenuItems = <T,>(
    groups: { name: string, fields: T[] }[],
    renderItem: (field: T) => ReactNode
): ReactNode[] =>
    groups.flatMap((group, groupIdx) => [
        <ListSubheader key={`__section_${groupIdx}_${group.name}`} disableSticky sx={{ p: 0, bgcolor: 'transparent', lineHeight: 'normal' }}>
            <FieldSectionHeader name={group.name} first={groupIdx === 0} />
        </ListSubheader>,
        ...group.fields.map(renderItem),
    ])
