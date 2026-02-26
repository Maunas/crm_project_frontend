import { Autocomplete, Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, type Control, type ControllerRenderProps, type FieldValues, type Path } from 'react-hook-form'
import { FormErrorMessage } from '../../../styles/styledMUIFormComponents'

interface BasicMultileInputProps<Option> {
    label?: string,
    options: Option[],
    required?: boolean,
    errorMessage?: string | null,
}

interface BasicControlFormInput<T extends FieldValues, Option> extends BasicMultileInputProps<Option> {
    control: Control<T>,
    name: Path<T>,
    returnField?: keyof Option | null,
}

interface ControlledACProps<T extends FieldValues, Option> extends BasicControlFormInput<T, Option> {
    getOptionLabel: (option: Option) => string,
    getOptionKey: (option: Option) => string,
    disabled?: boolean,
    hidden?: boolean,
    multiple?: boolean,
    disableClearable?: boolean,
    autocomplete?: string
}

export const ControlledAutocomplete = <T extends FieldValues, Option>
    ({ control, name, label, options, getOptionLabel, getOptionKey, returnField = null,
        required = false, multiple = false, disabled = false, hidden = false, disableClearable = false,
        errorMessage = null, autocomplete = "one-time-code", ...props }: ControlledACProps<T, Option>) => {

    const handleChange = (field: ControllerRenderProps<T, Path<T>>, values: Option | Option[] | null) => {
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
            field.onChange((values as Option)[returnField])
        } else {
            field.onChange((values as Option[]).map(value => value[returnField]))
        }
    }

    const handleValue = (field: ControllerRenderProps<T, Path<T>>) => {
        //Por defecto, si no hay valores devuelve null o []
        if (!field.value || field.value === "") return (multiple ? [] : null)

        //Devuelve la opción, o arreglo de opciones, elegidos. (Autocomplete necesita el objeto entero.)
        if (returnField === null) return field.value

        //Busca el objeto (find) o el arreglo de objetos (filter) a partir del atributo seleccionado.
        if (!multiple) {
            return options.find(option => field.value === option?.[returnField]) ?? null
        } else {
            return options.filter(option => field.value.includes(option?.[returnField]))
        }
    }

    if ((!options || options.length === 0) && !disabled) return <AutocompleteLoader label={label} />

    return (
        <Controller name={name} control={control} disabled={disabled}
            render={({ field }) => (
                <Autocomplete {...field} multiple={multiple} hidden={hidden} disableClearable={disableClearable}
                    options={options ?? []}
                    onChange={(_, value) => handleChange(field, value)}
                    value={handleValue(field)}
                    getOptionLabel={getOptionLabel} getOptionKey={getOptionKey}
                    isOptionEqualToValue={(option, value) => getOptionKey(option) === getOptionKey(value)}
                    renderInput={(params) =>
                        <>
                            <TextField {...params} label={label} required={required}
                                error={!!errorMessage} autoComplete={autocomplete}
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        endAdornment: (
                                            params.InputProps.endAdornment
                                        ),
                                    },
                                }}
                                {...props}
                            />
                            {errorMessage &&
                                <FormErrorMessage>{errorMessage}</FormErrorMessage>
                            }
                        </>
                    }
                />
            )}
        />
    )
}

