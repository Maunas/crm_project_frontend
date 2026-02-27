import { ControlledCheckbox, ControlledNumber, ControlledSlider, PasswordField, SingleFileField } from "../common/forms/CustomInputs";
import { AutocompleteLoader, ControlledAutocomplete, ControlledGroupedCheckbox, ControlledRadio } from "../common/forms/CustomMultipleInputs";
import type { LeadPostValueData } from "./LeadForm";
import type { Lead } from "../../types/leads";
import type { NomenclatorItem } from "../../types/leadFields";
import { type Control, type FieldValues, type Path, type UseFormRegister } from "react-hook-form";
import dayjs from "dayjs";
import { FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents";

interface BasicFormInput<T extends FieldValues> {
    label?: string,
    name: Path<T>,
    required?: boolean,
    errorMessage?: string,
    autoComplete?: string
}
interface RegisterFormInput<T extends FieldValues> extends BasicFormInput<T> {
    register: UseFormRegister<T>
}
interface ControlFormInput<T extends FieldValues> extends BasicFormInput<T> {
    control: Control<T>
}

export const LeadFormPassword = <T extends FieldValues>
    ({ register, name, label, required = true, errorMessage, autoComplete = "one-time-code" }: RegisterFormInput<T>) => {
    return (
        <PasswordField register={register} name={name} label={label}
            required={required} errorMessage={errorMessage} autoComplete={autoComplete} />)
}

interface LeadFormTextInput<T extends FieldValues> extends RegisterFormInput<T> {
    type?: string,
    autoComplete?: string,
    multiline?: boolean
}
export const LeadFormText = <T extends FieldValues>
    ({ register, name, label, type = "text", required = false, errorMessage, autoComplete = "one-time-code", multiline = false }: LeadFormTextInput<T>) => {
    if (type === "date") return (
        <>
            <TextField {...register(name, { setValueAs: (value) => `${dayjs(value).format("YYYY-MM-DD")}` })}
                label={label} id={name} type={type} required={required} error={!!errorMessage}
                autoComplete={autoComplete} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </>)
    if (type === "datetime-local") return (
        <>
            <TextField {...register(name, { setValueAs: (value) => `${dayjs(value).format("YYYY-MM-DD HH:mm:ss")}` })}
                label={label} id={name} type={type} required={required} error={!!errorMessage}
                autoComplete={autoComplete} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </>)
    return (
        <>
            <TextField {...register(name)} label={label} id={name} type={multiline ? undefined : type} multiline={multiline}
                required={required} error={!!errorMessage} autoComplete={autoComplete} fullWidth />
            {errorMessage &&
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            }
        </>)
}

export const LeadFormFile = <T extends FieldValues>
    ({ register, name, label, required = false, errorMessage, autoComplete = "one-time-code" }: RegisterFormInput<T>) => {
    return (
        <SingleFileField register={register} name={name} label={label} id={name}
            required={required} errorMessage={errorMessage} autoComplete={autoComplete} />
    )
}

interface RegPropWithLeadField<T extends FieldValues> extends RegisterFormInput<T> {
    leadField: LeadPostValueData
}
export const LeadFormAddress = <T extends FieldValues>
    ({ register, name, label, leadField, required = false, errorMessage, autoComplete = "one-time-code" }: RegPropWithLeadField<T>) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "MAPS_URL":
            return (<LeadFormText register={register} name={name} label={label} required={required} errorMessage={errorMessage} autoComplete={autoComplete} type="url" />)
        default:
            return (<LeadFormText register={register} name={name} label={label} required={required} errorMessage={errorMessage} autoComplete={autoComplete} />)
    }
}

