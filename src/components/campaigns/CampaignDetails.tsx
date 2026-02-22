import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import type { LeadFieldDetailed } from '../../types/leadFields'
import { Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, ButtonGroup, Link, Breadcrumbs, Stack, Grid, Divider, Box, IconButton, Paper } from '@mui/material'
import type { CampaignDetailed } from '../../types/campaigns'
import { activeLeadField, deleteLeadField, getLeadFields } from '../leadFields/leadFieldServices'
import { ContainerWithSidebar, GenericModal } from '../common/layout/GenericContainer'
import { SimulateLead } from '../lead/LeadForm'
import EditIcon from '@mui/icons-material/Edit';
import { disableCampaign, enableCampaign, getCampaign } from './campaignServices'
import { useSidebar } from '../hooks/useSidebar'
import dayjs from 'dayjs'
import { CampaignFormSidebar } from './CampaignForms'
import { EnabledIcon } from '../common/lists/Badges'
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { useListPagination } from '../hooks/useListPagination'
import type { Paginable } from '../../types/common'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { CommonButton, DisableButton } from '../common/details/DetailsCommonButton'

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)
    const [fields, setFields] = useState<Paginable<LeadFieldDetailed> | null>(null)

    const nav = useNavigate()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar()

    const { page, pageSize, pageComponentProps } = useListPagination(fields?.total_pages ?? 0)

    useEffect(() => {
        if (!id) return
        getCampaign(parseInt(id)).then(res => {
            setCampaign(res)
        })
    }, [id])
    useEffect(() => {
        if (!id) return
        getLeadFields({
            detailed: true, campaign_id: parseInt(id), only_active: false, page: page, page_size: pageSize
        })
            .then(setFields)
    }, [id, page, pageSize])

    const handleActive = (fieldIdx: number) => {
        const newFields = [...fields]
        if (fields[fieldIdx].active) {
            deleteLeadField(fields[fieldIdx].id)
                .then(() => {
                    newFields[fieldIdx].active = false
                    setFields(newFields)
                }).catch(() => alert("error"))
        } else {
            activeLeadField(fields[fieldIdx].id)
                .then(() => {
                    newFields[fieldIdx].active = true
                    setFields(newFields)
                }).catch(() => alert("error"))
        }
    }

    const handleActiveCampaign = (campaign: CampaignDetailed) => {

        const updateActive = () => {
            updateEntity({ ...campaign, active: !campaign.active }, "UPDATE_CMP")
        }

        if (campaign.active) {
            disableCampaign(campaign.id)
                .then(res => {
                    if (res.action === "disabled") {
                        updateActive()
                    } else {
                        alert("Eliminado")
                        nav("/campaigns")
                    }
                })
        } else {
            enableCampaign(campaign.id)
                .then(updateActive)
        }
    }

    const updateEntity = (newCampaign: CampaignDetailed, mode: string) => {
        switch (mode) {
            case "UPDATE_CMP": {
                if (!campaign) break
                setCampaign(newCampaign)
                break;
            }
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} containerSize="xl"
            sidebarComponent={
                <CampaignDetailSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} updateEntity={updateEntity} />} >
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
                                <CommonButton handleClick={() => handleSidebar("UPDATE_CMP", campaign)} actionType="MODIFY">Modificar</CommonButton>
                                <DisableButton active={campaign.active} handleActive={() => handleActiveCampaign(campaign)} />
                            </ButtonGroup>
                        </Grid >
                    </Grid>
                    <Divider />
                    <Grid size="grow" container justifyContent="center" alignItems="center" gap={2}>

                        <Grid size="grow" minWidth="16rem" >
                            <Typography variant="h2">Lista de Campos de Lead</Typography>

                        </Grid >

                        <Grid size="grow" minWidth="22rem" >
                            <ButtonGroup fullWidth>
                                <CommonButton component={RouterLink} to={`/leadfield/new/${id}`} actionType="CREATE">Agregar Campo</CommonButton>
                                <GenericModal buttonText='Vista previa de formulario' actionType="DETAILS" variant="outlined" containerSx={{ minWidth: "80vw" }} >
                                    {campaign && fields?.items?.length > 0 &&
                                        <SimulateLead campaignId={campaign.id} leadFields={fields.items} />
                                    }
                                </GenericModal>
                            </ButtonGroup>
                        </Grid >
                    </Grid>


                    <TableContainer component={Paper} >
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell align="right">Tipo</TableCell>
                                    <TableCell align="right">Subtipo</TableCell>
                                    <TableCell align="right">Obligatorio</TableCell>
                                    <TableCell align="right">Único</TableCell>
                                    <TableCell align="right">Visible</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fields?.items?.sort((a, b) => a.order - b.order)
                                    .map((row, idx) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th">{row.order}</TableCell>
                                            <TableCell component="th">
                                                <Stack spacing={1} direction="row">
                                                    <EnabledIcon active={row.active} />
                                                    <Typography fontWeight="bold">{row.name} </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">{row.field_type_code}</TableCell>
                                            <TableCell align="right">{row.field_subtype_code ?? "Sin subtipo"}</TableCell>

                                            <TableCell align="right">
                                                <EnabledIcon active={row.required} trueTooltip='Obligatorio' falseTooltip='Opcional' />
                                            </TableCell>
                                            <TableCell align="right">
                                                <EnabledIcon active={row.is_primary} trueTooltip='Único' falseTooltip='Repetible' />
                                            </TableCell>
                                            <TableCell align="right">
                                                <EnabledIcon active={row.is_visible} trueTooltip='Visible' falseTooltip='Oculto' />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" justifyContent="end">
                                                    <IconButton size='small' edge="end" onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                                        <SearchIcon />
                                                    </IconButton>
                                                    {idx > 1 &&
                                                        <>
                                                            <IconButton size='small' edge="end" component={RouterLink} to={`/leadfield/modify/${row.id}`}>
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton size='small' edge="end" onClick={() => handleActive(idx)}>
                                                                {row.active ?
                                                                    <DeleteIcon color="error" /> :
                                                                    <RestoreFromTrashIcon color="success" />
                                                                }
                                                            </IconButton>
                                                        </>}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <PaginationComponent {...pageComponentProps} />


                </Stack>
            }
        </ContainerWithSidebar>
    )
}

interface SidebarProps {
    mode: string | null,
    entity: CampaignDetailed | LeadFieldDetailed | null,
    closeSidebar: () => void,
    updateEntity: (entity: CampaignDetailed | LeadFieldDetailed, mode: string) => void,
    handleSidebar: (mode: string, entity: CampaignDetailed | LeadFieldDetailed | null) => void,
    handleActive: (org: CampaignDetailed | LeadFieldDetailed) => void,
}
const CampaignDetailSidebar = ({ mode, entity, closeSidebar, updateEntity, handleSidebar, handleActive }: SidebarProps) => {
    switch (mode) {
        case "UPDATE_CMP":
            return <CampaignFormSidebar existingCmp={entity as CampaignDetailed}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar}
                updateEntityOnList={(entity) => updateEntity(entity, mode)} />
    }
}