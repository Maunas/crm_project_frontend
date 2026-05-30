import { useEffect, useState } from "react"
import type { LeadPostForm } from "../leadForm/LeadForm"
import { LeadFieldTypeIcon } from "features/leadFields/LeadFieldTypeIcon"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { CustomListItem } from "shared/ui/lists/CustomListItem"
import { useLoading } from "src/hooks/useLoading"
import type { LeadFieldDetailed, LeadFieldValueDetailed } from "src/types/leadFields"
import type { NomenclatorItem } from "src/types/nomenclators"
import type { Lead, LeadDetailed } from "src/types/leads"
import { getLeads, updateLead } from "../leadService"
import { getNomenclatorItems } from "features/nomenclators/nomenclatorService"
import { createFormDataFromLead } from "../leadUtils"
import { setFormErrors } from "src/utils/forms"
import { getListField } from "src/utils/lists"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { useForm, type Control, type UseFormRegister } from "react-hook-form"
import { ListItemText, Stack } from "@mui/material"
import { getFieldIconTypeCode } from "src/features/leadFields/leadFieldUtils"
import { LeadFormRelatedLead, LeadFormSelector } from "../shared/LeadFormMultipleFields"
import { LeadFormBool, LeadFormDate, LeadFormFile, LeadFormNumber, LeadFormText } from "../shared/LeadFormFields"


/**
 * Toma el lead viejo y el nuevo, y recorre los leadFields del lead viejo, reemplazando sus valores por los nuevos.
 */
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

interface LeadPartialUpdateProps {
    fieldValue: LeadFieldValueDetailed,
    onClose: (id: number) => void,
    lead: LeadDetailed,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
}

export const LeadPartialUpdate = ({ fieldValue, onClose, lead, updateLeadInfo }: LeadPartialUpdateProps) => {

    const { register, control, setError, handleSubmit, formState: { errors } } = useForm<PartialFormProps>({
        defaultValues: {
            value: getValue(fieldValue)
        }
    })

    const fieldData = fieldValue.field

    const iconCode = getFieldIconTypeCode(fieldData.field_type_code, fieldData.field_template_code)

    const onSubmit = async (data: PartialFormProps) => {
        if (!data.value) return
        const postData: LeadPostForm = {
            values: [{ field_id: fieldData.id, value: data.value, fieldData: fieldData }],
        }
        const formData = createFormDataFromLead(postData)
        return updateLead(formData, lead.id).then(res => {
            const newLead = getUpdatedLead(lead, res)
            if (!newLead) return
            updateLeadInfo(newLead, true)
            showToast(`Campo "${fieldData.name}" modificado con éxito.`)
            onClose(fieldData.id)
        }).catch((e) => {
            setFormErrors(e, setError, null, "value", true)
        })
    }

    const { fnWithLoading: submitLoad, loading } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitLoad)}>
            <CustomListItem disablePadding alwaysShowSecondary secondaryAction={
                <Stack direction="row">
                    {!loading && <CommonIconButton title="Cancelar" actionType="CLOSE" onClick={() => onClose(fieldData.id)}
                        size="small" tooltipSize="small" color="error" />}
                    <CommonIconButton title="Guardar" actionType="SAVE" type="submit" loading={loading}
                        size="small" tooltipSize="small" color="primary" />
                </Stack>
            }>
                <LeadFieldTypeIcon typeCode={iconCode} subtypeCode={fieldData.field_subtype_code} />
                <ListItemText sx={{ mr: 9 }}>
                    <LeadFormFieldType register={register} control={control} leadField={fieldData}
                        size="small" errorMessage={errors?.value?.message} />
                </ListItemText>
            </CustomListItem>
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
    const typeCode = leadField.field_type_code
    const subtypeCode = leadField.field_subtype_code ?? undefined
    const required = leadField.required

    const [selectors, setSelectors] = useState<NomenclatorItem[] | undefined>(undefined)
    const [relatedLeads, setRelatedLeads] = useState<Lead[] | undefined>(undefined)

    useEffect(() => {
        if (leadField?.nomenclator?.id) {
            getNomenclatorItems({ detailed: false, page_size: 0, nomenclator_id: leadField.nomenclator.id, only_active: true })
                .then(res => setSelectors(res.items))
                .catch(e => showCommonErrorToast(e, `Ocurrio un error buscando las opciones de ${leadField.name}`))
        }
        else if (leadField?.related_campaign?.id) {
            getLeads({ detailed: false, page_size: 0, campaign_id: leadField.related_campaign.id, only_active: true })
                .then(res => setRelatedLeads(res.items))
                .catch(e => showCommonErrorToast(e, `Ocurrio un error buscando los leads de ${leadField.name}`))
        }
    }, [leadField])

    switch (typeCode) {
        case "LEAD":
            return (<LeadFormRelatedLead control={control} name={name} options={relatedLeads} size={size}
                label={label} required={required} errorMessage={errorMessage} />)
        case "FILE":
            return (<LeadFormFile register={register} name={name} required={required} size={size}
                errorMessage={errorMessage} />)
        case "SELECTOR":
            return (<LeadFormSelector control={control} name={name} options={selectors} size={size}
                label={label} subtype={subtypeCode} required={required} errorMessage={errorMessage} />)
        case "BOOL":
            return (<LeadFormBool control={control} name={name} label={label} errorMessage={errorMessage} size={size} />)
        case "DATE_TIME": case "DATE":
            return (<LeadFormDate register={register} name={name} label={label} size={size}
                subtype={subtypeCode} required={leadField.required} errorMessage={errorMessage} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber control={control} name={name} label={label} size={size}
                subtype={subtypeCode} required={leadField.required} errorMessage={errorMessage} />)
        case "STRING":
            return <LeadFormText register={register} name={name} label={label} size={size}
                required={leadField.required} errorMessage={errorMessage} subtype={subtypeCode} />
    }
}