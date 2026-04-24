import { Grid, IconButton, ListItem } from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import CloseIcon from "@mui/icons-material/Close"
import type { LeadFieldDetailed, LeadFieldValueDetailed } from "../../../types/leadFields"
import { useForm, type Control, type UseFormRegister } from "react-hook-form"
import { FormErrorMessage } from "../../common/forms/StyledFormComponents"
import type { LeadPostForm } from "../leadForm/LeadForm"
import { createFormDataFromLead, getLeads, getSelectorField, updateLead } from "../leadService"
import { setFormErrors } from "../../../generalService"
import type { Lead, LeadDetailed } from "../../../types/leads"
import { LeadFormAddress, LeadFormBool, LeadFormCheckbox, LeadFormFile, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormRelatedLead, LeadFormSelector, LeadFormText } from "../leadForm/LeadFormFieldTypes"
import { useEffect, useState } from "react"
import type { NomenclatorItem } from "../../../types/nomenclators"
import { getNomenclatorItems } from "../../nomenclators/nomenclatorService"

interface LeadPartialUpdateProps {
    fieldValue: LeadFieldValueDetailed,
    onClose: () => void,
    lead: LeadDetailed,
    updateLeadInfo: (lead: LeadDetailed) => void
}

const getUpdatedLead = (oldLead: LeadDetailed, fieldId: number, newLead: Lead) => {
    const newValueIdx = newLead.field_values.findIndex(fv => fv.field.id === fieldId)
    if (newValueIdx === -1) return null
    const fieldValuesCopy = [...oldLead.field_values]
    fieldValuesCopy[newValueIdx].value = newLead.field_values[newValueIdx].value
    fieldValuesCopy[newValueIdx].nomenclator_items = newLead.field_values[newValueIdx].nomenclator_items
    fieldValuesCopy[newValueIdx].related_leads = newLead.field_values[newValueIdx].related_leads
    return { ...oldLead, fieldValues: fieldValuesCopy } as LeadDetailed
}

interface PartialFormProps {
    value: string | number[] | number | FileList
}

const getValue = (fieldValue: LeadFieldValueDetailed) => {
    if (fieldValue.field.field_type_code === "LEAD") return getSelectorField(fieldValue.related_leads, "id", true) as number[]
    if (["SELECTOR_MULTIPLE", "CHECKBOX_MULTIPLE"].includes(fieldValue?.field?.field_subtype_code ?? ""))
        return getSelectorField(fieldValue.nomenclator_items, "id", true) as number[]
    if (["SELECTOR_SIMPLE", "CHECKBOX_SIMPLE"].includes(fieldValue?.field?.field_subtype_code ?? ""))
        return fieldValue.nomenclator_items[0].id
    return fieldValue.value
}

export const LeadPartialUpdate = ({ fieldValue, onClose, lead, updateLeadInfo }: LeadPartialUpdateProps) => {

    const { register, control, setError, handleSubmit, formState: { errors } } = useForm<PartialFormProps>({
        defaultValues: {
            value: getValue(fieldValue)
        }
    })

    const onSubmit = (data: PartialFormProps) => {
        if (!data.value) return
        const postData: LeadPostForm = {
            values: [{ field_id: fieldValue.field.id, value: data.value, fieldData: fieldValue.field }],
        }
        const formData = createFormDataFromLead(postData)
        updateLead(formData, lead.id).then(res => {
            const newLead = getUpdatedLead(lead, fieldValue.field.id, res)
            if (!newLead) return
            updateLeadInfo(newLead)
            console.log("updated")
            onClose()
        }).catch((e) => {
            setFormErrors(e, setError)
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ListItem >
                <Grid container gap={1} alignItems="center" width="100%">
                    <Grid container gap={.5} direction="column" size="grow">
                        <LeadFormFieldType register={register} control={control} leadField={fieldValue.field} errorMessage={errors?.value?.message} />
                        <FormErrorMessage>{errors?.value?.message}</FormErrorMessage>
                    </Grid>
                    <IconButton size="small" edge="end" color="primary" title="Guardar" type="submit">
                        <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" edge="end" color="error" title="Cancelar" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Grid>
            </ListItem>
        </form>
    )
}


interface LeadFormFieldTypeProps {
    register: UseFormRegister<PartialFormProps>,
    control: Control<PartialFormProps>,
    leadField: LeadFieldDetailed,
    errorMessage?: string
}

const LeadFormFieldType = ({ register, control, leadField, errorMessage }: LeadFormFieldTypeProps) => {

    const name = "value"
    const label = leadField.name ?? undefined

    const [selectors, setSelectors] = useState<NomenclatorItem[] | undefined>(undefined)
    const [relatedLeads, setRelatedLeads] = useState<Lead[] | undefined>(undefined)

    useEffect(() => {
        if (leadField?.nomenclator?.id) {
            getNomenclatorItems({ detailed: false, page_size: 0, nomenclator_id: leadField.nomenclator.id, only_active: true })
                .then(res => setSelectors(res.items))
        }
        else if (leadField?.related_campaign?.id) {
            getLeads({ detailed: false, page_size: 0, campaign_id: leadField.related_campaign.id, only_active: true })
                .then(res => setRelatedLeads(res.items))
        }
    }, [leadField])

    switch (leadField.field_type_code) {
        case "LEAD":
            return (<LeadFormRelatedLead label={label} name={name} control={control} options={relatedLeads}
                leadField={leadField} required={leadField.required} errorMessage={errorMessage} />)
        case "SELECTOR":
            return (<LeadFormSelector label={label} name={name} control={control} options={selectors}
                leadField={leadField} required={leadField.required} errorMessage={errorMessage} />)
        case "CHECKBOX":
            return (<LeadFormCheckbox label={label} name={name} control={control} options={selectors}
                leadField={leadField} returnField="id" required={leadField.required} errorMessage={errorMessage} />)
        case "URL":
            return (<LeadFormText label={label} name={name} register={register} type="url"
                required={leadField.required} errorMessage={errorMessage} />)
        case "ADDRESS":
            return (<LeadFormAddress label={label} name={name} register={register} leadField={leadField}
                required={leadField.required} errorMessage={errorMessage} />)
        case "PHONE":
            return (<LeadFormText label={label} name={name} register={register} type="tel"
                required={leadField.required} errorMessage={errorMessage} />)
        case "EMAIL":
            return (<LeadFormText label={label} name={name} register={register} type="email"
                required={leadField.required} errorMessage={errorMessage} />)
        case "DATE":
            return (<LeadFormText label={label} name={name} register={register} type="date"
                required={leadField.required} errorMessage={errorMessage} />)
        case "DATE_TIME":
            return (<LeadFormText label={label} name={name} register={register} type="datetime-local"
                required={leadField.required} errorMessage={errorMessage} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={label} name={name} control={control}
                required={leadField.required} errorMessage={errorMessage} />)
        case "RICH_TEXT":
            return (<LeadFormText label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} multiline />)
        case "RATING":
            return (<LeadFormRating label={label} field_subtype_code={leadField.field_subtype_code!} name={name} control={control}
                required={leadField.required} errorMessage={errorMessage} />)
        case "MONEY":
            return (<LeadFormMoney label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />)
        case "PASSWORD":
            return (<LeadFormPassword label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />)
        case "BOOL":
            return (<LeadFormBool label={label} name={name} control={control} errorMessage={errorMessage} />)
        case "FILE":
            return (<LeadFormFile label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />)
        default:
            return <LeadFormText label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />
    }
}