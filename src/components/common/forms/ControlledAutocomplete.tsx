import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { Controller, type Control, type ControllerRenderProps, type FieldValues } from 'react-hook-form'

interface ControlledACProps {
    optionList: object[],
    label?: string,
    name: string,
    control: Control,
    getOptionLabel: (option: object) => string,
    getOptionKey?: (option: object) => string,
    returnField?: string | null,
    sx?: object | null,
    disabled?: boolean,
    required?: boolean,
    loading?: boolean
    multiple?: boolean,
}

export const ControlledAutocomplete = ({ optionList, label, name, control, getOptionLabel, getOptionKey = option => option.id,
    returnField = null, sx = {}, disabled = false, required = false, loading = false, multiple = false }: ControlledACProps) => {

    const handleChange = (field: ControllerRenderProps<FieldValues, string>, values: object | object[] | null) => {
        //Por defecto, si no hay valores devuelve null o []
        if (!values) {
            field.onChange(multiple ? [] : null)
            return
        }

        //Si no hay returnField, devuelve el objeto, o arreglo de objetos.
        if (returnField === null) {
            field.onChange(values)
            return
        }

        //Si hay returnField, se devuelve un campo específico, o un arreglo del campo específico.
        if (!multiple) {
            field.onChange(values[returnField])
        } else {
            field.onChange(values.map(value => value[returnField]))
        }
    }

    const handleValue = (field: ControllerRenderProps<FieldValues, string>) => {
        //Por defecto, si no hay valores devuelve null o []
        if (!field.value || field.value === "") return (multiple ? [] : null)

        //Devuelve la opción, o arreglo de opciones, elegidos. (Autocomplete necesita el objeto entero.)
        if (returnField === null) {
            return field.value
        }

        //Busca el objeto (find) o el arreglo de objetos (filter) a partir del atributo seleccionado.
        if (!multiple) {
            return optionList.find(item => field.value === item?.[returnField]) ?? null
        } else {
            return optionList.filter(option => field.value.includes(option?.[returnField]))
        }
    }

    return (
        <Controller name={name} control={control} disabled={disabled}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    loading={loading}
                    options={optionList}
                    multiple={multiple}
                    renderInput={(params) =>
                        <TextField {...params} label={label} sx={sx} required={required}
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                },
                            }}
                        />
                    }
                    getOptionLabel={getOptionLabel}
                    getOptionKey={getOptionKey}
                    isOptionEqualToValue={(option, value) =>
                        getOptionKey(option) === getOptionKey(value)}
                    onChange={(_, value) => handleChange(field, value)}
                    value={handleValue(field)}
                />
            )}
        >
        </Controller>
    )
}

interface LoaderProps {
    label?: string,
    sx?: object | null
}
export const AutocompleteLoader = ({ label, sx }: LoaderProps) => {
    return (
        <Autocomplete
            options={[]} loading disabled
            renderInput={(params) =>
                <TextField {...params} label={label} sx={sx}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <CircularProgress color="inherit" size={20} />
                            ),
                        },
                    }}
                />
            }
        />
    )
}
