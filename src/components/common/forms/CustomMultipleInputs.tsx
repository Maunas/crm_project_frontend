import { Autocomplete, Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Radio, RadioGroup, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, type Control, type ControllerRenderProps, type FieldValues } from 'react-hook-form'

interface BasicControlFormInput {
    label?: string,
    name: string,
    control: Control<object>,
    options: object[],
    required?: boolean,
    errorMessage?: string | null,
    returnField?: string | null,
}

interface ControlledACProps extends BasicControlFormInput {
    getOptionLabel: (option: object) => string,
    getOptionKey?: (option: object) => string,
    sx?: object | null,
    disabled?: boolean,
    hidden?: boolean,
    loading?: boolean
    multiple?: boolean,
    autocomplete?: string
}

export const ControlledAutocomplete = ({ label, name, control, options, required = false, errorMessage = null, disabled = false, loading = false, hidden = false,
    getOptionLabel, getOptionKey = option => option.id, returnField = null, sx = {}, multiple = false, autocomplete = "one-time-code" }: ControlledACProps) => {
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
            return options.find(item => field.value === item?.[returnField]) ?? null
        } else {
            return options.filter(option => field.value.includes(option?.[returnField]))
        }
    }

    return (
        <Controller name={name} control={control} disabled={disabled}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    loading={loading}
                    options={options ?? []}
                    multiple={multiple}
                    hidden={hidden}
                    renderInput={(params) =>
                        <>
                            <TextField {...params} label={label} sx={sx} required={required}
                                error={!!errorMessage} autoComplete={autocomplete} 
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
                            {errorMessage &&
                                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
                            }
                        </>
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

interface ControlledRadioProps extends Omit<BasicControlFormInput, "returnField"> {
    row?: boolean,
    radioLabel?: (option: object) => string,
    keyField?: string,
    returnField?: string,
    int?: boolean
}
export const ControlledRadio = ({ label, name, control, options, required = false, errorMessage = null, row = true, int = false,
    returnField = "value", radioLabel = (option) => `${option.value}`, keyField = "label" }: ControlledRadioProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) => {
                return (
                    <FormControl required={required} error={!!errorMessage}>
                        <FormLabel id={name}>{label}</FormLabel>
                        <RadioGroup row={row}
                            {...field}
                            id={name}
                            value={field.value ?? null}
                            onChange={(e, value) => field.onChange(int ? Number(value) : value)}
                        >

                            {options?.length > 0 &&
                                options.map((option) =>
                                    <FormControlLabel key={option?.[keyField]} value={int ? Number(option[returnField]) : option[returnField]}
                                        control={<Radio />} label={radioLabel(option)} />
                                )}
                        </RadioGroup>
                        {errorMessage &&
                            <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
                        }
                    </FormControl>
                )
            }
            }>
        </Controller>
    )
}


interface BasicControlFormInput {
    label?: string,
    name: string,
    control: Control<object>,
    options: object[],
    required?: boolean,
    errorMessage?: string | null,
}
interface CtrlGroupedCheckboxProps extends BasicControlFormInput {
    row?: boolean,
    idField?: string,
    checkboxLabel?: (option: object) => string
}
export const ControlledGroupedCheckbox = ({ label, name, control, options, required = false, errorMessage = null, returnField = null,
    row = true, idField, checkboxLabel }: CtrlGroupedCheckboxProps) => {

    return (
        <Controller name={name} control={control} render={({ field }) =>
            <>
                <GroupedCheckbox field={field} label={label} options={options} row={row} required={required} errorMessage={errorMessage}
                    returnField={returnField} idField={idField} checkboxLabel={checkboxLabel} />
                {errorMessage &&
                    <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
                }
            </>
        } />
    )
}

interface GroupedCheckboxProps {
    label?: string,
    field: ControllerRenderProps,
    options: object[],
    required?: boolean,
    errorMessage?: string | null
    returnField?: string | null,
    row?: boolean,
    idField?: string,
    checkboxLabel?: (option: object) => string,
}
const GroupedCheckbox = ({ label, field, options, required = false, errorMessage = null, returnField = null,
    row = true, idField = "id", checkboxLabel = (option) => option.value }: GroupedCheckboxProps) => {

    const [checkboxState, setCheckboxState] = useState(new Map())

    useEffect(() => {
        if (!field?.value || field?.value?.length === 0) return
        const valueArray = field.value.map(value => ([
            options.find(op => (op?.[returnField] ?? op) === value)?.[idField],
            value
        ]))
        const defaultValues = new Map(valueArray)
        setCheckboxState(defaultValues)
    }, [])

    useEffect(() => {
        field.onChange(Array.from(checkboxState.values()))
    }, [checkboxState])

    const handleChange = (e, value, option) => {
        const newCheckboxState = new Map(checkboxState)
        if (value) {
            newCheckboxState.set(option?.[idField], returnField ? option?.[returnField] : option)
        } else {
            newCheckboxState.delete(option?.[idField])
        }
        setCheckboxState(newCheckboxState)
    }

    return (
        <FormControl required={required} error={!!errorMessage} >
            <FormLabel>{label}</FormLabel>
            <FormGroup row={row} >
                {options?.map(option => (
                    <FormControlLabel key={option?.[idField]} label={checkboxLabel(option)}
                        control={
                            <Checkbox checked={checkboxState.has(option?.[idField])} onChange={(e, value) => handleChange(e, value, option)}
                                name={option?.[idField]} />
                        }
                    />)
                )}
            </FormGroup>
        </FormControl>
    )
}