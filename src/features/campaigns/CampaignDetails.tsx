import { useCallback, useEffect, useState } from 'react'
import { UpdateCampaignFormSidebar } from './CampaignForms'
import { LeadFieldTable } from '../leadFields/LeadFieldTable'
import { LeadFieldDetail } from '../leadFields/LeadFieldDetail'
import { LeadFieldFormSidebar } from '../leadFields/LeadFieldForm'
import { ValidationFormSidebar } from '../validations/ValidationForm'
import ContainerWithSidebar from 'shared/layout/container/GenericContainer'
import TitleAndActive from 'shared/ui/details/TitleAndActive'
import CommonButton from 'shared/ui/buttons/CommonButton'
import HandleActiveButton from 'shared/ui/buttons/HandleActiveButton'
import DetailsMetadata from 'shared/ui/details/DetailsMetadata'
import { useSidebar } from 'src/hooks/useSidebar'
import type { CampaignDetailed } from 'src/types/campaigns'
import type { LeadFieldDetailed } from 'src/types/leadFields'
import { disableCampaign, enableCampaign, getCampaign } from './campaignServices'
import { getLeadField, getLeadFields } from '../leadFields/leadFieldServices'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Typography, ButtonGroup, Link, Breadcrumbs, Stack, Divider } from '@mui/material'

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadFieldDetailed>("id", params, setParams, getLeadField, "DETAILS_FIELD")

    const nav = useNavigate()

    useEffect(() => {
        closeSidebar()
        if (!id) return
        getCampaign(parseInt(id)).then(res => {
            setCampaign(res)
        })
    }, [id, closeSidebar])

    //Necesaria la lista en este componente, en lugar de LeadFieldTable,
    // para facilitar la modificación de la lista desde el sidebar.
    const [leadFields, setLeadFields] = useState<LeadFieldDetailed[] | null>(null)

    const updateLeadFields = useCallback(() => {
        getLeadFields({
            detailed: true, campaign_id: Number(id), only_active: false, page_size: 0
        }).then(res => setLeadFields(res.items))
    }, [setLeadFields, id])

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
                return updateLeadFields()
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
    }, [campaign, closeSidebar, selectedEntity, updateLeadFields, handleSidebar])

    const handleActiveCampaign = useCallback((campaign: CampaignDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_CMP", { ...campaign, active: !campaign.active })
        }
        if (campaign.active) {
            disableCampaign(campaign.id!)
                .then(res => {
                    if (res.action === "disabled") updateActive()
                    else {
                        alert("Eliminado")
                        nav("/campaigns")
                    }
                })
        } else {
            enableCampaign(campaign.id!)
                .then(updateActive)
        }
    }, [nav, updateEntity])

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} containerSize="xl"
            sidebarComponent={campaign &&
                <CampaignDetailSidebar mode={sidebarMode} entity={selectedEntity} campaign={campaign}
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
                                <HandleActiveButton active={campaign.active} handleActive={() => handleActiveCampaign(campaign)} />
                                <CommonButton onClick={() => handleSidebar("UPDATE_CMP", null)} actionType="MODIFY">Modificar</CommonButton>
                                <CommonButton component={RouterLink} variant='outlined' to={`/leads?workspace=${campaign.workspace_id}&campaign=${campaign.id}`}
                                    actionType="LIST">Ver Lista de Leads</CommonButton>
                            </ButtonGroup>
                        </Stack>
                        <Divider />
                        <LeadFieldTable campaign={campaign} leadFields={leadFields} updateLeadFields={updateLeadFields}
                            handleSidebar={handleSidebar} updateEntity={updateEntity} />
                    </Stack>
                }
            </Stack>
        </ContainerWithSidebar >
    )
}

interface SidebarProps {
    mode: string | null,
    entity: LeadFieldDetailed | null,
    campaign: CampaignDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    closeSidebar: () => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
}
const CampaignDetailSidebar = ({ mode, entity, campaign, handleSidebar, closeSidebar, updateEntity }: SidebarProps) => {
    switch (mode) {
        case "UPDATE_CMP":
            return <UpdateCampaignFormSidebar existingCmp={campaign}
                closeSidebar={closeSidebar} updateEntityOnList={(entity) => updateEntity(mode, entity)} />
        case "DETAILS_FIELD":
            return <LeadFieldDetail leadField={entity as LeadFieldDetailed}
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