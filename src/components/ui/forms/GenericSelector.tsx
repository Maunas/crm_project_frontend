import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import TextField from '@mui/material/TextField'
import { FormErrorMessage } from './FormFeedback'
import { AutocompleteLoader } from './CustomMultipleInputs'
import { renderFieldSectionGroup, renderGroupedMenuItems } from './FieldSectionHeader'

interface RenderGroupParams {
    key: string | number
    group: string
    children?: ReactNode
}

export interface SelectorProps<T> {
    options: T[]
    value: T | null
    onChange: (value: T | null) => void
    getOptionLabel: (option: T) => string
    getOptionKey: (option: T) => string | number
    /** true (default) = Autocomplete con buscador (escribís y filtra); false = <Select> simple. */
    searchable?: boolean
    /** Agrupa las opciones por sección -- requiere que "options" ya venga agrupable (ver `groupOptions`, se reordena internamente para que no se repitan encabezados). */
    groupBy?: (option: T) => string
    /** Custom del encabezado de grupo en modo searchable. Por defecto usa el mismo criterio visual de toda la app (línea divisora suave + título chico, ver FieldSectionHeader.tsx). */
    renderGroup?: (params: RenderGroupParams) => ReactNode
    /** Contenido de cada opción -- mismo render en modo Select y en modo Autocomplete. Si no se pasa, usa getOptionLabel. */
    renderOptionContent?: (option: T) => ReactNode
    label?: string
    disabled?: boolean
    size?: 'small' | 'medium'
    disableClearable?: boolean
    errorMessage?: string | null
    placeholder?: string
    required?: boolean
}

interface OptionGroup<T> { name: string, fields: T[] }

/** Agrupa una lista en grupos contiguos según `groupBy`, preservando el orden de aparición. */
function groupOptions<T>(options: T[], groupBy: (option: T) => string): OptionGroup<T>[] {
    const groups: OptionGroup<T>[] = []
    const indexByName = new Map<string, number>()
    options.forEach(option => {
        const name = groupBy(option)
        if (!indexByName.has(name)) {
            indexByName.set(name, groups.length)
            groups.push({ name, fields: [] })
        }
        groups[indexByName.get(name)!].fields.push(option)
    })
    return groups
}

/**
 * Selector genérico value/onChange -- no depende de react-hook-form. 
 * `searchable` decide si se renderiza como un `Autocomplete` (con input de texto para filtrar) 
 * o como un `<Select>` simple, sin duplicar la lógica.
 *
 * Pensado como base para selectores especializados (ej. `FieldSelector`, que agrega el
 * agrupamiento por sección de campos nativos/custom).
 */
export const GenericSelector = <T,>({
    options, value, onChange, getOptionLabel, getOptionKey, searchable = true, groupBy, renderGroup,
    renderOptionContent, label, disabled = false, size = 'medium', disableClearable = false,
    errorMessage = null, placeholder, required = false,
}: SelectorProps<T>) => {

    const groups = useMemo(() => groupBy ? groupOptions(options, groupBy) : null, [options, groupBy])

    if (searchable) {
        if ((!options || options.length === 0) && !disabled) return <AutocompleteLoader label={label} size={size} />

        return (
            <Autocomplete
                options={options}
                value={value}
                disabled={disabled}
                disableClearable={disableClearable}
                size={size}
                fullWidth
                groupBy={groupBy}
                renderGroup={groupBy ? (renderGroup ?? renderFieldSectionGroup) : undefined}
                onChange={(_, newValue) => onChange(newValue as T | null)}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={(option, val) => getOptionKey(option) === getOptionKey(val)}
                renderOption={renderOptionContent
                    ? ({ key, ...liProps }, option) => <li key={key} {...liProps}>{renderOptionContent(option)}</li>
                    : undefined}
                renderInput={(params) => (
                    <TextField {...params} label={label} required={required} error={!!errorMessage}
                        placeholder={placeholder} size={size} fullWidth />
                )}
            />
        )
    }

    return (
        <FormControl size={size} fullWidth disabled={disabled} error={!!errorMessage} required={required}>
            {label && <InputLabel>{label}</InputLabel>}
            <Select
                value={value ? getOptionKey(value) : ''}
                label={label}
                onChange={(e) => {
                    const selected = options.find(o => getOptionKey(o) === e.target.value) ?? null
                    onChange(selected)
                }}
            >
                {groups
                    ? renderGroupedMenuItems(groups, (option) => (
                        <MenuItem key={getOptionKey(option)} value={getOptionKey(option)}>
                            {renderOptionContent ? renderOptionContent(option) : getOptionLabel(option)}
                        </MenuItem>
                    ))
                    : options.map((option) => (
                        <MenuItem key={getOptionKey(option)} value={getOptionKey(option)}>
                            {renderOptionContent ? renderOptionContent(option) : getOptionLabel(option)}
                        </MenuItem>
                    ))}
            </Select>
            {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        </FormControl>
    )
}
