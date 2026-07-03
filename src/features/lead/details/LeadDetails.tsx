import { useCallback, useEffect, useMemo, useState } from "react"
import { LeadFieldSections } from "./LeadDetailsSections"
import { LeadTags } from "src/features/orgProperties/tags/LeadTagsMenu.tsx"
import { LeadActivities } from "../activities/LeadActivities"
import { DisableConfirmDialog } from "src/components/ui/feedback/ConfirmationDialog.tsx"
import LoadingScreenWrapper from "src/components/ui/feedback/LoadingScreen.tsx"
import GenericPaper from "shared/layout/container/GenericPaper"
import TitleAndActive from "shared/ui/details/TitleAndActive"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading.ts"
import type { LeadDetailed } from "src/types/leads.ts"
import type { Campaign } from "src/types/campaigns.ts"
import { disableLead, enableLead, getLead } from "../leadService.ts"
import { getCampaign } from "src/features/campaigns/campaignServices.ts"
import { getLeadTitleArray } from "../leadUtils.ts"
import { showCommonErrorToast, showToast } from "src/utils/feedback.ts"
import { useLeadNavigation } from "../stores/LeadNavigationContext.tsx"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Grid, Typography, ButtonGroup, Stack, Breadcrumbs, Link, Box, CircularProgress, Fab, Slide } from "@mui/material"
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LeadDetailsState } from "./LeadDetailsState.tsx"

