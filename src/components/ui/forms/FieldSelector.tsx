import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import type { LeadField } from 'src/types/leadFields'
import { getFieldSelectorGroupName, groupFieldsForSelector, flattenGroupedFields } from 'src/features/leadFields/leadFieldUtils'
import { GenericSelector } from './GenericSelector'

interface FieldSelectorProps {
    fields: LeadField[]
    value: number | string | null
    onChange: (fieldId: number | string | null) => void
    /** true (default) = con buscador (Autocomplete); false = <Select> simple, sin input de texto. */
    searchable?: boolean
    label?: string
    disabled?: boolean
    size?: 'small' | 'medium'
    disableClearable?: boolean
    errorMessage?: string | null
    /** Si se muestra el "(TIPO_DE_CAMPO)" al lado del nombre -- se omite para nativos igual. Default true. */
    showTypeCaption?: boolean
    /** Se llama con el campo elegido (objeto completo) ANTES de `onChange` -- ej. para resetear otro campo del form que dependa del tipo del elegido. */
    onChangeBefore?: (field: LeadField | null) => void
}

/**
 * Selector especializado en "elegir un campo" de Lead (custom + nativos), agrupado por sección:
 * "Datos del Lead"/"Creación"/"Modificación" para los nativos, la sección real (`lead_field_section`)
 * para los custom (ver `leadFieldUtils.ts`). 
 *
 * "Hereda" de `Selector` el toggle `searchable` para la diferencia entre modo Autocomplete (con buscador), y Select simple.
 */
export const FieldSelector = ({
    fields, value, onChange, searchable = true, label = 'Campo', disabled = false,
    size = 'small', disableClearable = false, errorMessage = null, showTypeCaption = true, onChangeBefore,
}: FieldSelectorProps) => {

    // Reordenadas por sección (contiguas, nativos primero) para que el groupBy no repita encabezados.
    const options = useMemo(() => flattenGroupedFields(groupFieldsForSelector(fields)), [fields])
    const selected = useMemo(() => options.find(f => f.id === value) ?? null, [options, value])

    return (
        <GenericSelector
            options={options}
            value={selected}
            onChange={(field) => {
                onChangeBefore?.(field)
                onChange(field ? field.id : null)
            }}
            getOptionLabel={(field) => field.name}
            getOptionKey={(field) => field.id}
            groupBy={getFieldSelectorGroupName}
            searchable={searchable}
            label={label}
            disabled={disabled}
            size={size}
            disableClearable={disableClearable}
            errorMessage={errorMessage}
            renderOptionContent={(field) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{field.name}</span>
                    {showTypeCaption && field.field_type.code !== 'NATIVE_ID' && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            ({field.field_type_code})
                        </Typography>
                    )}
                </Box>
            )}
        />
    )
}

interface ControlledFieldSelectorProps<TForm extends FieldValues> extends Omit<FieldSelectorProps, 'value' | 'onChange'> {
    control: Control<TForm>
    name: Path<TForm>
}

/**
 * Versión conectada a react-hook-form de `FieldSelector`, para los formularios que ya manejan su
 * estado con `control`/`name` (ej. Automatizaciones, filtros de la lista de leads) en vez del
 * patrón `value`/`onChange` a mano (ej. condiciones de enrutamiento).
 */
export const ControlledFieldSelector = <TForm extends FieldValues>({ control, name, ...props }: ControlledFieldSelectorProps<TForm>) => (
    <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
            <FieldSelector
                {...props}
                value={field.value ?? null}
                onChange={field.onChange}
                errorMessage={props.errorMessage ?? fieldState.error?.message}
            />
        )}
    />
)
