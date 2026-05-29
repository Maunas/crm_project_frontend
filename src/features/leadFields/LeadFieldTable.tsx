import { memo, useEffect, useMemo, useState } from "react"
import { SimulateLeadFormModal } from "../lead/leadForm/LeadFormWraper"
import { EnabledIcon } from "shared/ui/lists/Icons"
import { SelectableTableRow } from "shared/ui/lists/CustomTableRow"
import CommonButton from "shared/ui/buttons/CommonButton"
import GenericModal from "shared/layout/container/GenericModal"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { useModal } from "src/hooks/useModal"
import type { LeadFieldDetailed } from "src/types/leadFields"
import type { CampaignDetailed } from "src/types/campaigns"
import { disableLeadField, enableLeadField } from "./leadFieldServices"
import { Box, ButtonGroup, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"

interface LeadFieldTableProps {
    campaign: CampaignDetailed,
    leadFields: LeadFieldDetailed[] | null,
    updateLeadFields: () => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    loading: boolean
}

const stopPropagationEvent = (e: React.SyntheticEvent, callback: () => void) => {
    e.stopPropagation()
    return callback()
}

export const LeadFieldTable = memo(({ campaign, leadFields, updateLeadFields, updateEntity, handleSidebar, loading = false }: LeadFieldTableProps) => {

    useEffect(() => {
        updateLeadFields()
    }, [campaign, updateLeadFields])

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
            <LoadingScreenWrapper loading={loading}>
                {sortedFields.length > 0 ?
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
                                    .map((row) => (
                                        <SelectableTableRow key={row.id} onClick={() => handleSidebar("DETAILS_FIELD", row)}>
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
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    :
                    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h4">No se han encontrado campos para esta campaña...</Typography>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar</CommonButton>
                    </Stack>
                }
            </LoadingScreenWrapper>
            <DisableConfirmDialog entity={deletingField} clearEntity={() => setDeletingField(null)} idModal='dis-field-det'
                onConfirm={() => handleActive(deletingField)} entityTypeName="el campo" />
        </Stack>
    )
})

import React from 'react'
import LoadingScreenWrapper from "src/components/feedback/LoadingScreen"
import { DisableConfirmDialog } from "src/components/feedback/ConfirmationDialog"
import { showCommonErrorToast, showToast } from "src/utils/feedback"

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
