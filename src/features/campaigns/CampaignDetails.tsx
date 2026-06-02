import { useCallback, useEffect, useState } from 'react'
import { UpdateCampaignFormSidebar } from './CampaignForms'
import { LeadFieldTable } from '../leadFields/LeadFieldTable'
import ContainerWithSidebar from 'shared/layout/container/GenericContainer'
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog'
import HandleActiveButton from 'shared/ui/buttons/HandleActiveButton'
import LoadingScreenWrapper from 'shared/feedback/LoadingScreen'
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
            <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} containerSize="xl" sidebarWidth='45rem'
                sidebarComponent={campaign &&
                    <UpdateCampaignFormSidebar existingCmp={campaign} closeSidebar={closeSidebar} updateCampaignData={updateCampaignData} />}
            >
                <Stack spacing={3}>
                    <Stack spacing={2}>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link component={RouterLink} to="/campaigns" underline="hover" color="inherit">
                                Espacios de Trabajo
                            </Link>
                            {campaign &&
                                <Typography sx={{ color: 'text.primary' }}>{campaign.name}</Typography>}
                        </Breadcrumbs>
                        {campaign &&
                            <TitleAndActive active={campaign.active} >
                                <Typography variant="h1">{campaign.name}</Typography>
                            </TitleAndActive>
                        }
                    </Stack>
                    {campaign &&
                        <Stack spacing={2} >
                            {campaign.description &&
                                <Typography variant="body1">{campaign.description}</Typography>
                            }
                            <DetailsMetadata entity={campaign} />
                            <Divider />
                            <Stack spacing={2} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                                <Typography variant="h2">Acciones</Typography>
                                <ButtonGroup sx={{ marginLeft: "auto" }}>
                                    <HandleActiveButton active={campaign.active} handleActive={() => setDeletingCmp(campaign)} />
                                    <CommonButton onClick={() => handleSidebar("UPDATE_CMP", null)} actionType="MODIFY">Modificar</CommonButton>
                                    <CommonButton component={RouterLink} variant='outlined' to={`/leads?workspace=${campaign.workspace_id}&campaign=${campaign.id}`}
                                        actionType="LIST">Ver Lista de Leads</CommonButton>
                                </ButtonGroup>
                            </Stack>
                            <Divider />
                            <LeadFieldTable campaign={campaign} cmpSidebarMode={sidebarMode} closeCmpSidebar={closeSidebar} />
                        </Stack>
                    }
                </Stack>
                <DisableConfirmDialog idModal='conf-delete-cmp-det' entity={deletingCmp} clearEntity={() => setDeletingCmp(null)} entityTypeName="la campaña"
                    onConfirm={() => handleActiveCampaign(deletingCmp!)} />
            </ContainerWithSidebar >
        </LoadingScreenWrapper>
    )
}
