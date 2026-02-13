import { type Control, type UseFormRegister } from "react-hook-form"
import type { LeadPostData, LeadPostValueData } from "./LeadForm"
import {
    LeadFormAddress, LeadFormBool, LeadFormCheckbox, LeadFormFile, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormRelatedLead,
    LeadFormSelector, LeadFormText,
    LeadFormTextArea
} from "./LeadFormFieldTypes"
import type { Lead } from "../../types/leads"
import type { NomenclatorItem } from "../../types/leadFields"


interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadPostData>,
    control: Control<LeadPostData>,
    idx: number,
    leadField: LeadPostValueData,
    relatedLeads: Map<number, Lead[]>,
    selectors: Map<number, NomenclatorItem[]>,
    errorMessage?: string | null
}

export const LeadFormFieldType = ({ register, idx, control, leadField, relatedLeads, selectors, errorMessage = null }: LeadFormFieldTypeProps) => {

    const name = `values.${idx}.value`

    switch (leadField.fieldData.field_type_code) {
        case "LEAD":
            return (<LeadFormRelatedLead label={leadField.fieldData.name} name={name} control={control} optionMap={relatedLeads}
                leadField={leadField} required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "SELECTOR":
            return (<LeadFormSelector label={leadField.fieldData.name} name={name} control={control} optionMap={selectors}
                leadField={leadField} required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "CHECKBOX":
            return (<LeadFormCheckbox label={leadField.fieldData.name} name={name} control={control} optionMap={selectors}
                leadField={leadField} returnField="id" required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "URL":
            return (<LeadFormText label={leadField.fieldData.name} name={name} register={register} type="url"
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "ADDRESS":
            return (<LeadFormAddress label={leadField.fieldData.name} name={name} register={register} leadField={leadField}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "PHONE":
            return (<LeadFormText label={leadField.fieldData.name} name={name} register={register} type="tel"
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "EMAIL":
            return (<LeadFormText label={leadField.fieldData.name} name={name} register={register} type="email"
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "DATE":
            return (<LeadFormText label={leadField.fieldData.name} name={name} register={register} type="date"
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "DATE_TIME":
            return (<LeadFormText label={leadField.fieldData.name} name={name} register={register} type="datetime-local"
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={leadField.fieldData.name} name={name} control={control}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "RICH_TEXT":
            return (<LeadFormTextArea label={leadField.fieldData.name} name={name} register={register}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "RATING":
            return (<LeadFormRating label={leadField.fieldData.name} leadField={leadField} name={name} control={control}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "MONEY":
            return (<LeadFormMoney label={leadField.fieldData.name} name={name} register={register}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "PASSWORD":
            return (<LeadFormPassword label={leadField.fieldData.name} name={name} register={register}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        case "BOOL":
            return (<LeadFormBool label={leadField.fieldData.name} name={name} control={control} errorMessage={errorMessage} />)
        case "FILE":
            return (<LeadFormFile label={leadField.fieldData.name} name={name} register={register} leadField={leadField}
                required={leadField.fieldData.required} errorMessage={errorMessage} />)
        default:
            return <LeadFormText label={leadField.fieldData.name} name={name} register={register}
                required={leadField.fieldData.required} errorMessage={errorMessage} />
    }
}