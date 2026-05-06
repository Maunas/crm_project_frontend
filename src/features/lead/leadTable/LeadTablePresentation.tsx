
import { memo, useCallback, useMemo } from "react"
import type { LeadField } from "../../../types/leadFields"
import type { Lead } from "../../../types/leads"
import { useNavigate } from "react-router-dom"
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, IconButton, Checkbox } from "@mui/material"
import { alpha, lighten } from "@mui/material/styles"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { LeadListCellValue } from "./LeadListCellValue"
import type { Palette } from "@mui/material/styles"
import type { LeadFieldValue } from "../../../types/leadFields"
import { SelectableTableRow } from "../../../components/ui/lists/CustomTableRow"

const TABLE_SX = { minWidth: 650 } as const

interface LeadTablePresentationProps {
    leads: Lead[],
    selectedColumns: LeadField[],
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
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

    return (
        <TableContainer component={Paper}>
            <Table sx={{ ...TABLE_SX, backgroundColor: lighten(palette.background.paper, .1) }} aria-label="simple table">
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
                    {leads.map(lead => (
                        <SelectableTableRow onClick={() => onRowClick(lead.id)} key={lead.id} >
                            <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                                <Checkbox
                                    color="primary"
                                    checked={checkedItems.has(lead.id)}
                                    onChange={(_, checked) => {
                                        if (checked) addItem(lead)
                                        else removeItem(lead)
                                    }}
                                />
                            </TableCell>
                            <LeadTableBodyRow key={lead.id} lead={lead} modalProps={modalProps} selectedColumns={selectedColumns} />
                        </SelectableTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
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
    },
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
            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
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
    selectedColumns: LeadField[],
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
}
export const LeadTableBodyRow = memo(({ lead, selectedColumns, modalProps }: LeadTableBodyRowProps) => {

    // Evita O(leads*columnas*field_values.find) en cada render:
    // lookup por columna para esta fila.
    const fieldValueByFieldId = useMemo(() => {
        const map = new Map<number, LeadFieldValue>()
        for (const fv of lead.field_values) map.set(fv.field_id, fv)
        return map
    }, [lead.field_values])

    return (
        selectedColumns.map((column) => {
            const leadValue = fieldValueByFieldId.get(column.id)
            return (
                <TableCell component="td" scope="row" align="left" key={`${lead.id}-${column.id}`}>
                    <LeadListCellValue leadId={lead.id} fieldValue={leadValue} modalProps={modalProps} shortLeadTitle
                        type={column.field_type_code} subtype={column.field_subtype_code} />
                </TableCell>
            )
        })
    )
})
