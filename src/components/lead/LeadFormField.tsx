import { type Control, type UseFormRegister } from "react-hook-form"
import type { LeadPostData, LeadPostValueData } from "./LeadForm"
import { LeadFormAddress, LeadFormBool, LeadFormCheckbox, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormRelatedLead, LeadFormSelector, LeadFormText } from "./LeadFormFieldTypes"
import type { Lead } from "../../types/leads"
import type { NomenclatorItem } from "../../types/leadFields"


interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadPostData>,
    control: Control<LeadPostData>,
    idx: number,
    leadField: LeadPostValueData,
    relatedLeads: Map<number, Lead[]>,
    selectors: Map<number, NomenclatorItem[]>
}

export const LeadFormFieldType = ({ register, idx, control, leadField, relatedLeads, selectors }: LeadFormFieldTypeProps) => {
    switch (leadField.fieldData.field_type_code) {
        case "LEAD":
            return (<LeadFormRelatedLead label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} optionMap={relatedLeads} leadField={leadField} required={leadField.fieldData.required}/>)
        case "SELECTOR":
            return (<LeadFormSelector label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} optionMap={selectors} leadField={leadField} required={leadField.fieldData.required}/>)
        case "CHECKBOX":
            return (<LeadFormCheckbox label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} optionMap={selectors} leadField={leadField} returnField="id" required={leadField.fieldData.required}/>)
        case "URL":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="url" required={leadField.fieldData.required}/>)
        case "ADDRESS":
            return (<LeadFormAddress label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} leadField={leadField} required={leadField.fieldData.required}/>)
        case "PHONE":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="tel" required={leadField.fieldData.required}/>)
        case "FILE":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="file" required={leadField.fieldData.required}/>)
        case "EMAIL":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="email" required={leadField.fieldData.required}/>)
        case "DATE":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="date" required={leadField.fieldData.required}/>)
        case "DATETIME":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="datetime-local" required={leadField.fieldData.required}/>)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} required={leadField.fieldData.required}/>)
        case "RATING":
            return (<LeadFormRating label={leadField.fieldData.name} leadField={leadField} name={`values.${idx}.value`} control={control} required={leadField.fieldData.required}/>)
        case "MONEY":
            return (<LeadFormMoney label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} required={leadField.fieldData.required}/>)
        case "PASSWORD":
            return (<LeadFormPassword label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} required={leadField.fieldData.required}/>)
        case "BOOL":
            return (<LeadFormBool label={leadField.fieldData.name} name={`values.${idx}.value`} control={control}/>)
        default:
            return <LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} required={leadField.fieldData.required}/>
    }
}