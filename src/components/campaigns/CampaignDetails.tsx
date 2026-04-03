import { useCallback, useEffect, useState } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { CommonButton, DisableButton } from '../common/details/DetailsCommonButton'
import { UpdateCampaignFormSidebar } from './CampaignForms'
import { LeadFieldTable } from '../leadFields/LeadFieldTable'
import { LeadFieldDetail } from '../leadFields/LeadFieldDetail'
import { LeadFieldFormSidebar } from '../leadFields/LeadFieldForm'
import { CustomChip } from '../../theme/styledMUIDisplayComponents'
import type { CampaignDetailed } from '../../types/campaigns'
import type { LeadFieldDetailed } from '../../types/leadFields'
import { disableCampaign, enableCampaign, getCampaign } from './campaignServices'
import { getLeadField, getLeadFields } from '../leadFields/leadFieldServices'
import { useSidebar } from '../hooks/useSidebar'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { Typography, ButtonGroup, Link, Breadcrumbs, Stack, Grid, Divider } from '@mui/material'
import { ValidationFormSidebar } from '../validations/ValidationForm'

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadFieldDetailed>(params, setParams, getLeadField, "DETAILS_FIELD", 'id')

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
    const updateEntity = (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => {
        switch (mode) {
            case "UPDATE_CMP": {
                if (!campaign) break
                return setCampaign(entity as CampaignDetailed)
            }
            case "UPDATE_FIELD": {
                const newLeadField = entity as LeadFieldDetailed
                if (!leadFields || !(leadFields?.length > 0)) return
                const newLeadFields = [...leadFields]
                const fieldIdx = leadFields.findIndex(field => field.id === newLeadField.id)
                if (fieldIdx === -1) return
                newLeadFields[fieldIdx] = newLeadField
                return setLeadFields(newLeadFields)
            }
            case "CREATE_FIELD": {
                if (!leadFields) break
                return updateLeadFields()
            }
            case "DELETE_FIELD": {
                if (!leadFields || !(leadFields?.length > 0)) return
                const newLeadFields = [...leadFields]
                const fieldIdx = leadFields.findIndex(field => field.id === entity.id)
                newLeadFields.splice(fieldIdx, 1)
                if (selectedEntity && entity.id === selectedEntity.id) closeSidebar()
                return setLeadFields(newLeadFields)
            }
        }
    }

    const handleActiveCampaign = (campaign: CampaignDetailed) => {
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
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} containerSize="xl"
            sidebarComponent={campaign &&
                <CampaignDetailSidebar mode={sidebarMode} entity={selectedEntity} campaign={campaign}
                    handleSidebar={handleSidebar} closeSidebar={closeSidebar} updateEntity={updateEntity} />}
        >
            <Stack gap={3}>
                <Stack gap={2}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link component={RouterLink} to="/campaigns" underline="hover" color="inherit">
                            Espacios de Trabajo
                        </Link>
                        {campaign &&
                            <Typography sx={{ color: 'text.primary' }}>{campaign.name}</Typography>}
                    </Breadcrumbs>
                    {campaign &&
                        <Grid size="grow" container gap={3} justifyContent="space-between" alignItems="center">
                            <Typography variant="h1">{campaign.name}</Typography>
                            {campaign.active ? <CustomChip sx={{ marginLeft: "auto" }} color='success' label="Habilitado" /> :
                                <CustomChip sx={{ marginLeft: "auto" }} color='error' label="Deshabilitado" />}
                        </Grid>
                    }
                </Stack>
                {campaign &&
                    <Stack spacing={2} >
                        <Grid container spacing={2}>
                            <Grid size="grow" minWidth="30rem">
                                {campaign.description
                                    ? <Typography variant="body1">{campaign.description}</Typography>
                                    : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
                                }
                            </Grid>
                            <Grid container spacing=".5rem" size={{ sm: 12, md: 12, lg: 3 }} minWidth="20rem">
                                <Grid size="grow" minWidth="18rem">
                                    <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                                    <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                                        {dayjs(campaign?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                                    </Typography>
                                </Grid>
                                <Grid size="grow" minWidth="18rem">
                                    <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>
                                    <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                                        {dayjs(campaign?.updated_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Divider />
                        <Grid size="grow" container justifyContent="center" alignItems="center" gap={2}>
                            <Grid size="grow" minWidth="16rem" >
                                <Typography variant="h2">Acciones</Typography>
                            </Grid >
                                <ButtonGroup sx={{ marginLeft: "auto" }}>
                                    <CommonButton handleClick={() => handleSidebar("UPDATE_CMP", null)} actionType="MODIFY">Modificar</CommonButton>
                                    <DisableButton active={campaign.active} handleActive={() => handleActiveCampaign(campaign)} />
                                </ButtonGroup>
                        </Grid>
                        <Divider />
                        <LeadFieldTable campaign={campaign} leadFields={leadFields} updateLeadFields={updateLeadFields}
                            handleSidebar={handleSidebar} updateEntity={updateEntity} />
                    </Stack>
                }
            </Stack>
        </ContainerWithSidebar>
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