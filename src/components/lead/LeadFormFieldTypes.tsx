import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Autocomplete, Box, Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Rating, Slider, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { ControlledCheckbox, ControlledGroupedCheckbox, ControlledNumber, ControlledRadio, ControlledSlider } from "../common/forms/ControlledInputs";
import { Controller, type Control } from "react-hook-form";
import NumberField, { NumberSpinner } from "../common/forms/NumberField";
import { AutocompleteLoader, ControlledAutocomplete, ControlledAutocompleteMultiple } from "../common/forms/ControlledAutocomplete";
import type { NomenclatorDetailed, NomenclatorItem } from "../../types/leadFields";
import type { Lead } from "../../types/leads";
import type { LeadPostData, LeadPostValueData } from "./LeadForm";

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

export const LeadFormText = ({ label, register, name, type = "text" }) => {
    if (["date", "datetime-local", "file"].includes(type)) return (
        <TextField id={name} label={label} fullWidth name={name} type={type} {...register(name)}
            slotProps={{ inputLabel: { shrink: true } }} />
    )
    return (<TextField id={name} label={label} fullWidth name={name} type={type} {...register(name)} />)
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
            return <ControlledSlider control={control} label={label} name={name} max={5} step={.5} type="rating" />
        case "NPS":
            return <ControlledSlider control={control} label={label} name={name} min={1} max={10} defaultValue={1} />
        case "SCORE":
            return <ControlledSlider control={control} label={label} name={name} min={0} max={100} />
    }
}

export const LeadFormNumber = ({ label, control, name }) => {
    return <ControlledNumber control={control} label={label} name={name} />
}

export const LeadFormAddress = ({ label, register, name, leadField }) => {
    switch (leadField.fieldData.field_subtype_code) {
        case "MAPS_URL":
            return (<LeadFormText label={label} name={name} register={register} type="url" />)
        default:
            return (<LeadFormText label={label} name={name} register={register} />)
    }
}

interface LeadFormSelectorProps {
    label?: string,
    control: Control<LeadPostData>,
    name: string,
    leadField: LeadPostValueData,
    optionMap: Map<number, NomenclatorItem[]>,
}


export const LeadFormSelector = ({ label, control, name, leadField, optionMap }: LeadFormSelectorProps) => {

    const optionMapId = leadField.fieldData.nomenclator_id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return <AutocompleteLoader label={label} />

    return (
        <ControlledAutocomplete control={control} name={name} label={label} returnField="id"
            getOptionKey={option => option?.code} getOptionLabel={option => option?.value}
            optionList={optionMap.get(optionMapId)}
            multiple={leadField.fieldData.field_subtype_code === "SELECTOR_MULTIPLE"} />
    )

}

interface LeadFormLeadProps extends Omit<LeadFormSelectorProps, "optionMap"> {
    optionMap: Map<number, Lead[]>,
}
export const LeadFormRelatedLead = ({ label, control, name, leadField, optionMap }: LeadFormLeadProps) => {
    const optionMapId = leadField.fieldData.related_campaign_id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return <AutocompleteLoader label={label} />
    return (
        <ControlledAutocomplete control={control} name={name} label={label} returnField="id"
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
    returnField?: string | null
}
export const LeadFormCheckbox = ({ label, control, name, leadField, optionMap, returnField = null }: LeadFormCheckboxProps) => {
    const optionMapId = leadField?.fieldData?.nomenclator_id
    if (!optionMap || !optionMapId || !optionMap.has(optionMapId)) return null

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_SIMPLE") return (
        <ControlledRadio control={control} name={name} options={optionMap.get(optionMapId)} label={label}
            keyField="id" returnField="id" radioLabel={option=>option.value}/>
    )

    if (leadField.fieldData.field_subtype_code === "CHECKBOX_MULTIPLE") return (
        <ControlledGroupedCheckbox control={control} name={name} returnField={returnField} label={label} options={optionMap.get(optionMapId)}
            checkboxLabel={option => option.value} idField="id" row/>
    )
}

