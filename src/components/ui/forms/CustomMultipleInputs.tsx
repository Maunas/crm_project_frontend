import { Autocomplete, Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Radio, RadioGroup, Stack, TextField, type AutocompleteRenderValueGetItemProps, type InputProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, type Control, type ControllerRenderProps, type FieldValues, type Path } from 'react-hook-form'
import { FormErrorMessage } from './FormFeedback'
import type { ReactNode } from 'react';
import CustomChip from '../details/CustomChip';

interface BasicMultipleInputProps<Option> {
    label?: string,
    options: Option[],
    required?: boolean,
    errorMessage?: string | null,
    size?: "small" | "medium",
    startAdornment?: InputProps["startAdornment"],
    disabled?: boolean,
    helper?: string,
}

interface BasicControlFormInput<T extends FieldValues, Option> extends BasicMultipleInputProps<Option> {
    control: Control<T>,
    name: Path<T>,
    returnField?: keyof Option | null,
}

interface ControlledACProps<T extends FieldValues, Option>
    extends BasicControlFormInput<T, Option> {
    getOptionLabel?: (option: Option) => string,
    getOptionKey: (option: Option) => string,
    disabled?: boolean,
    hidden?: boolean,
    multiple?: boolean,
    disableClearable?: boolean,
    autocomplete?: string,
    helper?: string,
    placeholder?: string,
    onChangeBefore?: (value?: Option | Option[] | null) => void
    //Para agrupar visualmente las opciones (ej: separar los ítems padre según a qué nomenclador padre pertenece cada uno).
    //Requiere que "options" ya venga ordenado/agrupado por este mismo criterio (si no, MUI repite el encabezado).
    groupBy?: (option: Option) => string,
    //Custom del encabezado de cada grupo (ver groupBy). Si no se pasa, usa el ListSubheader en negrita
    //por defecto de MUI -- pasar `renderFieldSectionGroup` (FieldSectionHeader.tsx) para selectores de campo.
    renderGroup?: (params: { key: string | number, group: string, children?: ReactNode }) => ReactNode,
    renderOption?: (props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key }, option: Option) => ReactNode;
    renderValue?: (
        value: Option | Option[],
        getItemProps: AutocompleteRenderValueGetItemProps<boolean>
    ) => ReactNode
}

export const ControlledAutocomplete = <T extends FieldValues, Option>
    ({ control, name, label, options, getOptionLabel, getOptionKey, returnField = null, renderOption,
        required = false, multiple = false, disabled = false, hidden = false, disableClearable = false,
        errorMessage = null, autocomplete = "one-time-code", helper, placeholder, size = "medium", renderValue, onChangeBefore, groupBy, renderGroup, ...props }: ControlledACProps<T, Option>) => {

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

    if ((!options || options.length === 0) && !disabled) return <AutocompleteLoader label={label} size={size} />

    return (
        <Controller name={name} control={control} disabled={disabled}
            render={({ field }) => (
                <Autocomplete {...field} multiple={multiple} hidden={hidden} disableClearable={disableClearable}
                    options={options ?? []} size={size} groupBy={groupBy} renderGroup={renderGroup}
                    onChange={(_, value) => {
                        if (onChangeBefore) onChangeBefore(value)
                        handleChange(field, value)
                    }}
                    value={handleValue(field)}
                    getOptionLabel={getOptionLabel} getOptionKey={getOptionKey} renderOption={renderOption}
                    isOptionEqualToValue={(option, value) => getOptionKey(option) === getOptionKey(value)}
                    fullWidth
                    // Solo realiza renderValue para estilizar los chips. 
                    // RenderValue tiene comportamiento inesperado con valores simples.
                    renderValue={
                        multiple
                            ? (renderValue ?? ((values, getItemProps) => {
                                const getMultipleItemProps = getItemProps as AutocompleteRenderValueGetItemProps<true>
                                return (values as Option[]).map((option, index) => {
                                    const { key, ...itemProps } = getMultipleItemProps({ index });
                                    return (
                                        <CustomChip
                                            key={key}
                                            label={getOptionLabel?.(option) ?? `${option}`}
                                            size="small"
                                            {...itemProps}
                                        />
                                    );
                                })
                            }))
                            : undefined
                    }
                    renderInput={(params) =>
                        <>
                            <TextField {...params} label={label} required={required}
                                error={!!errorMessage} autoComplete={autocomplete}
                                placeholder={placeholder} size={size} fullWidth
                                {...props}
                                slotProps={{
                                    ...params.slotProps,
                                    input: {
                                        ...params.slotProps.input,
                                        startAdornment: <>
                                            {props.startAdornment}
                                            {params.slotProps?.input?.startAdornment}
                                        </>
                                    }
                                }}
                            />
                            {helper &&
                                <FormHelperText>{helper}</FormHelperText>
                            }
                            {errorMessage &&
                                <FormErrorMessage>{errorMessage}</FormErrorMessage>
                            }
                        </>
                    }
                />
            )
            }
        />
    )
}

