import { type Control, type UseFormRegister } from "react-hook-form"
import type { LeadPostData, LeadPostValueData } from "./LeadForm"
import { LeadFormAddress, LeadFormBool, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormSelector, LeadFormText } from "./LeadFormFieldTypes"
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
            return (<LeadFormSelector label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} optionMap={relatedLeads} leadField={leadField} />)
        case "SELECTOR": case "CHECKBOX":
            return (<LeadFormSelector label={leadField.fieldData.name} name={`values.${idx}.value`} control={control} optionMap={selectors} leadField={leadField} />)
        case "URL":
            return (<LeadFormText label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} type="url" />)
        case "ADDRESS":
            return (<LeadFormAddress label={leadField.fieldData.name} name={`values.${idx}.value`} register={register} leadField={leadField} />)
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