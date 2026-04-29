import { IconButton, ListItem, ListItemText, Stack } from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import CloseIcon from "@mui/icons-material/Close"
import type { LeadFieldDetailed, LeadFieldValueDetailed } from "../../../types/leadFields"
import { useForm, type Control, type UseFormRegister } from "react-hook-form"
import { FormErrorMessage } from "../../common/forms/StyledFormComponents"
import type { LeadPostForm } from "../leadForm/LeadForm"
import { createFormDataFromLead, getLeads, getSelectorField, updateLead } from "../leadService"
import type { Lead, LeadDetailed } from "../../../types/leads"
import { LeadFormAddress, LeadFormBool, LeadFormCheckbox, LeadFormFile, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormRelatedLead, LeadFormSelector, LeadFormText } from "../leadForm/LeadFormFieldTypes"
import { useEffect, useState } from "react"
import type { NomenclatorItem } from "../../../types/nomenclators"
import { getNomenclatorItems } from "../../nomenclators/nomenclatorService"
import { LeadFieldTypeIcon } from "../../leadFields/LeadFieldTypeIcon"

interface LeadPartialUpdateProps {
    fieldValue: LeadFieldValueDetailed,
    onClose: () => void,
    lead: LeadDetailed,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
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
            updateLeadInfo(newLead, true)
            console.log("updated")
            onClose()
        }).catch((e) => {
            setError("root", e?.response?.data?.detail?.message)
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ListItem disablePadding secondaryAction={
                <Stack direction="row" spacing={.5}>
                    <IconButton size="small" edge="end" color="primary" title="Guardar" type="submit">
                        <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" edge="end" color="error" title="Cancelar" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            }>
                <LeadFieldTypeIcon typeCode={fieldValue.field.field_type_code} subtypeCode={fieldValue.field.field_subtype_code} />
                <ListItemText sx={{ mr: 11 }}>
                    <Stack spacing={.5} direction="column" sx={{ flexGrow: 1, pt: .5 }}>
                        <LeadFormFieldType register={register} control={control} leadField={fieldValue.field}
                            size="small" errorMessage={errors?.value?.message} />
                        <FormErrorMessage>{errors?.value?.message}</FormErrorMessage>
                    </Stack>
                </ListItemText>
            </ListItem>
        </form>
    )
}


interface LeadFormFieldTypeProps {
    register: UseFormRegister<PartialFormProps>,
    control: Control<PartialFormProps>,
    leadField: LeadFieldDetailed,
    errorMessage?: string,
    size?: "small" | "medium"
}

const LeadFormFieldType = ({ register, control, leadField, errorMessage, size = "medium" }: LeadFormFieldTypeProps) => {

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
                leadField={leadField} required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "SELECTOR":
            return (<LeadFormSelector label={label} name={name} control={control} options={selectors}
                leadField={leadField} required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "CHECKBOX":
            return (<LeadFormCheckbox label={label} name={name} control={control} options={selectors} size={size}
                leadField={leadField} returnField="id" required={leadField.required} errorMessage={errorMessage} />)
        case "URL":
            return (<LeadFormText label={label} name={name} register={register} type="url"
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "ADDRESS":
            return (<LeadFormAddress label={label} name={name} register={register} leadField={leadField}
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "PHONE":
            return (<LeadFormText label={label} name={name} register={register} type="tel"
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "EMAIL":
            return (<LeadFormText label={label} name={name} register={register} type="email"
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "DATE":
            return (<LeadFormText label={label} name={name} register={register} type="date"
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "DATE_TIME":
            return (<LeadFormText label={label} name={name} register={register} type="datetime-local"
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={label} name={name} control={control}
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "RICH_TEXT":
            return (<LeadFormText label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} size={size} multiline />)
        case "RATING":
            return (<LeadFormRating label={label} field_subtype_code={leadField.field_subtype_code!} name={name} control={control}
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "MONEY":
            return (<LeadFormMoney label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "PASSWORD":
            return (<LeadFormPassword label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        case "BOOL":
            return (<LeadFormBool label={label} name={name} control={control} errorMessage={errorMessage} size={size} />)
        case "FILE":
            return (<LeadFormFile label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} size={size} />)
        default:
            return <LeadFormText label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} size={size} />
    }
}