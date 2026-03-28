/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import type { LeadFilter, LeadListParams, Paginable } from '../../types/common'
import type { Lead } from '../../types/leads'
import type { Campaign, Workspace } from '../../types/campaigns'
import { useListPagination } from '../hooks/useListPagination'
import { getFilteredLeads, getLeads } from './leadService'
import { getWorkspaces } from '../workspaces/workspaceServices'
import { getCampaigns } from '../campaigns/campaignServices'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography, Grid, Stack, Autocomplete, TextField } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { type UserContextItems } from '../users/UserProvider'
import { UserContext } from '../common/contexts'
import { LeadListTable } from './LeadListTable'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { LeadFilters } from './LeadFilters'

export const LeadList = () => {

    const [params, setParams] = useSearchParams()

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [headers, setHeaders] = useState<LeadListParams>({ only_active: true, page_size: 20 })
    const [filters, setFilters] = useState<LeadFilter[]>([])
    const [campaignId, setCampaignId] = useState<string | number | null>(params?.get("campaign_id") ?? null)
    const [workspaceId, setWorkspaceId] = useState<string | number | null>(params?.get("workspace_id") ?? null)
    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const { fetchPage, refresh, pageComponentProps } = useListPagination(leads)

    const fetchLeads = (page: number, filters: LeadFilter[], headers: LeadListParams) => {
        if (filters.length > 0) {
            getFilteredLeads({filters: filters}, { campaign_id: campaignId, page, ...headers }).then(setLeads)
        } else {
            getLeads({ campaign_id: campaignId, page, ...headers }).then(setLeads)
        }
    }

    useEffect(() => {
        fetchLeads(fetchPage, filters, headers)
    }, [campaignId, fetchPage, refresh])


    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(res => {
            setWorkspaces(res.items)
            if (!workspaceId || !res.items.map(i => i.id).includes(Number(workspaceId))) setWorkspaceId(res.items[0].id)
        })
    }, [selectedOrg])

    useEffect(() => {
        if (!workspaceId) return
        getCampaigns({ only_active: true, workspace_id: workspaceId as number, page_size: 0 }).then(res => {
            setCampaigns(res.items)
            if (!campaignId || !res.items.map(i => i.id).includes(Number(campaignId))) setCampaignId(res.items[0].id)

        })
    }, [workspaceId])

    useEffect(() => {
        setParams(prev => {
            const next = new URLSearchParams(prev)
            if (workspaceId) next.set("workspace_id", `${workspaceId}`)
            else next.delete("workspace_id")
            return next
        }, { replace: true })
    }, [workspaceId, setParams])

    useEffect(() => {
        setParams(prev => {
            const next = new URLSearchParams(prev)
            if (campaignId) next.set("campaign_id", `${campaignId}`)
            else next.delete("campaign_id")
            return next
        }, { replace: true })
    }, [campaignId, setParams])

    const applyFilters = (data: { headers: LeadListParams, filters: LeadFilter[] }) => {
        setHeaders({ ...headers, ...data.headers })
        setFilters(data.filters)
        fetchLeads(1, data.filters, data.headers)
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
            <Grid container alignItems="center" spacing=".5rem">
                <Autocomplete
                    disablePortal
                    options={workspaces.map(i => i.id)}
                    getOptionLabel={option => workspaces.find(i => i.id === option)?.name ?? ""}
                    sx={{ width: 200 }}
                    value={Number(workspaceId)}
                    onChange={(_, val) => setWorkspaceId(val)}
                    renderInput={(params) => <TextField {...params} label="Espacio de Trabajo" />}
                />
                <ArrowForwardIcon />
                <Autocomplete
                    disablePortal
                    options={campaigns.map(i => i.id)}
                    getOptionLabel={option => campaigns.find(i => i.id === option)?.name ?? ""}
                    sx={{ width: 200 }}
                    disabled={!workspaceId}
                    value={Number(campaignId)}
                    onChange={(_, val) => setCampaignId(val)}
                    renderInput={(params) => <TextField {...params} label="Campaña" />}
                />
            </Grid>
            <Accordion disableGutters sx={{ boxShadow: "none", border: "1px solid gray" }}>
                <AccordionSummary sx={{ height: "64px" }}
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="filter-content" id="filter-header"
                >
                    <Typography variant="h2" >Filtros</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ paddingTop: 0 }}>
                    <LeadFilters applyFilters={applyFilters} filters={{ filters, headers }} campaignId={Number(campaignId)} />
                </AccordionDetails>
            </Accordion>
            {leads && leads?.items?.length > 0 && !!campaignId &&
                <LeadListTable leads={leads.items} campaignId={Number(campaignId)} />
            }
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
}


