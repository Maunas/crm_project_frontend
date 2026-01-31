import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Rating, TextField, Typography } from "@mui/material"
import { useState } from "react";
import { ControlledCheckbox } from "../common/forms/ControlledInputs";
import { NumberField } from '@base-ui/react/number-field';
import { Controller } from "react-hook-form";

export const LeadFormPassword = ({ label, name, register }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput id={name} label={label} type={showPassword ? 'text' : 'password'}
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
        </FormControl>
    )
}

export const LeadFormDefault = ({ label, register, name }) => {
    return (
        <TextField id={name} label={label} fullWidth name={name} {...register(name)} />
    )
}
export const LeadFormMoney = ({ label, register, name }) => {
    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput id={name} label={label}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                {...register(name)}
            />
        </FormControl>
    )
}

export const LeadFormBool = ({ label, control, name }) => {
    return (
        <FormControlLabel control={<ControlledCheckbox control={control} name={name} />} label={label} />
    )
}

export const LeadFormRating = ({ label, control, name, leadField }) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "STAR_RATING":
            return (
                <Controller name={name} control={control} render={({ field }) =>
                    <Grid container spacing={2} alignItems="center">
                        <Rating precision={0.5} size="large"
                            {...field}
                        />
                        <TextField type="number"
                            {...field}
                        />
                    </Grid>
                } />
            )

    }
}