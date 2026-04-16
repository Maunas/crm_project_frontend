import { useCallback, useEffect, useMemo, useState } from 'react'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import { LeadListTable } from './LeadListTable'
import { CommonButton } from '../../common/details/DetailsCommonButton'
import type { LeadFilter, LeadListParams, Paginable } from '../../../types/common'
import type { Lead } from '../../../types/leads'
import { useListPagination } from '../../hooks/useListPagination'
import { useModal } from '../../hooks/useModal'
import { getFilteredLeads, getLeads } from '../leadService'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Typography, Grid, Stack } from '@mui/material'
import { useOrderList } from '../../hooks/useOrderList'
import { LeadCampaignSelector, LeadTableOptions } from './LeadTableOptions'

export const LeadList = () => {

    const [params, setParams] = useSearchParams()

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)

    const [headers, setHeaders] = useState<LeadListParams>({ only_active: true, page_size: 15 })
    const [filters, setFilters] = useState<LeadFilter[]>([])
    const [workspaceId, setWorkspaceId] = useState<string | number | null>(params?.get("workspace_id") ?? null)
    const [campaignId, setCampaignId] = useState<string | number | null>(params?.get("campaign_id") ?? null)

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

    //Memoizadas
    const handleWorkspaceChange = useCallback((id: number | string | null) => {
        setWorkspaceId(id)
    }, [])
    const handleCampaignChange = useCallback((id: number | string | null) => {
        setCampaignId(id)
    }, [])

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId, fetchPage, fetchLeads])

    const { modalProps } = useModal()

    //Al aplicar filtros vuelve a la primera página
    const setFiltersAndHeaders = useCallback((filters: LeadFilter[], headers: LeadListParams) => {
        if (!campaignId) return null
        return fetchLeads(1, filters, headers, campaignId).then(() => {
            setHeaders(headers)
            setFilters(filters)
        })
    }, [campaignId, fetchLeads])

    const orderList = useCallback((fieldId: number | string | null, ascending: boolean) => {
        if (!campaignId) return null
        const newHeaders = { ...headers, order_by: fieldId, ascending }
        setHeaders(newHeaders)
        fetchLeads(leads?.page ?? 1, filters, newHeaders, campaignId)
    }, [campaignId, filters, headers, leads?.page, fetchLeads])

    const { orderProps } = useOrderList(orderList)

    const areThereLeads = useMemo(() => leads?.items ? leads.items.length > 0 : false, [leads])

    return (
        <Stack gap={3}>
            <Grid container justifyContent="space-between" alignItems="center" spacing="1rem">
                <Typography variant="h1">Lista de Leads</Typography>
                {areThereLeads &&
                    <CommonButton actionType='CREATE' variant="contained" color="primary" sx={{ marginLeft: "auto" }}
                        component={RouterLink} to="/leads/new">
                        Agregar Lead
                    </CommonButton>}
            </Grid>
            <Stack gap={2}>
                <Grid container alignItems="center" justifyContent="space-between" gap={2}>
                    <LeadCampaignSelector workspaceId={workspaceId} setWorkspaceId={handleWorkspaceChange}
                        campaignId={campaignId} setCampaignId={handleCampaignChange} />
                    <LeadTableOptions areThereLeads={areThereLeads} campaignId={campaignId} modalProps={modalProps}
                        filters={filters} headers={headers} setFiltersAndHeaders={setFiltersAndHeaders} />
                </Grid>
                {
                    leads && !!campaignId && !!workspaceId ?
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