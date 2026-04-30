import { useCallback, useEffect, useMemo, useState } from 'react'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import { LeadListTable } from './LeadListTable'
import { CommonButton } from '../../common/details/DetailsCommonButton'
import type { LeadFilter, LeadListParams, OrderParams, Paginable } from '../../../types/common'
import type { Lead } from '../../../types/leads'
import { useListPagination } from '../../hooks/useListPagination'
import { useModal } from '../../hooks/useModal'
import { getFilteredLeads, getLeads } from '../leadService'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Typography, Grid, Stack } from '@mui/material'
import { useOrderList } from '../../hooks/useOrderList'
import { LeadCampaignSelector, LeadTableOptions } from './LeadTableOptions'
import type { LeadField } from '../../../types/leadFields'
import { getLeadFields } from '../../leadFields/leadFieldServices'
import { GenericModal } from '../../common/layout/GenericContainer'
import LeadColumnSelector from './LeadColumnSelector'

const DEFAULT_N_OF_FIELDS = 6

export const LeadList = () => {

    const [params, setParams] = useSearchParams()
    const { modalProps } = useModal()

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)

    const [fetchParams, setFetchParams] = useState<LeadListParams>({ only_active: true, page_size: 15 })

    const [orderParams, setOrderParams] = useState<OrderParams>({})

    const [filters, setFilters] = useState<LeadFilter[]>([])

    //Si tiene filtros, debe usar otro endpoint.
    const fetchLeads = useCallback((page: number, filters: LeadFilter[], headers: LeadListParams, campaignId: string | number) => {
        if (filters.length > 0) {
            return getFilteredLeads({ filters: filters }, { campaign_id: campaignId, page, ...headers }).then(setLeads)
        } else {
            return getLeads({ campaign_id: campaignId, page, ...headers }).then(setLeads)
        }
    }, [])

    const areThereLeads = useMemo(() => leads?.items ? leads.items.length > 0 : false, [leads])

    //-------------------Selección de Campaña--------------------------

    const [workspaceId, setWorkspaceId] = useState<string | number | null>(params?.get("workspace") ?? null)
    const [campaignId, setCampaignId] = useState<string | number | null>(params?.get("campaign") ?? null)

    //Guarda los cambios de campaign y workspace a searchParams
    useEffect(() => {
        setParams(prev => {
            if (prev.get("workspace_id") === workspaceId && prev.get("campaign_id") === campaignId) return prev
            const next = new URLSearchParams(prev)
            if (workspaceId) next.set("workspace", `${workspaceId}`)
            else next.delete("workspace_id")
            if (campaignId) next.set("campaign", `${campaignId}`)
            else next.delete("campaign_id")
            return next
        }, { replace: true })
    }, [campaignId, workspaceId, setParams])

    const handleWorkspaceChange = useCallback((id: number | string | null) => {
        setWorkspaceId(id)
    }, [])
    const handleCampaignChange = useCallback((id: number | string | null) => {
        setCampaignId(id)
    }, [])

    //--------------------------------Paginación------------------------------

    const { fetchPage, pageComponentProps } = useListPagination(leads)

    //-------------------------------Ordenamiento-------------------------------


    const orderListFn = useCallback((orderBy: number | string | null, ascending: boolean) => {
        if (!campaignId) return null
        setOrderParams({ order_by: orderBy, ascending })
        fetchLeads(leads?.page ?? 1, filters, { ...fetchParams, ...orderParams }, campaignId)
    }, [campaignId, filters, orderParams, fetchParams, leads?.page, fetchLeads])

    const { orderProps } = useOrderList(orderListFn)

    //----------------------------------Filtros----------------------------------

    //Al aplicar filtros vuelve a la primera página
    const setFiltersAndHeaders = useCallback((filters: LeadFilter[], fetchParams: LeadListParams) => {
        if (!campaignId) return null
        return fetchLeads(1, filters, fetchParams, campaignId).then(() => {
            setFetchParams(fetchParams)
            setFilters(filters)
        })
    }, [campaignId, fetchLeads])

    //-----------------------------Orden de Columnas-----------------------------

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        if (!campaignId) return
        getLeadFields({ detailed: false, campaign_id: Number(campaignId), only_active: true, page_size: 0 })
            .then(leadFields => setLeadFields(leadFields.items))
    }, [campaignId])

    const [selectedIds, setSelectedIds] = useState<number[]>([])

    //Trae el arreglo de ids, con el orden definido de leads en localStorage. Si no, trae los primeros N elementos
    useEffect(() => {
        if (!leadFields || leadFields.length === 0 || !campaignId) return
        const localSelectedFields = JSON.parse(window.localStorage.getItem("sel_lead_fields") ?? "{}")?.[campaignId]
        if (localSelectedFields) {
            setSelectedIds(localSelectedFields)
        } else {
            setSelectedIds(leadFields.slice(0, DEFAULT_N_OF_FIELDS).map(fields => fields.id))
        }
    }, [leadFields, campaignId])

    const handleSelectedIds = useCallback((ids: number[], closeModal: boolean = false) => {
        setSelectedIds(ids)
        if (closeModal) modalProps.handleClose()
    }, [modalProps])

    //Ante cambios a selectedIds los actualiza en localStorage
    useEffect(() => {
        if (selectedIds.length === 0 || !campaignId) return
        const totalSelectedFields = window.localStorage.getItem("sel_lead_fields")
        let newTotalSelectedFields: Record<number, number[]> = {}
        if (totalSelectedFields) {
            newTotalSelectedFields = { ...JSON.parse(totalSelectedFields) }
        }
        newTotalSelectedFields[Number(campaignId)] = selectedIds
        window.localStorage.setItem("sel_lead_fields", JSON.stringify(newTotalSelectedFields))
    }, [selectedIds, campaignId])

    //--------------------------------Presentación--------------------------------

    const [presentationMode, setPresentationMode] = useState<string>("TABLE")

    useEffect(() => {
        if (!campaignId) return
        fetchLeads(fetchPage, filters, { ...fetchParams, ...orderParams }, campaignId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId, fetchPage, fetchLeads])

    return (
        <Stack spacing={3}>
            <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing="1rem">
                <Typography variant="h1">Lista de Leads</Typography>
                {areThereLeads &&
                    <CommonButton actionType='CREATE' variant="contained" color="primary" sx={{ marginLeft: "auto" }}
                        component={RouterLink} to="/leads/new">
                        Agregar Lead
                    </CommonButton>}
            </Grid>
            <Stack spacing={2}>
                <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }} spacing={2} useFlexGap>
                    <LeadCampaignSelector workspaceId={workspaceId} setWorkspaceId={handleWorkspaceChange}
                        campaignId={campaignId} setCampaignId={handleCampaignChange} />
                    <LeadTableOptions areThereLeads={areThereLeads} campaignId={campaignId} modalProps={modalProps}
                        filters={filters} headers={{ ...fetchParams, ...orderParams }} setFiltersAndHeaders={setFiltersAndHeaders} />
                </Stack>
                {
                    leads && !!campaignId && !!workspaceId ?
                        <LeadListTable leads={leads.items} leadFields={leadFields} selectedIds={selectedIds} modalProps={modalProps}
                            activeFilters={filters.length} orderProps={orderProps} handleSelectedIds={handleSelectedIds} />
                        :
                        <Stack spacing={3} sx={{ alignItems: "center", my: 3 }}>
                            <Typography variant="h3">No hay leads para presentar</Typography>
                            <Typography variant="h4">Revisa que haya una campaña seleccionada</Typography>
                        </Stack>
                }
                <PaginationComponent {...pageComponentProps} />
            </Stack >
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector originalList={leadFields} selectedIds={selectedIds!} handleSelectedIds={handleSelectedIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
        </Stack>
    )
}