export const LeadDetailsLayout = () => {

    const { id } = useParams()

    const numId = useMemo(() => {
        if (id === undefined) return id
        const numId = parseInt(id)
        if (isNaN(numId)) return undefined
        return numId
    }, [id])

    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const nav = useNavigate()
    const [lastMove, setLastMove] = useState<"next" | "prev" | false>(false)

    const { getNextLeadId, getPrevLeadId, isLoadingNavigation, isFirstItem, isLastItem, isNavigationValid } = useLeadNavigation();

    const handleNext = async () => {
        if (numId === undefined) return
        setLoading(true)
        setLastMove("next")
        const nextId = await getNextLeadId(numId);
        if (nextId) nav(`/leads/${nextId}`);
        else setLoading(false)
    };

    const handlePrev = async () => {
        if (numId === undefined) return
        setLoading(true)
        setLastMove("prev")
        const prevId = await getPrevLeadId(numId);
        if (prevId) nav(`/leads/${prevId}`);
        else setLoading(false)
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
    }, [numId]);

    const fetchLeads = useCallback(async (numId: number) => {
        try {
            if (numId === undefined) return
            await getLead(numId).then(async (lead) => {
                setLead(prev => prev?.id !== lead.id ? lead : prev)
                if (!lead.campaign_id) return
                if (lead.campaign_id === campaign?.id) return
                await getCampaign(lead.campaign_id).then(setCampaign)
            })
        } catch (e) {
            showCommonErrorToast(e)
        }
    }, [campaign?.id])

    const { loading, setLoading, fnWithLoading } = useLoading(fetchLeads)

    useEffect(() => {
        if (!numId) return
        fnWithLoading(numId)
    }, [numId, fnWithLoading])

    const handleActive = (lead: LeadDetailed) => {
        if (!lead.active) return enableLead(lead.id).then(() => {
            showToast(`"${leadTitle}" habilitado con éxito`)
            setLead({ ...lead, active: true })
        })
        else return disableLead(lead.id).then(res => {
            if (res.action === "deleted") {
                showToast(`"${leadTitle}" eliminado definitivamente`)
                return nav(`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`)
            }
            else {
                showToast(`"${leadTitle}" deshabilitado con éxito`)
                return setLead({ ...lead, active: false })
            }
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

    const setSlideDirection = useMemo(() => {
        if (!lastMove) return undefined
        if (lastMove === "next") return (isLoadingNavigation || loading) ? "right" : "left"
        else return (isLoadingNavigation || loading) ? "left" : "right"
    }, [lastMove, isLoadingNavigation, loading])

    const [isDeleting, setIsDeleting] = useState<LeadDetailed | null>(null)

    //TO DO: Error de id no disponible
    if (numId === undefined) return <p>Id inválido</p>
    return (
        <LoadingScreenWrapper loading={loading && !lastMove}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', pb: 3 }}>
                {isNavigationValid(numId) &&
                    <Box sx={{ flexShrink: 0, width: "2.5rem", position: "relative" }}>
                        <Box sx={{ position: 'sticky', top: '50vh', transform: 'translateY(-50%)', zIndex: 10 }}>
                            <Fab
                                color="primary"
                                size="small"
                                onClick={handlePrev}
                                disabled={isLoadingNavigation || loading || isFirstItem(numId)}
                            >
                                {isLoadingNavigation || loading ? <CircularProgress size={24} color="inherit" /> : <ArrowBackIosNewIcon />}
                            </Fab>
                        </Box>
                    </Box>}

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Slide in={!loading && !isLoadingNavigation} appear={false} unmountOnExit
                        direction={setSlideDirection}>
                        <Stack spacing={2}>
                            {campaign &&
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Link component={RouterLink} to={`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`}
                                        sx={{ underline: "hover", fontWeight: 600 }} >
                                        {campaign?.name}
                                    </Link>
                                    <Typography sx={{ color: 'text.primary' }}>{leadTitle?.join(" ")}</Typography>
                                </Breadcrumbs>}
                            {lead &&
                                <Grid container spacing={2}>
                                    <Grid size="grow" sx={{ minWidth: "20rem", flexGrow: 2 }} >
                                        <LeadInfo lead={lead} handleActive={() => setIsDeleting(lead)} leadTitle={leadTitle} updateLeadInfo={updateLeadInfo} />
                                    </Grid>
                                    <Grid size="grow" sx={{ minWidth: "22rem", flexGrow: 3 }} component={GenericPaper} >
                                        <LeadActivities lead={lead} reloadAudit={reloadAudit} />
                                    </Grid>
                                </Grid >
                            }
                        </Stack >
                    </Slide>
                </Box>

                {isNavigationValid(numId) &&
                    <Box sx={{ flexShrink: 0, width: '40px' }}>
                        <Box sx={{ position: 'sticky', top: '50vh', transform: 'translateY(-50%)', zIndex: 10 }}>
                            <Fab
                                color="primary"
                                size="small"
                                onClick={handleNext}
                                disabled={isLoadingNavigation || loading || isLastItem(numId)}
                            >
                                {isLoadingNavigation || loading ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardIosIcon />}
                            </Fab>
                        </Box>
                    </Box>}
            </Stack >
            <DisableConfirmDialog entity={isDeleting} clearEntity={() => setIsDeleting(null)}
                idModal="del-lead-det" onConfirm={() => handleActive(lead!)} entityTypeName="el lead" onlyDelete />
        </LoadingScreenWrapper>
    )
}

interface LeadInfoProps {
    lead: LeadDetailed,
    handleActive: (lead: LeadDetailed) => void,
    leadTitle: (string | undefined)[] | null,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
}

export const LeadInfo = ({ lead, leadTitle, handleActive, updateLeadInfo }: LeadInfoProps) => {
    return (
        <Stack spacing={2}>
            <GenericPaper elevation={0}>
                <Stack spacing={3} sx={{ alignItems: "start" }}>
                    <Stack spacing={1} sx={{ width: "100%" }}>
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
                    <LeadTags lead={lead} updateLeadInfo={updateLeadInfo} />
                    <LeadDetailsState lead={lead} updateLeadInfo={updateLeadInfo} contactState={lead.contact_state} flowState={lead.current_state} />
                </Stack>
            </GenericPaper>
            <LeadFieldSections lead={lead} updateLeadInfo={updateLeadInfo} />
        </Stack>
    )
}