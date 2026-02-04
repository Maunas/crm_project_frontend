import { useForm } from "react-hook-form"
import type { LeadDetailed } from "../../types/leads"
import { LeadFormValues, type LeadPostData } from "./LeadForm"
import { Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { getLead } from "./leadService"

export const UpdateLead = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)

    useEffect(() => {
        getLead(Number(id)).then(setLead)
    }, [id])

    const { register, control, handleSubmit, setError, formState: { errors } } = useForm<LeadPostData>()

    const formattedLeadValues = useMemo(() => {
        if (!lead) return []
        return lead.field_values.filter(value => value.field.active)
            .map((fieldValue) => {
                if (fieldValue.value || fieldValue.value === "") return fieldValue
                const type = fieldValue?.field?.field_type_code
                const subtype = fieldValue?.field?.field_subtype_code
                const leads = fieldValue?.related_leads
                if (type === "LEAD" && leads && leads.length > 0) return {
                    ...fieldValue,
                    value: leads[0]?.id ?? null
                }
                const nomenclators = fieldValue?.nomenclator_items
                if (subtype && nomenclators && nomenclators.length > 0) return {
                    ...fieldValue,
                    value: ["CHECKBOX_MULTIPLE", "SELECTOR_MULTIPLE"].includes(subtype)
                        ? nomenclators.map(item => item.id)
                        : nomenclators[0]?.id ?? null
                }
                return fieldValue
            })
    }, [lead])

    if (lead) return (
        <form autoComplete="off">
            <Typography variant="h1">{`Actualizando Lead: ${lead?.field_values[0].value} ${lead?.field_values[1].value}`}</Typography>
            <input type="text" id="campaign_id" value={lead?.campaign_id} hidden
                {...register("campaign_id", { valueAsNumber: true })} />
            <LeadFormValues leadFields={formattedLeadValues} idLead={Number(id)}
                register={register} control={control} handleSubmit={handleSubmit} setError={setError} errors={errors} />

        </form>
    )
}