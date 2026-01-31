import { Grid, TextField, Typography } from "@mui/material"
import type { Control, UseFormRegister } from "react-hook-form"
import type { LeadPostData, LeadPostValueData } from "./LeadForm"
import { useState } from "react"
import { LeadFormBool, LeadFormDefault, LeadFormMoney, LeadFormPassword, LeadFormRating } from "./LeadFormFieldTypes"

interface LeadFormFieldProps {
    register: UseFormRegister<LeadPostData>,
    control: Control<LeadPostData>,
    idx: number,
    leadField: LeadPostValueData

}

export const LeadFormField = ({ register, control, idx, leadField }: LeadFormFieldProps) => {
    return (
        <Grid size={6} container spacing={2}>
            <Grid size={2} >
                <TextField
                    id={`values.${idx}.field_id`}
                    label="Id"
                    fullWidth
                    {...register(`values.${idx}.field_id`)}
                    value={leadField.fieldData.id}
                    disabled
                />
            </Grid>
            <Grid size="grow" minWidth="20rem">
                <LeadFormFieldType register={register} idx={idx} control={control} leadField={leadField} />
                <Typography color="initial">{leadField.fieldData.field_template_code && `${leadField.fieldData.field_template_code} - `}{leadField.fieldData.field_type_code}</Typography>
            </Grid>
        </Grid>
    )
}

interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadPostData>,
    control: Control<LeadPostData>,
    idx: number,
    leadField: LeadPostValueData

}
export const LeadFormFieldType = ({ register, idx, control, leadField }: LeadFormFieldTypeProps) => {


    switch (leadField.fieldData.field_type_code) {
        case "RATING":
            return (<LeadFormRating label={leadField.fieldData.name} leadField={leadField} name={`values.${idx}.value`} control={control} />)
        
        case "MONEY":
            return (<LeadFormMoney label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} />)
        case "PASSWORD":
            return (<LeadFormPassword label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} />)
        case "BOOL":
            return (<LeadFormBool label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} />)
        default:
            return <LeadFormDefault label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} />
    }
}