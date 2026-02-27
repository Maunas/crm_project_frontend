import { useCallback, useEffect, useMemo, useState } from "react"
import type { Campaign, Workspace } from "../../types/campaigns"
import { useNavigate, useParams } from "react-router-dom"
import { getCampaigns } from "../campaigns/campaignServices"
import { createLead, getLead } from "./leadService"
import { Autocomplete, Divider, Grid, Stack, TextField, Typography } from "@mui/material"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents"
import { LeadForm } from "./LeadForm"
import type { LeadFieldDetailed } from "../../types/leadFields"
import { useForm } from "react-hook-form"
import type { LeadDetailed } from "../../types/leads"
import { getWorkspaces } from "../workspaces/workspaceServices"

/** Wrapper para presentar LeadForm de creación en una página. */
export const CreateLeadFormPage = () => {

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const [campaignError, setCampaignError] = useState<string | undefined>(undefined)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        getWorkspaces({ "page_size": 0, only_active: true }).then(res => setWorkspaces(res.items))
    }, [])

    useEffect(() => {
        if (!selectedWorkspace) return
        getCampaigns({ page_size: 0, only_active: true, workspace_id: selectedWorkspace.id }).then(res => setCampaigns(res.items))
    }, [selectedWorkspace])

    const onSubmit = useCallback((data: FormData) => {
        return createLead(data).then(lead => nav(`/leads/${lead.id}`))
    }, [nav])

    return (

        <form autoComplete="off">
            <Stack spacing={2}>
                <Typography variant="h1" color="initial">Nuevo Lead</Typography>
                <Grid container spacing={2}>
                    <Grid size="grow" minWidth="20rem">
                        <Autocomplete options={workspaces} loading={workspaces.length === 0} disabled={workspaces.length === 0}
                            onChange={(_, value) => setSelectedWorkspace(value)} value={selectedWorkspace}
                            getOptionLabel={o => o.name!} renderInput={(props) =>
                                <TextField label="Workspace" {...props} />
                            } />
                    </Grid>
                    <Grid size="grow" minWidth="20rem">
                        <Autocomplete options={campaigns.filter(c => c.workspace_id === selectedWorkspace?.id)}
                            loading={campaigns.length === 0} disabled={campaigns.length === 0 && !selectedWorkspace}
                            onChange={(_, value) => setSelectedCampaign(value)} value={selectedCampaign}
                            getOptionLabel={o => o.name!}
                            renderInput={(props) =>
                                <TextField error={!!campaignError} label="Campaña" {...props} />
                            } />
                    </Grid>
                </Grid>
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