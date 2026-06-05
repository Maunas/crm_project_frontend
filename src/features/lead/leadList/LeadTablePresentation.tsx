
import { memo, useCallback, useMemo } from "react"
import { LeadListCellValue } from "./LeadListCellValue"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import type { LeadField, LeadFieldValue } from "src/types/leadFields"
import type { Lead } from "src/types/leads"
import { useNavigate } from "react-router-dom"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, Checkbox, TableSortLabel } from "@mui/material"
import type { Palette } from "@mui/material/styles"

const TABLE_SX = {} as const

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

    return (
        <TableContainer component={Paper} elevation={4}>
            <Table sx={{ ...TABLE_SX }} aria-label="lead table">
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

    return (
        <TableCell align="left" {...dragEvents(idx, false)} sx={headerSx}
            sortDirection={orderProps.orderBy !== column.id ? false :
                (orderProps.ascending ? "asc" : "desc")} >
            <TableSortLabel
                active={orderProps.orderBy === column.id}
                direction={orderProps.orderBy !== column.id ? "asc" :
                    (orderProps.ascending ? "asc" : "desc")}
                onClick={handleOrder}
            >
                {column.name}
            </TableSortLabel>
        </TableCell >
    )
})


interface LeadTableBodyRowProps {
    lead: Lead,
    selectedColumns: LeadField[],
    modalProps: {
        openModalId?: string;
        handleOpen: (idModal: string) => void;
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
                    <LeadListCellValue leadId={lead.id} fieldValue={leadValue} {...modalProps}
                        type={column.field_type_code} subtype={column.field_subtype_code} />
                </TableCell>
            )
        })
    )
})
