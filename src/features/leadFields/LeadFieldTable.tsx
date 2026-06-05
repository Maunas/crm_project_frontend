import { memo } from "react"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import { EnabledIcon } from "shared/ui/lists/Icons"
import type { LeadFieldDetailed } from "src/types/leadFields"
import { Box, Checkbox, Stack, Table, TableBody, TableCell, TableHead, TableRow, type Palette } from "@mui/material"
import React from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ReorderFieldsIds } from "./LeadFieldList"
import { useDragAndDrop } from "src/hooks/useDragAndDrop"
import CommonButton from "src/components/ui/buttons/CommonButton"
import { stopPropagationEvent } from "src/utils/lists"

interface LeadFieldTableProps {
    sectLeadFields: LeadFieldDetailed[],
    orderFieldsIds: number[],
    setOrderFieldsIds: React.Dispatch<React.SetStateAction<ReorderFieldsIds[]>>,
    sectIdx: number,
    handleSidebar: (mode: string, entity: LeadFieldDetailed) => void,
    setDeletingField: (field: LeadFieldDetailed) => void,
    isReordering: boolean,
    palette: Palette,
    checkedItems: Map<number, LeadFieldDetailed>,
    addItem: (item: LeadFieldDetailed | LeadFieldDetailed[]) => void,
    removeItem: (item: LeadFieldDetailed | LeadFieldDetailed[]) => void

}


export const LeadFieldTable = memo(({ sectLeadFields, orderFieldsIds, setOrderFieldsIds, sectIdx, palette,
    isReordering = false, handleSidebar, setDeletingField, checkedItems, addItem, removeItem }: LeadFieldTableProps) => {

    const handleFieldChange = (fields: number[]) => {
        setOrderFieldsIds(prev => {
            const newList = [...prev]
            newList[sectIdx].fields = fields
            return newList
        })
    }

    const { handleDragEnter, handleDragOver, handleDragStart, handleDrop, dragStyles } = useDragAndDrop(orderFieldsIds, handleFieldChange)

    return (
        <Table size='small'>
            <TableHead>
                <TableRow>
                    <TableCell>
                    </TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="left">Tipo</TableCell>
                    <TableCell align="right">Obligatorio</TableCell>
                    <TableCell align="right">Único</TableCell>
                    <TableCell align="right">Visible</TableCell>
                    {!isReordering && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {orderFieldsIds
                    .map((rowId, idx) => {
                        const rowData = sectLeadFields.find(field => field.id === rowId)
                        if (!rowData) return
                        return <SelectableTableRow key={rowData.id} onClick={() => !isReordering ? handleSidebar("DETAILS_FIELD", rowData) : {}}
                            sx={isReordering ? dragStyles(idx, palette, "column", true) : {}}
                            {...(isReordering ? {
                                onDragEnter: () => handleDragEnter(idx),
                                onDragOver: handleDragOver,
                                onDrop: () => handleDrop(idx)
                            } : {})}>
                            <TableCell padding="checkbox" onClick={stopPropagationEvent()}>
                                {!isReordering ?
                                    <Checkbox onClick={stopPropagationEvent()} checked={checkedItems.has(rowData.id)}
                                        onChange={(_, checked) => checked ? addItem(rowData) : removeItem(rowData)} /> :
                                    <CommonButton actionType="DRAG" draggable variant="contained" onlyTooltip color="primary"
                                        size="small" onClick={stopPropagationEvent()}
                                        onDragStart={() => handleDragStart(idx)} sx={{ cursor: "grab", px: 2, minWidth: 0 }} />
                                }
                            </TableCell>
                            <LeadFieldTableCells row={rowData} />
                            {!isReordering &&
                                <TableCell align="right">
                                    <Stack direction="row" sx={{ justifyContent: "end" }} className="table-actions">
                                        <CommonIconButton actionType="DETAILS" title="Detalle" tooltipSize="small" size="small"
                                            onClick={stopPropagationEvent(() => handleSidebar("DETAILS_FIELD", rowData))} />
                                        {orderFieldsIds.length > 1 &&
                                            <>
                                                <CommonIconButton actionType="MODIFY" title="Modificar" tooltipSize="small" size="small"
                                                    onClick={stopPropagationEvent(() => handleSidebar("UPDATE_FIELD", rowData))} />
                                                <CommonIconButton actionType={rowData.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                    title={rowData.active ? "Deshabilitar" : "Habilitar"}
                                                    onClick={stopPropagationEvent(() => setDeletingField(rowData))} color={rowData.active ? "error" : "success"} />
                                            </>}
                                    </Stack>
                                </TableCell>
                            }
                        </SelectableTableRow>
                    })
                }
            </TableBody>
        </Table>
    )
})


export const LeadFieldTableCells = memo(({ row }: { row: LeadFieldDetailed }) => {
    return (
        <>
            <TableCell component="th">
                <Stack spacing={1} direction="row">
                    <EnabledIcon active={row.active} size="small" />
                    <Box sx={{ fontWeight: "bold" }}>{row.name} </Box>
                </Stack>
            </TableCell>
            <TableCell align="left">
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <span>{row.field_type.description}</span>
                    {row.field_subtype ? <>
                        <ArrowForwardIcon fontSize="small" />
                        <span>{row.field_subtype?.description}</span>
                    </> : ""}
                </Stack>
            </TableCell>
            <TableCell align="right">
                <EnabledIcon active={row.required} trueTooltip='Obligatorio' falseTooltip='Opcional' size="small" />
            </TableCell>
            <TableCell align="right">
                <EnabledIcon active={row.is_primary} trueTooltip='Único' falseTooltip='Repetible' size="small" />
            </TableCell>
            <TableCell align="right">
                <EnabledIcon active={row.is_visible} trueTooltip='Visible' falseTooltip='Oculto' size="small" />
            </TableCell>
        </>
    )
})