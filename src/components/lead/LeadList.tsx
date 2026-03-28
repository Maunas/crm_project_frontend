import { useContext, useEffect, useState } from 'react'
import { ControlledCheckbox, ControlledNumber } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import type { LeadListParams, Paginable } from '../../types/common'
import type { Lead } from '../../types/leads'
import type { Campaign, Workspace } from '../../types/campaigns'
import { useListPagination } from '../hooks/useListPagination'
import { getLeads } from './leadService'
import { getWorkspaces } from '../workspaces/workspaceServices'
import { getCampaigns } from '../campaigns/campaignServices'
import { useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography, Grid, Stack } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { type UserContextItems } from '../users/UserProvider'
import { UserContext } from '../common/contexts'
import { LeadListTable } from './LeadListTable'

export const LeadList = () => {

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
    const [filters, setFilters] = useState<LeadListParams>({ workspace_id: 1, campaign_id: 1, only_active: true, page_size: 20 })

    const {selectedOrg} = useContext<UserContextItems>(UserContext)

    const { fetchPage, refresh, pageComponentProps } = useListPagination(leads)

    useEffect(() => {
        getLeads({ page: fetchPage, ...filters }).then(setLeads)
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [fetchPage, refresh])

    const { control, setValue, handleSubmit } = useForm<LeadListParams>({
        defaultValues: { workspace_id: filters.workspace_id, campaign_id: filters.campaign_id, only_active: filters.only_active, page_size: filters.page_size }
    })

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(res => {
            setWorkspaces(res.items)
            setValue("workspace_id", res.items?.at(-1)?.id ?? undefined)
        })
    }, [selectedOrg, setValue])

    const selectedWorkspace = useWatch<LeadListParams>({ name: "workspace_id", control })

    useEffect(() => {
        if (!selectedWorkspace) return
        getCampaigns({ only_active: true, workspace_id: selectedWorkspace as number, page_size: 0 }).then(res => {
            setCampaigns(res.items)
            setValue("campaign_id", res.items?.at(-1)?.id ?? undefined)
        })
    }, [selectedWorkspace, setValue])

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
            {leads && leads?.items?.length > 0 && filters.campaign_id &&
                <LeadListTable leads={leads.items} campaignId={filters.campaign_id} />
            }
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
}


