import { useEffect, useMemo, useState } from "react"
import { LeadFieldSections } from "./LeadDetailsSections"
import { LeadTags } from "./LeadTags"
import { LeadActivities } from "../activities/LeadActivities"
import GenericPaper from "shared/layout/container/GenericPaper"
import TitleAndActive from "shared/ui/details/TitleAndActive"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { LeadDetailed } from "src/types/leads.ts"
import type { Campaign } from "src/types/campaigns.ts"
import { disableLead, enableLead, getLead } from "../leadService.ts"
import { getCampaign } from "src/features/campaigns/campaignServices.ts"
import { getLeadTitleArray } from "../leadUtils.ts"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Grid, Typography, ButtonGroup, Stack, Breadcrumbs, Link, Container, Box, CircularProgress, Fab } from "@mui/material"
import { useLeadNavigation } from "../stores/LeadNavigationContext.tsx"

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const LeadDetailsLayout = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const nav = useNavigate()

    const { getNextLeadId, getPrevLeadId, isLoadingNavigation } = useLeadNavigation();

    const handleNext = async () => {
        if (!id) return
        const nextId = await getNextLeadId(parseInt(id));
        if (nextId) nav(`/leads/${nextId}`);
    };

    const handlePrev = async () => {
        if (!id) return
        const prevId = await getPrevLeadId(parseInt(id));
        if (prevId) nav(`/leads/${prevId}`);
    };
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Evitamos navegar si el usuario está enfocado en un campo de texto
            const activeTag = document.activeElement?.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
                return;
            }

            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
        <Container maxWidth={false} sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>

            {/* --- COLUMNA IZQUIERDA (Pegajosa) --- */}
            <Box sx={{ flexShrink: 0, width: '40px', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'sticky', top: '50vh', transform: 'translateY(-50%)', zIndex: 10, height: 'max-content' }}>
                    <Fab
                        color="primary"
                        size="small"
                        onClick={handlePrev}
                        disabled={isLoadingNavigation}
                    >
                        {isLoadingNavigation ? <CircularProgress size={24} color="inherit" /> : <ArrowBackIosNewIcon />}
                    </Fab>
                </Box>
            </Box>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack spacing={3}>
                    {campaign &&
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link component={RouterLink} to={`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`}
                                sx={{ underline: "hover", fontWeight: 600 }} >
                                {campaign?.name}
                            </Link>
                            <Typography sx={{ color: 'text.primary' }}>{leadTitle}</Typography>
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
            </Box>

            {/* --- COLUMNA DERECHA (Pegajosa) --- */}
            <Box sx={{ flexShrink: 0, width: '40px', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'sticky', top: '50vh', transform: 'translateY(-50%)', zIndex: 10, height: 'max-content' }}>
                    <Fab
                        color="primary"
                        size="small"
                        onClick={handleNext}
                        disabled={isLoadingNavigation}
                    >
                        {isLoadingNavigation ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardIosIcon />}
                    </Fab>
                </Box>
            </Box>

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
                    <Stack spacing={1} sx={{ width: "100%" }}>
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