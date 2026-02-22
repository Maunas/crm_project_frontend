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

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<CampaignDetailed | null>(null)
    const [fields, setFields] = useState<Paginable<LeadFieldDetailed> | null>(null)

    const nav = useNavigate()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar()

    const { page, pageSize, pageComponentProps } = useListPagination(fields?.total_pages ?? 0, 2)

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
        if (campaign.active) {
            disableCampaign(campaign.id)
                .then(res => {
                    if (res.action === "disabled") {
                        updateEntity({ ...campaign, active: false }, "UPDATE_CMP")
                    } else {
                        alert("Eliminado")
                        nav("/campaigns")
                    }
                }).catch(() => alert("error"))
        } else {
            enableCampaign(campaign.id)
                .then(() => {
                    updateEntity({ ...campaign, active: true }, "UPDATE_CMP")
                }).catch(() => alert("error"))
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
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode}
            sidebarComponent={
                <CampaignDetailSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} updateEntity={updateEntity} />} >
            <Breadcrumbs aria-label="breadcrumb">
                <Link component={RouterLink} to="/campaigns" underline="hover" color="inherit">
                    Campañas
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
                        <Grid container spacing={2} size="grow" minWidth="20rem">

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
                    <Typography variant="h2" color="initial">Acciones</Typography>
                    <Grid size="grow" width="grow" container justifyContent="center" alignItems="center" marginInline={2}>
                        <Grid size="grow" />
                        <Grid size="grow" minWidth="30rem" >
                            <ButtonGroup variant="contained" fullWidth>
                                <Button onClick={() => handleSidebar("UPDATE_CMP", campaign)} fullWidth>Modificar</Button>
                                <Button variant='contained' color="secondary" fullWidth
                                    onClick={() => handleActiveCampaign(campaign)}>
                                    Deshabilitar
                                </Button>
                            </ButtonGroup>
                        </Grid >
                        <Grid size="grow" />
                    </Grid>
                    <Divider />
                    <Typography variant="h2" color="initial" width="100%">Campos de Lead</Typography>
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
                    <ButtonGroup variant="contained" >

                        <Button component={RouterLink} variant='contained' to={`/leadfield/new/${id}`} fullWidth>
                            Agregar nuevo campo
                        </Button>
                        <GenericModal buttonText='Vista previa de formulario' buttonProps={{ variant: "outlined", fullWidth: true }} containerSx={{ minWidth: "80vw" }} >
                            {campaign && fields?.items?.length > 0 &&
                                <SimulateLead campaignId={campaign.id} leadFields={fields.items} />
                            }
                        </GenericModal>
                    </ButtonGroup>

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