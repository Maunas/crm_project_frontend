import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material"
import { useState } from "react";
import { ControlledCheckbox, ControlledGroupedCheckbox, ControlledNumber, ControlledRadio, ControlledSlider } from "../common/forms/ControlledInputs";
import { type Control, type UseFormRegister } from "react-hook-form";
import { AutocompleteLoader, ControlledAutocomplete } from "../common/forms/ControlledAutocomplete";
import type { NomenclatorItem } from "../../types/leadFields";
import type { Lead } from "../../types/leads";
import type { LeadPostData, LeadPostValueData } from "./LeadForm";

interface BasicFormInput {
    label?: string,
    name: string,
    required?: boolean
}
interface RegisterFormInput extends BasicFormInput {
    register: UseFormRegister<object>
}
interface ControlFormInput extends BasicFormInput {
    control: Control<object>
}

export const LeadFormPassword = ({ label, name, register, required = true }: RegisterFormInput) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput id={name} label={label} type={showPassword ? 'text' : 'password'}
                required={required}
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


interface LeadFormTextInput extends BasicFormInput {
    type?: string
}
export const LeadFormText = ({ label, register, name, type = "text", required=false }: LeadFormTextInput) => {
    if (["date", "datetime-local", "file"].includes(type)) return (
        <TextField id={name} label={label} fullWidth name={name} type={type} {...register(name)}
            slotProps={{ inputLabel: { shrink: true } }} required={required}/>
    )
    return (<TextField id={name} label={label} fullWidth name={name} type={type} {...register(name)}  required={required}/>)
}

export const LeadFormMoney = ({ label, register, name, required=false }: RegisterFormInput) => {
    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <OutlinedInput id={name} label={label} required={required}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                {...register(name)}
            />
        </FormControl>
    )
}

export const LeadFormBool = ({ label, control, name, required=false }: ControlFormInput) => {
    return (
        <FormControlLabel control={<ControlledCheckbox control={control} name={name} />} label={label} required={required}/>
    )
}

interface RatingProps extends ControlFormInput {
    leadField:object
}
export const LeadFormRating = ({ label, control, name, required=false, leadField }: RatingProps) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "STAR_RATING":
            return <ControlledSlider control={control} label={label} name={name} max={5} step={.5} type="rating" required={required} />
        case "NPS":
            return <ControlledSlider control={control} label={label} name={name} min={1} max={10} defaultValue={1} required={required} />
        case "SCORE":
            return <ControlledSlider control={control} label={label} name={name} min={0} max={100} required={required} />
    }
}

export const LeadFormNumber = ({ label, control, name, required=false }: ControlFormInput) => {
    return <ControlledNumber control={control} label={label} name={name} required={required} />
}

interface AddressProps extends RegisterFormInput {
    leadField:object
}
export const LeadFormAddress = ({ label, register, name, leadField, required=false }: AddressProps) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "MAPS_URL":
            return (<LeadFormText label={label} name={name} register={register} type="url" required={required}/>)
        default:
            return (<LeadFormText label={label} name={name} register={register} required={required}/>)
    }
}

interface LeadFormSelectorProps {
    label?: string,
    control: Control<LeadPostData>,
    name: string,
    leadField: LeadPostValueData,
    optionMap: Map<number, NomenclatorItem[]>,
    required?: boolean
}


export const LeadFormSelector = ({ label, control, name, leadField, optionMap, required=false }: LeadFormSelectorProps) => {

    const optionMapId = leadField.fieldData.nomenclator_id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return <AutocompleteLoader label={label} />

    return (
        <ControlledAutocomplete control={control} name={name} label={label} returnField="id"
            getOptionKey={option => option?.code} getOptionLabel={option => option?.value}
            optionList={optionMap.get(optionMapId)} required={required}
            multiple={leadField.fieldData.field_subtype_code === "SELECTOR_MULTIPLE"} />
    )

}

interface LeadFormLeadProps extends Omit<LeadFormSelectorProps, "optionMap"> {
    optionMap: Map<number, Lead[]>,
}
export const LeadFormRelatedLead = ({ label, control, name, leadField, optionMap, required = false }: LeadFormLeadProps) => {
    const optionMapId = leadField.fieldData.related_campaign_id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return <AutocompleteLoader label={label} />
    return (
        <ControlledAutocomplete control={control} name={name} label={label} returnField="id" required={required}
            getOptionLabel={(option) => `${option?.field_values?.[0].value} ${option?.field_values?.[1].value}`}
            optionList={optionMap.get(optionMapId)} />
    )
}



interface LeadFormCheckboxProps {
    label?: string,
    control: Control<LeadPostData>,
    name: string,
    leadField: LeadPostValueData,
    optionMap: Map<number, NomenclatorItem[]>,
    returnField?: string | null,
    required?: boolean
}
export const LeadFormCheckbox = ({ label, control, name, leadField, optionMap, returnField = null, required = false }: LeadFormCheckboxProps) => {
    const optionMapId = leadField?.fieldData?.nomenclator_id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return null

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_SIMPLE") return (
        <ControlledRadio control={control} name={name} options={optionMap.get(optionMapId)} label={label}
            keyField="id" returnField="id" radioLabel={option => option.value} required={required} />
    )

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_MULTIPLE") return (
        <ControlledGroupedCheckbox control={control} name={name} returnField={returnField} label={label} options={optionMap.get(optionMapId)}
            checkboxLabel={option => option.value} idField="id" row required={required} />
    )
}

