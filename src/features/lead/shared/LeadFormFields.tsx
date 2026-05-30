import type { ReactNode } from "react";
import { ControlledNumber, ControlledSlider, ControlledSwitch, PasswordField, RegisteredTextInput, SingleFileField } from "shared/ui/forms/CustomInputs";
import { FormErrorMessage } from "shared/ui/forms/FormFeedback";
import { formatDate } from "src/utils/formatters";
import { type Control, type FieldValues, type Path, type UseFormRegister } from "react-hook-form";
import { Stack, TextField, useColorScheme } from "@mui/material"
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';

interface BasicFormInput<T extends FieldValues> {
    name: Path<T>,
    label?: string,
    size?: "small" | "medium"
    required?: boolean,
    errorMessage?: string,
}
interface RegisterFormInput<T extends FieldValues> extends BasicFormInput<T> {
    register: UseFormRegister<T>
}
interface ControlFormInput<T extends FieldValues> extends BasicFormInput<T> {
    control: Control<T>,
}

interface LeadFormTextInput<T extends FieldValues> extends RegisterFormInput<T> {
    subtype?: string,
}

const TEXT_INPUT_TYPE = {
    STRING: "text",
    SIMPLE_ADDRESS: "text",
    COORDINATES: "text",
    EMAIL: "email",
    WHATSAPP: "tel",
    MOBILE: "tel",
    PHONE: "tel",
    LANDLINE: "tel",
    URL: "url",
    WEBSITE: "url",
    SOCIAL_MEDIA: "url",
    MAPS_URL: "url",
}

export const LeadFormText = <T extends FieldValues>
    ({ register, name, label, subtype, required = false, size = "medium", errorMessage }: LeadFormTextInput<T>) => {

    const commonTextSubtype = (subtype ?? "STRING") as keyof typeof TEXT_INPUT_TYPE

    switch (subtype) {
        case "PASSWORD":
            return <LeadFormPassword register={register} name={name} label={label}
                size={size} required={required} errorMessage={errorMessage} />
        case "HTML": case "MARKDOWN":
            return <RegisteredTextInput register={register} name={name} label={label} id={name} type={undefined}
                size={size} required={required} errorMessage={errorMessage} autoComplete="one-time-code" multiline />
        default:
            return <RegisteredTextInput register={register} name={name} label={label} id={name} type={TEXT_INPUT_TYPE[commonTextSubtype]}
                size={size} required={required} errorMessage={errorMessage} autoComplete="one-time-code" />
    }
}


export const LeadFormPassword = <T extends FieldValues>
    ({ register, name, label, required = true, size = "medium", errorMessage }: RegisterFormInput<T>) => {
    return (
        <PasswordField register={register} name={name} label={label} size={size}
            required={required} errorMessage={errorMessage} autoComplete="one-time-code" />)
}

export const LeadFormFile = <T extends FieldValues>
    ({ register, name, label, required = false, size = "medium", errorMessage }: RegisterFormInput<T>) => {
    return (
        <SingleFileField register={register} name={name} label={label} id={name} size={size}
            required={required} errorMessage={errorMessage} autoComplete="one-time-code" />
    )
}

export const LeadFormBool = <T extends FieldValues>
    ({ label, control, name, required = false, size = "medium", errorMessage }: ControlFormInput<T>) => {
    return <Stack direction="row" sx={{ p: size === "medium" ? ".5rem 1rem" : "0 .5rem", cursor: "default" }}>
        <ControlledSwitch control={control} name={name} label={label} errorMessage={errorMessage} required={required} />
    </Stack>
}

interface LeadFormNumberInput<T extends FieldValues> extends BasicFormInput<T> {
    control: Control<T>,
    subtype?: string
}

