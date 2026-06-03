import { memo, type ReactNode } from "react"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import { EnabledIcon } from "shared/ui/lists/Icons"
import type { LeadFieldDetailed } from "src/types/leadFields"
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import React from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface LeadFieldTableProps {
    leadFields: LeadFieldDetailed[],
    orderFieldsIds: number[],
    handleSidebar: (mode: string, entity: LeadFieldDetailed) => void,
    setDeletingField: (field: LeadFieldDetailed) => void,
    isOpen?: boolean,
    header?: ReactNode
}

const stopPropagationEvent = (e: React.SyntheticEvent, callback: () => void) => {
    e.stopPropagation()
    return callback()
}

export const LeadFieldTable = memo(({ leadFields, orderFieldsIds, handleSidebar, setDeletingField }: LeadFieldTableProps) => {

    return (
        <>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="left">Tipo</TableCell>
                        <TableCell align="right">Obligatorio</TableCell>
                        <TableCell align="right">Único</TableCell>
                        <TableCell align="right">Visible</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orderFieldsIds
                        .map(rowId => {
                            const rowData = leadFields.find(field => field.id === rowId)
                            if (!rowData) return
                            return <SelectableTableRow key={rowData.id} onClick={() => handleSidebar("DETAILS_FIELD", rowData)}>
                                <LeadFieldTableCells row={rowData} />
                                <TableCell align="right">
                                    <Stack direction="row" sx={{ justifyContent: "end" }} className="table-actions">
                                        <CommonIconButton actionType="DETAILS" title="Detalle" tooltipSize="small" size="small"
                                            onClick={(e) => stopPropagationEvent(e, () => handleSidebar("DETAILS_FIELD", rowData))} />
                                        {orderFieldsIds.length > 1 &&
                                            <>
                                                <CommonIconButton actionType="MODIFY" title="Modificar" tooltipSize="small" size="small"
                                                    onClick={(e) => stopPropagationEvent(e, () => handleSidebar("UPDATE_FIELD", rowData))} />
                                                <CommonIconButton actionType={rowData.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                    title={rowData.active ? "Deshabilitar" : "Habilitar"}
                                                    onClick={(e) => stopPropagationEvent(e, () => setDeletingField(rowData))} color={rowData.active ? "error" : "success"} />
                                            </>}
                                    </Stack>
                                </TableCell>
                            </SelectableTableRow>
                        })
                    }
                </TableBody>
            </Table>
        </>
    )
})


export const LeadFieldTableCells = memo(({ row }: { row: LeadFieldDetailed }) => {
    return (
        <>
            <TableCell component="th">{row.order}</TableCell>
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