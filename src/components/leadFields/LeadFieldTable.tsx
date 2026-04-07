import { useEffect } from "react"
import { GenericModal } from "../common/layout/GenericContainer"
import { SimulateLeadFormModal } from "../lead/leadForm/LeadFormWraper"
import { EnabledIcon } from "../common/lists/Badges"
import { CommonButton } from "../common/details/DetailsCommonButton"
import type { LeadFieldDetailed } from "../../types/leadFields"
import type { CampaignDetailed } from "../../types/campaigns"
import { disableLeadField, enableLeadField } from "./leadFieldServices"
import { useModal } from "../hooks/useModal"
import { ButtonGroup, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { lighten, useTheme } from "@mui/material/styles"

interface LeadFieldTableProps {
    campaign: CampaignDetailed,
    leadFields: LeadFieldDetailed[] | null,
    updateLeadFields: () => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

export const LeadFieldTable = ({ campaign, leadFields, updateLeadFields, updateEntity, handleSidebar }: LeadFieldTableProps) => {

    useEffect(() => {
        updateLeadFields()
    }, [campaign, updateLeadFields])

    const handleActive = (field: LeadFieldDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_FIELD", { ...field, active: !field.active })
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

    return (
        <>
            <Grid size="grow" container justifyContent="center" alignItems="center" gap={2}>
                <Grid size="grow" minWidth="16rem" >
                    <Typography variant="h2">Lista de Campos de Lead</Typography>
                </Grid >
                {leadFields && leadFields.length > 0 &&
                    <>
                        <ButtonGroup sx={{ marginLeft: "auto" }}>
                            <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar Campo</CommonButton>
                            <GenericModal modalProps={modalProps} idModal="simulateLead" buttonText='Vista previa de formulario'
                                actionType="DETAILS" variant="outlined" containerSx={{ minWidth: "80vw" }} >
                                {campaign &&
                                    <SimulateLeadFormModal campaign={campaign} leadFields={leadFields} onCancel={modalProps.handleClose} />
                                }
                            </GenericModal>
                        </ButtonGroup>
                    </>
                }
            </Grid>


            {leadFields && leadFields.length > 0 ?
                <TableContainer component={Paper}  >
                    <Table aria-label="simple table" size='small' sx={{ backgroundColor: lighten(palette.background.paper, .1) }}>
                        <TableHead>
                            <TableRow>
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
                            {leadFields?.sort((a, b) => a.order - b.order)
                                .map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th">{row.order}</TableCell>
                                        <TableCell component="th" onClick={() => handleSidebar("DETAILS_FIELD", row)}>
                                            <Stack spacing={1} direction="row">
                                                <EnabledIcon active={row.active} />
                                                <Typography fontWeight="bold">{row.name} </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">{row.field_type.description}</TableCell>
                                        <TableCell align="right">{row.field_subtype?.description ?? "---"}</TableCell>

                                        <TableCell align="right">
                                            <EnabledIcon active={row.required} trueTooltip='Obligatorio' falseTooltip='Opcional' />
                                        </TableCell>
                                        <TableCell align="right">
                                            <EnabledIcon active={row.is_primary} trueTooltip='Único' falseTooltip='Repetible' />
                                        </TableCell>
                                        <TableCell align="right">
                                            <EnabledIcon active={row.is_visible} trueTooltip='Visible' falseTooltip='Oculto' />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" justifyContent="end">
                                                <IconButton size='small' edge="end" onClick={() => handleSidebar("DETAILS_FIELD", row)}>
                                                    <SearchIcon />
                                                </IconButton>
                                                {row.order > 1 &&
                                                    <>
                                                        <IconButton size='small' edge="end" onClick={() => handleSidebar("UPDATE_FIELD", row)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton size='small' edge="end" onClick={() => handleActive(row)}>
                                                            {row.active ?
                                                                <DeleteIcon color="error" /> :
                                                                <RestoreFromTrashIcon color="success" />
                                                            }
                                                        </IconButton>
                                                    </>}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                :
                <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                    <Typography variant="h4">No se han encontrado campos para esta campaña...</Typography>
                    <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar Campo</CommonButton>
                </Grid>
            }
        </>
    )
}
