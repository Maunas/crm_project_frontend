import { useForm } from "react-hook-form"
import type { LeadDetailed } from "../../types/leads"
import type { LeadFieldDetailed } from "../../types/leadFields"
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
        return lead.field_values.map((fieldValue) => {
            if (fieldValue.value || fieldValue.value === "") return fieldValue
            const type = fieldValue?.field?.field_type_code
            const subtype = fieldValue?.field?.field_subtype_code

            if (type === "LEAD" && fieldValue?.related_leads?.length > 0) return {
                ...fieldValue,
                value: fieldValue?.related_leads[0]?.id ?? null
            }
            if (fieldValue?.nomenclator_items?.length > 0) return {
                ...fieldValue,
                value: ["CHECKBOX_MULTIPLE", "SELECTOR_MULTIPLE"].includes(subtype)
                    ? fieldValue.nomenclator_items.map(item => item.id)
                    : fieldValue?.nomenclator_items[0]?.id ?? null
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