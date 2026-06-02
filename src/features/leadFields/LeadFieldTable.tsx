import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { SimulateLeadFormModal } from "../lead/leadForm/LeadFormWraper"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import GenericModal from "shared/layout/container/GenericModal"
import CommonButton from "shared/ui/buttons/CommonButton"
import { EnabledIcon } from "shared/ui/lists/Icons"
import { useModal } from "src/hooks/useModal"
import type { LeadFieldDetailed } from "src/types/leadFields"
import type { CampaignDetailed } from "src/types/campaigns"
import { disableLeadField, enableLeadField, getLeadField, getLeadFields } from "./leadFieldServices"
import { Box, ButtonGroup, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"

interface LeadFieldTableProps {
    campaign: CampaignDetailed,
    closeCmpSidebar: () => void,
    cmpSidebarMode: unknown | null
}

const stopPropagationEvent = (e: React.SyntheticEvent, callback: () => void) => {
    e.stopPropagation()
    return callback()
}

const MIN_FIELDS = 10

export const LeadFieldTable = memo(({ campaign, cmpSidebarMode, closeCmpSidebar }: LeadFieldTableProps) => {

    //Necesaria la lista en este componente, en lugar de LeadFieldTable,
    // para facilitar la modificación de la lista desde el sidebar.
    const [leadFields, setLeadFields] = useState<LeadFieldDetailed[] | null>(null)

    const fetchLeadFields = useCallback((id: number) => {
        return getLeadFields({
            detailed: true, campaign_id: id, only_active: false, page_size: 0
        }).then(res => setLeadFields(res.items))
    }, [setLeadFields])

    const { loading: fieldsLoading, fnWithLoading: fetchFieldsLoad } = useLoading(fetchLeadFields)

    useEffect(() => {
        fetchFieldsLoad(Number(campaign.id))
    }, [campaign, fetchFieldsLoad])

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadFieldDetailed>("id", params, setParams, getLeadField, "DETAILS_FIELD")

    const handleSidebarWrapper = (mode: string, entity?: LeadFieldDetailed | null) => {
        if (cmpSidebarMode) closeCmpSidebar()
        handleSidebar(mode, entity)
    }

    //Define como actualizar la lista dependiendo de la acción realizada. 
    // Para CREATE se vuelve a hacer fetch de la página para no arruinar la paginación
    const updateEntity = useCallback((mode: string, entity: LeadFieldDetailed) => {
        switch (mode) {
            case "UPDATE_FIELD": {
                const newLeadField = entity as LeadFieldDetailed
                if (newLeadField.id === selectedEntity?.id) {
                    handleSidebar("KEEP", newLeadField)
                }
                return setLeadFields(prevList => {
                    if (!prevList || !(prevList?.length > 0)) return prevList
                    const newLeadFields = [...prevList]
                    const fieldIdx = prevList.findIndex(field => field.id === newLeadField.id)
                    if (fieldIdx === -1) return prevList
                    newLeadFields[fieldIdx] = newLeadField
                    return newLeadFields
                })
            }
            case "CREATE_FIELD": {
                return fetchFieldsLoad()
            }
            case "DELETE_FIELD": {
                return setLeadFields(prevList => {
                    if (!prevList || !(prevList?.length > 0)) return prevList
                    const newLeadFields = [...prevList]
                    const fieldIdx = prevList.findIndex(field => field.id === entity.id)
                    if (fieldIdx === -1) return prevList
                    newLeadFields.splice(fieldIdx, 1)
                    if (selectedEntity && entity.id === selectedEntity.id) closeSidebar()
                    return newLeadFields
                })
            }
        }
    }, [closeSidebar, selectedEntity, fetchFieldsLoad, handleSidebar])

    const handleActive = async (field: LeadFieldDetailed | null) => {
        if (!field || !field.id) return
        const updateActive = () => {
            updateEntity("UPDATE_FIELD", { ...field, active: !field.active })
            handleSidebar("KEEP", { ...field, active: !field.active })
        }
        if (field.active) {
            disableLeadField(field.id)
                .then(res => {
                    if (res.action === "disabled") {
                        updateActive()
                        showToast(`El campo "${field.name}" se ha deshabilitado con éxito`)
                    }
                    else {
                        updateEntity("DELETE_FIELD", field)
                        showToast(`El campo "${field.name}" se ha eliminado definitivamente`)
                    }
                })
                .catch(e => showCommonErrorToast(e))
        }
        else enableLeadField(field.id).then(() => {
            updateActive()
            showToast(`El campo "${field.name}" se ha habilitado con éxito`)
        })
            .catch(e => showCommonErrorToast(e))

    }

    const { modalProps } = useModal()

    const sortedFields = useMemo(() => {
        if (!leadFields || leadFields?.length === 0) return []
        return [...leadFields].sort((a, b) => a.order - b.order)
    }, [leadFields])

    const [deletingField, setDeletingField] = useState<LeadFieldDetailed | null>(null)

    const [showAll, setShowAll] = useState<boolean>(false)

    return (
        <Stack spacing={3}>
            <Stack useFlexGap direction="row" spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h2">Lista de Campos de Lead</Typography>
                {sortedFields.length > 0 &&
                    <ButtonGroup sx={{ marginLeft: "auto" }}>
                        <GenericModal {...modalProps} idModal="simulateLead" buttonText='Vista previa de formulario' maxWidth="xl" fullWidth
                            btnProps={{ actionType: "DETAILS", variant: "outlined" }} sx={{ minWidth: "80vw" }} >
                            {campaign &&
                                <SimulateLeadFormModal campaign={campaign} leadFields={sortedFields} onCancel={modalProps.handleClose} />
                            }
                        </GenericModal>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE" onlyTooltip>
                            Agregar
                        </CommonButton>
                    </ButtonGroup>
                }
            </Stack>
            <LoadingScreenWrapper loading={fieldsLoading}>
                {sortedFields.length > 0 ?
                    <Stack spacing={1}>
                        <TableContainer component={Paper} elevation={4}  >
                            <Table aria-label="simple table" size='small' >
                                <TableHead >
                                    <TableRow sx={{ "& .MuiTableCell-root": { fontWeight: 600 } }}>
                                        <TableCell></TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell align="right">Tipo</TableCell>
                                        <TableCell align="right">Subtipo</TableCell>
                                        <TableCell align="right">Obligatorio</TableCell>
                                        <TableCell align="right">Único</TableCell>
                                        <TableCell align="right">Visible</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedFields
                                        .map((row, idx) => {
                                            if (!showAll && idx >= MIN_FIELDS) return
                                            return <SelectableTableRow key={row.id} onClick={() => handleSidebar("DETAILS_FIELD", row)}>
                                                <LeadFieldTableCells row={row} />
                                                <TableCell align="right">
                                                    <Stack direction="row" sx={{ justifyContent: "end" }} className="table-actions">
                                                        <CommonIconButton actionType="DETAILS" title="Detalle" tooltipSize="small" size="small"
                                                            onClick={(e) => stopPropagationEvent(e, () => handleSidebar("DETAILS_FIELD", row))} />
                                                        {sortedFields.length > 1 &&
                                                            <>
                                                                <CommonIconButton actionType="MODIFY" title="Modificar" tooltipSize="small" size="small"
                                                                    onClick={(e) => stopPropagationEvent(e, () => handleSidebar("UPDATE_FIELD", row))} />
                                                                <CommonIconButton actionType={row.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                                    title={row.active ? "Deshabilitar" : "Habilitar"}
                                                                    onClick={(e) => stopPropagationEvent(e, () => setDeletingField(row))} color={row.active ? "error" : "success"} />
                                                            </>}
                                                    </Stack>
                                                </TableCell>
                                            </SelectableTableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {sortedFields.length > MIN_FIELDS &&
                            <CommonButton actionType={showAll ? "MINUS" : "CREATE"} onClick={() => setShowAll(!showAll)}>
                                {showAll ? "Mostrar Menos" : "Mostrar Todos"}
                            </CommonButton>}
                    </Stack>
                    :
                    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h4">No se han encontrado campos para esta campaña...</Typography>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar</CommonButton>
                    </Stack>
                }
            </LoadingScreenWrapper>
            <GenericSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} sidebarComponent={
                <LeadFieldSidebar mode={sidebarMode} entity={selectedEntity} updateEntity={updateEntity} campaign={campaign}
                    closeSidebar={closeSidebar} handleSidebar={handleSidebarWrapper} leadFieldListLength={leadFields?.length ?? 0} />
            } />
            <DisableConfirmDialog entity={deletingField} clearEntity={() => setDeletingField(null)} idModal='dis-field-det'
                onConfirm={() => handleActive(deletingField)} entityTypeName="el campo" />
        </Stack>
    )
})

import React from 'react'
import LoadingScreenWrapper from "src/components/feedback/LoadingScreen"
import { DisableConfirmDialog } from "src/components/feedback/ConfirmationDialog"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { useLoading } from "src/hooks/useLoading"
import { useSidebar } from "src/hooks/useSidebar"
import { useSearchParams } from "react-router-dom"
import { GenericSidebar } from "src/components/layout/container/GenericContainer"
import { LeadFieldDetail } from "./LeadFieldDetail"
import { LeadFieldFormSidebar } from "./LeadFieldForm"
import { ValidationFormSidebar } from "../validations/ValidationForm"

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
            <TableCell align="right">{row.field_type.description}</TableCell>
            <TableCell align="right">{row.field_subtype?.description ?? "---"}</TableCell>
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


interface SidebarProps {
    mode: string | null,
    entity: LeadFieldDetailed | null,
    closeSidebar: () => void,
    updateEntity: (mode: string, entity: LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    leadFieldListLength: number,
    campaign: CampaignDetailed
}

const LeadFieldSidebar = ({ mode, entity, handleSidebar, closeSidebar, updateEntity, campaign, leadFieldListLength }: SidebarProps) => {
    switch (mode) {
        case "DETAILS_FIELD":
            return <LeadFieldDetail leadField={entity as LeadFieldDetailed} leadFieldListLength={leadFieldListLength}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar} updateEntity={updateEntity} />
        case "CREATE_FIELD":
            return <LeadFieldFormSidebar campaign={campaign} closeSidebar={closeSidebar} handleSidebar={handleSidebar}
                updateEntityOnList={(entity) => updateEntity(mode, entity)} />
        case "UPDATE_FIELD":
            return <LeadFieldFormSidebar existingLF={entity as LeadFieldDetailed} campaign={campaign}
                updateEntityOnList={(entity) => updateEntity(mode, entity)}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar} />
        case "UPDATE_VAL":
            return <ValidationFormSidebar leadField={entity as LeadFieldDetailed}
                updateEntityOnList={(entity) => updateEntity("UPDATE_FIELD", entity)}
                handleSidebar={handleSidebar} />
    }
}