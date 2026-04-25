import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"
import type { NomenclatorDetailed } from "../../types/nomenclators"
import { ButtonGroup, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import dayjs from "dayjs"
import { TitleAndActive } from "../common/layout/MinorComponents"

interface NomenclatorDetailsProps {
    entity: NomenclatorDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void,
    handleActive: (entity: NomenclatorDetailed) => void
}

export const NomenclatorDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (entity) return (
        <Stack spacing={3} >
            <TitleAndActive active={entity.active}>
                <Typography variant="h2">{entity.name}</Typography>
            </TitleAndActive>
            <Stack spacing={2}>
                <Stack spacing={1}>
                    {!entity.organization_id && <Typography variant="body1" sx={{ fontStyle: "italic" }} >(Nomenclador del Sistema)</Typography>}
                    {entity.campaign_id
                        ? <Stack spacing={1} direction="row">
                            <Typography>Perteneciente a la</Typography>
                            <Link component={RouterLink} to={`/campaigns/${entity.campaign_id}`}>
                                Campaña {entity.campaign_id}
                            </Link>
                        </Stack>
                        : <Typography variant="body1" >Nomenclador Global</Typography>
                    }
                    {entity.parent_nomenclator_id &&
                        <Stack spacing={1} direction="row">
                            <Typography>Depende del nomenclador</Typography>
                            <Link component={RouterLink} to={`/nomenclators/${entity.parent_nomenclator_id}`}>{entity.parent_nomenclator_id}</Link>
                        </Stack>
                    }
                </Stack>
                <Divider />
                <CommonButton actionType="LIST" variant="contained" component={RouterLink} to={`/nomenclators/${entity.id}`} >Ver Items de Nomenclador</CommonButton>
                <Divider />
                <Grid container spacing={1} >
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fecha de creación:</Typography>
                        <Typography variant="body1" sx={{ textTransform: "capitalize", pl: "auto" }}>
                            {dayjs(entity?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fecha de última modificación:</Typography>
                        <Typography variant="body1" sx={{ textTransform: "capitalize", pl: "auto" }}>
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
