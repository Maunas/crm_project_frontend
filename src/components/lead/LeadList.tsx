import { useEffect, useMemo, useState } from 'react'
import { ControlledCheckbox, ControlledNumber } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import type { LeadListParams, Paginable } from '../../types/common'
import type { Lead } from '../../types/leads'
import type { LeadField, LeadFieldValue } from '../../types/leadFields'
import type { Campaign, Workspace } from '../../types/campaigns'
import { useListPagination } from '../hooks/useListPagination'
import { getLeads } from './leadService'
import { getLeadFields } from '../leadFields/leadFieldServices'
import { getWorkspaces } from '../workspaces/workspaceServices'
import { getCampaigns } from '../campaigns/campaignServices'
import { useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography, Grid, TableContainer, Paper, Table, TableRow, TableCell, TableBody, TableHead, Stack } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const LeadList = () => {

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
    const [filters, setFilters] = useState<LeadListParams>({ workspace_id: 1, campaign_id: 1, only_active: true, page_size: 20 })

    const { fetchPage, pageComponentProps } = useListPagination(leads)

    useEffect(() => {
        if (!campaignId) return
        fetchLeads(fetchPage, filters, headers)
    }, [campaignId, fetchPage, refresh])

    const { control, handleSubmit } = useForm<LeadListParams>({
        defaultValues: { workspace_id: filters.workspace_id, campaign_id: filters.campaign_id, only_active: filters.only_active, page_size: filters.page_size }
    })

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(res => setWorkspaces(res.items))
    }, [])

    const selectedWorkspace = useWatch<LeadListParams>({ name: "workspace_id", control })

    useEffect(() => {
        if (!selectedWorkspace) return
        getCampaigns({ only_active: true, workspace_id: selectedWorkspace as number, page_size: 0 }).then(res => setCampaigns(res.items))
    }, [selectedWorkspace])

    const applyFilters = (data: LeadListParams) => {
        const newFilters = { ...filters, ...data }
        setFilters(newFilters)
        getLeads({ page: 1, ...newFilters }).then(setLeads)
    }

    return (
        <Stack spacing={2}>
            <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h1">Lista de Leads</Typography>
                {leads && leads.items.length > 0 &&
                    <CommonButton actionType='CREATE' variant="contained" color="primary" sx={{ marginLeft: "auto" }}
                        component={RouterLink} to="/leads/new">
                        Agregar Lead
                    </CommonButton>}
            </Grid>
            <Stack gap={2}>
                <Grid container alignItems="center" justifyContent="space-between" gap={2}>
                    <Grid container alignItems="center" gap={1}>
                        <Autocomplete {...autocompleteCommonProps(workspaces, "Espacio de Trabajo")}
                            value={Number(workspaceId)} onChange={(_, val) => setWorkspaceId(val)}
                        />
                        <ArrowForwardIcon />
                        <Autocomplete {...autocompleteCommonProps(campaigns, "Campaña")}
                            value={Number(campaignId)} onChange={(_, val) => setCampaignId(val)}
                            disabled={!workspaceId}
                        />
                    </Grid>
                    <Grid container alignItems="center" spacing={1} sx={{ marginLeft: 'auto' }}>
                        <Grid sx={{ marginLeft: 'auto' }}>
                            {
                                leads && leads?.items?.length > 0 && !!campaignId &&
                                <CommonButton actionType='OPTIONS' color='secondary' onClick={() => modalProps.handleOpen("columns_selector")} >
                                    Modificar Columnas
                                </CommonButton>
                            }
                        </Grid>
                        <Grid sx={{ marginLeft: 'auto' }}>
                            {leads && leads.items.length > 0 &&
                                <Badge badgeContent={filters.length} color="success">
                                    <CommonButton actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")}>
                                        Aplicar Filtros
                                    </CommonButton>
                                </Badge>}
                            <GenericModal idModal="lead_filters" modalProps={modalProps} buttonText="Aplicar Filtros" maxWidth="lg"
                                actionType='FILTER' color='secondary' showButton={false} >
                                <LeadFilters applyFilters={applyFilters} filters={{ filters, headers }} campaignId={Number(campaignId)}
                                    onClose={() => modalProps.handleClose()} />
                            </GenericModal>
                        </Grid>
                    </Grid>
                </Grid> 
                {
                    leads && !!campaignId ?
                        <LeadListTable leads={leads.items} campaignId={Number(campaignId)} modalProps={modalProps}
                            activeFilters={filters.length} orderList={orderList} />
                        :
                        <Stack gap={3} alignItems="center" my={3}>
                            <Typography variant="h3">No hay leads para presentar</Typography>
                            <Typography variant="h4">Revisa que haya una campaña seleccionada</Typography>
                        </Stack>
                }
                <PaginationComponent {...pageComponentProps} />
            </Stack >
        </Stack>
    )
}
interface LeadTableProps {
    leads: Lead[],
    campaignId: number
}
export const LeadTable = ({ leads, campaignId }: LeadTableProps) => {
    const NUMBER_OF_FIELDS = 8

    const [leadColumns, setLeadColumns] = useState<LeadField[]>([])

    useEffect(() => {
        if (!campaignId) return
        getLeadFields({ detailed: false, campaign_id: campaignId, only_active: true, page_size: NUMBER_OF_FIELDS +1 })
            .then(leadFields => {
                setLeadColumns(leadFields.items)
            })
    }, [campaignId])

    //Indica si los dos primeros campos del primer lead de la lista son Nombre y Apellido.
    const areFirstFieldsNames = useMemo(() => {
        if (leadColumns.length < 2) return false
        const isFirstNameTemplate = leadColumns[0].field_template_code === "FIRST_NAME"
        const isLastNameTemplate = leadColumns[1].field_template_code === "LAST_NAME"
        return isFirstNameTemplate && isLastNameTemplate
    }, [leadColumns])


    const getValue = (field_value: LeadFieldValue) => {
        if (field_value.value && field_value.value !== "") return `${field_value.value}`
        else if (field_value?.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items?.reduce((acc, item) => `${acc}${acc.length > 0 ? " | " : ""}${item.value}`, "")
        }
        else if (field_value?.related_leads?.length > 0) {
            return field_value.related_leads?.reduce((acc, item) => {
                const relatedLeadName = item?.field_values?.[0]?.value + " " + item?.field_values?.[1]?.value
                return `${acc}${acc.length > 0 ? " | " : ""}${relatedLeadName}`
            }, "")
        }
        else return "---"
    }

    const nav = useNavigate()

    if (leads.length > 0 && leadColumns.length > 0) return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow >
                        {areFirstFieldsNames
                            ? leadColumns.filter((_, idx) => idx !== 1).map((column, idx) => //Elimina el campo Apellido
                                <TableCell align={idx > 0 ? "right" : "left"} key={column.id}>{idx > 0 ? column.name : "Nombre Completo"}</TableCell>
                            )
                            : leadColumns.slice(0, NUMBER_OF_FIELDS).map((column, idx) =>
                                <TableCell align={idx > 0 ? "right" : "left"} key={column.id}>{column.name}</TableCell>
                            )
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leads.map(lead => (
                        <TableRow onClick={() => nav(`/leads/${lead.id}`)} className='selectable'
                            key={lead.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {areFirstFieldsNames
                                ? leadColumns.filter((_, idx) => idx !== 1).map((column, idx) => {//Elimina el campo Apellido
                                    const leadValue = lead.field_values.find(lv => lv.field_id === column.id)
                                    //Si no se encuentra, no hay valor
                                    if (!leadValue) return <TableCell component="td" scope="row" align={idx === 0 ? "left" : "right"} key={`${lead.id}-${column.id}`}>---</TableCell>
                                    //Si es el primer elemento, nombre completo
                                    if (idx === 0) return (
                                        <TableCell component="td" scope="row" align="left" key={`${lead.id}-${column.id}`}>
                                            {lead?.field_values?.[0]?.value} {lead?.field_values?.[1]?.value}
                                        </TableCell>
                                    )
                                    else return (
                                        <TableCell component="td" scope="row" align="right" key={`${lead.id}-${column.id}`}>{getValue(leadValue)}</TableCell>
                                    )
                                })
                                : leadColumns.slice(0, NUMBER_OF_FIELDS).map((column, idx) => {
                                    const leadValue = lead.field_values.find(lv => lv.field_id === column.id)
                                    if (!leadValue) return <TableCell component="td" scope="row" align={idx > 0 ? "right" : "left"} key={`${lead.id}-${column.id}`}>---</TableCell>
                                    return <TableCell align={idx > 0 ? "right" : "left"} key={`${lead.id}-${column.id}`}>{getValue(leadValue)}</TableCell>
                                })
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}