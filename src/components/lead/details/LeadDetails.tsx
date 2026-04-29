import { useEffect, useMemo, useState } from "react"
import { LeadActivities } from "./activities/LeadActivities.tsx"
import { GenericPaper } from "../../common/layout/GenericContainer.tsx"
import { CommonButton } from "../../common/details/DetailsCommonButton.tsx"
import type { LeadDetailed } from "../../../types/leads.ts"
import { disableLead, enableLead, getLead, getLeadTitleArray } from "../leadService.ts"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Container, Grid, Typography, ButtonGroup, Stack, Breadcrumbs, Link } from "@mui/material"
import { getCampaign } from "../../campaigns/campaignServices.ts"
import type { Campaign } from "../../../types/campaigns.ts"
import { LeadFieldSections } from "./LeadDetailsSections.tsx"
import { TitleAndActive } from "../../common/layout/MinorComponents.tsx"
import { LeadTags } from "./LeadTags.tsx"

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

    const updateLeadInfo = (newLead: LeadDetailed, reloadAudits: boolean = false) => {
        setLead(newLead)
        if (reloadAudits) setReloadAudit(prev => prev + 1)
    }

    const leadTitle = useMemo(() => {
        if (!lead) return null
        return getLeadTitleArray(lead)
    }, [lead])

    //reconoce cambios para actualizar la lista de audit
    const [reloadAudit, setReloadAudit] = useState<number>(0)


    return (
        <Container maxWidth={false}>
            <Stack spacing={3}>
                {campaign &&
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link component={RouterLink} to={`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`}
                            sx={{ underline: "hover", fontWeight: 600 }} >
                            {campaign?.name}
                        </Link>
                        <Typography sx={{ color: 'text.primary' }}>{leadTitle?.join(" ") ?? "Lead"}</Typography>
                    </Breadcrumbs>}
                {lead &&
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4, lg: 4 }} sx={{ minWidth: "20rem" }} >
                            <LeadInfo lead={lead} handleActive={handleActive} leadTitle={leadTitle} updateLeadInfo={updateLeadInfo} />
                        </Grid>
                        <Grid size="grow" sx={{ minWidth: "20rem" }} component={GenericPaper} >
                            <LeadActivities leadId={lead.id} reloadAudit={reloadAudit} />
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
    leadTitle: (string | undefined)[] | null,
    updateLeadInfo: (lead: LeadDetailed) => void
}

export const LeadInfo = ({ lead, leadTitle, handleActive, updateLeadInfo }: LeadInfoProps) => {

    return (
        <Stack spacing={2}>
            <GenericPaper>
                <Stack spacing={3} sx={{ alignItems: "center" }}>
                    <Stack spacing={1}>
                        <LeadTags lead={lead} tags={lead.tags} updateLeadInfo={updateLeadInfo} />
                        <TitleAndActive active={lead?.active} >
                            <Typography sx={{ textOverflow: "ellipsis" }} variant="h1">
                                {(leadTitle && leadTitle?.length > 0) ? leadTitle?.join(" ") : "Título no encontrado"}
                            </Typography>
                        </TitleAndActive>
                    </Stack>
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
                </Stack>
            </GenericPaper>
            <LeadFieldSections lead={lead} updateLeadInfo={updateLeadInfo} />
        </Stack>
    )
}