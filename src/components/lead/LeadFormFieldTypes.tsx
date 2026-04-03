import { ControlledNumber, ControlledSlider, ControlledSwitch, PasswordField, SingleFileField } from "../common/forms/CustomInputs";
import { AutocompleteLoader, ControlledAutocomplete, ControlledGroupedCheckbox, ControlledRadio } from "../common/forms/CustomMultipleInputs";
import type { LeadPostFormValues } from "./LeadForm";
import { FormErrorMessage } from "../../theme/styledMUIFormComponents";
import type { Lead } from "../../types/leads";
import type { NomenclatorItem } from "../../types/nomenclators";
import { type Control, type FieldValues, type Path, type UseFormRegister } from "react-hook-form";
import dayjs from "dayjs";
import { FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material"

interface BasicFormInput<T extends FieldValues> {
    label?: string,
    name: Path<T>,
    required?: boolean,
    errorMessage?: string,
    autoComplete?: string
    size?: "small" | "medium"
}
interface RegisterFormInput<T extends FieldValues> extends BasicFormInput<T> {
    register: UseFormRegister<T>
}
interface ControlFormInput<T extends FieldValues> extends BasicFormInput<T> {
    control: Control<T>,
}

export const LeadFormPassword = <T extends FieldValues>
    ({ register, name, label, required = true, size = "medium", errorMessage, autoComplete = "one-time-code" }: RegisterFormInput<T>) => {
    return (
        <PasswordField register={register} name={name} label={label} size={size}
            required={required} errorMessage={errorMessage} autoComplete={autoComplete} />)
}

interface LeadFormTextInput<T extends FieldValues> extends RegisterFormInput<T> {
    type?: string,
    autoComplete?: string,
    multiline?: boolean
}
export const LeadFormText = <T extends FieldValues>
    ({ register, name, label, type = "text", required = false, size = "medium", errorMessage, autoComplete = "one-time-code", multiline = false }: LeadFormTextInput<T>) => {
    if (type === "date") return (
        <>
            <TextField {...register(name, { setValueAs: (value) => `${dayjs(value).format("YYYY-MM-DD")}` })}
                label={label} id={name} type={type} required={required} error={!!errorMessage} size={size}
                autoComplete={autoComplete} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </>)
    if (type === "datetime-local") return (
        <>
            <TextField {...register(name, { setValueAs: (value) => `${dayjs(value).format("YYYY-MM-DD HH:mm:ss")}` })}
                label={label} id={name} type={type} required={required} error={!!errorMessage} size={size}
                autoComplete={autoComplete} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </>)
    return (
        <>
            <TextField {...register(name)} label={label} id={name} type={multiline ? undefined : type} multiline={multiline}
                required={required} error={!!errorMessage} autoComplete={autoComplete} size={size} fullWidth />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </>)
}

export const LeadFormFile = <T extends FieldValues>
    ({ register, name, label, required = false, size = "medium", errorMessage, autoComplete = "one-time-code" }: RegisterFormInput<T>) => {
    return (
        <SingleFileField register={register} name={name} label={label} id={name} size={size}
            required={required} errorMessage={errorMessage} autoComplete={autoComplete} />
    )
}

interface RegPropWithLeadField<T extends FieldValues> extends RegisterFormInput<T> {
    leadField: LeadPostFormValues
}
export const LeadFormAddress = <T extends FieldValues>
    ({ register, name, label, leadField, required = false, size = "medium", errorMessage, autoComplete = "one-time-code" }: RegPropWithLeadField<T>) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "MAPS_URL":
            return (<LeadFormText register={register} name={name} label={label} size={size}
                required={required} errorMessage={errorMessage} autoComplete={autoComplete}
                type="url" />)
        default:
            return (<LeadFormText register={register} name={name} label={label} size={size}
                required={required} errorMessage={errorMessage} autoComplete={autoComplete} />)
    }
}

export const LeadFormMoney = <T extends FieldValues>
    ({ register, name, label, required = false, size = "medium", errorMessage, autoComplete = "one-time-code" }: LeadFormTextInput<T>) => {
    return (
        <FormControl required={required} error={!!errorMessage} fullWidth>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput {...register(name)} size={size}
                id={name} label={label} autoComplete={autoComplete}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </FormControl>
    )
}

export const LeadFormBool = <T extends FieldValues>
    ({ label, control, name, required = false, size = "medium", errorMessage }: ControlFormInput<T>) => {
    return <FormControl variant="outlined" fullWidth>
        <OutlinedInput fullWidth sx={{ p: size === "medium" ? ".5rem 1rem" : "0 .5rem", cursor: "default" }}
            inputComponent={() => <ControlledSwitch control={control} name={name} label={label} errorMessage={errorMessage} required={required} />}
        />
    </FormControl>

}

