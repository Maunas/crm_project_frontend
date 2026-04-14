import { useCallback, useContext, useEffect, useState } from 'react'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import { LeadListTable } from './LeadListTable'
import { LeadFilters } from './LeadFilters'
import { CommonButton } from '../../common/details/DetailsCommonButton'
import { GenericModal } from '../../common/layout/GenericContainer'
import type { LeadFilter, LeadListParams, Paginable } from '../../../types/common'
import type { Lead } from '../../../types/leads'
import type { Campaign, Workspace } from '../../../types/campaigns'
import { useListPagination } from '../../hooks/useListPagination'
import { useModal } from '../../hooks/useModal'
import { type UserContextItems } from '../../users/UserProvider'
import { UserContext } from '../../common/contexts'
import { getFilteredLeads, getLeads } from '../leadService'
import { getWorkspaces } from '../../workspaces/workspaceServices'
import { getCampaigns } from '../../campaigns/campaignServices'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Typography, Grid, Stack, Autocomplete, TextField, type AutocompleteRenderInputParams, Badge } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useOrderList } from '../../hooks/useOrderList'

export const LeadList = () => {

    const [params, setParams] = useSearchParams()

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)

    const [headers, setHeaders] = useState<LeadListParams>({ only_active: true, page_size: 20 })
    const [filters, setFilters] = useState<LeadFilter[]>([])

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [workspaceId, setWorkspaceId] = useState<string | number | null>(params?.get("workspace_id") ?? null)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [campaignId, setCampaignId] = useState<string | number | null>(params?.get("campaign_id") ?? null)

    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const { fetchPage, pageComponentProps } = useListPagination(leads)

    //Si tiene filtros, debe usar otro endpoint.
    const fetchLeads = useCallback((page: number, filters: LeadFilter[], headers: LeadListParams, campaignId: string | number) => {
        if (filters.length > 0) {
            return getFilteredLeads({ filters: filters }, { campaign_id: campaignId, page, ...headers }).then(setLeads)
        } else {
            return getLeads({ campaign_id: campaignId, page, ...headers }).then(setLeads)
        }
    }, [])

    useEffect(() => {
        if (!campaignId) return
        fetchLeads(fetchPage, filters, headers, campaignId)
    }, [campaignId, fetchPage, fetchLeads])

    //Inicialización al cambiar de organización
    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(wsps => {
            setWorkspaces(wsps.items)
            if (wsps.items.length === 0) {
                setWorkspaceId(null)
                return
            }
            //Si hay un workspaceId en params, y es parte de la lista, lo setea, si no el primer elemento
            const newWorkspaceId = (workspaceId && wsps.items.map(i => i.id).includes(Number(workspaceId))) ? workspaceId : wsps.items[0].id
            setWorkspaceId(newWorkspaceId)

            if (!newWorkspaceId) return
            getCampaigns({ only_active: true, workspace_id: newWorkspaceId as number, page_size: 0 }).then(cmps => {
                setCampaigns(cmps.items)
                if (cmps.items.length === 0) {
                    setCampaignId(null)
                    return
                }
                const newCampaignId = (campaignId && cmps.items.map(i => i.id).includes(Number(campaignId))) ? campaignId : cmps.items[0].id
                setCampaignId(newCampaignId)
            })
        })
    }, [selectedOrg])

    const handleWorkspaceChange = useCallback((newWorkspaceId: number | null) => {
        if (!newWorkspaceId) return
        setWorkspaceId(newWorkspaceId)
        getCampaigns({ only_active: true, workspace_id: newWorkspaceId, page_size: 0 }).then(res => {
            setCampaigns(res.items)
            setCampaignId(res.items[0].id)
        })
    }, [])

    //Actualización de los campaign y workspace elegidos como searchParams
    useEffect(() => {
        setParams(prev => {
            if (prev.get("workspace_id") === workspaceId && prev.get("campaign_id") === campaignId) return prev
            const next = new URLSearchParams(prev)
            if (workspaceId) next.set("workspace_id", `${workspaceId}`)
            else next.delete("workspace_id")
            if (campaignId) next.set("campaign_id", `${campaignId}`)
            else next.delete("campaign_id")
            return next
        }, { replace: true })
    }, [campaignId, workspaceId, setParams])
    const { modalProps } = useModal()

    //Al aplicar filtros vuelve a la primera página
    const applyFilters = useCallback((data: { headers: LeadListParams, filters: LeadFilter[] }) => {
        if (!campaignId) return null
        const newHeaders = { ...headers, ...data.headers }
        return fetchLeads(1, data.filters, newHeaders, campaignId).then(() => {
            setHeaders(newHeaders)
            setFilters(data.filters)
            modalProps.handleClose()
        })
    }, [campaignId, fetchLeads, headers, modalProps])

    const orderList = useCallback((fieldId: number | string | null, ascending: boolean) => {
        if (!campaignId) return null
        const newHeaders = { ...headers, order_by: fieldId, ascending }
        setHeaders(newHeaders)
        fetchLeads(leads?.page ?? 1, filters, newHeaders, campaignId)
    }, [campaignId, filters, headers, leads?.page, fetchLeads])

    const { orderProps } = useOrderList(orderList)


    const autocompleteCommonProps = useCallback((list: (Campaign | Workspace)[], label: string) => ({
        size: "small" as "small" | "medium",
        disablePortal: true,
        options: list.map(i => i.id),
        getOptionLabel: (option: number | null) => list.find(i => i.id === option)?.name ?? "",
        sx: { width: 200 },
        renderInput: (params: AutocompleteRenderInputParams) => <TextField {...params} label={label} />
    }), [])


    return (
        <Stack gap={3}>
            <Grid container justifyContent="space-between" alignItems="center" spacing="1rem">
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
                            value={Number(workspaceId)} onChange={(_, val) => handleWorkspaceChange(val)}
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
                            activeFilters={filters.length} orderProps={orderProps} />
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