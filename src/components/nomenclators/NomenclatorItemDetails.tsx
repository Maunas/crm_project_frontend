import { ButtonGroup, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import dayjs from "dayjs"
import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"
import type { NomenclatorItemDetailed } from "../../types/nomenclators"
import { CustomChip } from "../../theme/styledMUIDisplayComponents"

interface NomenclatorDetailsProps {
    entity: NomenclatorItemDetailed | null,
    parentEntity?: NomenclatorItemDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void,
    handleActive: (entity: NomenclatorItemDetailed) => void
}

export const NomenclatorItemDetails = ({ entity, parentEntity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (entity) return (
        <Stack gap={3} >
            <Grid container gap={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2">{entity.value}</Typography>
                {entity.active ? <CustomChip sx={{ marginLeft: "auto" }} color='success' label="Habilitado" /> :
                    <CustomChip sx={{ marginLeft: "auto" }} color='error' label="Deshabilitado" />}
            </Grid>
            <Stack gap={2} >
                {!entity.organization_id && <Typography variant="body1" fontStyle="italic" >(Nomenclador del Sistema)</Typography>}
                <Divider />
                {parentEntity &&
                    <>
                        <Stack direction="row" gap={1}>
                            <Typography variant="body1">Depende del Item de Nomenclador</Typography>
                            <Link component={RouterLink} to={`/nomenclators/${parentEntity?.nomenclator_id}`}>{parentEntity?.value}</Link>
                        </Stack>
                        <Divider />
                    </>}
                <Grid container gap={1} >
                    <Grid size="grow" minWidth="18rem">
                        <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                        <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                            {dayjs(entity?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                    <Grid size="grow" minWidth="18rem">
                        <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>
                        <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                            {dayjs(entity?.updated_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <ButtonGroup sx={{ marginLeft: "auto" }}>
                    <CommonButton handleClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {entity.organization_id &&
                        <DisableButton active={entity.active} handleActive={() => handleActive(entity)} />
                    }
                    {entity.organization_id &&
                        <CommonButton handleClick={() => handleSidebar("UPDATE_NOM", entity)} actionType="MODIFY" >Modificar</CommonButton>
                    }
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}
