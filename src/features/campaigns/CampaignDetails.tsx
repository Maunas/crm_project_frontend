import { useCallback, useEffect, useState } from 'react'
import { UpdateCampaignFormSidebar } from './CampaignForms'
import { LeadFieldList } from '../leadFields/LeadFieldList'
import ContainerWithSidebar from 'shared/layout/container/GenericContainer'
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog'
import HandleActiveButton from 'shared/ui/buttons/HandleActiveButton'
import LoadingScreenWrapper from 'shared/feedback/LoadingScreen'
import GenericPaper from 'shared/layout/container/GenericPaper'
import DetailsMetadata from 'shared/ui/details/DetailsMetadata'
import TitleAndActive from 'shared/ui/details/TitleAndActive'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { useSidebar } from 'src/hooks/useSidebar'
import { useLoading } from 'src/hooks/useLoading'
import type { CampaignDetailed } from 'src/types/campaigns'
import { disableCampaign, enableCampaign, getCampaign } from './campaignServices'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { Typography, ButtonGroup, Link, Breadcrumbs, Stack, Divider } from '@mui/material'

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)

    const { sidebarMode, handleSidebar, closeSidebar } = useSidebar<CampaignDetailed>("id")

    const nav = useNavigate()

    const fetchCmpDetails = useCallback((id: number) => (
        getCampaign(id).then(res => {
            setCampaign(res)
        })), [])

    const { fnWithLoading: fetchCmpLoad, loading } = useLoading(fetchCmpDetails)

    useEffect(() => {
        closeSidebar()
        if (!id) return
        fetchCmpLoad(Number(id))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    //Define como actualizar la lista dependiendo de la acción realizada. 
    // Para CREATE se vuelve a hacer fetch de la página para no arruinar la paginación
    const updateCampaignData = useCallback((entity: CampaignDetailed) => {
        if (!campaign) return
        return setCampaign(entity)
    }, [campaign])

    const handleActiveCampaign = useCallback((campaign: CampaignDetailed) => {
        const updateActive = () => {
            updateCampaignData({ ...campaign, active: !campaign.active })
        }
        if (campaign.active) {
            return disableCampaign(campaign.id!)
                .then(res => {
                    if (res.action === "disabled") {
                        updateActive()
                        showToast(`"${campaign.name}" deshabilitado con éxito.`)
                    }
                    else {
                        nav("/campaigns")
                        showToast(`"${campaign.name}" eliminado definitivamente.`)
                    }
                })
                .catch(e => showCommonErrorToast(e))
        } else {
            return enableCampaign(campaign.id!)
                .then(() => {
                    updateActive()
                    showToast(`"${campaign.name}" habilitado con éxito.`)
                })
                .catch(e => showCommonErrorToast(e))
        }
    }, [nav, updateCampaignData])

    const [deletingCmp, setDeletingCmp] = useState<CampaignDetailed | null>(null)

    return (
        <LoadingScreenWrapper loading={loading}>
            <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar}
                containerSize="xl" sidebarWidth='45rem' noPaper
                sidebarComponent={campaign &&
                    <UpdateCampaignFormSidebar existingCmp={campaign} closeSidebar={closeSidebar} updateCampaignData={updateCampaignData} />}
            >
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link component={RouterLink} to="/campaigns" underline="hover" color="inherit">
                        Espacios de Trabajo
                    </Link>
                    {campaign &&
                        <Typography sx={{ color: 'text.primary' }}>{campaign.name}</Typography>}
                </Breadcrumbs>
                <Stack spacing={3}>
                    <GenericPaper>
                        <Stack spacing={3}>
                            {campaign &&
                                <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <TitleAndActive active={campaign.active} >
                                        <Stack>
                                            <Typography variant="h1">{campaign.name}</Typography>
                                            {campaign.description &&
                                                <Typography variant="body1" color="textSecondary">{campaign.description}</Typography>}
                                        </Stack>
                                    </TitleAndActive>
                                    <Stack spacing={2} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", ml: "auto" }}>
                                        <ButtonGroup sx={{ marginLeft: "auto" }}>
                                            <CommonButton component={RouterLink} variant='outlined' to={`/leads?workspace=${campaign.workspace_id}&campaign=${campaign.id}`}
                                                actionType="LIST" onlyTooltip color="secondary">Ver Leads</CommonButton>
                                            <CommonButton component={RouterLink} variant='outlined' to={`/automations/?campaign_id=${campaign.id}`}
                                                actionType="LIST">Automatizaciones</CommonButton>
                                            <HandleActiveButton active={campaign.active} handleActive={() => setDeletingCmp(campaign)} onlyTooltip />
                                            <CommonButton onClick={() => handleSidebar("UPDATE_CMP", null)} actionType="MODIFY" onlyTooltip>Modificar</CommonButton>
                                        </ButtonGroup>
                                    </Stack>
                                </Stack>
                            }
                            {campaign && <>
                                <Divider />
                                <DetailsMetadata entity={campaign} />
                            </>}
                        </Stack>
                    </GenericPaper>
                    {campaign &&
                        <GenericPaper>
                            <LeadFieldList campaign={campaign} cmpSidebarMode={sidebarMode} closeCmpSidebar={closeSidebar} />
                        </GenericPaper>}
                </Stack>
                <DisableConfirmDialog idModal='conf-delete-cmp-det' entity={deletingCmp} clearEntity={() => setDeletingCmp(null)} entityTypeName="la campaña"
                    onConfirm={() => handleActiveCampaign(deletingCmp!)} />
            </ContainerWithSidebar >
        </LoadingScreenWrapper >
    )
}
