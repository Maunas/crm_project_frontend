import { Checkbox, FormControlLabel, Grid, Radio, RadioGroup, Rating, Slider, TextField, Typography } from '@mui/material'
import { Controller, type Control } from 'react-hook-form'
import NumberField, { NumberSpinner } from './NumberField'

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
    options: {
        label: string,
        value: string
    }[]
}
export const ControlledRadio = ({ control, name, row = true, options }: ControlledRadioProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) =>
                <RadioGroup row={row}
                    {...field}
                >
                    {options?.length > 0 &&
                        options.map((option) =>
                            <FormControlLabel key={option.label} value={option.value}
                                control={<Radio />} label={option.label} />
                        )}
                </RadioGroup>
            }>
        </Controller>
    )
}

interface ControlledTextProps {
    control: Control,
    name: string,
    label: string,
    id?: string
}
export const ControlledTextInput = ({ control, name, label, id }: ControlledTextProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) =>
                <TextField
                    {...field}
                    id={id ?? name}
                    label={label ?? name}
                    value={field.value ?? ""}
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
    type?: "slider" | "rating"
}
export const ControlledSlider = ({ name, control, label, min = 0, max, defaultValue = 0, step = 1, type = "slider" }: ControlledSliderProps) => {
    return (
        <Controller name={name} control={control} render={({ field }) =>
            <Grid container spacing={2} alignItems="center">
                <Grid size="grow" alignItems="center" sx={{ paddingInline: 2 }}>
                    {label && <Typography component="legend">{label}</Typography>}

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
}
export const ControlledNumber = ({ name, control, label, min, max, step, type = "field" }: ControlledNumberProps) => {
    return (
        <Controller name={name} control={control} render={({ field }) => (
            <>
                {type === "field" &&
                    <NumberField
                        {...field} sx={{width:"100%"}}
                        onValueChange={(value) => field.onChange(value)}
                        label={label} min={min} max={max} step={step}
                    />
                }
                {type === "spinner" &&
                    <NumberSpinner
                        {...field} sx={{width:"100%"}}
                        onValueChange={(value) => field.onChange(value)}
                        label={label} min={min} max={max} step={step}
                    />
                }
            </>
        )}
        />
    )
}
