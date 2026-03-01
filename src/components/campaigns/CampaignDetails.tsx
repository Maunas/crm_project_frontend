import { useCallback, useEffect, useState } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { CommonButton, DisableButton } from '../common/details/DetailsCommonButton'
import { UpdateCampaignFormSidebar } from './CampaignForms'
import { LeadFieldTable } from '../leadFields/LeadFieldTable'
import { LeadFieldDetail } from '../leadFields/LeadFieldDetail'
import { LeadFieldFormSidebar } from '../leadFields/LeadFieldForm'
import type { Paginable } from '../../types/common'
import type { CampaignDetailed } from '../../types/campaigns'
import type { LeadFieldDetailed } from '../../types/leadFields'
import { disableCampaign, enableCampaign, getCampaign } from './campaignServices'
import { getLeadFields } from '../leadFields/leadFieldServices'
import { useSidebar } from '../hooks/useSidebar'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { Chip, Typography, ButtonGroup, Link, Breadcrumbs, Stack, Grid, Divider } from '@mui/material'
import { ValidationFormSidebar } from '../validations/ValidationForm'

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadFieldDetailed>()
    const nav = useNavigate()

    useEffect(() => {
        closeSidebar()
        if (!id) return
        getCampaign(parseInt(id)).then(res => {
            setCampaign(res)
        })
    }, [id, closeSidebar])

    //Necesaria la lista e n este componente, en lugar de LeadFieldTable,
    // para facilitar la modificación de la lista desde el sidebar.
    const [leadFields, setLeadFields] = useState<Paginable<LeadFieldDetailed> | null>(null)

    const updateLeadFields = useCallback((page: number, pageSize: number) => {
        if (!campaign) return
        getLeadFields({
            detailed: true, campaign_id: campaign.id, only_active: false, page: page, page_size: pageSize
        }).then(setLeadFields)
    }, [campaign, setLeadFields])

    const updateEntity = (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => {
        switch (mode) {
            case "UPDATE_CMP": {
                if (!campaign) break
                return setCampaign(entity as CampaignDetailed)
            }
            case "UPDATE_FIELD": {
                const newLeadField = entity as LeadFieldDetailed
                if (selectedEntity && entity.id === selectedEntity.id) handleSidebar("KEEP", newLeadField)
                if (!leadFields?.items || !(leadFields?.items?.length > 0)) return
                const newLeadFields = [...leadFields.items]
                const fieldIdx = leadFields.items.findIndex(field => field.id === entity.id)
                if (fieldIdx === -1) return
                newLeadFields[fieldIdx] = newLeadField
                return setLeadFields({ ...leadFields, items: newLeadFields })
            }
            case "CREATE_FIELD": {
                if (!leadFields) break
                return updateLeadFields(leadFields.page, leadFields.page_size)
            }
        }
    }

    const handleActiveCampaign = (campaign: CampaignDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_CMP", { ...campaign, active: !campaign.active })
        }
        if (campaign.active) {
            disableCampaign(campaign.id)
                .then(res => {
                    if (res.action === "disabled") updateActive()
                    else {
                        alert("Eliminado")
                        nav("/campaigns")
                    }
                })
        } else {
            enableCampaign(campaign.id)
                .then(updateActive)
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} containerSize="xl"
            sidebarComponent={campaign &&
                <CampaignDetailSidebar mode={sidebarMode} entity={selectedEntity} campaign={campaign} updateLeadFields={() => updateLeadFields(1, leadFields!.page_size!)}
                    handleSidebar={handleSidebar} closeSidebar={closeSidebar} updateEntity={updateEntity} />} >
            <Breadcrumbs aria-label="breadcrumb">
                <Link component={RouterLink} to="/campaigns" underline="hover" color="inherit">
                    Espacios de Trabajo
                </Link>
                {campaign &&
                    <Typography sx={{ color: 'text.primary' }}>{campaign.name}</Typography>}
            </Breadcrumbs>

            {campaign &&
                <Stack spacing={2} >
                    <Grid size={12} container spacing={2} justifyContent="space-between" alignItems="center">
                        <Typography variant="h1" color="initial">{campaign.name}</Typography>
                        {campaign.active ? <Chip color='success' label="Habilitado" /> :
                            <Chip color='error' label="Deshabilitado" />}
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid size="grow" minWidth="30rem">

                            {campaign.description
                                ? <Typography variant="body1" color="initial">{campaign.description}</Typography>
                                : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
                            }
                        </Grid>
                        <Grid container spacing={2} size={{ sm: 12, md: 12, lg: 3 }} minWidth="20rem">
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
                            <Typography variant="h2" color="initial">Acciones</Typography>
                        </Grid >
                        <Grid size="grow" minWidth="20rem" >
                            <ButtonGroup fullWidth>
                                <CommonButton handleClick={() => handleSidebar("UPDATE_CMP", null)} actionType="MODIFY">Modificar</CommonButton>
                                <DisableButton active={campaign.active} handleActive={() => handleActiveCampaign(campaign)} />
                            </ButtonGroup>
                        </Grid >
                    </Grid>
                    <Divider />
                    <LeadFieldTable campaign={campaign} leadFields={leadFields} updateLeadFields={updateLeadFields}
                        handleSidebar={handleSidebar} updateEntity={updateEntity} />
                </Stack>
            }
        </ContainerWithSidebar>
    )
}

interface SidebarProps {
    mode: string | null,
    entity: LeadFieldDetailed | null,
    campaign: CampaignDetailed,
    updateLeadFields: () => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    closeSidebar: () => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
}
const CampaignDetailSidebar = ({ mode, entity, campaign, updateLeadFields, handleSidebar, closeSidebar, updateEntity }: SidebarProps) => {
    switch (mode) {
        case "UPDATE_CMP":
            return <UpdateCampaignFormSidebar existingCmp={campaign}
                closeSidebar={closeSidebar} updateEntityOnList={(entity) => updateEntity(mode, entity)} />
        case "DETAILS_FIELD":
            return <LeadFieldDetail leadField={entity as LeadFieldDetailed} updateLeadFields={updateLeadFields}
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
                handleSidebar={handleSidebar}/>
    }
}