interface CtlPropsWithLeadField<T extends FieldValues> extends ControlFormInput<T> {
    field_subtype_code: string
}
export const LeadFormRating = <T extends FieldValues>
    ({ control, name, label, field_subtype_code, required = false, errorMessage, size = "medium" }: CtlPropsWithLeadField<T>) => {
    switch (field_subtype_code) {
        case "STAR_RATING":
            return <ControlledSlider control={control} name={name} label={label} required={required} errorMessage={errorMessage} max={5} step={.5} type="rating" size={size} />
        case "NPS":
            return <ControlledSlider control={control} name={name} label={label} required={required} errorMessage={errorMessage} min={1} max={10} defaultValue={1} size={size} />
        case "SCORE":
            return <ControlledSlider control={control} name={name} label={label} required={required} errorMessage={errorMessage} min={0} max={100} size={size} />
    }
}

export const LeadFormNumber = <T extends FieldValues>
    ({ control, name, label, required = false, size="medium", errorMessage }: ControlFormInput<T>) => {
    return <ControlledNumber control={control} label={label} name={name} required={required} errorMessage={errorMessage} size={size} />
}

interface LeadFormSelectorProps<T extends FieldValues> extends ControlFormInput<T> {
    leadField: LeadPostFormValues,
    optionMap: Map<number, NomenclatorItem[]>,
    autoComplete?: string
}

export const LeadFormSelector = <T extends FieldValues>
    ({ label, name, control, required = false, size="medium", errorMessage, leadField, optionMap, autoComplete = "one-time-code" }: LeadFormSelectorProps<T>) => {

    const optionMapId = leadField?.fieldData?.nomenclator_id

    if (optionMap && optionMapId && optionMap.has(optionMapId)) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={optionMap.get(optionMapId)!} returnField="id"
                getOptionLabel={option => option.value!} getOptionKey={option => `${option.id}`}
                required={required} errorMessage={errorMessage} autocomplete={autoComplete} size={size}
                multiple={leadField.fieldData.field_subtype_code === "SELECTOR_MULTIPLE"} />
        )
    }
    else return <AutocompleteLoader label={label} />
}

interface LeadFormLeadProps<T extends FieldValues> extends Omit<LeadFormSelectorProps<T>, "optionMap"> {
    optionMap: Map<number, Lead[]>,
}
export const LeadFormRelatedLead = <T extends FieldValues>
    ({ control, name, label, optionMap, leadField, required = false, size="medium", errorMessage, autoComplete = "one-time-code" }: LeadFormLeadProps<T>) => {

    const optionMapId = leadField.fieldData.related_campaign_id

    if (optionMap && optionMapId && optionMap.has(optionMapId)) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={optionMap.get(optionMapId)!} returnField="id"
                getOptionLabel={option => `${option?.field_values?.[0].value} ${option?.field_values?.[1].value}`} size={size}
                getOptionKey={option => `${option?.id}`} required={required} errorMessage={errorMessage} autocomplete={autoComplete} multiple />
        )
    }
    return <AutocompleteLoader label={label} />
}

interface LeadFormCheckboxProps<T extends FieldValues> extends ControlFormInput<T> {
    leadField: LeadPostFormValues,
    optionMap: Map<number, NomenclatorItem[]>,
    autoComplete?: string,
    returnField: keyof NomenclatorItem
}
export const LeadFormCheckbox = <T extends FieldValues>
    ({ control, label, name, required = false, size="medium", errorMessage, leadField, optionMap, returnField }: LeadFormCheckboxProps<T>) => {

    const optionMapId = leadField?.fieldData?.nomenclator_id

    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return null

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_SIMPLE") return (

        <FormControl variant="outlined" fullWidth>
            <InputLabel shrink>{label}</InputLabel>
            <OutlinedInput fullWidth sx={{ p: size === "medium" ? ".5rem 1rem" : "0 .5rem", cursor: "default" }}
                notched label={label}
                inputComponent={() => (
                    <ControlledRadio control={control} name={name} options={optionMap.get(optionMapId)!}
                        keyField="id" returnField={returnField} isReturnInt getRadioLabel={option => option.value!}
                        required={required} errorMessage={errorMessage} />
                )}
            />
        </FormControl>

    )

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_MULTIPLE") return (
        <FormControl variant="outlined" fullWidth>
            <InputLabel shrink>{label}</InputLabel>
            <OutlinedInput fullWidth sx={{ p: size === "medium" ? ".5rem 1rem" : "0 .5rem", cursor: "default" }}
                notched label={label}
                inputComponent={() => <ControlledGroupedCheckbox control={control} name={name} options={optionMap.get(optionMapId)!}
                    returnField="id" keyField={returnField} getCheckboxLabel={option => option.value!}
                    required={required} errorMessage={errorMessage} row />}
            />
        </FormControl>

    )
}
