import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_LEAD_PAGE_SIZE } from 'src/utils/constants'
import { LeadListContent } from './LeadListContent'
import { LeadSidebar } from './LeadSidebar'
import { LeadDetailsSidebar } from './LeadDetailsSidebar'
import LeadColumnSelector from '../leadListOptions/LeadColumnSelector'
import LeadBoardCardFieldsSelector from '../leadListOptions/LeadBoardCardFieldsSelector'
import { DisableBulkConfirmDialog } from 'src/components/ui/feedback/ConfirmationDialog'
import { NATIVE_LEAD_FIELDS } from '../nativeLeadFields'
import { DEFAULT_BOARD_CARD_FIELDS, type BoardCardFieldCode } from '../boardCardFields'
import { getFieldSelectorGroupName } from 'src/features/leadFields/leadFieldUtils'
import { LeadCampaignSelector } from '../leadListOptions/LeadListOptions'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen'
import GenericModal from 'shared/layout/container/GenericModal'
import { useListPagination } from 'src/hooks/useListPagination'
import { useSelectCheckbox } from 'src/hooks/useSelectCheckbox'
import { useOrderList } from 'src/hooks/useOrderList'
import { useLoading } from 'src/hooks/useLoading'
import { useModal } from 'src/hooks/useModal'
import { useSidebar } from 'src/hooks/useSidebar'
import type { LeadFilter, LeadListParams, ListParams, OrderParams, Paginable } from 'src/types/shared'
import type { Lead, LeadDetailed, LeadView, LeadViewParams } from 'src/types/leads'
import type { LeadField } from 'src/types/leadFields'
import { bulkDeleteLead, createView, getFilteredLeads, getLead, getLeads, updateView, exportLeads } from '../leadService'
import { getLeadFields } from 'src/features/leadFields/leadFieldServices'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { useLeadNavigation } from '../stores/LeadNavigationContext'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import {
    Box, Button, Collapse, Divider, IconButton, InputAdornment,
    Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { Can } from 'src/components/auth/Can'

const DEFAULT_N_OF_FIELDS = 6
// MUI AppBar toolbar height (desktop) = 64px; m: -3 cancels parent p: 3 entirely
const LAYOUT_OFFSET = '64px'

export const LeadListPage = () => {

    const [params, setParams] = useSearchParams()
    const { modalProps } = useModal()
    const navigate = useNavigate()
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'))

    // Sidebar
    const [sidebarOpen, setSidebarOpen] = useState(!isSmallScreen)
    useEffect(() => { setSidebarOpen(!isSmallScreen) }, [isSmallScreen])

    // Leads state
    const [leads, setLeads] = useState<Paginable<Lead> | null>(null)
    const [fetchParams, setFetchParams] = useState<LeadListParams>({ only_active: true, page_size: DEFAULT_LEAD_PAGE_SIZE })
    const [orderParams, setOrderParams] = useState<OrderParams>({})
    const [filters, setFilters] = useState<LeadFilter[]>([])
    const headerParams = useMemo(() => ({ ...fetchParams, ...orderParams }), [fetchParams, orderParams])
    // Incrementa cada vez que el usuario carga una vista guardada → dispara reset visual del formulario
    const [viewLoadKey, setViewLoadKey] = useState(0)

    // Búsqueda de texto libre (mutuamente exclusiva con filtros)
    const [searchText, setSearchText] = useState('')
    // Versión debounceada del texto de búsqueda (misma espera de 400ms que ya usa el fetch de la
    // vista Tabla), para pasarle al modo Tablero -- este carga sus propios leads por columna
    // (ver LeadListContent) y hasta ahora nunca recibía el texto buscado, solo los filtros
    // estructurados del panel de filtros.
    const [debouncedQuery, setDebouncedQuery] = useState<string | undefined>(undefined)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchLeads = useCallback((page: number, filters: LeadFilter[], headers: LeadListParams, campaignId: string | number) => {
        if (filters.length > 0) {
            return getFilteredLeads({ filters }, { campaign_id: campaignId, page, ...headers })
                .then(setLeads).catch(e => { showCommonErrorToast(e); throw e })
        }
        return getLeads({ campaign_id: campaignId, page, ...headers })
            .then(setLeads).catch(e => { showCommonErrorToast(e); throw e })
    }, [])

    const areThereLeads = useMemo(() => (leads?.items?.length ?? 0) > 0, [leads])
    const { loading, fnWithLoading: fetchLeadLoad } = useLoading(fetchLeads)

    // LeadNavigationContext sync
    const { setListContext } = useLeadNavigation()
    useEffect(() => {
        if (leads?.items?.length) {
            const ids = leads.items.map(l => l.id)
            // campaignId antes se forzaba a Number(), lo que mandaba NaN como filtro al
            // re-buscar leads adyacentes (nav siguiente/anterior).
            setListContext(ids, { ...headerParams, page: leads.page, campaign_id: campaignId as string }, filters, leads.total_pages)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leads, headerParams, filters, setListContext])

    // Campaign / Workspace
    const [workspaceId, setWorkspaceId] = useState<string | number | null>(params?.get('workspace') ?? null)
    const [campaignId, setCampaignId] = useState<string | number | null>(params?.get('campaign') ?? null)

    useEffect(() => {
        setParams(prev => {
            const next = new URLSearchParams(prev)
            if (workspaceId) next.set('workspace', `${workspaceId}`); else next.delete('workspace_id')
            if (campaignId) next.set('campaign', `${campaignId}`); else next.delete('campaign_id')
            return next
        }, { replace: true })
    }, [campaignId, workspaceId, setParams])

    const handleWorkspaceChange = useCallback((id: number | string | null) => setWorkspaceId(id), [])
    const handleCampaignChange = useCallback((id: number | string | null) => setCampaignId(id), [])
    const campaignSelectorProps = useMemo(() => ({
        workspaceId, campaignId, handleWorkspaceChange, handleCampaignChange
    }), [workspaceId, campaignId, handleWorkspaceChange, handleCampaignChange])

    // Pagination
    const { fetchPage, pageComponentProps } = useListPagination(leads)
    useEffect(() => {
        if (!campaignId) return
        fetchLeadLoad(fetchPage, filters, headerParams, campaignId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId, fetchPage, fetchLeadLoad])

    // Ordering
    const orderListFn = useCallback((orderBy: number | string | null, ascending: boolean) => {
        if (!campaignId) return null
        setOrderParams({ order_by: orderBy, ascending })
        fetchLeadLoad(leads?.page ?? 1, filters, { ...fetchParams, order_by: orderBy, ascending }, campaignId)
    }, [campaignId, filters, fetchParams, leads?.page, fetchLeadLoad])
    const { orderProps, setOrderList } = useOrderList(orderListFn)

    // Filters (limpian la búsqueda de texto al activarse)
    const setFiltersAndHeaders = useCallback(async (filters: LeadFilter[], newParams: LeadListParams) => {
        if (!campaignId) return null
        if (filters.length > 0) { setSearchText(''); setDebouncedQuery(undefined) }
        return fetchLeadLoad(1, filters, { ...newParams, ...orderParams }, campaignId).then(() => {
            setFetchParams(newParams); setFilters(filters)
        })
    }, [campaignId, fetchLeadLoad, orderParams])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setFiltersAndHeaders([], fetchParams) }, [campaignId])

    // Búsqueda de texto con debounce de 400ms
    const handleSearchChange = useCallback((value: string) => {
        setSearchText(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            if (!campaignId) return
            const query = value.trim() || undefined
            // Limpiar filtros activos al buscar
            if (value.trim()) { setFilters([]) }
            setDebouncedQuery(query)
            fetchLeadLoad(1, [], { ...fetchParams, ...orderParams, query }, campaignId)
        }, 400)
    }, [campaignId, fetchLeadLoad, fetchParams, orderParams])

    const handleSearchClear = useCallback(() => {
        setSearchText('')
        setDebouncedQuery(undefined)
        if (!campaignId) return
        fetchLeadLoad(1, filters, { ...fetchParams, ...orderParams, query: undefined }, campaignId)
    }, [campaignId, fetchLeadLoad, fetchParams, orderParams, filters])

    // Lead fields (custom + nativos del sistema)
    const [leadFields, setLeadFields] = useState<LeadField[]>([])
    useEffect(() => {
        if (!campaignId) return
        // campaignId antes se forzaba a Number(); eso mandaba NaN y rompía la carga de
        // campos para el selector de columnas.
        getLeadFields({ detailed: false, campaign_id: String(campaignId), only_active: true, page_size: 0 })
            .then(r => setLeadFields([...r.items, ...NATIVE_LEAD_FIELDS]))
    }, [campaignId])

    const [selectedFieldIds, setSelectedFieldIds] = useState<number[]>([])
    useEffect(() => {
        if (!leadFields.length || !campaignId) return
        const local = JSON.parse(window.localStorage.getItem('sel_lead_fields') ?? '{}')?.[campaignId]
        setSelectedFieldIds(local ?? leadFields.slice(0, DEFAULT_N_OF_FIELDS).map(f => f.id))
    }, [leadFields, campaignId])

    const handleSelectedFieldIds = useCallback((ids: number[], closeModal = false) => {
        setSelectedFieldIds(ids)
        if (closeModal) modalProps.handleClose()
    }, [modalProps])

    useEffect(() => {
        if (!selectedFieldIds.length || !campaignId) return
        const stored = JSON.parse(window.localStorage.getItem('sel_lead_fields') ?? '{}')
        // Antes se guardaba bajo Number(campaignId) (= "NaN" como key de objeto, ya que
        // campaignId es un uuid) pero se leía bajo el campaignId real (línea de arriba) --
        // esa key desalineada hacía que la selección de columnas nunca persistiera.
        stored[campaignId] = selectedFieldIds
        window.localStorage.setItem('sel_lead_fields', JSON.stringify(stored))
    }, [selectedFieldIds, campaignId])

    // Elementos de la tarjeta del tablero (Subtítulo/Etapa/Equipo/Asignado a) -- mismo patrón de
    // persistencia que selectedFieldIds (columnas de la tabla) de arriba: localStorage por
    // campaña, más adelante también en ui_config.card_fields de la vista guardada.
    const [cardFields, setCardFields] = useState<BoardCardFieldCode[]>(DEFAULT_BOARD_CARD_FIELDS)
    useEffect(() => {
        if (!campaignId) return
        const local = JSON.parse(window.localStorage.getItem('board_card_fields') ?? '{}')?.[campaignId]
        setCardFields(local ?? DEFAULT_BOARD_CARD_FIELDS)
    }, [campaignId])

    const handleCardFields = useCallback((fields: BoardCardFieldCode[], closeModal = false) => {
        setCardFields(fields)
        if (closeModal) modalProps.handleClose()
    }, [modalProps])

    useEffect(() => {
        if (!campaignId) return
        const stored = JSON.parse(window.localStorage.getItem('board_card_fields') ?? '{}')
        stored[campaignId] = cardFields
        window.localStorage.setItem('board_card_fields', JSON.stringify(stored))
    }, [cardFields, campaignId])

    // Presentation mode
    const [presentationMode, setPresentationMode] = useState('TABLE')
    const presentationProps = useMemo(() => ({
        presentationMode,
        handlePresentation: (mode: string) => setPresentationMode(mode)
    }), [presentationMode])

    // LeadView
    const saveView = useCallback(async (name: string, visibility: string, existingView?: LeadView) => {
        if (!campaignId) return
        if (existingView) {
            if (!existingView.campaign_id) return
            // team_id de existingView es el id interno viejo (FK embebida sin migrar), no el
            // uuid que ahora espera LeadViewPost. Se omite del payload para no reenviarlo --
            // el backend lo deja sin cambios si no viene en el body (exclude_unset).
            const { team_id: _existingTeamId, ...restExistingView } = existingView
            return updateView({ ...restExistingView, name }, existingView.id)
        }
        return createView({
            name, visibility, campaign_id: String(campaignId),
            filters: { filters },
            sort_config: { order_by: orderProps.orderBy, ascending: orderProps.ascending },
            ui_config: { selected_ids: selectedFieldIds, fetch_params: fetchParams, card_fields: cardFields },
            view_type: presentationMode,
        })
    }, [campaignId, fetchParams, filters, orderProps, presentationMode, selectedFieldIds, cardFields])

    const currentView = useMemo(() => {
        if (!campaignId) return
        return {
            filters: { filters },
            sort_config: { order_by: orderProps.orderBy, ascending: orderProps.ascending },
            ui_config: { selected_ids: selectedFieldIds, fetch_params: fetchParams, card_fields: cardFields },
            view_type: presentationMode,
        } as LeadViewParams
    }, [campaignId, fetchParams, filters, orderProps, presentationMode, selectedFieldIds, cardFields])

    const loadView = useCallback((view: LeadView) => {
        // view.campaign_id sigue siendo la FK embebida (id interno viejo) -- el uuid real está
        // en el objeto anidado view.campaign. El comentario viejo acá decía que campaign_id ya
        // era el uuid, pero eso era un bug de schema (el Response tiraba 500 en la práctica) --
        // nunca llegó a probarse con datos reales.
        if (!campaignId || String(campaignId) !== view.campaign?.id) return
        let newFilters: LeadFilter[] = []
        if (view?.filters?.filters) { newFilters = view.filters.filters; setFilters(newFilters) }
        let newFetchParams: ListParams = {}
        if (view?.ui_config?.fetch_params) { newFetchParams = view.ui_config.fetch_params; setFetchParams(newFetchParams) }
        let newOrderParams: OrderParams = {}
        if (view?.sort_config?.order_by && view?.sort_config?.ascending !== undefined) {
            newOrderParams = { order_by: `${view.sort_config.order_by}`, ascending: view.sort_config.ascending }
            setOrderParams(newOrderParams)
            setOrderList(view.sort_config.order_by, view.sort_config.ascending)
        }
        if (view?.ui_config?.selected_ids) setSelectedFieldIds(view.ui_config.selected_ids)
        if (view?.ui_config?.card_fields) setCardFields(view.ui_config.card_fields as BoardCardFieldCode[])
        if (view?.view_type) setPresentationMode(view.view_type)
        fetchLeadLoad(fetchPage, newFilters, { ...newFetchParams, ...newOrderParams }, campaignId)
        setViewLoadKey(k => k + 1)
    }, [campaignId, fetchLeadLoad, fetchPage, setOrderList])

    const viewUpdateProps = useMemo(() => ({ saveView, loadView, currentView }), [saveView, loadView, currentView])

    // Bulk selection & delete
    const selectCheckboxProps = useSelectCheckbox<Lead>()
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const selectedCount = selectCheckboxProps.checkedItems.size

    const bulkDelete = useCallback(async () => {
        if (!campaignId) return
        return bulkDeleteLead({ ids: Array.from(selectCheckboxProps.checkedItems.keys()) })
            .then(res => {
                fetchLeadLoad(fetchPage, filters, headerParams, campaignId)
                selectCheckboxProps.removeAllItems()
                showToast([
                    res.deleted.length > 0 ? `Se eliminaron ${res.deleted.length} lead${res.deleted.length > 1 ? 's' : ''}` : '',
                    res.failed.length > 0 ? `No se pudo eliminar ${res.failed.length} lead${res.failed.length > 1 ? 's' : ''}` : '',
                ].filter(Boolean).join('\n'))
            })
            .catch(e => showCommonErrorToast(e))
    }, [selectCheckboxProps, campaignId, fetchLeadLoad, fetchPage, filters, headerParams])

    // Export / Import
    // Bug real encontrado 2026-08-11: se mandaba solo campaignId, así que el Excel exportado
    // siempre traía todos los leads de la campaña sin importar los filtros/búsqueda aplicados en
    // el listado. Se mandan los mismos filtros y texto buscado que se están usando ahora (son
    // mutuamente excluyentes, ver setFiltersAndHeaders/handleSearchChange).
    const handleExport = useCallback(async () => {
        if (!campaignId) return
        try { await exportLeads(campaignId, filters, debouncedQuery) }
        catch (e) { console.error('Error al exportar los leads', e) }
    }, [campaignId, filters, debouncedQuery])
    const { fnWithLoading: exportLoad, loading: exporting } = useLoading(handleExport)

    const handleImport = useCallback(() => {
        if (!campaignId) return
        navigate(`/leads/import?campaign=${campaignId}`)
    }, [campaignId, navigate])

    const hasSelection = selectedCount > 0

    // Sidebar de detalle "rápido" de un lead (clic simple en la Tabla o el Tablero) -- reutiliza
    // el mismo mecanismo de Drawer que Workspace/Team (useSidebar + GenericSidebar, ver
    // LeadDetailsSidebar.tsx). A diferencia de esas listas (que ya tienen el objeto completo en
    // memoria), el listado de leads solo trae la versión "lite" de los campos (sin
    // validation_rules/nomenclator completo, ver LeadFieldValueResponse vs
    // LeadFieldValueDetailedResponse en el backend) -- por eso NO se pasa directo el Lead de la
    // fila/tarjeta clickeada, sino que se pide el LeadDetailed completo (mismo pedido que hace la
    // página de detalle completo) antes de mostrar el sidebar con datos editables.
    const { sidebarMode: leadSidebarMode, selectedEntity: selectedLead, handleSidebar: handleLeadSidebar, closeSidebar: closeLeadSidebar } =
        useSidebar<LeadDetailed>("id", params, setParams, getLead, "DETAILS_LEAD")
    const [leadSidebarLoading, setLeadSidebarLoading] = useState(false)

    const handleLeadClick = useCallback((id: string) => {
        handleLeadSidebar("DETAILS_LEAD", null)
        setLeadSidebarLoading(true)
        getLead(id)
            .then(lead => handleLeadSidebar("KEEP", lead))
            .catch(e => { showCommonErrorToast(e); closeLeadSidebar() })
            .finally(() => setLeadSidebarLoading(false))
    }, [handleLeadSidebar, closeLeadSidebar])

    return (
        <Box sx={{
            display: 'flex',
            height: `calc(100vh - ${LAYOUT_OFFSET})`,
            m: -3,   // cancel parent Box p: 3 (all sides)
            overflow: 'hidden',
        }}>
            {/* ── Sidebar ── */}
            <Collapse in={sidebarOpen} orientation="horizontal" sx={{ flexShrink: 0 }}>
                <Box sx={{
                    width: 280,
                    height: '100%',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <LeadSidebar
                        campaignId={campaignId}
                        filters={filters}
                        headers={headerParams}
                        setFiltersAndHeaders={setFiltersAndHeaders}
                        presentationProps={presentationProps}
                        viewUpdateProps={viewUpdateProps}
                        modalProps={modalProps}
                        onToggle={() => setSidebarOpen(false)}
                        formResetKey={viewLoadKey}
                    />
                </Box>
            </Collapse>

            {/* ── Contenido principal ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

                {/* Header estilo WorkspaceHeader */}
                <Box sx={{
                    px: 2, py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexShrink: 0,
                }}>
                    {/* Toggle sidebar */}
                    <Tooltip title={sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}>
                        <IconButton size="small" onClick={() => setSidebarOpen(prev => !prev)}
                            sx={{ color: 'text.secondary', flexShrink: 0 }}>
                            {sidebarOpen
                                ? <MenuOpenIcon fontSize="small" />
                                : <MenuIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {/* Breadcrumb: Workspace / Campaña */}
                    <LeadCampaignSelector {...campaignSelectorProps} />

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    {/* Búsqueda centrada */}
                    <TextField
                        size="small"
                        placeholder="Buscar por nombre, email, teléfono..."
                        value={searchText}
                        onChange={e => handleSearchChange(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchText ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleSearchClear} edge="end"
                                            sx={{ p: 0.25 }}>
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }
                        }}
                        sx={{ flex: 1, maxWidth: 380 }}
                    />

                    {/* Acciones contextuales - derecha */}
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {hasSelection ? (
                            <>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                    {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
                                </Typography>
                                {areThereLeads && (
                                    <Button variant="outlined" size="small"
                                        onClick={exportLoad}
                                        disabled={exporting}
                                        startIcon={<FileDownloadIcon sx={{ fontSize: '16px !important' }} />}>
                                        Exportar
                                    </Button>
                                )}
                                <Button variant="outlined" color="error" size="small"
                                    onClick={() => setBulkDeleteOpen(true)}
                                    startIcon={<DeleteIcon sx={{ fontSize: '16px !important' }} />}>
                                    Eliminar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Tooltip title="Importar Leads">
                                    <IconButton size="small" onClick={handleImport}
                                        sx={{ color: 'text.secondary' }}>
                                        <FileUploadIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {areThereLeads && (
                                    <Tooltip title="Exportar Leads">
                                        <IconButton size="small" onClick={exportLoad} disabled={exporting}
                                            sx={{ color: 'text.secondary' }}>
                                            <FileDownloadIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {areThereLeads && (
                                    <Can permission="lead:create">
                                        <Button variant="contained" size="small"
                                            component={RouterLink}
                                            to={`/leads/new?workspace=${workspaceId}&campaign=${campaignId}`}
                                            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}>
                                            Nuevo Lead
                                        </Button>
                                    </Can>
                                )}
                            </>
                        )}
                    </Box>
                </Box>

                {/* Contenido de leads */}
                <Box sx={{
                    flex: 1, overflow: 'auto', pt: 2, pb: 2, pl: 2, pr: 0,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(128,128,128,0.5) rgba(0,0,0,0.06)',
                    '&::-webkit-scrollbar': { width: '10px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.06)', borderRadius: '99px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.5)', borderRadius: '99px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128,128,128,0.8)' },
                }}>
                    <LoadingScreenWrapper loading={loading}>
                        {(leads && campaignId !== null && workspaceId !== null) ? (
                            <>
                                <LeadListContent
                                    leads={leads.items}
                                    leadFields={leadFields}
                                    selectedFieldIds={selectedFieldIds}
                                    cardFields={cardFields}
                                    modalProps={modalProps}
                                    presentationMode={presentationMode}
                                    activeFilters={filters.length}
                                    orderProps={orderProps}
                                    handleSelectedFieldIds={handleSelectedFieldIds}
                                    selectCheckboxProps={selectCheckboxProps}
                                    workspaceId={workspaceId ?? undefined}
                                    campaignId={campaignId}
                                    filters={filters}
                                    searchQuery={debouncedQuery}
                                    onClearFilters={() => setFiltersAndHeaders([], fetchParams)}
                                    onLeadClick={handleLeadClick}
                                />
                                {presentationMode === 'TABLE' && (
                                    <Box sx={{ mt: 1 }}>
                                        <PaginationComponent {...pageComponentProps} />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
                                <Typography variant="h3">No hay leads para presentar</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Seleccioná un espacio de trabajo y campaña para comenzar.
                                </Typography>
                            </Stack>
                        )}
                    </LoadingScreenWrapper>
                </Box>
            </Box>

            {/* Dialogs */}
            <DisableBulkConfirmDialog
                open={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                idModal="bulk-del-leads"
                onlyDelete
                entityTypeName="los leads seleccionados"
                onConfirm={bulkDelete}
                isDisabling
            />
            <GenericModal
                idModal="columns_selector"
                {...modalProps}
                buttonText="Modificar Columnas"
                maxWidth="md"
                fullWidth
                showButton={false}
            >
                <LeadColumnSelector
                    originalList={leadFields}
                    selectedFieldIds={selectedFieldIds!}
                    handleSelectedFieldIds={handleSelectedFieldIds}
                    handleClose={modalProps.handleClose}
                    showField="name"
                    getGroupName={getFieldSelectorGroupName}
                />
            </GenericModal>
            <GenericModal
                idModal="card_fields_selector"
                {...modalProps}
                buttonText="Elementos de la Tarjeta"
                maxWidth="sm"
                fullWidth
                showButton={false}
            >
                <LeadBoardCardFieldsSelector
                    cardFields={cardFields}
                    handleCardFields={handleCardFields}
                    handleClose={modalProps.handleClose}
                />
            </GenericModal>

            <LeadDetailsSidebar
                isOpen={Boolean(leadSidebarMode)}
                lead={selectedLead}
                loading={leadSidebarLoading}
                onClose={closeLeadSidebar}
                onUpdate={(lead) => handleLeadSidebar("KEEP", lead)}
            />
        </Box>
    )
}
