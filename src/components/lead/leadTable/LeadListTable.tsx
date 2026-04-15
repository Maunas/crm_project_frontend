/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { GenericModal } from "../../common/layout/GenericContainer"
import LeadColumnSelector from "./LeadColumnSelector"
import type { LeadField } from "../../../types/leadFields"
import type { Lead } from "../../../types/leads"
import { useDragAndDrop } from "../../hooks/useDragAndDrop"
import { getLeadFields } from "../../leadFields/leadFieldServices"
import { Link, useNavigate, type NavigateFunction } from "react-router-dom"
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme, ButtonGroup, Badge, IconButton } from "@mui/material"
import { alpha, lighten } from "@mui/material/styles"
import { CommonButton } from "../../common/details/DetailsCommonButton"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { LeadListCellValue } from "./LeadListCellValue"
import type { Palette } from "@mui/material/styles"
import type { LeadFieldValue } from "../../../types/leadFields"

const TABLE_ROW_SX = { '&:last-child td, &:last-child th': { border: 0 } } as const
const TABLE_SX = { minWidth: 650 } as const
const DEFAULT_N_OF_FIELDS = 6

interface LeadListTableProps {
    leads: Lead[],
    campaignId: number,
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    },
    activeFilters: number,
    orderProps: {
        orderBy: string | number | null;
        ascending: boolean;
        handleOrderList: (field: string | number | null) => void;
    }
}

