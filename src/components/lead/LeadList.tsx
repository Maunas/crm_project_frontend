import React, { useEffect, useMemo, useState } from 'react'
import type { Lead } from '../../types/leads'
import { getLeads } from './leadService'
import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, Pagination, Typography, Grid, TableContainer, Paper, Table, TableRow, TableCell, TableBody, TableHead, TablePagination } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Paginable } from '../../types/common'
import { useForm } from 'react-hook-form'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ControlledCheckbox, ControlledNumber, RegisteredTextInput } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { getCampaigns } from '../campaigns/campaignServices'
import type { CampaignDetailed } from '../../types/campaigns'

export const LeadList = () => {

    const [leads, setLeads] = useState<Paginable<Lead[]> | null>(null)
    const [campaigns, setCampaigns] = useState<CampaignDetailed[] | null>(null)
    const [filters, setFilters] = useState<object>({ campaign_id: 1, only_active: false, page_size: 20 })

    useEffect(() => {
        getCampaigns({ only_active: false }).then(setCampaigns)
    }, [])

    const [page, setPage] = useState<number>(1)
    const handlePage = (e: React.ChangeEvent<unknown>, value: number) => {
        if (value === page) return
        getLeads({ page: value, ...filters }).then((res) => {
            setPage(value)
            setLeads(res)
        })
    }

    const { control, handleSubmit } = useForm({
        defaultValues: { campaign_id: 1, only_active: false, page_size: 20 }
    })

    const applyFilters = (data) => {
        const newFilters = { ...filters, ...data }
        setFilters(newFilters)
    }

    useEffect(() => {
        getLeads({ page: 1, ...filters }).then((res) => {
            setPage(1)
            setLeads(res)
        })
    }, [filters])

    console.log(leads)

    const handlePageSize = (e, value) => {
        setFilters({ ...filters, page_size: value })
    }

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
                    {campaigns?.length > 0 &&
                        <form >
                            <ControlledAutocomplete name='campaign_id' control={control} options={campaigns}
                                getOptionLabel={o => o.name} label='Campaña' returnField="id" />
                            <ControlledCheckbox control={control} name="only_active" label="Mostrar sólo Leads habilitados"
                                defaultValue={true} />
                            <ControlledNumber control={control} name="page_size" label="Items por página" min={1} step={5} />
                            <Button variant="contained" color="secondary" onClick={handleSubmit(applyFilters)}>
                                Aplicar Filtros
                            </Button>
                        </form>}
                </AccordionDetails>
            </Accordion>
            {leads &&
                <LeadTable leads={leads.items} />
            }
            <Pagination page={page} onChange={handlePage} count={leads?.total_pages} color="secondary" />
        </>
    )
}
interface LeadTableProps {
    leads: Lead[]
}
export const LeadTable = ({ leads }: LeadTableProps) => {
    const fieldNames = useMemo(() =>
        leads[0].field_values
            .sort((a, b) => a.field?.order - b.field?.order)
            .map(value => value?.field?.name)
            .slice(2, 7)
        , [leads])

    const getValue = (field_value) => {
        if (field_value.value) return field_value.value
        else if (field_value.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items?.reduce((acc, item) => `${acc}${acc.length > 0 ? " | ":""}${item.value}`, "")
    }
        else if (field_value.related_leads?.length > 0) {
            const relatedLead = field_value.related_leads[0]?.field_values
            return relatedLead?.[0]?.value + " " + relatedLead?.[1]?.value
                    }
        else return "---"
        }

return (
    <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell>Nombre Completo</TableCell>
                    {fieldNames?.length > 0 &&
                        fieldNames.map((name) =>
                            <TableCell align="right" key={name} >{name}</TableCell>
                        )}
                </TableRow>
            </TableHead>
            <TableBody>
                {leads.map(lead => (
                    <TableRow
                        key={lead.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="td" scope="row">
                            {lead?.field_values?.[0]?.value} {lead?.field_values?.[1]?.value}
                        </TableCell>
                        {
                            lead.field_values?.length > 2 &&
                            lead.field_values
                                .sort((a, b) => a.field?.order - b.field?.order)
                                .slice(2, 7)
                                .map((value) =>
                                    <TableCell key={value.id} align="right">
                                        {getValue(value)}
                                    </TableCell>
                                )
                        }
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)
}
