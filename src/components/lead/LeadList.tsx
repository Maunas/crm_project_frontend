import React, { useEffect, useState } from 'react'
import type { Lead } from '../../types/leads'
import { getLeads } from './leadService'
import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, Pagination, Typography, Grid } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Paginable } from '../../types/common'
import { useForm } from 'react-hook-form'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ControlledCheckbox, RegisteredTextInput } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { getCampaigns } from '../campaigns/campaignServices'

export const LeadList = () => {

    const [leads, setLeads] = useState<Paginable<Lead[]> | null>(null)
    const [campaigns, setCampaigns] = useState<Lead[] | null>(null)

    useEffect(() => {
        getLeads({ only_active: false }).then(setLeads)
        getCampaigns({ only_active: false }).then(setCampaigns)
    }, [])

    const [page, setPage] = useState<number>(1)
    const handlePage = (e: React.ChangeEvent<unknown>, value: number) => {
        if (value === page) return
        getLeads({ only_active: false, page: value }).then((res) => {
            setPage(value)
            setLeads(res)
        })
    }

    const { control, handleSubmit } = useForm()

    const applyFilters = (data) => {
        getLeads({ ...data, page: 1 }).then((res) => {
            setPage(1)
            setLeads(res)
        })
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
            <Accordion disableGutters sx={{ boxShadow: "none" }}>
                <AccordionSummary sx={{ height: "64px" }}
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel0-content" id="panel0-header"
                >
                    <Typography variant="h2">Filtros</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ paddingTop: 0 }}>
                    <form >
                        <ControlledAutocomplete name='campaign_id' control={control} options={campaigns}
                            getOptionLabel={o => o.name} label='Campaña' returnField="id" />
                        <ControlledCheckbox control={control} name="only_active" label="Mostrar Leads Deshabilitados"
                            defaultValue={true} />
                        <Button variant="contained" color="secondary" onClick={handleSubmit(applyFilters)}>
                            Aplicar Filtros
                        </Button>
                    </form>
                </AccordionDetails>
            </Accordion>
            {leads?.items?.length > 0 &&
                leads.items.map(lead =>
                    <Button component={Link} to={`/leads/${lead.id}`} key={lead.id}>
                        {`${lead.field_values?.[0]?.value} ${lead.field_values?.[1]?.value}`}
                    </Button>)
            }
            <Pagination page={page} onChange={handlePage} count={leads?.total_pages} color="secondary" />
        </>
    )
}
