import { Grid } from "@mui/material"
import type { Control, UseFormRegister } from "react-hook-form"
import type { LeadPostData, LeadPostValueData } from "./LeadForm"
import { LeadFormAddress, LeadFormBool, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormText } from "./LeadFormFieldTypes"

interface LeadFormFieldProps {
    register: UseFormRegister<LeadPostData>,
    control: Control<LeadPostData>,
    idx: number,
    leadField: LeadPostValueData

}

export const LeadFormField = ({ register, control, idx, leadField }: LeadFormFieldProps) => {
    return (
        <Grid size="grow" alignItems="center" minWidth="20rem">
            <LeadFormFieldType register={register} idx={idx} control={control} leadField={leadField} />
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

    if (leadField.field_id === 45) console.log(leadField.fieldData.field_type_code)
    switch (leadField.fieldData.field_type_code) {
        case "URL":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="url" />)
        case "ADDRESS":
            return (<LeadFormAddress label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} leadField={leadField}/>)
        case "PHONE":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="tel" />)
        case "FILE":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="file" />)
        case "EMAIL":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="email" />)
        case "DATE":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="date" />)
        case "DATETIME":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="datetime-local" />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} />)
        case "RATING":
            return (<LeadFormRating label={leadField.fieldData.name} leadField={leadField} name={`values.${idx}.value`} control={control} />)
        case "MONEY":
            return (<LeadFormMoney label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} />)
        case "PASSWORD":
            return (<LeadFormPassword label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} />)
        case "BOOL":
            return (<LeadFormBool label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} />)
        default:
            return <LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} />
    }
}