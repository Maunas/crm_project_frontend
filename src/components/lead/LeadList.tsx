import { useEffect, useMemo, useState } from 'react'
import type { Lead } from '../../types/leads'
import { getLeads } from './leadService'
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography, Grid, TableContainer, Paper, Table, TableRow, TableCell, TableBody, TableHead } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import type { LeadListParams, Paginable } from '../../types/common'
import { useForm, useWatch } from 'react-hook-form'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ControlledCheckbox, ControlledNumber } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import type { Campaign, Workspace } from '../../types/campaigns'
import { getCampaigns } from '../campaigns/campaignServices'
import { useListPagination } from '../hooks/useListPagination'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { getWorkspaces } from '../workspaces/workspaceServices'

export const LeadList = () => {

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
    const [filters, setFilters] = useState<LeadListParams>({ campaign_id: 1, only_active: false, page_size: 20 })

    const { fetchPage, pageComponentProps } = useListPagination(leads)

    useEffect(() => {
        getLeads({ page: fetchPage, ...filters }).then(setLeads)
    }, [fetchPage])

    const { control, handleSubmit } = useForm<LeadListParams>({
        defaultValues: { campaign_id: filters.campaign_id, only_active: filters.only_active, page_size: filters.page_size }
    })

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(res => setWorkspaces(res.items))
    }, [])

    const selectedWorkspace = useWatch<LeadListParams>({ name: "workspace_id", control })

    useEffect(() => {
        if (!selectedWorkspace) return
        getCampaigns({ only_active: true, workspace_id: selectedWorkspace, page_size: 0 }).then(res => setCampaigns(res.items))
    }, [selectedWorkspace])

    const applyFilters = (data: LeadListParams) => {
        const newFilters = { ...filters, ...data }
        setFilters(newFilters)
        getLeads({ page: 1, ...newFilters }).then(setLeads)
    }

    console.log(leads)

    return (
        <>
            <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h1">Lista de Leads</Typography>
                <Grid>
                    <Button variant="contained" color="primary" component={Link} to="/leads/new">
                        Crear Lead
                    </Button>
                </Grid>
            </Grid>
            <Accordion disableGutters sx={{ boxShadow: "none", border: "1px solid gray" }}>
                <AccordionSummary sx={{ height: "64px" }}
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="filter-content" id="filter-header"
                >
                    <Typography variant="h2" >Filtros</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ paddingTop: 0 }}>

                    <form >
                        <Grid container spacing={2}>
                            <Grid size="grow" minWidth="20rem">
                                <ControlledAutocomplete name='workspace_id' control={control} options={workspaces ?? []}
                                    getOptionLabel={o => o.name!} getOptionKey={o => `${o.id}`} label='Workspace' returnField="id" disableClearable/>
                            </Grid>
                            <Grid size="grow" minWidth="20rem">
                                <ControlledAutocomplete name='campaign_id' control={control} options={campaigns?.filter(c => c.workspace_id === selectedWorkspace) ?? []}
                                    getOptionLabel={o => o.name!} getOptionKey={o => `${o.id}`} label='Campaña' returnField="id" 
                                    disabled={!selectedWorkspace} disableClearable />
                            </Grid>
                            <Grid size="grow" minWidth="20rem">
                                <ControlledCheckbox control={control} name="only_active" label="Mostrar sólo Leads habilitados" />
                            </Grid>
                            <Grid size="grow" minWidth="20rem">
                                <ControlledNumber control={control} name="page_size" label="Items por página" min={5} step={5} />
                            </Grid>
                        </Grid>
                        <Button variant="contained" color="secondary" onClick={handleSubmit(applyFilters)}>
                            Aplicar Filtros
                        </Button>
                    </form>
                </AccordionDetails>
            </Accordion>
            {leads && leads?.items?.length > 0 &&
                <LeadTable leads={leads.items} />
            }
            <PaginationComponent {...pageComponentProps} />
        </>
    )
}
interface LeadTableProps {
    leads: Lead[]
}
export const LeadTable = ({ leads }: LeadTableProps) => {

    const areFirstFieldNames = useMemo(() => {
        const isFirstNameTemplate = leads[0].field_values[0].field.field_template_code === "FIRST_NAME"
        const isLastNameTemplate = leads[0].field_values[1].field.field_template_code === "LAST_NAME"
        return isFirstNameTemplate && isLastNameTemplate
    }, [leads])

    const fieldNames = useMemo(() => {
        const fieldNames = leads[0].field_values
            .sort((a, b) => a.field?.order - b.field?.order)
            .map(value => value?.field?.name)
        if (areFirstFieldNames) {
            return fieldNames.slice(2, 8)
        } else {
            return fieldNames.slice(0, 8)
        }
    }, [leads, areFirstFieldNames])

    const getValue = (field_value) => {
        if (field_value.value) return `${field_value.field.field_type_code === "MONEY" ? "$ " : ""}${field_value.value}`
        else if (field_value.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items?.reduce((acc, item) => `${acc}${acc.length > 0 ? " | " : ""}${item.value}`, "")
        }
        else if (field_value.related_leads?.length > 0) {
            const relatedLead = field_value.related_leads[0]?.field_values
            return relatedLead?.[0]?.value + " " + relatedLead?.[1]?.value
        }
        else return "---"
    }

    const nav = useNavigate()

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow >
                        {
                            areFirstFieldNames &&
                            <TableCell>Nombre Completo</TableCell>
                        }
                        {fieldNames?.length > 0 &&
                            fieldNames.map((name, idx) =>
                                <TableCell align={!areFirstFieldNames && idx === 0 ? "left" : "right"} key={name} >{name}</TableCell>
                            )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leads.map(lead => (
                        <TableRow onClick={() => nav(`/leads/${lead.id}`)} style={{ cursor: "pointer" }}
                            key={lead.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {
                                areFirstFieldNames ?
                                    <>
                                        <TableCell component="td" scope="row">
                                            {lead?.field_values?.[0]?.value} {lead?.field_values?.[1]?.value}
                                        </TableCell>
                                        {
                                            lead.field_values?.length > 2 &&
                                            lead.field_values
                                                .sort((a, b) => a.field?.order - b.field?.order)
                                                .slice(2, 8)
                                                .map((value) =>
                                                    <TableCell key={value.id} align="right">
                                                        {getValue(value)}
                                                    </TableCell>
                                                )
                                        }
                                    </> :
                                    <>
                                        {
                                            lead.field_values?.length > 0 &&
                                            lead.field_values
                                                .sort((a, b) => a.field?.order - b.field?.order)
                                                .slice(0, 8)
                                                .map((value, idx) =>
                                                    <TableCell key={value.id} align={idx === 0 ? "left" : "right"}>
                                                        {getValue(value)}
                                                    </TableCell>
                                                )
                                        }
                                    </>
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
