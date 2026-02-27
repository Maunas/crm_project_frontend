import { useCallback, useEffect, useMemo, useState } from "react"
import type { Campaign } from "../../types/campaigns"
import { useNavigate, useParams } from "react-router-dom"
import { getCampaigns } from "../campaigns/campaignServices"
import { createLead, getLead } from "./leadService"
import { Autocomplete, Divider, Stack, TextField, Typography } from "@mui/material"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents"
import { LeadForm } from "./LeadForm"
import type { LeadFieldDetailed } from "../../types/leadFields"
import { useForm } from "react-hook-form"
import type { LeadDetailed } from "../../types/leads"

/** Wrapper para presentar LeadForm de creación en una página. */
export const CreateLeadFormPage = () => {

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const [campaignError, setCampaignError] = useState<string | undefined>(undefined)
    const nav = useNavigate()

    useEffect(() => {
        getCampaigns({ "page_size": 0, only_active: true }).then(res => setCampaigns(res.items))
    }, [])

    const onSubmit = useCallback((data: FormData) => {
        return createLead(data).then(lead => nav(`/leads/${lead.id}`))
    }, [nav])

    return (

        <form autoComplete="off">
            <Stack spacing={2}>
                <Typography variant="h1" color="initial">Nuevo Lead</Typography>
                <Autocomplete options={campaigns} loading={campaigns.length === 0} disabled={campaigns.length === 0}
                    onChange={(_, value) => setSelectedCampaign(value)} value={selectedCampaign}
                    getOptionLabel={o => o.name!}
                    renderInput={(props) =>
                        <TextField error={!!campaignError} label="Campaña" {...props} />
                    } />
                {campaignError && <FormErrorMessage>{campaignError}</FormErrorMessage>}
                <Divider />
                <LeadForm campaignId={selectedCampaign?.id} onSubmit={onSubmit} onCancel={() => nav("/leads")} setCampaignError={setCampaignError} />
            </Stack>
        </form>
    )
}

interface SimulateProps {
    campaignId: number,
    leadFields: LeadFieldDetailed[]
}
export const SimulateLeadFormModal = ({ campaignId, leadFields }: SimulateProps) => {

    const { register, control, handleSubmit, setError, formState: { errors } } = useForm<LeadPostForm>()

    const filteredLeadFields = useMemo(() => leadFields.filter(field => field.active), [leadFields])

    return (
        <form autoComplete="off">
            <Typography variant="h1" color="initial">Simulación de Nuevo Lead: Campaña {campaignId}</Typography>
            <input type="text" id="campaign_id" value={campaignId} hidden
                {...register("campaign_id", { valueAsNumber: true })} />
            <LeadForm leadFields={filteredLeadFields} simulate
                register={register} control={control} handleSubmit={handleSubmit} setError={setError} errors={errors} />
        </form>
    )
}

export const UpdateLeadFormPage = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)

    useEffect(() => {
        getLead(Number(id)).then(setLead)
    }, [id])

    const { register, control, handleSubmit, setError, formState: { errors } } = useForm<LeadPostForm>()

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
            <LeadForm leadFields={formattedLeadValues} idLead={Number(id)}
                register={register} control={control} handleSubmit={handleSubmit} setError={setError} errors={errors} />

        </form>
    )
}