export const LeadListTable = memo(({ leads, campaignId, activeFilters = 0, modalProps, orderProps }: LeadListTableProps) => {

    const nav = useNavigate()
    const { palette } = useTheme()

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        if (!campaignId) return
        getLeadFields({ detailed: false, campaign_id: campaignId, only_active: true, page_size: 0 })
            .then(leadFields => setLeadFields(leadFields.items))
    }, [campaignId])

    const [selectedIds, setSelectedIds] = useState<number[]>([])

    //Trae el arreglo de ids, con el orden definido de leads en localStorage. Si no, trae los primeros N elementos
    useEffect(() => {
        if (!leadFields || leadFields.length === 0) return
        const localSelectedFields = JSON.parse(window.localStorage.getItem("sel_lead_fields") ?? "{}")?.[campaignId]
        if (localSelectedFields) {
            setSelectedIds(localSelectedFields)
        } else {
            setSelectedIds(leadFields.slice(0, DEFAULT_N_OF_FIELDS).map(fields => fields.id))
        }
    }, [leadFields])

    //Filtra los objetos LeadField para seguir el orden del arreglo de ids.
    const selectedColumns = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return null
        if (!selectedIds || selectedIds.length === 0) return null
        return leadFields.filter(leadField => selectedIds.includes(leadField.id))
            .sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id))
    }, [leadFields, selectedIds])

    //Ante cambios a selectedIds los actualiza en localStorage
    useEffect(() => {
        if (selectedIds.length === 0) return
        const totalSelectedFields = window.localStorage.getItem("sel_lead_fields")
        let newTotalSelectedFields: Record<number, number[]> = {}
        if (totalSelectedFields) {
            newTotalSelectedFields = { ...JSON.parse(totalSelectedFields) }
        }
        newTotalSelectedFields[campaignId] = selectedIds
        window.localStorage.setItem("sel_lead_fields", JSON.stringify(newTotalSelectedFields))
    }, [selectedIds])


    const handleSelectedIds = useCallback((ids: number[]) => {
        setSelectedIds(ids)
        modalProps.handleClose()
    }, [modalProps])

    const { dragStyles, dragEvents } = useDragAndDrop(selectedIds, (items) => setSelectedIds(items))

    //Si hay leads, pero no hay columnas seleccionadas
    if (selectedColumns?.length === 0 && leads.length > 0) return (
        <Stack gap={3} my={3} alignItems="center">
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector itemsList={leadFields} selectedIds={selectedIds!} handleSelectedIds={handleSelectedIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
            <Stack gap={2} alignItems="center">
                <Typography variant="h3">No hay leads para presentar.</Typography>
                <Typography variant="h4">Revisa las columnas seleccionadas.</Typography>
            </Stack>
            <CommonButton actionType="OPTIONS" color="secondary" onClick={() => modalProps.handleOpen("columns_selector")}>
                Modificar Columnas
            </CommonButton>
        </Stack>
    )

    if (leads.length === 0) return (
        <Stack gap={3} my={3} alignItems="center">
            <Stack gap={2} alignItems="center">
                <Typography variant="h3">No hay leads para presentar</Typography>
                <Typography variant="h4">Agrega un lead nuevo
                    {activeFilters > 0 && " o revisa los filtros activos"}
                </Typography>
            </Stack>
            <ButtonGroup >
                <CommonButton actionType="CREATE" color="primary" component={Link} to="/leads/new">
                    Agregar Lead
                </CommonButton>
                {activeFilters > 0 &&
                    <Badge badgeContent={activeFilters} color="success">
                        <CommonButton actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")}>
                            Aplicar Filtros
                        </CommonButton>
                    </Badge>
                }
            </ButtonGroup>
        </Stack>
    )

    if (leads.length > 0) return (
        <>
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector itemsList={leadFields} selectedIds={selectedIds!} handleSelectedIds={handleSelectedIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
            {selectedColumns && selectedColumns.length > 0 &&
                <TableContainer component={Paper}>
                    <Table sx={{ ...TABLE_SX, backgroundColor: lighten(palette.background.paper, .1) }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {selectedColumns.map((column, idx) =>
                                    <LeadTableHeaderRow key={column.id} column={column} idx={idx} orderProps={orderProps}
                                        dragStyles={dragStyles} dragEvents={dragEvents} palette={palette} />
                                )
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leads.map(lead => (
                                <LeadTableBodyRow key={lead.id}
                                    lead={lead} modalProps={modalProps} nav={nav} selectedColumns={selectedColumns} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </>
    )
})

interface LeadTableHeaderRowProps {
    column: LeadField,
    idx: number,
    orderProps: {
        orderBy: string | number | null;
        ascending: boolean;
        handleOrderList: (field: string | number | null) => void;
    },
    palette: Palette,
    dragStyles: (idx: number, palette: Palette, direction?: "column" | "row") => object,
    dragEvents: (idx: number, dropLast?: boolean) => {
        draggable: boolean;
        onDragEnter: () => void;
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
        onDragStart: () => void;
        onDrop: () => void;
    }
}
export const LeadTableHeaderRow = memo(({ column, idx, orderProps, dragStyles, dragEvents, palette }: LeadTableHeaderRowProps) => {
    const handleOrder = useCallback(() => orderProps.handleOrderList(column.id), [orderProps, column.id])
    const headerSx = useMemo(() => ({
        fontWeight: 600,
        ...dragStyles(idx, palette, "row")
    }), [dragStyles, idx, palette])

    const iconButtonSx = useMemo(() => ({
        backgroundColor: orderProps.orderBy === column.id ? alpha(palette.secondary.light, .7) : "none",
        color: orderProps.orderBy === column.id ? palette.secondary.contrastText : palette.text.primary,
        "&:hover": {
            backgroundColor: palette.secondary.main,
            color: palette.secondary.contrastText
        }
    }), [orderProps.orderBy, column.id, palette.secondary.contrastText, palette.secondary.light, palette.secondary.main, palette.text.primary])

    return (
        <TableCell align="left"
            {...dragEvents(idx, false)}
            sx={headerSx}
        >
            <Stack gap={1} direction="row" alignItems="center">
                {column.name}
                <IconButton size="small" onClick={handleOrder} sx={iconButtonSx}>
                    {orderProps.orderBy !== column.id &&
                        <ArrowUpwardIcon fontSize="small" />
                    }
                    {orderProps.orderBy === column.id &&
                        (orderProps.ascending ?
                            <ArrowUpwardIcon fontSize="small" />
                            :
                            <ArrowDownwardIcon fontSize="small" />
                        )
                    }
                </IconButton>
            </Stack>
        </TableCell>
    )
})

interface LeadTableBodyRowProps {
    lead: Lead,
    nav: NavigateFunction,
    selectedColumns: LeadField[],
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    },
}
export const LeadTableBodyRow = memo(({ nav, lead, selectedColumns, modalProps }: LeadTableBodyRowProps) => {
    const onRowClick = useCallback(() => nav(`/leads/${lead.id}`), [nav, lead.id])

    // Evita O(leads*columnas*field_values.find) en cada render:
    // lookup por columna para esta fila.
    const fieldValueByFieldId = useMemo(() => {
        const map = new Map<number, LeadFieldValue>()
        for (const fv of lead.field_values) map.set(fv.field_id, fv)
        return map
    }, [lead.field_values])

    return (
        <TableRow onClick={onRowClick}
            key={lead.id} sx={TABLE_ROW_SX}
        >
            {selectedColumns.map((column) => {
                const leadValue = fieldValueByFieldId.get(column.id)
                return (
                    <TableCell component="td" scope="row" align="left" key={`${lead.id}-${column.id}`}>
                        <LeadListCellValue leadId={lead.id} fieldValue={leadValue} modalProps={modalProps}
                            type={column.field_type_code} subtype={column.field_subtype_code} />
                    </TableCell>
                )
            })
            }
        </TableRow>
    )
})
