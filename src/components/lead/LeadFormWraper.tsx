import { useCallback, useEffect, useMemo, useState } from "react"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents"
import { LeadForm } from "./LeadForm"
import type { LeadField, LeadFieldDetailed, LeadFieldValue } from "../../types/leadFields"
import type { LeadDetailed } from "../../types/leads"
import type { Campaign, Workspace } from "../../types/campaigns"
import { createLead, getLead, simulateCreateLead, updateLead } from "./leadService"
import { getWorkspaces } from "../workspaces/workspaceServices"
import { getCampaigns } from "../campaigns/campaignServices"
import { useNavigate, useParams } from "react-router-dom"
import { Autocomplete, Divider, Grid, Stack, TextField, Typography } from "@mui/material"

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
    onCancel: () => void
}
export const SimulateLeadFormModal = ({ campaignId, onCancel }: SimulateProps) => {

    const onSubmit = useCallback((data: FormData) => {
        return simulateCreateLead(data)
            .then(() => alert("El formulario se envió correctamente."))
    }, [])

    return (
        <form autoComplete="off">
            <Stack spacing={2}>
                <Typography variant="h1" color="initial">Simulación de Nuevo Lead: Campaña {campaignId}</Typography>
                <LeadForm campaignId={campaignId} onSubmit={onSubmit} onCancel={onCancel} submitBtnLabel="Validar Datos" />
            </Stack>
        </form>
    )
}

export const UpdateLeadFormPage = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        getLead(Number(id)).then(setLead)
    }, [id])

    //Convierte LeadFieldDetailed a LeadField
    const detailedToNormalLeadField = (leadField: LeadFieldDetailed) => {
        let newFieldData: LeadField = {
            ...leadField,
            lead_field_section_id: leadField.lead_field_section.id
        }
        if (leadField.nomenclator) newFieldData = {
            ...newFieldData,
            nomenclator_id: leadField.nomenclator.id
        }
        if (leadField.related_campaign) newFieldData = {
            ...newFieldData,
            related_campaign_id: leadField.related_campaign.id
        }
        return newFieldData as LeadField
    }


    //Convierte LeadFieldDetailed a LeadField
    const formattedLeadFields: LeadField[] = useMemo(() => {
        if (!lead || !lead.field_values) return []
        return lead.field_values.filter(value => value.field.active)
            .map(fieldValue => detailedToNormalLeadField(fieldValue.field))
    }, [lead])

    //Convierte LeadFieldValueDetailed a LeadFieldValue
    const formattedLeadValues: LeadFieldValue[] = useMemo(() => {
        if (!lead || !lead.field_values) return []
        return lead.field_values.filter(value => value.active && value.field.active)
            .map(fieldValue => {
                const fieldData = fieldValue.field
                const newFieldData = detailedToNormalLeadField(fieldData)
                return ({ ...fieldValue, field: newFieldData }) as LeadFieldValue
            })
    }, [lead])

    const onSubmit = useCallback((data: FormData) => {
        return updateLead(data, lead!.id).then(lead => nav(`/leads/${lead.id}`))
    }, [nav, lead])

    if (lead && lead.campaign_id) return (
        <form autoComplete="off">
            <Stack spacing={2}>
                <Typography variant="h1">{`Modificar Lead: ${lead?.field_values[0].value} ${lead?.field_values[1].value}`}</Typography>
                <LeadForm existingValues={formattedLeadValues} existingLeadFields={formattedLeadFields}
                    campaignId={lead.campaign_id} onSubmit={onSubmit} onCancel={() => nav(`/leads/${lead.id}`)} />
            </Stack>
        </form>
    )
}