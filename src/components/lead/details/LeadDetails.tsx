import { useEffect, useMemo, useState } from "react"
import { LeadActivities } from "./LeadActivities.tsx"
import { GenericPaper } from "../../common/layout/GenericContainer.tsx"
import { CommonButton } from "../../common/details/DetailsCommonButton.tsx"
import { CustomChip } from "../../common/details/StyledDisplayComponents.tsx"
import type { LeadDetailed } from "../../../types/leads.ts"
import { disableLead, enableLead, getLead, getLeadTitleArray } from "../leadService.ts"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Container, Grid, Typography, ButtonGroup, Stack, Breadcrumbs, Link } from "@mui/material"
import { getCampaign } from "../../campaigns/campaignServices.ts"
import type { Campaign } from "../../../types/campaigns.ts"
import { LeadFieldSections } from "./LeadDetailsSections.tsx"

export const LeadDetailsLayout = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        if (id) getLead(parseInt(id)).then((lead) => {
            setLead(lead)
            if (!lead.campaign_id) return
            getCampaign(lead.campaign_id).then(setCampaign)
        })
    }, [id])

    const handleActive = (lead: LeadDetailed) => {
        if (!lead.active) enableLead(lead.id).then(() => setLead({ ...lead, active: true }))
        else disableLead(lead.id).then(res => {
            if (res.action === "deleted") return nav("/leads")
            else return setLead({ ...lead, active: false })
        })
    }

    const leadTitle = useMemo(() => {
        if (!lead) return ""
        return getLeadTitleArray(lead).join(" ")
    }, [lead])


    return (
        <Container maxWidth={false}>
            <Stack gap={3}>
                {campaign &&
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link component={RouterLink} to={`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`}
                            underline="hover" fontWeight={600} >
                            {campaign?.name}
                        </Link>
                        <Typography sx={{ color: 'text.primary' }}>{leadTitle}</Typography>
                    </Breadcrumbs>}
                {lead &&
                    <Grid container gap={3}>
                        <Grid size={{ xs: 12, md: 4, lg: 4 }} minWidth="20rem" >
                            <LeadInfo lead={lead} handleActive={handleActive} leadTitle={leadTitle} />
                        </Grid>
                        <Grid size="grow" minWidth="20rem" component={GenericPaper} >
                            <LeadActivities leadId={lead.id} />
                        </Grid>
                    </Grid >
                }
            </Stack >
        </Container >
    )
}


interface LeadInfoProps {
    lead: LeadDetailed,
    handleActive: (lead: LeadDetailed) => void,
    leadTitle: string,
}

export const LeadInfo = ({ lead, leadTitle, handleActive }: LeadInfoProps) => {

    return (
        <Stack gap={2}>
            <GenericPaper>
                <Grid container gap={3} alignItems="center">
                    <Grid container size="grow" gap={2} alignItems="center" justifyContent="space-between">
                        <Typography variant="h1">
                            {leadTitle.length > 0 ? leadTitle : "Título no encontrado"}
                        </Typography>
                        <CustomChip label={lead?.active ? "Habilitado" : "Deshabilitado"}
                            color={lead?.active ? "success" : "error"} sx={{ marginLeft: "auto" }} />
                    </Grid>
                    <ButtonGroup fullWidth>
                        <CommonButton actionType={lead.active ? "DISABLE" : "ENABLE"} variant="outlined"
                            color={lead.active ? "error" : "success"} onClick={() => handleActive(lead)}>
                            {lead.active ? "Eliminar" : "Habilitar"}
                        </CommonButton>
                        <CommonButton actionType="MODIFY" variant="contained" color="primary"
                            component={RouterLink} to={`/leads/modify/${lead?.id}`}>
                            Modificar
                        </CommonButton>
                    </ButtonGroup>
                </Grid>
            </GenericPaper>
            <LeadFieldSections lead={lead} />
        </Stack>
    )
}