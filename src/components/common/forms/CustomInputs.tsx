import { Checkbox, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Rating, Slider, TextField, Typography } from '@mui/material'
import { Controller, type Control, type UseFormRegister } from 'react-hook-form'
import NumberField, { NumberSpinner } from './NumberField'
import { useState } from 'react'
import { Visibility, VisibilityOff } from '@mui/icons-material'

interface BasicFormInput {
    label?: string,
    name: string,
    required?: boolean,
    errorMessage?: string | null,
    autoComplete?: string
}
interface RegisterFormInput extends BasicFormInput {
    register: UseFormRegister<object>
}
interface ControlFormInput extends BasicFormInput {
    control: Control<object>
}

interface ControlledTextProps extends ControlFormInput {
    id?: string,
    type?: string | null
}
export const ControlledTextInput = ({ control, name, type = "text", label, id, required = false, errorMessage = null, autoComplete = "one-time-code" }: ControlledTextProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) =>
                <>
                    <TextField
                        {...field} autoComplete={autoComplete}
                        id={id ?? name}
                        label={label ?? name}
                        value={field.value ?? ""}
                        required={required} type={type}
                        error={!!errorMessage}
                        fullWidth
                    />
                    {errorMessage &&
                        <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
                    }
                </>
            }>
        </Controller>
    )
}

interface ControlledSliderProps extends ControlFormInput {
    defaultValue?: number,
    min?: number,
    max?: number
    step?: number,
    type?: "slider" | "rating"
}
export const ControlledSlider = ({ name, control, label, min = 0, max, defaultValue = 0, step = 1,
    type = "slider", required = false, errorMessage = null }: ControlledSliderProps) => {
    return (
        <Controller name={name} control={control} render={({ field }) =>
            <FormControl error={!!errorMessage}>
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
                {errorMessage &&
                    <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
                }
            </FormControl>
        } />
    )
}

interface ControlledNumberProps extends Omit<ControlledSliderProps, "type"> {
    type?: "field" | "spinner"
}
export const ControlledNumber = ({ name, control, label, min, max, step, type = "field",
    required = false, errorMessage = null }: ControlledNumberProps) => {
    return (
        <Controller name={name} control={control} render={({ field }) => (
            <>
                {type === "field" &&
                    <NumberField
                        {...field} sx={{ width: "100%" }} error={!!errorMessage}
                        value={field.value ?? ""}
                        onValueChange={(value) => field.onChange(value)}
                        label={label} min={min} max={max} step={step} required={required}

                    />
                }
                {type === "spinner" &&
                    <NumberSpinner
                        {...field} sx={{ width: "100%" }} error={!!errorMessage}
                        onValueChange={(value) => field.onChange(value)}
                        label={label} min={min} max={max} step={step} required={required}
                    />
                }
                {errorMessage &&
                    <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
                }
            </>
        )}
        />
    )
}

interface ControlledCheckboxProps extends ControlFormInput {
    title?: string
}

export const ControlledCheckbox = ({ label, name, control, title, required = false, errorMessage = null }: ControlledCheckboxProps) => {
    return (
        <FormControl error={!!errorMessage}>
            <FormLabel error={!!errorMessage}>{title}</FormLabel>
            <FormControlLabel label={label} required={required} control={
                <Controller name={name} control={control} defaultValue={false}
                    render={({ field }) => (
                        <Checkbox
                            {...field}
                            checked={field.value ?? false}
                            onChange={(_, checked) => field.onChange(checked ?? false)}
                        />
                    )}
                />
            } />
            {errorMessage &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
            }
        </FormControl>
    )
}

export const PasswordField = ({ label, name, register, required = true, errorMessage = null, autoComplete = "one-time-code" }: RegisterFormInput) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <FormControl fullWidth error={!!errorMessage} required={required} >
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput id={name} label={label} type={showPassword ? 'text' : 'password'}
                error={!!errorMessage} autoComplete={autoComplete}
                {...register(name)}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={
                                showPassword ? 'Ocultar contraseña.' : 'Ver contraseña.'
                            }
                            onClick={handleClickShowPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
            />
            {errorMessage &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
            }
        </FormControl>
    )
}

interface FileProps extends RegisterFormInput {
    accept?: string,
    id?: string
}
export const SingleFileField = ({ name, label, register, id, required = false, errorMessage = null, autoComplete = "one-time-code", accept = "" }: FileProps) => {
    return (
        <>
            <TextField
                {...register(name)}
                autoComplete={autoComplete} type="file" accept={accept} fullWidth
                id={id ?? name} label={label ?? name} required={required} error={!!errorMessage}
                slotProps={{ inputLabel: { shrink: true } }}
            />
            {errorMessage &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
            }
        </>)
}

interface RegisteredTextProps extends RegisterFormInput {
    id?: string | null,
    type?: string | null
}

export const RegisteredTextInput = ({ name, label, register, type = "text", id = null, required = false, errorMessage = null, autoComplete = "one-time-code" }: RegisteredTextProps) => {
    return (
        <TextField
            {...register(name)}
            autoComplete={autoComplete} fullWidth type={type}
            id={id ?? name} label={label ?? name} required={required} error={!!errorMessage}
        />
    )
}
