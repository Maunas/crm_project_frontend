import { useState, type HTMLInputTypeAttribute } from "react";
import NumberField, { NumberSpinner } from "./NumberField";
import { Controller, type Control, type FieldValues, type Path, type UseFormRegister, } from "react-hook-form";
import { Box, Checkbox, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Rating, Slider, TextField, Typography, } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormErrorMessage } from "../../../styledComponents/styledMUIFormComponents";

interface BasicFormInput<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  required?: boolean;
  errorMessage?: string;
  autoComplete?: string;
  size?: "small" | "medium"
}
interface RegisterFormInput<T extends FieldValues> extends BasicFormInput<T> {
  register: UseFormRegister<T>;
}
interface ControlFormInput<T extends FieldValues> extends BasicFormInput<T> {
  control: Control<T>;
}

interface ControlledTextProps<T extends FieldValues> extends ControlFormInput<T> {
  id?: string;
  type?: string;
}
export const ControlledTextInput = <T extends FieldValues>
  ({ control, label, name, required = false, errorMessage, autoComplete = "one-time-code", id, type = "text", size = "medium" }: ControlledTextProps<T>) => {
  return (
    <Controller control={control} name={name} render={({ field }) => (
      <>
        <TextField {...field} size={size}
          value={field.value ?? ""}
          label={label} id={id ?? name} type={type}
          required={required} error={!!errorMessage} autoComplete={autoComplete} fullWidth
        />
        {errorMessage && (
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        )}
      </>
    )} />
  );
};

interface ControlledSliderProps<T extends FieldValues> extends ControlFormInput<T> {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  type?: "slider" | "rating";
}
export const ControlledSlider = <T extends FieldValues>
  ({ control, label, name, required = false, errorMessage, min = 0, max, defaultValue = 0, step = 1, type = "slider" }: ControlledSliderProps<T>) => {
  return (
    <Controller name={name} control={control} render={({ field }) => (
      <FormControl error={!!errorMessage} fullWidth>
        <Grid container spacing={4} alignItems="center" justifyContent="space-around">
          <Grid size="grow" alignItems="center" maxWidth="13rem">
            {label && (
              <Typography component="legend">
                {label} {!required && "(Opcional)"}
              </Typography>
            )}

            {type === "slider" && (
              <Box sx={{ pl: 2 }}>
                <Slider {...field}
                  value={field.value || defaultValue}
                  color="secondary" min={min} max={max} step={step}
                />
              </Box>
            )}

            {type === "rating" && (
              <Rating {...field}
                value={field.value || defaultValue}
                max={max} precision={step} size="large"
              />
            )}
          </Grid>
          <Grid size="grow" alignItems="center" maxWidth="13rem">
            <NumberSpinner {...field}
              value={field.value || defaultValue}
              onValueChange={(value) => field.onChange(value)}
              min={type === "rating" ? 0 : min} max={max} step={step} size="small"
            />
          </Grid>
        </Grid>
        {errorMessage && (
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        )}
      </FormControl>
    )}
    />
  );
};

interface ControlledNumberProps<T extends FieldValues> extends Omit<ControlledSliderProps<T>, "type"> {
  type?: "field" | "spinner";
}
export const ControlledNumber = <T extends FieldValues>
  ({ control, label, name, required = false, errorMessage, min, max, step, type = "field" }: ControlledNumberProps<T>) => {
  return (
    <Controller name={name} control={control} render={({ field }) => (
      <>
        {type === "field" && (
          <NumberField {...field} label={label}
            value={Number(field.value ?? "")}
            onValueChange={(value) => field.onChange(value)}
            min={min} max={max} step={step} required={required} error={!!errorMessage}
          />
        )}
        {type === "spinner" && (
          <NumberSpinner {...field} label={label}
            value={Number(field.value ?? "")}
            onValueChange={(value) => field.onChange(value)}
            min={min} max={max} step={step} required={required} error={!!errorMessage}
          />
        )}
        {errorMessage && (
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        )}
      </>
    )}
    />
  );
};

interface ControlledCheckboxProps<T extends FieldValues> extends ControlFormInput<T> {
  title?: string;
}

export const ControlledCheckbox = <T extends FieldValues>
  ({ control, label, name, required = false, errorMessage, title }: ControlledCheckboxProps<T>) => {
  return (
    <FormControl error={!!errorMessage}>
      <FormLabel error={!!errorMessage}>{title}</FormLabel>
      <FormControlLabel label={label} required={required}
        control={
          <Controller name={name} control={control}
            render={({ field }) => (
              <Checkbox {...field}
                checked={field.value ?? false}
                onChange={(_, checked) => field.onChange(checked ?? false)}
              />
            )}
          />
        }
      />
      {errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export const PasswordField = <T extends FieldValues>
  ({ register, label, name, required = false, errorMessage, autoComplete = "one-time-code" }: RegisterFormInput<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <FormControl required={required} error={!!errorMessage} fullWidth>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <OutlinedInput id={name} label={label}
        type={showPassword ? "text" : "password"}
        error={!!errorMessage} autoComplete={autoComplete} {...register(name)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Ocultar contraseña." : "Ver contraseña."}
              onClick={handleClickShowPassword} edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      {errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  );
};

interface FileProps<T extends FieldValues> extends RegisterFormInput<T> {
  id?: string;
}
export const SingleFileField = <T extends FieldValues>
  ({ register, name, label, required = false, errorMessage, autoComplete = "one-time-code", id }: FileProps<T>) => {
  return (
    <>
      <TextField {...register(name)} label={label ?? ""} id={id ?? name} type="file"
        required={required} error={!!errorMessage} autoComplete={autoComplete} fullWidth slotProps={{ inputLabel: { shrink: true } }}
      />
      {errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </>
  );
};

interface RegisteredTextProps<T extends FieldValues> extends RegisterFormInput<T> {
  id?: string | null;
  type?: HTMLInputTypeAttribute;
  onChange?: () => void,
  multiline?: boolean
}

export const RegisteredTextInput = <T extends FieldValues>
  ({ register, name, label, required = false, errorMessage, autoComplete = "one-time-code", multiline = false,
    id = null, type = "text", onChange = () => { } }: RegisteredTextProps<T>) => {
  return (
    <>
      <TextField {...register(name)} label={label ?? name} id={id ?? name} type={type} onChange={onChange}
        required={required} error={!!errorMessage} autoComplete={autoComplete} multiline={multiline} fullWidth
      />
      {errorMessage && typeof errorMessage === "string" && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </>
  );
};
