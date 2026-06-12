import { memo, useCallback, useMemo, useState } from "react"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import { EnabledIcon } from "shared/ui/lists/Icons"
import type { LeadFieldDetailed } from "src/types/leadFields"
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme, type Palette } from "@mui/material"
import React from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ReorderFieldsIds } from "./LeadFieldList"
import { useDragAndDrop } from "src/hooks/useDragAndDrop"
import CommonButton from "src/components/ui/buttons/CommonButton"
import { stopPropagationEvent } from "src/utils/lists"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { DisableConfirmDialog } from "src/components/feedback/ConfirmationDialog"
import { getFieldsBySections } from "./leadFieldUtils"

const MIN_FIELDS = 10

interface LeadFieldTableSectionsProps {
    leadFields: LeadFieldDetailed[]
    newFieldsBySectionIds: ReorderFieldsIds[],
    setNewFieldsBySectionIds: React.Dispatch<React.SetStateAction<ReorderFieldsIds[]>>,
    handleActive: (field: LeadFieldDetailed | null) => Promise<void>,
    isReordering: boolean,
    handleSidebarWrapper: (mode: string, entity?: LeadFieldDetailed | null | undefined) => void,
    checkedItems: Map<number, LeadFieldDetailed>;
    checkedItemsArray: LeadFieldDetailed[];
    addItem: (item: LeadFieldDetailed | LeadFieldDetailed[]) => void;
    removeItem: (item: LeadFieldDetailed | LeadFieldDetailed[]) => void;
}

export const LeadFieldTableSections = ({ leadFields, newFieldsBySectionIds, setNewFieldsBySectionIds, handleActive, isReordering,
    handleSidebarWrapper, checkedItems, checkedItemsArray, addItem, removeItem }: LeadFieldTableSectionsProps) => {

    const { palette } = useTheme()
    const [showAll, setShowAll] = useState<boolean>(false)
    const [openTableId, setOpenTableId] = useState<number | null>(null)

    // Deshabilitación de campos
    const [deletingField, setDeletingField] = useState<LeadFieldDetailed | null>(null)
    const handleDeletingField = useCallback((deletingField: LeadFieldDetailed) => setDeletingField(deletingField), [])

    /**Devuelve la cantidad de items seleccionados por sección */
    const checkedBySectionId = useMemo(() => {
        const map = new Map<number, number>()
        for (const item of checkedItemsArray) {
            const sectId = item.lead_field_section.id
            map.set(sectId, (map.get(sectId) ?? 0) + 1)
        }
        return map
    }, [checkedItemsArray])

    //Reordena las secciones, no los campos.
    const { handleDragEnter, handleDragOver, handleDragStart, handleDrop, dragStyles } = useDragAndDrop(newFieldsBySectionIds, (i) => setNewFieldsBySectionIds(i))

    const fieldsMapBySection = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return new Map()
        const sectionArray = getFieldsBySections(leadFields).map(section => ([section.id, section] as const))
        return new Map(sectionArray)
    }, [leadFields])

    return (
        <Box>
            {newFieldsBySectionIds.map((section, idx) => {
                const sectFields = showAll ? section.fields : section.fields.slice(0, MIN_FIELDS)
                const leadFieldsData = fieldsMapBySection.get(section.sectId)
                const sectionCheckedItems = checkedBySectionId.get(section.sectId) ?? 0
                if (!leadFieldsData) return
                return (
                    <Accordion expanded={openTableId === section.sectId} component={Paper} elevation={3} key={`${section.sectId}-acc`}
                        onChange={(_, expanded) => expanded ? setOpenTableId(section.sectId) : setOpenTableId(null)}
                        sx={[{ p: 0 }, isReordering ? dragStyles(idx, palette, "column", true) : {}]}
                        {...(isReordering ? {
                            onDragEnter: () => handleDragEnter(idx),
                            onDragOver: handleDragOver,
                            onDrop: () => handleDrop(idx)
                        } : {})}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${section.sectId}-content`} id={`${section.sectId}-header`}>
                            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                                {!isReordering ?
                                    <Checkbox
                                        checked={section.fields.length === sectionCheckedItems}
                                        indeterminate={sectionCheckedItems > 0 && section.fields.length !== sectionCheckedItems}
                                        onClick={stopPropagationEvent()}
                                        onChange={(_, checked) => checked ? addItem(leadFieldsData.fields) : removeItem(leadFieldsData.fields)} /> :
                                    <CommonButton actionType="DRAG" draggable variant="contained" onlyTooltip color="primary"
                                        onClick={stopPropagationEvent()}
                                        onDragStart={() => handleDragStart(idx)} sx={{ cursor: "grab", px: 1.5, minWidth: 0 }} />
                                }
                                <Typography variant="h3" sx={{ py: .5, flexGrow: 1 }}>{section.sectName}</Typography>
                                {sectionCheckedItems > 0 &&
                                    <Typography variant="body1" sx={{ fontStyle: "italic", py: .5, flexGrow: 1 }}>
                                        {`- ${sectionCheckedItems === 1 ? "1 item seleccionado" : `${sectionCheckedItems} items seleccionados`} `}
                                    </Typography>
                                }
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} elevation={6} key={`section-${section.sectId}`}>
                                <LeadFieldTable sectLeadFields={leadFieldsData.fields} orderFieldsIds={sectFields}
                                    setOrderFieldsIds={setNewFieldsBySectionIds} sectIdx={idx} palette={palette} isReordering={isReordering}
                                    handleSidebar={handleSidebarWrapper} setDeletingField={handleDeletingField} checkedItems={checkedItems}
                                    addItem={addItem} removeItem={removeItem} />
                                {sectFields.length > MIN_FIELDS &&
                                    <CommonButton actionType={showAll ? "MINUS" : "CREATE"} onClick={() => setShowAll(!showAll)} fullWidth>
                                        {showAll ? "Mostrar Menos" : "Mostrar Todos"}
                                    </CommonButton>}
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion >
                )
            })
            }
            <DisableConfirmDialog entity={deletingField} clearEntity={() => setDeletingField(null)} idModal='dis-field-det'
                onConfirm={() => handleActive(deletingField)} entityTypeName="el campo" />
        </Box >
    )
}

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

    //Precalcula el estilo para evitar rerenderizados
    const dragStyleList = useMemo(() => {
        return orderFieldsIds.map((_, idx) => dragStyles(idx, palette, "column", true))
    }, [dragStyles, orderFieldsIds, palette])

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
                            sx={isReordering ? dragStyleList[idx] : {}}
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