interface LoaderProps {
    label?: string,
}
export const AutocompleteLoader = ({ label, ...props }: LoaderProps) => {
    return (
        <Autocomplete
            options={[]} loading disabled renderInput={(params) =>
                <TextField {...params} label={label} {...props}
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

interface ControlledRadioProps<T extends FieldValues, Option> extends Omit<BasicControlFormInput<T, Option>, "returnField"> {
    getRadioLabel: (option: Option) => string,
    keyField: keyof Option,
    returnField: keyof Option,
    row?: boolean,
    isReturnInt?: boolean
}
export const ControlledRadio = <T extends FieldValues, Option>
    ({ control, label, name, options, required = false, errorMessage = null, row = true,
        returnField, isReturnInt = false, keyField, getRadioLabel }: ControlledRadioProps<T, Option>) => {
    return (
        <Controller control={control} name={name} render={({ field }) => {
            return (
                <FormControl required={required} error={!!errorMessage}>
                    <FormLabel id={name}>{label}</FormLabel>
                    <RadioGroup {...field} row={row} id={name}
                        value={field.value ?? null}
                        onChange={(_, value) => field.onChange(isReturnInt ? Number(value) : value)}
                    >
                        {options?.length > 0 &&
                            options.map(option =>
                                <FormControlLabel key={`${option[keyField]}`}
                                    value={isReturnInt ? Number(option[returnField]) : option[returnField]}
                                    control={<Radio />} label={getRadioLabel(option)} />
                            )}
                    </RadioGroup>
                    {errorMessage &&
                        <FormErrorMessage>{errorMessage}</FormErrorMessage>
                    }
                </FormControl>
            )
        }} />
    )
}

interface CtrlGroupedCheckboxProps<T extends FieldValues, Option> extends BasicControlFormInput<T, Option> {
    getCheckboxLabel: (option: Option) => string
    keyField: keyof Option,
    row?: boolean,
}
export const ControlledGroupedCheckbox = <T extends FieldValues, Option>
    ({ control, label, name, options, required = false, errorMessage = null, returnField = null,
        row = true, keyField, getCheckboxLabel }: CtrlGroupedCheckboxProps<T, Option>) => {

    return (
        <Controller name={name} control={control} render={({ field }) =>
            <>
                <GroupedCheckbox field={field} label={label} options={options}
                    returnField={returnField} keyField={keyField} getCheckboxLabel={getCheckboxLabel}
                    row={row} required={required} errorMessage={errorMessage} />
                {errorMessage &&
                    <FormErrorMessage>{errorMessage}</FormErrorMessage>
                }
            </>
        } />
    )
}

interface GroupedCheckboxProps<T extends FieldValues, Option> extends BasicMultileInputProps<Option> {
    field: ControllerRenderProps<T, Path<T>>,
    returnField?: keyof Option | null,
    keyField: keyof Option,
    getCheckboxLabel: (option: Option) => string,
    row?: boolean,
}

//Los checkbox tienen sus campos individualmente. Este componente crea un mapa para devolver los valores como un arreglo.
const GroupedCheckbox = <T extends FieldValues, Option>
    ({ field, label, options, required = false, errorMessage = null, returnField = null,
        row = true, keyField, getCheckboxLabel }: GroupedCheckboxProps<T, Option>) => {

    const [checkboxState, setCheckboxState] = useState(() => {
        //Inicializa el estado con los valores por defecto, o un mapa vacio si no hay
        if (!field?.value || field?.value?.length === 0) return new Map()
        const valueArray = field.value.map((value: unknown) => ([
            options.find(op => (returnField ? op[returnField] : op) === value)?.[keyField],
            value
        ]))
        return new Map(valueArray)
    })

    useEffect(() => {
        field.onChange(Array.from(checkboxState.values()))
    }, [checkboxState, field])

    const handleChange = (_: React.ChangeEvent<HTMLInputElement, Element>, value: boolean, option: Option) => {
        const newCheckboxState = new Map(checkboxState)
        if (value) {
            newCheckboxState.set(option[keyField], returnField ? option[returnField] : option)
        } else {
            newCheckboxState.delete(option[keyField])
        }
        setCheckboxState(newCheckboxState)
    }

    return (
        <FormControl required={required} error={!!errorMessage} >
            <FormLabel>{label}</FormLabel>
            <FormGroup row={row} >
                {options?.map(option => (
                    <FormControlLabel key={`${option[keyField]}`} label={getCheckboxLabel(option)}
                        control={
                            <Checkbox checked={checkboxState.has(option?.[keyField])} onChange={(e, value) => handleChange(e, value, option)}
                                name={`${option[keyField]}`} />
                        }
                    />)
                )}
            </FormGroup>
        </FormControl>
    )
}