export const LeadFormMoney = <T extends FieldValues>
    ({ register, name, label, required = false, errorMessage, autoComplete = "one-time-code" }: LeadFormTextInput<T>) => {
    return (
        <FormControl required={required} error={!!errorMessage} fullWidth>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput {...register(name)}
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
    ({ label, control, name, required = false, errorMessage }: ControlFormInput<T>) => {
    return <ControlledCheckbox control={control} name={name} label={label} errorMessage={errorMessage} required={required} />
}

interface CtlPropsWithLeadField<T extends FieldValues> extends ControlFormInput<T> {
    leadField: LeadPostValueData
}
export const LeadFormRating = <T extends FieldValues>
    ({ control, name, label, leadField, required = false, errorMessage }: CtlPropsWithLeadField<T>) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "STAR_RATING":
            return <ControlledSlider control={control} name={name} label={label} required={required} errorMessage={errorMessage} max={5} step={.5} type="rating" />
        case "NPS":
            return <ControlledSlider control={control} name={name} label={label} required={required} errorMessage={errorMessage} min={1} max={10} defaultValue={1} />
        case "SCORE":
            return <ControlledSlider control={control} name={name} label={label} required={required} errorMessage={errorMessage} min={0} max={100} />
    }
}

export const LeadFormNumber = <T extends FieldValues>
    ({ control, name, label, required = false, errorMessage }: ControlFormInput<T>) => {
    return <ControlledNumber control={control} label={label} name={name} required={required} errorMessage={errorMessage} />
}

interface LeadFormSelectorProps<T extends FieldValues> extends ControlFormInput<T> {
    leadField: LeadPostValueData,
    optionMap: Map<number, NomenclatorItem[]>,
    autoComplete?: string
}

export const LeadFormSelector = <T extends FieldValues>
    ({ label, name, control, required = false, errorMessage, leadField, optionMap, autoComplete = "one-time-code" }: LeadFormSelectorProps<T>) => {

    const optionMapId = leadField?.fieldData?.nomenclator_id

    if (optionMap && optionMapId && optionMap.has(optionMapId)) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={optionMap.get(optionMapId)!} returnField="id"
                getOptionLabel={option => option?.value} getOptionKey={option => option?.code}
                required={required} errorMessage={errorMessage} autocomplete={autoComplete}
                multiple={leadField.fieldData.field_subtype_code === "SELECTOR_MULTIPLE"} />
        )
    }
    else return <AutocompleteLoader label={label} />
}

interface LeadFormLeadProps<T extends FieldValues> extends Omit<LeadFormSelectorProps<T>, "optionMap"> {
    optionMap: Map<number, Lead[]>,
}
export const LeadFormRelatedLead = <T extends FieldValues>
    ({ control, name, label, optionMap, leadField, required = false, errorMessage, autoComplete = "one-time-code" }: LeadFormLeadProps<T>) => {

    const optionMapId = leadField.fieldData.related_campaign_id

    if (optionMap && optionMapId && optionMap.has(optionMapId)) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={optionMap.get(optionMapId)!} returnField="id"
                getOptionLabel={option => `${option?.field_values?.[0].value} ${option?.field_values?.[1].value}`}
                getOptionKey={option => `${option?.id}`} required={required} errorMessage={errorMessage} autocomplete={autoComplete} multiple />
        )
    }
    return <AutocompleteLoader label={label} />
}

interface LeadFormCheckboxProps<T extends FieldValues> extends ControlFormInput<T> {
    leadField: LeadPostValueData,
    optionMap: Map<number, NomenclatorItem[]>,
    autoComplete?: string,
    returnField: keyof T
}
export const LeadFormCheckbox = <T extends FieldValues>
    ({ label, name, control, required = false, errorMessage, leadField, optionMap, returnField }: LeadFormCheckboxProps<T>) => {

    const optionMapId = leadField?.fieldData?.nomenclator_id

    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return null

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_SIMPLE") return (
        <ControlledRadio control={control} name={name} label={label} options={optionMap.get(optionMapId)!}
            keyField="id" returnField={returnField} isReturnInt getRadioLabel={option => option.value}
            required={required} errorMessage={errorMessage} />
    )

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_MULTIPLE") return (
        <ControlledGroupedCheckbox control={control} name={name} label={label} options={optionMap.get(optionMapId)!}
            returnField="id" keyField={returnField} getCheckboxLabel={option => option.value}
            required={required} errorMessage={errorMessage} row />
    )
}
