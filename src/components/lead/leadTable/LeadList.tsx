import { useCallback, useEffect, useMemo, useState } from 'react'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import { LeadListTable } from './LeadListTable'
import type { LeadFilter, LeadListParams, OrderParams, Paginable } from '../../../types/common'
import { CommonCollapsedButton } from '../../common/details/DetailsCommonButton'
import type { Lead } from '../../../types/leads'
import { useListPagination } from '../../hooks/useListPagination'
import { useModal } from '../../hooks/useModal'
import { bulkDeleteLead, createView, getFilteredLeads, getLeads } from '../leadService'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Typography, Grid, Stack, IconButton } from '@mui/material'
import { useOrderList } from '../../hooks/useOrderList'
import type { LeadField } from '../../../types/leadFields'
import { getLeadFields } from '../../leadFields/leadFieldServices'
import { GenericModal } from '../../common/layout/GenericContainer'
import LeadColumnSelector from './LeadColumnSelector'
import { LeadListOptions } from './LeadListOptions'
import { useSelectCheckbox } from '../../hooks/useSelectCheckbox'
import AddIcon from '@mui/icons-material/Add';

const DEFAULT_N_OF_FIELDS = 6

export const LeadList = () => {

    const [params, setParams] = useSearchParams()
    const { modalProps } = useModal()

    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)

    const [fetchParams, setFetchParams] = useState<LeadListParams>({ only_active: true, page_size: 15 })

    const [orderParams, setOrderParams] = useState<OrderParams>({})

    const [filters, setFilters] = useState<LeadFilter[]>([])

    const headerParams = useMemo(() => ({ ...fetchParams, ...orderParams }), [fetchParams, orderParams])

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

    const campaignSelectorProps = useMemo(() => ({
        workspaceId, campaignId, handleWorkspaceChange, handleCampaignChange
    }), [workspaceId, campaignId, handleWorkspaceChange, handleCampaignChange])

    //--------------------------------Paginación------------------------------

    const { fetchPage, pageComponentProps } = useListPagination(leads)

    useEffect(() => {
        if (!campaignId) return
        fetchLeads(fetchPage, filters, headerParams, campaignId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId, fetchPage, fetchLeads])

    //-------------------------------Ordenamiento-------------------------------


    const orderListFn = useCallback((orderBy: number | string | null, ascending: boolean) => {
        if (!campaignId) return null
        setOrderParams({ order_by: orderBy, ascending })
        fetchLeads(leads?.page ?? 1, filters, { ...fetchParams, order_by: orderBy, ascending }, campaignId)
    }, [campaignId, filters, fetchParams, leads?.page, fetchLeads])

    const { orderProps } = useOrderList(orderListFn)

    //----------------------------------Filtros----------------------------------

    //Al aplicar filtros vuelve a la primera página
    const setFiltersAndHeaders = useCallback((filters: LeadFilter[], newParams: LeadListParams) => {
        if (!campaignId) return null
        return fetchLeads(1, filters, { ...newParams, ...orderParams }, campaignId).then(() => {
            setFetchParams(newParams)
            setFilters(filters)
        })
    }, [campaignId, fetchLeads, orderParams])

    //-----------------------------Orden de Columnas-----------------------------

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        if (!campaignId) return
        getLeadFields({ detailed: false, campaign_id: Number(campaignId), only_active: true, page_size: 0 })
            .then(leadFields => setLeadFields(leadFields.items))
    }, [campaignId])

    const [selectedFieldIds, setSelectedFieldIds] = useState<number[]>([])

    //Trae el arreglo de ids, con el orden definido de leads en localStorage. Si no, trae los primeros N elementos
    useEffect(() => {
        if (!leadFields || leadFields.length === 0 || !campaignId) return
        const localSelectedFields = JSON.parse(window.localStorage.getItem("sel_lead_fields") ?? "{}")?.[campaignId]
        if (localSelectedFields) {
            setSelectedFieldIds(localSelectedFields)
        } else {
            setSelectedFieldIds(leadFields.slice(0, DEFAULT_N_OF_FIELDS).map(fields => fields.id))
        }
    }, [leadFields, campaignId])

    const handleSelectedFieldIds = useCallback((ids: number[], closeModal: boolean = false) => {
        setSelectedFieldIds(ids)
        if (closeModal) modalProps.handleClose()
    }, [modalProps])

    //Ante cambios a selectedFieldIds los actualiza en localStorage
    useEffect(() => {
        if (selectedFieldIds.length === 0 || !campaignId) return
        const totalSelectedFields = window.localStorage.getItem("sel_lead_fields")
        let newTotalSelectedFields: Record<number, number[]> = {}
        if (totalSelectedFields) {
            newTotalSelectedFields = { ...JSON.parse(totalSelectedFields) }
        }
        newTotalSelectedFields[Number(campaignId)] = selectedFieldIds
        window.localStorage.setItem("sel_lead_fields", JSON.stringify(newTotalSelectedFields))
    }, [selectedFieldIds, campaignId])

    //--------------------------------Presentación--------------------------------

    const [presentationMode, setPresentationMode] = useState<string>("TABLE")

    const presentationProps = useMemo(() => ({
        presentationMode,
        handlePresentation: (mode: "string") => {
            setPresentationMode(mode)
        }
    }), [presentationMode, setPresentationMode])

    //------------------------------------LeadView------------------------------------

    const saveView = () => {
        if (!campaignId) return
        createView({
            name: "Vista",
            campaign_id: Number(campaignId),
            visibility: "PRIVATE",
            view_type: presentationMode,
            filters: { "filters": filters },
            sort_config: { "order_by": orderProps.orderBy, "ascending": orderProps.ascending },
            ui_config: { "selected_ids": selectedFieldIds }
        })
    }

    //-------------------------------Leads Seleccionados-------------------------------

    const selectCheckboxProps = useSelectCheckbox<Lead>()

    const bulkDelete = useCallback(() => {
        if (!campaignId) return
        return bulkDeleteLead({ ids: Array.from(selectCheckboxProps.checkedItems.keys()) })
            .then(() => {
                fetchLeads(fetchPage, filters, headerParams, campaignId)
                selectCheckboxProps.removeAllItems()
            })
    }, [selectCheckboxProps, campaignId, fetchLeads, fetchPage, filters, headerParams])

    return (
        <Stack spacing={3}>
            <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }} spacing="1rem">
                <Typography variant="h1">Lista de Leads</Typography>
                {areThereLeads &&
                    <Stack direction="row" sx={{ marginLeft: "auto" }}>
                        <IconButton color="primary" title="Agregar Lead"
                            component={RouterLink} to="/leads/new">
                            <AddIcon />
                        </IconButton>
                        <CommonCollapsedButton actionType='CREATE' variant="contained" color="primary"
                            component={RouterLink} to="/leads/new">
                            Agregar Lead
                        </CommonCollapsedButton>
                    </Stack>
                }
            </Grid>
            <Stack spacing={2}>
                <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }} spacing={2} useFlexGap>
                    <LeadListOptions areThereLeads={areThereLeads} campaignId={campaignId} modalProps={modalProps} campaignSelectorProps={campaignSelectorProps} presentationProps={presentationProps}
                        filters={filters} headers={{ ...fetchParams, ...orderParams }} setFiltersAndHeaders={setFiltersAndHeaders} saveView={saveView} selectCheckboxProps={selectCheckboxProps}
                        bulkDelete={bulkDelete} />
                </Stack>
                {
                    leads && !!campaignId && !!workspaceId ?
                        <LeadListTable leads={leads.items} leadFields={leadFields} selectedFieldIds={selectedFieldIds} modalProps={modalProps}
                            activeFilters={filters.length} orderProps={orderProps} handleSelectedFieldIds={handleSelectedFieldIds} selectCheckboxProps={selectCheckboxProps} />
                        :
                        <Stack spacing={3} sx={{ alignItems: "center", my: 3 }}>
                            <Typography variant="h3">No hay leads para presentar</Typography>
                            <Typography variant="h4">Revisa que haya una campaña seleccionada</Typography>
                        </Stack>
                }
                <PaginationComponent {...pageComponentProps} />
            </Stack >
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector originalList={leadFields} selectedFieldIds={selectedFieldIds!} handleSelectedFieldIds={handleSelectedFieldIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
        </Stack>
    )
}