import { FormControl, FormHelperText, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material"
import { ControlledCheckbox, ControlledNumber, ControlledSingleFile, ControlledSlider, PasswordField, SingleFileField } from "../common/forms/CustomInputs";
import { type Control, type UseFormRegister } from "react-hook-form";
import { AutocompleteLoader, ControlledAutocomplete, ControlledGroupedCheckbox, ControlledRadio } from "../common/forms/CustomMultipleInputs";
import type { LeadField, NomenclatorItem } from "../../types/leadFields";
import type { Lead } from "../../types/leads";
import type { LeadPostData, LeadPostValueData } from "./LeadForm";

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

export const LeadFormPassword = ({ label, name, register, required = true, errorMessage = null, autoComplete = "one-time-code" }: RegisterFormInput) => {
    return <PasswordField label={label} name={name} register={register} required={required} errorMessage={errorMessage} autoComplete={autoComplete} />
}

interface LeadFormTextInput extends RegisterFormInput {
    type?: string,
    autoComplete?: string,
    multiline?: boolean
}
export const LeadFormText = ({ label, register, name, type = "text", required = false, errorMessage = null, autoComplete = "one-time-code", multiline = false }: LeadFormTextInput) => {
    if (["date", "datetime-local"].includes(type)) return (
        <>
            <TextField id={name} label={label} fullWidth type={type} {...register(name)} autoComplete={autoComplete}
                slotProps={{ inputLabel: { shrink: true } }} required={required} error={!!errorMessage} />
            {errorMessage &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
            }
        </>)
    return (
        <>
            <TextField id={name} label={label} fullWidth type={multiline ? null : type} {...register(name)} required={required} error={!!errorMessage} autoComplete={autoComplete} multiline={multiline} />
            {errorMessage &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
            }
        </>)
}

interface FileProps extends RegisterFormInput {
    leadField: LeadPostValueData
}
export const LeadFormFile = ({ label, register, name, leadField, required = false, errorMessage = null, autoComplete = "one-time-code" }: FileProps) => {
    const subType = leadField.fieldData.field_subtype_code
    return (<>
        <SingleFileField id={name} label={label} register={register} name={name}
            errorMessage={errorMessage} required={required} autoComplete={autoComplete}
            accept={subType === "FILE_DOCUMENT" ? "" : "image/*"}
        />
    </>)
}

export const LeadFormAddress = ({ label, register, name, leadField, required = false, errorMessage = null, autoComplete = "one-time-code" }: FileProps) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "MAPS_URL":
            return (<LeadFormText label={label} name={name} register={register} type="url" required={required} errorMessage={errorMessage} autoComplete={autoComplete} />)
        default:
            return (<LeadFormText label={label} name={name} register={register} required={required} errorMessage={errorMessage} autoComplete={autoComplete} />)
    }
}

export const LeadFormTextArea = ({ label, register, name, required = false, errorMessage = null, autoComplete = "one-time-code" }: LeadFormTextInput) => {
    return (<LeadFormText label={label} name={name} register={register} required={required} multiline errorMessage={errorMessage} autoComplete={autoComplete} />)
}

export const LeadFormMoney = ({ label, register, name, required = false, errorMessage = null, autoComplete = "one-time-code" }: LeadFormTextInput) => {
    return (
        <FormControl fullWidth required={required} error={!!errorMessage}>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput id={name} label={label} autoComplete={autoComplete}
                {...register(name)}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
            {errorMessage &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errorMessage}</FormHelperText>
            }
        </FormControl>
    )
}

export const LeadFormBool = ({ label, control, name, required = false, errorMessage = null }: ControlFormInput) => {
    return <ControlledCheckbox control={control} name={name} label={label} errorMessage={errorMessage} required={required} />
}

interface RatingProps extends ControlFormInput {
    leadField: object
}
export const LeadFormRating = ({ label, control, name, required = false, leadField, errorMessage = null }: RatingProps) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "STAR_RATING":
            return <ControlledSlider control={control} label={label} name={name} max={5} step={.5} type="rating" required={required} errorMessage={errorMessage} />
        case "NPS":
            return <ControlledSlider control={control} label={label} name={name} min={1} max={10} defaultValue={1} required={required} errorMessage={errorMessage} />
        case "SCORE":
            return <ControlledSlider control={control} label={label} name={name} min={0} max={100} required={required} errorMessage={errorMessage} />
    }
}

export const LeadFormNumber = ({ label, control, name, required = false, errorMessage = null }: ControlFormInput) => {
    return <ControlledNumber control={control} label={label} name={name} required={required} errorMessage={errorMessage} />
}

interface LeadFormSelectorProps extends ControlFormInput {
    leadField: LeadPostValueData,
    optionMap: Map<number, NomenclatorItem[]>,
    autoComplete?: string
}

export const LeadFormSelector = ({ label, name, control, required = false, errorMessage = null, leadField, optionMap, autoComplete = "one-time-code" }: LeadFormSelectorProps) => {
    const optionMapId = leadField?.fieldData?.nomenclator_id ?? leadField?.fieldData?.nomenclator?.id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return <AutocompleteLoader label={label} />

    return (
        <ControlledAutocomplete control={control} name={name} label={label} returnField="id" autoComplete={autoComplete}
            getOptionKey={option => option?.code} getOptionLabel={option => option?.value}
            options={optionMap.get(optionMapId)} required={required} errorMessage={errorMessage}
            multiple={leadField.fieldData.field_subtype_code === "SELECTOR_MULTIPLE"} />
    )

}

interface LeadFormCheckboxProps extends LeadFormSelectorProps {
    returnField?: string | null,
}
export const LeadFormCheckbox = ({ label, name, control, required = false, errorMessage = null, leadField, optionMap, returnField = null }: LeadFormCheckboxProps) => {
    const optionMapId = leadField?.fieldData?.nomenclator_id ?? leadField?.fieldData?.nomenclator?.id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return null

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_SIMPLE") return (
        <ControlledRadio control={control} name={name} options={optionMap.get(optionMapId)} label={label} int
            keyField="id" returnField="id" radioLabel={option => option.value} required={required} errorMessage={errorMessage} />
    )

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_MULTIPLE") return (
        <ControlledGroupedCheckbox control={control} name={name} returnField={returnField} label={label} options={optionMap.get(optionMapId)}
            checkboxLabel={option => option.value} idField="id" row required={required} errorMessage={errorMessage} />
    )
}

interface LeadFormLeadProps extends Omit<LeadFormSelectorProps, "optionMap"> {
    optionMap: Map<number, Lead[]>,
}
export const LeadFormRelatedLead = ({ label, name, control, required = false, errorMessage = null, leadField, optionMap, autoComplete = "one-time-code" }: LeadFormLeadProps) => {
    const optionMapId = leadField.fieldData.related_campaign_id ?? leadField?.fieldData?.related_campaign?.id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return <AutocompleteLoader label={label} />
    return (
        <ControlledAutocomplete control={control} name={name} label={label} returnField="id" autoComplete={autoComplete}
            getOptionLabel={(option) => `${option?.field_values?.[0].value} ${option?.field_values?.[1].value}`}
            options={optionMap.get(optionMapId)} required={required} errorMessage={errorMessage} />
    )
}