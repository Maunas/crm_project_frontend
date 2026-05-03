import { useLeadNavigation } from "../../../contexts/LeadNavigationContext.tsx"; // Ajusta la ruta
import { Box, Fab, CircularProgress } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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

export const LeadDetailsLayout = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const nav = useNavigate()
    const leadIdNum = Number(id);

    // 1. Traemos las funciones del contexto
    const { getNextLeadId, getPrevLeadId, isLoadingNavigation } = useLeadNavigation();

    // 2. Funciones de navegación
    const handleNext = async () => {
        const nextId = await getNextLeadId(leadIdNum);
        if (nextId) nav(`/leads/${nextId}`);
    };

    const handlePrev = async () => {
        const prevId = await getPrevLeadId(leadIdNum);
        if (prevId) nav(`/leads/${prevId}`);
    };

    // 3. Efecto para escuchar las flechas del teclado
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
    }, [leadIdNum]); // Es importante que leadIdNum esté en las dependencias

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

    const updateLeadInfo = (newLead: LeadDetailed) => {
        setLead(newLead)
        setReloadAudit(prev => prev + 1)
    }

    const leadTitle = useMemo(() => {
        if (!lead) return ""
        return getLeadTitleArray(lead).join(" ")
    }, [lead])

    //reconoce cambios para actualizar la lista de audit
    const [reloadAudit, setReloadAudit] = useState<number>(0)


    return (
        <Container maxWidth={false}>
            {/* --- BOTÓN ANTERIOR (Flotante a la izquierda) --- */}
            <Fab 
                color="primary" 
                size="small" 
                onClick={handlePrev} 
                disabled={isLoadingNavigation}
                sx={{ 
                    position: 'fixed', 
                    left: 24, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 1200 
                }}
            >
                {isLoadingNavigation ? <CircularProgress size={24} color="inherit" /> : <ArrowBackIosNewIcon />}
            </Fab>

            {/* --- BOTÓN SIGUIENTE (Flotante a la derecha) --- */}
            <Fab 
                color="primary" 
                size="small" 
                onClick={handleNext} 
                disabled={isLoadingNavigation}
                sx={{ 
                    position: 'fixed', 
                    right: 24, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 1200 
                }}
            >
                {isLoadingNavigation ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardIosIcon />}
            </Fab>
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
        </Container >
    )
}


interface LeadInfoProps {
    lead: LeadDetailed,
    handleActive: (lead: LeadDetailed) => void,
    leadTitle: string,
    updateLeadInfo: (lead: LeadDetailed) => void
}

export const LeadInfo = ({ lead, leadTitle, handleActive, updateLeadInfo }: LeadInfoProps) => {

    return (
        <Stack spacing={2}>
            <GenericPaper>
                <Stack spacing={3} sx={{ alignItems: "center" }}>
                    <TitleAndActive active={lead?.active} >
                        <Typography variant="h1">{leadTitle.length > 0 ? leadTitle : "Título no encontrado"}</Typography>
                    </TitleAndActive>
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