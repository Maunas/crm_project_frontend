import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Radio, RadioGroup, Rating, Slider, TextField, Typography } from '@mui/material'
import { Controller, type Control, type ControllerRenderProps } from 'react-hook-form'
import NumberField, { NumberSpinner } from './NumberField'
import { useEffect, useState } from 'react'

interface ControlledCheckboxProps {
    control: Control,
    name: string
}

export const ControlledCheckbox = ({ control, name }: ControlledCheckboxProps) => {
    return (
        <Controller name={name} control={control}
            render={({ field }) => (
                <Checkbox
                    {...field}
                    checked={field.value ?? false}
                />
            )}
        >
        </Controller >
    )
}

interface ControlledRadioProps {
    control: Control,
    name: string,
    row?: boolean,
    required?: boolean,
    label?: string,
    options: object[],
    returnField?: string | null,
    radioLabel?: (option: object) => string,
    keyField?: string,
}
export const ControlledRadio = ({ control, name, row = true, options, label, required=false,
    returnField = "value", radioLabel = (option) => `${option.value}`, keyField = "label" }: ControlledRadioProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) => {
                return (
                    <FormControl required={required}>
                        <FormLabel id={name}>{label}</FormLabel>
                        <RadioGroup row={row}
                            {...field}
                            id={name}
                            value={field.value ?? null}
                        >

                            {options?.length > 0 &&
                                options.map((option) =>
                                    <FormControlLabel key={option?.[keyField]} value={option?.[returnField] ?? null}
                                        control={<Radio />} label={radioLabel(option)} />
                                )}
                        </RadioGroup>
                    </FormControl>
                )
            }
            }>
        </Controller>
    )
}

interface ControlledTextProps {
    control: Control,
    name: string,
    label: string,
    required?: boolean,
    id?: string
}
export const ControlledTextInput = ({ control, name, label, id, required=false }: ControlledTextProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) =>
                <TextField
                    {...field}
                    id={id ?? name}
                    label={label ?? name}
                    value={field.value ?? ""}
                    required={required}
                    fullWidth
                />
            }>
        </Controller>
    )
}

interface ControlledSliderProps {
    control: Control,
    name: string,
    label?: string,
    defaultValue?: number,
    min?: number,
    max?: number
    step?: number,
    required?: boolean,
    type?: "slider" | "rating"
}
export const ControlledSlider = ({ name, control, label, min = 0, max, defaultValue = 0, step = 1, type = "slider",required=false }: ControlledSliderProps) => {
    return (
        <Controller name={name} control={control} render={({ field }) =>
            <Grid container spacing={2} alignItems="center">
                <Grid size="grow" alignItems="center" sx={{ paddingInline: 2 }}>
                    {label && <Typography component="legend">{label}{required && "*"}</Typography>}

                    {type === "slider" &&
                        <Slider
                            {...field} value={field.value || defaultValue}
                            color="secondary"
                            min={min} max={max} step={step} />
                    }

                    {type === "rating" &&
                        <Rating
                            {...field} value={field.value || defaultValue}
                            precision={step} size="large" max={max}
                        />
                    }
                </Grid>
                <NumberSpinner
                    {...field} value={field.value || defaultValue}
                    onValueChange={(value) => field.onChange(value)}
                    min={type === "rating" ? 0 : min} max={max} step={step} size="small"
                />
            </Grid>
        } />
    )
}

interface ControlledNumberProps {
    control: Control,
    name: string,
    label?: string,
    defaultValue?: number,
    min?: number,
    max?: number
    step?: number,
    type?: "field" | "spinner"
    required?: boolean,
}
export const ControlledNumber = ({ name, control, label, min, max, step, type = "field", required=false }: ControlledNumberProps) => {
    return (
        <Controller name={name} control={control} render={({ field }) => (
            <>
                {type === "field" &&
                    <NumberField
                        {...field} sx={{ width: "100%" }}
                        onValueChange={(value) => field.onChange(value)}
                        label={label} min={min} max={max} step={step} required={required}

                    />
                }
                {type === "spinner" &&
                    <NumberSpinner
                        {...field} sx={{ width: "100%" }}
                        onValueChange={(value) => field.onChange(value)}
                        label={label} min={min} max={max} step={step} required={required}
                    />
                }
            </>
        )}
        />
    )
}

interface CtrlGroupedCheckboxProps {
    label?: string,
    control: Control,
    name: string,
    options: object[],
    returnField?: string | null,
    row?: boolean,
    idField?: string,
    checkboxLabel?: (option: object) => string
}
export const ControlledGroupedCheckbox = ({ label, name, control, row=true, options, returnField = null, idField, checkboxLabel }: CtrlGroupedCheckboxProps) => {

    return <Controller name={name} control={control} render={({ field }) =>
        <GroupedCheckbox field={field} label={label} options={options} row={row}
    returnField={returnField} idField={idField} checkboxLabel={checkboxLabel} />

    } />
}

interface GroupedCheckboxProps {
    field: ControllerRenderProps,
    label?: string,
    options: object[],
    returnField?: string | null,
    row?: boolean,
    idField?: string,
    checkboxLabel?: (option: object) => string
}
const GroupedCheckbox = ({ field, label, options, row=true,returnField = null, idField = "id", checkboxLabel = (option) => option.value }: GroupedCheckboxProps) => {

    const [checkboxState, setCheckboxState] = useState(new Map())

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
        <FormControl
            component="fieldset"
            variant="standard"
        >
            <FormLabel>{label}</FormLabel>
            <FormGroup row={row} >
                {options?.map(option => (
                    <FormControlLabel key={option?.[idField]}
                        control={
                            <Checkbox checked={checkboxState.has(option?.[idField])} onChange={(e, value) => handleChange(e, value, option)}
                                name={option?.[idField]} />
                        }
                        label={checkboxLabel(option)}
                    />)

                )}
            </FormGroup>
        </FormControl>
    )
}