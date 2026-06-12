import { useCallback, useEffect, useMemo, useState } from "react"
import { LeadForm } from "./LeadForm"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import type { LeadField, LeadFieldDetailed, LeadFieldValue } from "src/types/leadFields"
import type { Campaign, Workspace } from "src/types/campaigns"
import type { LeadDetailed } from "src/types/leads"
import { getLeadTitleArray } from "../leadUtils"
import { createLead, getLead, simulateCreateLead, updateLead } from "../leadService"
import { getWorkspaces } from "src/features/workspaces/workspaceServices"
import { getCampaigns } from "src/features/campaigns/campaignServices"
import { showToast } from "src/utils/feedback"
import { useUserContext } from "src/stores/UserContext"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Autocomplete, Divider, Grid, Stack, TextField, Typography } from "@mui/material"

/** Wrapper para presentar LeadForm de creación en una página. */
export const CreateLeadFormPage = () => {

    const [params] = useSearchParams()

    const { activeOrg } = useUserContext()

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const [campaignError, setCampaignError] = useState<string | undefined>(undefined)

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        getWorkspaces({ page_size: 0, only_active: true }).then(res => {
            setWorkspaces(res.items)
            const paramWspId = params.get("workspace")
            if (!paramWspId) return
            const paramWsp = res.items.find(wsp => wsp.id === Number(paramWspId))
            if (!paramWsp) return
            setSelectedWorkspace(paramWsp)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeOrg])


    useEffect(() => {
        if (!selectedWorkspace) return
        getCampaigns({ page_size: 0, only_active: true, workspace_id: selectedWorkspace.id }).then(res => {
            setCampaigns(res.items)
            const paramCmpId = params.get("campaign")
            if (!paramCmpId) return
            const paramCmp = res.items.find(cmp => cmp.id === Number(paramCmpId))
            if (!paramCmp) return
            setSelectedCampaign(paramCmp)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWorkspace])

    const onSubmit = useCallback((data: FormData) => {
        return createLead(data).then(lead => {
            nav(`/leads/${lead.id}`)
            showToast(`El lead fue creado con éxito`)
        })
    }, [nav])

    return (
        <Stack spacing={3}>
            <Typography variant="h1">Nuevo Lead</Typography>
            <Stack spacing={2}>
                <Grid container spacing={1}>
                    <Grid size="grow" sx={{ minWidth: "20rem" }}>
                        <Autocomplete options={workspaces} loading={workspaces.length === 0} disabled={workspaces.length === 0}
                            onChange={(_, value) => setSelectedWorkspace(value)} value={selectedWorkspace}
                            getOptionLabel={o => o.name!} renderInput={(props) =>
                                <TextField label="Workspace" {...props} />
                            } />
                    </Grid>
                    <Grid size="grow" sx={{ minWidth: "20rem" }}>
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
                {selectedCampaign && <Divider />}
                <LeadForm campaignId={selectedCampaign?.id} onSubmit={onSubmit} onCancel={() => nav(`/leads?workspace=${selectedWorkspace?.id}&campaign=${selectedCampaign?.id}`)} setCampaignError={setCampaignError} />
            </Stack>
        </Stack>
    )
}

//Convierte LeadFieldDetailed a LeadField
const detailedToNormalLeadField = (leadField: LeadFieldDetailed) => {
    let newFieldData: LeadField = {
        ...leadField
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

interface SimulateProps {
    campaign: Campaign,
    leadFields: LeadFieldDetailed[],
    onCancel: () => void
}
export const SimulateLeadFormModal = ({ campaign, leadFields, onCancel }: SimulateProps) => {

    const onSubmit = useCallback((data: FormData) => {
        return simulateCreateLead(data)
            .then(() => showToast(`Formulario enviado con éxito`))
    }, [])

    //Convierte arreglo de LeadFieldDetailed a arreglo de LeadField
    const formattedLeadFields: LeadField[] = useMemo(() => {
        if (!leadFields) return []
        return leadFields
            .filter(leadField => leadField.active)
            .map(leadField => detailedToNormalLeadField(leadField))
    }, [leadFields])

    return (
        <Stack spacing={3}>
            <Typography variant="h1">Simulación de Nuevo Lead: Campaña {campaign.name}</Typography>
            <LeadForm campaignId={campaign.id} existingLeadFields={formattedLeadFields}
                onSubmit={onSubmit} onCancel={onCancel} submitBtnLabel="Validar" />
        </Stack>
    )
}

export const UpdateLeadFormPage = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        getLead(Number(id)).then(setLead)
    }, [id])

    //Formatea LeadFieldValue para el formulario.
    const formattedLeadValues: LeadFieldValue[] = useMemo(() => {
        if (!lead || !lead.field_values) return []
        return (
            lead.field_values
                .filter(value => value.active && value.field.active)
                .map(fieldValue => {
                    const newFieldData = detailedToNormalLeadField(fieldValue.field)
                    return ({ ...fieldValue, field: newFieldData }) as LeadFieldValue
                })
        )
    }, [lead])

    //Convierte arreglo de LeadFieldDetailed a arreglo de LeadField
    const formattedLeadFields: LeadField[] = useMemo(() => {
        if (!formattedLeadValues) return []
        return formattedLeadValues.map(leadField => leadField.field)
    }, [formattedLeadValues])

    const onSubmit = useCallback((data: FormData) => {
        return updateLead(data, lead!.id)
            .then(lead => {
                showToast(`El lead fue modificado con éxito`)
                nav(`/leads/${lead.id}`)
            })
    }, [nav, lead])

    const leadTitle = useMemo(() => {
        if (!lead) return "Lead no Encontrado"
        return getLeadTitleArray(lead).join(" ")
    }, [lead])

    if (lead && lead.campaign_id) return (
        <Stack spacing={3}>
            <Typography variant="h1">{`Modificar Lead: ${leadTitle}`}</Typography>
            <LeadForm existingValues={formattedLeadValues} existingLeadFields={formattedLeadFields}
                campaignId={lead.campaign_id} onSubmit={onSubmit} onCancel={() => nav(`/leads/${lead.id}`)} />
        </Stack>
    )
}