import { Button, ButtonGroup, Chip, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import dayjs from "dayjs"
import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"
import type { NomenclatorDetailed } from "../../types/nomenclators"

interface NomenclatorDetailsProps {
    entity: NomenclatorDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void,
    handleActive: (entity: NomenclatorDetailed) => void
}

export const NomenclatorDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (entity) return (
        <Stack spacing={2} >
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.name}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            {entity.campaign_id
                ? <Link component={RouterLink} to={`/campaigns/${entity.campaign_id}`}>Perteneciente a la Campaña {entity.campaign_id}</Link>
                : <Typography variant="body1" >Nomenclador Global.</Typography>
            }
            {entity.parent_nomenclator_id &&
                <Link component={RouterLink} to={`/nomenclators/${entity.parent_nomenclator_id}`}>Depende del nomenclador {entity.parent_nomenclator_id}</Link>
            }
            <Divider />
            <Button variant="contained" component={RouterLink} to={`/nomenclators/${entity.id}`} >Ver Items de Nomenclador</Button>
            <Divider />
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
