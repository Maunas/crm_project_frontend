import { ButtonGroup, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { EnabledIcon } from "../common/lists/Badges"
import { CommonButton } from "../common/details/DetailsCommonButton"
import { GenericModal } from "../common/layout/GenericContainer"
import { SimulateLead } from "../lead/LeadForm"
import { useEffect } from "react"
import type { Paginable } from "../../types/common"
import type { LeadFieldDetailed } from "../../types/leadFields"
import { useListPagination } from "../hooks/useListPagination"
import { disableLeadField, enableLeadField } from "./leadFieldServices"
import { PaginationComponent } from "../common/lists/PaginationComponent"
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import type { CampaignDetailed } from "../../types/campaigns"

interface LeadFieldTableProps {
    campaign: CampaignDetailed,
    leadFields: Paginable<LeadFieldDetailed> | null,
    updateLeadFields: (page: number, pageSize: number) => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

export const LeadFieldTable = ({ campaign, leadFields, updateLeadFields, updateEntity, handleSidebar }: LeadFieldTableProps) => {

    const { page, pageSize, goToPageOne, pageComponentProps } = useListPagination(leadFields?.total_pages ?? 0,10)

    useEffect(() => {
        updateLeadFields(page, pageSize)
    }, [page, pageSize, updateLeadFields])

    const handleActive = (field: LeadFieldDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_FIELD", { ...field, active: !field.active })
        }
        if (field.active) {
            disableLeadField(field.id)
                .then(res => {
                    if (res.action === "disabled") updateActive()
                    else {
                        goToPageOne()
                        updateLeadFields(1, pageSize) //Se hace manualmente. Si la página ya era la 1, no actua useEffect.
                    }
                })
        }
        else enableLeadField(field.id).then(updateActive)
    }

    if (leadFields) return (
        <>
            <Grid size="grow" container justifyContent="center" alignItems="center" gap={2}>

                <Grid size="grow" minWidth="16rem" >
                    <Typography variant="h2">Lista de Campos de Lead</Typography>
                </Grid >

                <Grid size="grow" minWidth="22rem" >
                    <ButtonGroup fullWidth>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar Campo</CommonButton>
                        <GenericModal buttonText='Vista previa de formulario' actionType="DETAILS" variant="outlined" containerSx={{ minWidth: "80vw" }} >
                            {campaign && leadFields?.items && leadFields?.items?.length > 0 &&
                                <SimulateLead campaignId={campaign.id} leadFields={leadFields.items} />
                            }
                        </GenericModal>
                    </ButtonGroup>
                </Grid >
            </Grid>


            <TableContainer component={Paper} >
                <Table aria-label="simple table" size='small'>
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
                        {leadFields?.items?.length > 0 &&
                            leadFields?.items?.sort((a, b) => a.order - b.order)
                                .map((row, idx) => (
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
                                        <TableCell align="right">{row.field_type_code}</TableCell>
                                        <TableCell align="right">{row.field_subtype_code ?? "Sin subtipo"}</TableCell>

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
                                                {row.order > 2 &&
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
            <PaginationComponent {...pageComponentProps} />
        </>
    )
}
