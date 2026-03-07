import { ButtonGroup, Chip, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import type { NomenclatorItemDetailed } from "../../types/leadFields"
import { Link as RouterLink } from "react-router-dom"
import dayjs from "dayjs"
import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"

interface NomenclatorDetailsProps {
    entity: NomenclatorItemDetailed | null,
    parentEntity?: NomenclatorItemDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void,
    handleActive: (entity: NomenclatorItemDetailed) => void
}

export const NomenclatorItemDetails = ({ entity, parentEntity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (entity) return (
        <Stack spacing={2} >
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.code} - {entity.value}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            <Divider />
            {parentEntity &&
            <>
                <Stack direction="row" spacing={1}>
                <Typography variant="body1" color="initial">Depende del Item de Nomenclador</Typography>
                <Link component={RouterLink} to={`/nomenclators/${parentEntity?.nomenclator_id}`}>{parentEntity?.code} - {parentEntity?.value}</Link>
            </Stack>
            <Divider />
            </>}
            <Grid container spacing={2} >
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

            <ButtonGroup fullWidth>
                <CommonButton handleClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                <DisableButton active={entity.active} handleActive={() => handleActive(entity)} />
                <CommonButton handleClick={() => handleSidebar("UPDATE_NOM", entity)} actionType="MODIFY" >Modificar</CommonButton>
            </ButtonGroup>
        </Stack>
    )
}
