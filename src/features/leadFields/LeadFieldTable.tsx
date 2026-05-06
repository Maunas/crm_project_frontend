import { useEffect, useMemo } from "react"
import { SimulateLeadFormModal } from "../lead/leadForm/LeadFormWraper"
import { EnabledIcon, ListAction } from "../../components/ui/lists/Icons"
import type { LeadFieldDetailed } from "../../types/leadFields"
import type { CampaignDetailed } from "../../types/campaigns"
import { disableLeadField, enableLeadField } from "./leadFieldServices"
import { Box, ButtonGroup, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { lighten, useTheme } from "@mui/material/styles"
import { SelectableTableRow } from "../../components/ui/lists/CustomTableRow"
import { useModal } from "src/hooks/useModal"
import CommonButton from "src/components/ui/buttons/CommonButton"
import GenericModal from "src/components/layout/container/GenericModal"

interface LeadFieldTableProps {
    campaign: CampaignDetailed,
    leadFields: LeadFieldDetailed[] | null,
    updateLeadFields: () => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

const stopPropagationEvent = (e: React.SyntheticEvent, callback: () => void) => {
    e.stopPropagation()
    return callback()
}

export const LeadFieldTable = ({ campaign, leadFields, updateLeadFields, updateEntity, handleSidebar }: LeadFieldTableProps) => {

    useEffect(() => {
        updateLeadFields()
    }, [campaign, updateLeadFields])

    const handleActive = (field: LeadFieldDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_FIELD", { ...field, active: !field.active })
            handleSidebar("KEEP", { ...field, active: !field.active })
        }
        if (field.active) {
            disableLeadField(field.id)
                .then(res => {
                    if (res.action === "disabled") updateActive()
                    else updateEntity("DELETE_FIELD", field)
                })
        }
        else enableLeadField(field.id).then(updateActive)
    }

    const { modalProps } = useModal()
    const { palette } = useTheme()

    const sortedFields = useMemo(() => {
        if (!leadFields || leadFields?.length === 0) return []
        return [...leadFields].sort((a, b) => a.order - b.order)
    }, [leadFields])

    return (
        <Stack spacing={2}>
            <Stack useFlexGap direction="row" spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h2">Lista de Campos de Lead</Typography>
                {sortedFields.length > 0 &&
                    <ButtonGroup sx={{ marginLeft: "auto" }}>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar Campo</CommonButton>
                        <GenericModal modalProps={modalProps} idModal="simulateLead" buttonText='Vista previa de formulario'
                            btnProps={{ actionType: "DETAILS", variant: "outlined" }} sx={{ minWidth: "80vw" }} >
                            {campaign &&
                                <SimulateLeadFormModal campaign={campaign} leadFields={sortedFields} onCancel={modalProps.handleClose} />
                            }
                        </GenericModal>
                    </ButtonGroup>
                }
            </Stack>


            {sortedFields.length > 0 ?
                <TableContainer component={Paper}  >
                    <Table aria-label="simple table" size='small' sx={{ backgroundColor: lighten(palette.background.paper, .1) }}>
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
                                        <TableCell align="right">
                                            <Stack direction="row" sx={{ justifyContent: "end" }}>
                                                <ListAction actionType="DETAILS" title="Detalle" tooltipSize="small" size="small"
                                                    onClick={(e) => stopPropagationEvent(e, () => handleSidebar("DETAILS_FIELD", row))} />
                                                {row.order > 1 &&
                                                    <>
                                                        <ListAction actionType="MODIFY" title="Modificar" tooltipSize="small" size="small"
                                                            onClick={(e) => stopPropagationEvent(e, () => handleSidebar("UPDATE_FIELD", row))} />
                                                        <ListAction actionType={row.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                            title={row.active ? "Deshabilitar" : "Habilitar"}
                                                            onClick={(e) => stopPropagationEvent(e, () => handleActive(row))} color={row.active ? "error" : "success"} />
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
                    <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar Campo</CommonButton>
                </Stack>
            }
        </Stack>
    )
}
