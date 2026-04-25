import { ButtonGroup, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import dayjs from "dayjs"
import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"
import type { NomenclatorItemDetailed } from "../../types/nomenclators"
import { TitleAndActive } from "../common/layout/MinorComponents"

interface NomenclatorDetailsProps {
    entity: NomenclatorItemDetailed | null,
    parentEntity?: NomenclatorItemDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void,
    handleActive: (entity: NomenclatorItemDetailed) => void
}

export const NomenclatorItemDetails = ({ entity, parentEntity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (entity) return (
        <Stack spacing={3} >
            <TitleAndActive active={entity.active}>
                <Typography variant="h2">{entity.value}</Typography>
            </TitleAndActive>
            <Stack spacing={2} >
                {!entity.organization_id && <Typography variant="body1" sx={{ fontStyle: "italic" }} >(Nomenclador del Sistema)</Typography>}
                <Divider />
                {parentEntity &&
                    <>
                        <Stack direction="row" spacing={1}>
                            <Typography variant="body1">Depende del Item de Nomenclador</Typography>
                            <Link component={RouterLink} to={`/nomenclators/${parentEntity?.nomenclator_id}`}>{parentEntity?.value}</Link>
                        </Stack>
                        <Divider />
                    </>}
                <Grid container spacing={1} >
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fecha de creación:</Typography>
                        <Typography variant="body1" sx={{ textTransform: "capitalize", pl: 2 }}>
                            {dayjs(entity?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fecha de última modificación:</Typography>
                        <Typography variant="body1" sx={{ textTransform: "capitalize", pl: 2 }}>
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
