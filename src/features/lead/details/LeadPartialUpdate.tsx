import { useEffect, useState } from "react"
import { LeadFormAddress, LeadFormBool, LeadFormCheckbox, LeadFormFile, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormRelatedLead, LeadFormSelector, LeadFormText } from "../shared/LeadFormFields"
import type { LeadPostForm } from "../leadForm/LeadForm"
import { LeadFieldTypeIcon } from "features/leadFields/LeadFieldTypeIcon"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import type { LeadFieldDetailed, LeadFieldValueDetailed } from "src/types/leadFields"
import type { NomenclatorItem } from "src/types/nomenclators"
import type { Lead, LeadDetailed } from "src/types/leads"
import { getLeads, updateLead } from "../leadService"
import { getNomenclatorItems } from "features/nomenclators/nomenclatorService"
import { createFormDataFromLead } from "../leadUtils"
import { getListField } from "src/utils/lists"
import { useForm, type Control, type UseFormRegister } from "react-hook-form"
import { IconButton, ListItem, ListItemText, Stack } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from "@mui/icons-material/Save"

interface LeadPartialUpdateProps {
    fieldValue: LeadFieldValueDetailed,
    onClose: () => void,
    lead: LeadDetailed,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
}

const getUpdatedLead = (oldLead: LeadDetailed, newLead: Lead) => {

    const newfieldValuesCopy = [...newLead.field_values].sort((a, b) => b.field.id - a.field.id)
    const oldfieldValuesCopy = [...oldLead.field_values].sort((a, b) => b.field.id - a.field.id)

    const newFieldValues = oldfieldValuesCopy.map((ofv, oidx) => {
        return {
            ...ofv,
            value: newfieldValuesCopy[oidx].value,
            nomenclator_items: newfieldValuesCopy[oidx].nomenclator_items,
            related_leads: newfieldValuesCopy[oidx].related_leads,
        }
    })
    return { ...oldLead, field_values: newFieldValues } as LeadDetailed
}

interface PartialFormProps {
    value: string | number[] | number | FileList | null
}

const getValue = (fieldValue: LeadFieldValueDetailed) => {
    if (fieldValue.field.field_type_code === "LEAD") return getListField(fieldValue.related_leads, "id", true) as number[]
    if (["SELECTOR_MULTIPLE", "CHECKBOX_MULTIPLE"].includes(fieldValue?.field?.field_subtype_code ?? ""))
        return getListField(fieldValue.nomenclator_items, "id", true) as number[]
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
            const newLead = getUpdatedLead(lead, res)
            if (!newLead) return
            updateLeadInfo(newLead, true)
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