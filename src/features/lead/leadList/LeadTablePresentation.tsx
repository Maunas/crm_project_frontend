
import { memo, useCallback, useEffect, useMemo, useRef } from "react"
import { LeadListCellValue } from "./LeadListCellValue"
import { DateValue } from "../shared/LeadValueComponents"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import type { LeadField, LeadFieldValue } from "src/types/leadFields"
import type { Lead } from "src/types/leads"
import { useNavigate } from "react-router-dom"
import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, Checkbox, TableSortLabel } from "@mui/material"
import type { Palette } from "@mui/material/styles"

const TABLE_SX = {
    '& .MuiTableCell-root': {
        fontSize: '0.8rem',
        py: '5px',
        px: '10px',
        whiteSpace: 'nowrap',
    },
    '& .MuiTableCell-head': {
        fontSize: '0.75rem',
        fontWeight: 700,
        py: '6px',
    },
    '& .MuiTableCell-paddingCheckbox': {
        px: '4px',
    },
} as const

interface LeadTablePresentationProps {
    leads: Lead[],
    selectedColumns: LeadField[],
    modalProps: {
        openModalId?: string;
        handleOpen: (idModal: string) => void;
        handleClose: () => void;
    },
    orderProps: {
        orderBy: string | number | null;
        ascending: boolean;
        handleOrderList: (field: string | number | null) => void;
    },
    dragProps: {
        dragEvents: (idx: number, dropLast?: boolean) => {
            draggable: boolean;
            onDragEnter: () => void;
            onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
            onDragStart: () => void;
            onDrop: () => void;
        };
        dragStyles: (idx: number, palette: Palette, direction?: "column" | "row") => object;
    },
    selectCheckboxProps: {
        checkedItems: Map<number, Lead>;
        addItem: (item: Lead | Lead[]) => void;
        removeItem: (item: Lead) => void;
        removeAllItems: () => void;
    }
}

export const LeadTablePresentation = memo(({ leads, selectedColumns, modalProps, orderProps,
    dragProps: { dragEvents, dragStyles },
    selectCheckboxProps: { checkedItems, addItem, removeItem, removeAllItems } }: LeadTablePresentationProps) => {

    const nav = useNavigate()
    const { palette } = useTheme()

    const areAllItemsChecked = useMemo(() => checkedItems.size === leads.length, [checkedItems, leads])
    const onRowClick = useCallback((id: number) => nav(`/leads/${id}`), [nav])

    // ── Scroll horizontal sincronizado arriba/abajo ───────────────────────────
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const topScrollRef      = useRef<HTMLDivElement>(null)
    const spacerRef         = useRef<HTMLDivElement>(null)
    const syncing           = useRef(false)

    // Mantiene el ancho del spacer igual al scrollWidth del TableContainer
    useEffect(() => {
        const container = tableContainerRef.current
        if (!container) return
        const updateWidth = () => {
            if (spacerRef.current) spacerRef.current.style.width = container.scrollWidth + 'px'
        }
        updateWidth()
        const ro = new ResizeObserver(updateWidth)
        ro.observe(container)
        return () => ro.disconnect()
    }, [selectedColumns])

    const onTopScroll = useCallback(() => {
        if (syncing.current || !tableContainerRef.current || !topScrollRef.current) return
        syncing.current = true
        tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft
        syncing.current = false
    }, [])

    const onBottomScroll = useCallback(() => {
        if (syncing.current || !tableContainerRef.current || !topScrollRef.current) return
        syncing.current = true
        topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft
        syncing.current = false
    }, [])

    return (
        <Box>
            {/* Scrollbar superior sincronizado */}
            <Box
                ref={topScrollRef}
                onScroll={onTopScroll}
                sx={{
                    overflowX: 'scroll',
                    overflowY: 'hidden',
                    mb: '4px',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 4,
                    // Scrollbar siempre visible, color neutro (anula el acento de Windows)
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(128,128,128,0.5) rgba(0,0,0,0.06)',
                    '&::-webkit-scrollbar':       { height: '10px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.06)', borderRadius: '99px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.5)', borderRadius: '99px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128,128,128,0.8)' },
                }}
            >
                <Box ref={spacerRef} sx={{ height: '1px', minWidth: 600 }} />
            </Box>

            <TableContainer ref={tableContainerRef} onScroll={onBottomScroll}
                component={Paper} elevation={4} sx={{
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(128,128,128,0.5) rgba(0,0,0,0.06)',
                    '&::-webkit-scrollbar':       { height: '10px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.06)', borderRadius: '99px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.5)', borderRadius: '99px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128,128,128,0.8)' },
                }}>
                <Table size="small" sx={{ ...TABLE_SX, minWidth: 600 }} aria-label="lead table">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={areAllItemsChecked}
                                    onChange={(_, checked) => checked ? addItem(leads) : removeAllItems()}
                                />
                            </TableCell>
                            {selectedColumns.map((column, idx) =>
                                <LeadTableHeaderRow key={column.id} column={column} idx={idx} orderProps={orderProps}
                                    dragStyles={dragStyles} dragEvents={dragEvents} palette={palette} />
                            )
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lea