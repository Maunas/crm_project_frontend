import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"
import { CustomChip } from "../common/details/StyledDisplayComponents"
import type { NomenclatorDetailed } from "../../types/nomenclators"
import { ButtonGroup, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import dayjs from "dayjs"

interface NomenclatorDetailsProps {
    entity: NomenclatorDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void,
    handleActive: (entity: NomenclatorDetailed) => void
}

export const NomenclatorDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (entity) return (
        <Stack gap={3} >
            <Grid container gap={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2">{entity.name}</Typography>
                {entity.active ? <CustomChip sx={{ marginLeft: "auto" }} color='success' label="Habilitado" /> :
                    <CustomChip sx={{ marginLeft: "auto" }} color='error' label="Deshabilitado" />}
            </Grid>
            <Stack gap={2}>
                <Stack gap={1}>
                    {!entity.organization_id && <Typography variant="body1" fontStyle="italic" >(Nomenclador del Sistema)</Typography>}
                    {entity.campaign_id
                        ? <Stack gap={1} direction="row">
                            <Typography>Perteneciente a la</Typography>
                            <Link component={RouterLink} to={`/campaigns/${entity.campaign_id}`}>
                                Campaña {entity.campaign_id}
                            </Link>
                        </Stack>
                        : <Typography variant="body1" >Nomenclador Global</Typography>
                    }
                    {entity.parent_nomenclator_id &&
                        <Stack gap={1} direction="row">
                            <Typography>Depende del nomenclador</Typography>
                            <Link component={RouterLink} to={`/nomenclators/${entity.parent_nomenclator_id}`}>{entity.parent_nomenclator_id}</Link>
                        </Stack>
                    }
                </Stack>
                <Divider />
                <CommonButton actionType="LIST" variant="contained" component={RouterLink} to={`/nomenclators/${entity.id}`} >Ver Items de Nomenclador</CommonButton>
                <Divider />
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