export const LeadFormNumber = <T extends FieldValues>
    ({ control, name, label, subtype, required = false, size = "medium", errorMessage }: LeadFormNumberInput<T>) => {

    switch (subtype) {
        case "NUMBER":
            return <ControlledNumber control={control} name={name} label={label} step={.01}
                required={required} size={size} errorMessage={errorMessage} />
        case "MONEY":
            return <LeadFormSpecialNumber control={control} name={name} label={label} startAdornment={<AttachMoneyIcon fontSize={size} />}
                required={required} size={size} errorMessage={errorMessage} />
        case "PERCENTAGE":
            return <LeadFormSpecialNumber control={control} name={name} label={label} endAdornment={<PercentIcon fontSize={size} />}
                required={required} size={size} errorMessage={errorMessage} />
        case "STAR_RATING":
        case "NPS":
        case "SCORE":
            return <LeadFormRating control={control} name={name} subtype={subtype} label={label}
                required={required} size="small" errorMessage={errorMessage} />

        default: //INT
            return <ControlledNumber control={control} name={name} label={label} step={1}
                required={required} size={size} errorMessage={errorMessage} />
    }

}
interface LeadFormSpecialNumber<T extends FieldValues> extends ControlFormInput<T> {
    startAdornment?: ReactNode,
    endAdornment?: ReactNode
}
export const LeadFormSpecialNumber = <T extends FieldValues>
    ({ control, name, label, required = false, size = "medium", startAdornment, endAdornment, errorMessage }: LeadFormSpecialNumber<T>) => {
    return (
        <ControlledNumber control={control} name={name} label={label} step={.01}
            required={required} size={size} errorMessage={errorMessage}
            startAdornment={startAdornment} endAdornment={endAdornment} />
    )
}

interface LeadFormRating<T extends FieldValues> extends ControlFormInput<T> {
    subtype: string
}
export const LeadFormRating = <T extends FieldValues>
    ({ control, name, label, subtype, required = false, errorMessage, size = "small" }: LeadFormRating<T>) => {
    switch (subtype) {
        case "STAR_RATING":
            return <ControlledSlider control={control} name={name} label={label} required={required}
                size={size} min={0} max={5} step={.5} type="rating" errorMessage={errorMessage} />
        case "NPS":
            return <ControlledSlider control={control} name={name} label={label} required={required}
                size={size} min={1} max={10} step={.1} defaultValue={1} errorMessage={errorMessage} />
        case "SCORE":
            return <ControlledSlider control={control} name={name} label={label} required={required}
                size={size} min={0} max={100} step={.1} errorMessage={errorMessage} />
    }
}

interface LeadFormDateInput<T extends FieldValues> extends RegisterFormInput<T> {
    type?: string,
    autoComplete?: string,
    multiline?: boolean,
    subtype?: string
}
const DATE_INPUT_TYPE = {
    DATE_TIME: { type: "datetime-local", format: "YYYY-MM-DD HH:mm:ss" },
    DATE_EVENT: { type: "datetime-local", format: "YYYY-MM-DD HH:mm:ss" },
    TIME_ONLY: { type: "time", format: "HH:mm:ss" },
    DATE_ONLY: { type: "date", format: "YYYY-MM-DD" },
    BIRTH_DATE: { type: "date", format: "YYYY-MM-DD" },
}
export const LeadFormDate = <T extends FieldValues>
    ({ register, name, label, subtype, required = false, size = "medium", errorMessage }: LeadFormDateInput<T>) => {

    const { mode } = useColorScheme();
    if (!subtype) return
    const subtypeCode = subtype as keyof typeof DATE_INPUT_TYPE

    return <>
        <TextField {...register(name, { setValueAs: (value) => formatDate(value, "custom", DATE_INPUT_TYPE[subtypeCode].format) })}
            label={label} id={name} type={DATE_INPUT_TYPE[subtypeCode].type} required={required} size={size}
            autoComplete="one-time-code" error={!!errorMessage} fullWidth
            slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                    sx: {
                        '&::-webkit-calendar-picker-indicator': {
                            filter: mode === "dark" ? 'invert(1)' : "none",  // negro → blanco
                        },
                    },
                    step: 1
                },
            }} />
        {errorMessage &&
            <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </>
}