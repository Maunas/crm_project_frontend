import { useEffect, useMemo, useState } from 'react'
import { ControlledCheckbox, ControlledNumber } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import type { LeadListParams, Paginable } from '../../types/common'
import type { Lead } from '../../types/leads'
import type { LeadFieldValue } from '../../types/leadFields'
import type { Campaign, Workspace } from '../../types/campaigns'
import { useListPagination } from '../hooks/useListPagination'
import { getLeads } from './leadService'
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
        getLeads({ page: fetchPage, ...filters }).then(setLeads)
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [fetchPage])

    const { control, handleSubmit } = useForm<LeadListParams>({
        defaultValues: { workspace_id: filters.workspace_id, campaign_id: filters.campaign_id, only_active: filters.only_active, page_size: filters.page_size }
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

    return (
        <Stack spacing={2}>
            <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h1">Lista de Leads</Typography>
                <Grid>
                    <Button variant="contained" color="primary" component={RouterLink} to="/leads/new">
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
                        <Grid container direction="column" spacing={2} alignItems="flex-end">
                            <Grid container size="grow" spacing={2}>
                                <Grid size="grow" minWidth="20rem">
                                    <ControlledAutocomplete name='workspace_id' control={control} options={workspaces ?? []}
                                        getOptionLabel={o => o.name!} getOptionKey={o => `${o.id}`} label='Workspace' returnField="id" disableClearable />
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
                        </Grid>
                    </form>
                </AccordionDetails>
            </Accordion>
            {leads && leads?.items?.length > 0 &&
                <LeadTable leads={leads.items} />
            }
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
}
interface LeadTableProps {
    leads: Lead[]
}
export const LeadTable = ({ leads }: LeadTableProps) => {

    const NUMBER_OF_FIELDS = 8
    //Indica si los dos primeros campos del primer lead de la lista son Nombre y Apellido.
    const areFirstFieldsNames = useMemo(() => {
        const isFirstNameTemplate = leads[0].field_values[0].field.field_template_code === "FIRST_NAME"
        const isLastNameTemplate = leads[0].field_values[1].field.field_template_code === "LAST_NAME"
        return isFirstNameTemplate && isLastNameTemplate
    }, [leads])

    //Trae un arreglo con los nombres de los primeros campos
    const fieldNames = useMemo(() => {
        const names = leads[0].field_values
            .sort((a, b) => a.field?.order - b.field?.order)
            .map(value => value?.field?.name)
        //Si los primeros son Nombre y Apellido, Agrega un campo Nombre Completo
        if (areFirstFieldsNames) {
            return ["Nombre Completo", ...names.slice(2, NUMBER_OF_FIELDS)]
        } else {
            return names.slice(0, NUMBER_OF_FIELDS - 1)
        }
    }, [leads, areFirstFieldsNames])

    const getValue = (field_value: LeadFieldValue) => {
        if (field_value.value) return `${field_value.value}`
        else if (field_value.nomenclator_items && field_value.nomenclator_items.length > 0) {
            return field_value.nomenclator_items?.reduce((acc, item) => `${acc}${acc.length > 0 ? " | " : ""}${item.value}`, "")
        }
        else if (field_value.related_leads && field_value.related_leads.length > 0) {
            return field_value.related_leads?.reduce((acc, item) => {
                const relatedLeadName = item?.field_values?.[0]?.value + " " + item?.field_values?.[1]?.value
                return `${acc}${acc.length > 0 ? " | " : ""}${relatedLeadName}`
            }, "")
        }
        else return "---"
    }

    const nav = useNavigate()

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow >
                        {fieldNames?.length > 0 &&
                            fieldNames.map((name, idx) =>
                                <TableCell align={idx > 0 ? "right" : "left"} key={name}>{name}</TableCell>
                            )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leads.map(lead => (
                        <TableRow onClick={() => nav(`/leads/${lead.id}`)} className='selectable'
                            key={lead.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {
                                areFirstFieldsNames ?
                                    <>
                                        <TableCell component="td" scope="row" align="left">
                                            {lead?.field_values?.[0]?.value} {lead?.field_values?.[1]?.value}
                                        </TableCell>
                                        {
                                            lead.field_values?.length > 2 &&
                                            lead.field_values
                                                .sort((a, b) => a.field?.order - b.field?.order)
                                                .slice(2, NUMBER_OF_FIELDS)
                                                .map(value =>
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
                                                .slice(0, NUMBER_OF_FIELDS - 1)
                                                .map((value, idx) =>
                                                    <TableCell key={value.id} align={idx > 0 ? "right" : "left"}>
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