interface LoaderProps {
    label?: string,
    size?: "small" | "medium"
}
export const AutocompleteLoader = ({ label, size = "medium", ...props }: LoaderProps) => {
    return (
        <Autocomplete size={size} options={[]} fullWidth loading disabled
            renderInput={(params) =>
                <TextField {...params} label={label} fullWidth size={size} {...props}
                    slotProps={{
                        ...params.slotProps,
                        input: {
                            ...params.slotProps.input,
                            endAdornment: (
                                <>
                                    <CircularProgress color="inherit" size={size === "small" ? 15 : 20} />
                                    {params.slotProps.input.endAdornment}
                                </>
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
    ({ control, label, name, options, required = false, errorMessage = null, row = true, disabled = false, helper,
        returnField, isReturnInt = false, keyField, getRadioLabel, ...props }: ControlledRadioProps<T, Option>) => {
    return (
        <Controller control={control} name={name} render={({ field }) => {
            return (
                <FormControl required={required} error={!!errorMessage} disabled={disabled}>
                    <FormLabel id={name}>{label}</FormLabel>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        {props.startAdornment}
                        <RadioGroup {...field} row={row} id={name}
                            value={field.value ?? null}
                            onChange={(_, value) => field.onChange(isReturnInt ? Number(value) : value)}
                        >
                            {options?.length > 0 &&
                                options.map(option =>
                                    <FormControlLabel key={`${option[keyField]}`}
                                        value={isReturnInt ? Number(option[returnField]) : option[returnField]}
                                        control={<Radio disabled={disabled} />} label={getRadioLabel(option)} />
                                )}
                        </RadioGroup>
                    </Stack>
                    {helper &&
                        <FormHelperText>{helper}</FormHelperText>
                    }
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
    ({ control, label, name, options, required = false, errorMessage = null, returnField = null, disabled = false, helper,
        row = true, keyField, getCheckboxLabel, ...props }: CtrlGroupedCheckboxProps<T, Option>) => {

    return (
        <Controller name={name} control={control} render={({ field }) =>
            <>
                <GroupedCheckbox field={field} label={label} options={options}
                    returnField={returnField} keyField={keyField} getCheckboxLabel={getCheckboxLabel}
                    row={row} required={required} errorMessage={errorMessage} disabled={disabled} {...props} />
                {helper &&
                    <FormHelperText>{helper}</FormHelperText>
                }
                {errorMessage &&
                    <FormErrorMessage>{errorMessage}</FormErrorMessage>
                }
            </>
        } />
    )
}

interface GroupedCheckboxProps<T extends FieldValues, Option> extends BasicMultipleInputProps<Option> {
    field: ControllerRenderProps<T, Path<T>>,
    returnField?: keyof Option | null,
    keyField: keyof Option,
    getCheckboxLabel: (option: Option) => string,
    row?: boolean,
}

//Los checkbox tienen sus campos individualmente. Este componente crea un mapa para devolver los valores como un arreglo.
const GroupedCheckbox = <T extends FieldValues, Option>
    ({ field, label, options, required = false, errorMessage = null, returnField = null, disabled = false,
        row = true, keyField, getCheckboxLabel, ...props }: GroupedCheckboxProps<T, Option>) => {

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkboxState])

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
        <FormControl required={required} error={!!errorMessage} disabled={disabled}>
            <FormLabel>{label}</FormLabel>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                {props.startAdornment}
                <FormGroup row={row} >
                    {options?.map(option => (
                        <FormControlLabel key={`${option[keyField]}`} label={getCheckboxLabel(option)}
                            control={
                                <Checkbox checked={checkboxState.has(option?.[keyField])} onChange={(e, value) => handleChange(e, value, option)}
                                    name={`${option[keyField]}`} disabled={disabled} />
                            }
                        />)
                    )}
                </FormGroup>

            </Stack>
        </FormControl>
    )
}