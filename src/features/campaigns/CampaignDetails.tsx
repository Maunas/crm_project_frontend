import { useCallback, useEffect, useState } from 'react'
import { UpdateCampaignFormSidebar } from './CampaignForms'
import { ValidationFormSidebar } from '../validations/ValidationForm'
import { LeadFieldFormSidebar } from '../leadFields/LeadFieldForm'
import { LeadFieldDetail } from '../leadFields/LeadFieldDetail'
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
import type { LeadFieldDetailed } from 'src/types/leadFields'
import type { CampaignDetailed } from 'src/types/campaigns'
import { disableCampaign, enableCampaign, getCampaign } from './campaignServices'
import { getLeadField, getLeadFields } from '../leadFields/leadFieldServices'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Typography, ButtonGroup, Link, Breadcrumbs, Stack, Divider } from '@mui/material'

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadFieldDetailed>("id", params, setParams, getLeadField, "DETAILS_FIELD")

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

    //Necesaria la lista en este componente, en lugar de LeadFieldTable,
    // para facilitar la modificación de la lista desde el sidebar.
    const [leadFields, setLeadFields] = useState<LeadFieldDetailed[] | null>(null)

    const fetchLeadFields = useCallback(() => {
        return getLeadFields({
            detailed: true, campaign_id: Number(id), only_active: false, page_size: 0
        }).then(res => setLeadFields(res.items))
    }, [setLeadFields, id])

    const { loading: fieldsLoading, fnWithLoading: fetchFieldsLoad } = useLoading(fetchLeadFields)

    //Define como actualizar la lista dependiendo de la acción realizada. 
    // Para CREATE se vuelve a hacer fetch de la página para no arruinar la paginación
    const updateEntity = useCallback((mode: string, entity: CampaignDetailed | LeadFieldDetailed) => {
        switch (mode) {
            case "UPDATE_CMP": {
                if (!campaign) break
                return setCampaign(entity as CampaignDetailed)
            }
            case "UPDATE_FIELD": {
                const newLeadField = entity as LeadFieldDetailed
                if (newLeadField.id === selectedEntity?.id) {
                    handleSidebar("KEEP", newLeadField)
                }
                return setLeadFields(prevList => {
                    if (!prevList || !(prevList?.length > 0)) return prevList
                    const newLeadFields = [...prevList]
                    const fieldIdx = prevList.findIndex(field => field.id === newLeadField.id)
                    if (fieldIdx === -1) return prevList
                    newLeadFields[fieldIdx] = newLeadField
                    return newLeadFields
                })
            }
            case "CREATE_FIELD": {
                return fetchFieldsLoad()
            }
            case "DELETE_FIELD": {
                return setLeadFields(prevList => {
                    if (!prevList || !(prevList?.length > 0)) return prevList
                    const newLeadFields = [...prevList]
                    const fieldIdx = prevList.findIndex(field => field.id === entity.id)
                    if (fieldIdx === -1) return prevList
                    newLeadFields.splice(fieldIdx, 1)
                    if (selectedEntity && entity.id === selectedEntity.id) closeSidebar()
                    return newLeadFields
                })
            }
        }
    }, [campaign, closeSidebar, selectedEntity, fetchFieldsLoad, handleSidebar])

    const handleActiveCampaign = useCallback((campaign: CampaignDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_CMP", { ...campaign, active: !campaign.active })
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
    }, [nav, updateEntity])

    const [deletingCmp, setDeletingCmp] = useState<CampaignDetailed | null>(null)

    return (
        <LoadingScreenWrapper loading={loading}>
            <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} containerSize="xl" sidebarWidth='45rem'
                sidebarComponent={campaign &&
                    <CampaignDetailSidebar mode={sidebarMode} entity={selectedEntity} campaign={campaign} leadFieldListLength={leadFields?.length}
                        handleSidebar={handleSidebar} closeSidebar={closeSidebar} updateEntity={updateEntity} />}
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
                            <LeadFieldTable campaign={campaign} leadFields={leadFields} updateLeadFields={fetchFieldsLoad} loading={fieldsLoading}
                                handleSidebar={handleSidebar} updateEntity={updateEntity} />
                        </Stack>
                    }
                </Stack>
                <DisableConfirmDialog idModal='conf-delete-cmp-det' entity={deletingCmp} clearEntity={() => setDeletingCmp(null)} entityTypeName="la campaña"
                    onConfirm={() => handleActiveCampaign(deletingCmp!)} />
            </ContainerWithSidebar >
        </LoadingScreenWrapper>
    )
}

interface SidebarProps {
    mode: string | null,
    entity: LeadFieldDetailed | null,
    campaign: CampaignDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    closeSidebar: () => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
    leadFieldListLength?: number
}
const CampaignDetailSidebar = ({ mode, entity, campaign, handleSidebar, closeSidebar, updateEntity, leadFieldListLength }: SidebarProps) => {
    switch (mode) {
        case "UPDATE_CMP":
            return <UpdateCampaignFormSidebar existingCmp={campaign}
                closeSidebar={closeSidebar} updateEntityOnList={(entity) => updateEntity(mode, entity)} />
        case "DETAILS_FIELD":
            return <LeadFieldDetail leadField={entity as LeadFieldDetailed} leadFieldListLength={leadFieldListLength}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar} updateEntity={updateEntity} />
        case "CREATE_FIELD":
            return <LeadFieldFormSidebar campaign={campaign} closeSidebar={closeSidebar} handleSidebar={handleSidebar}
                updateEntityOnList={(entity) => updateEntity(mode, entity)} />
        case "UPDATE_FIELD":
            return <LeadFieldFormSidebar existingLF={entity as LeadFieldDetailed} campaign={campaign}
                updateEntityOnList={(entity) => updateEntity(mode, entity)}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar} />
        case "UPDATE_VAL":
            return <ValidationFormSidebar leadField={entity as LeadFieldDetailed}
                updateEntityOnList={(entity) => updateEntity("UPDATE_FIELD", entity)}
                handleSidebar={handleSidebar} />
    }
}