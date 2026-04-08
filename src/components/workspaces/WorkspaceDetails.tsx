import { CampaignList } from "../campaigns/CampaignList"
import { CommonButton, DisableButton } from "../common/details/DetailsCommonButton"
import { CustomChip } from "../common/details/StyledDisplayComponents"
import type { CampaignDetailed, WorkspaceDetailed } from "../../types/campaigns"
import dayjs from "dayjs"
import { Stack, Typography, ButtonGroup, Divider, Grid } from "@mui/material"

interface WorkspaceDetailsProps {
    entity: WorkspaceDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}

export const WorkspaceDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: WorkspaceDetailsProps) => {

    if (entity) return (
        <Stack gap={3} >
            <Grid container gap={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2">{entity.name}</Typography>
                {entity.active ? <CustomChip sx={{ marginLeft: "auto" }} color='success' label="Habilitado" /> :
                    <CustomChip sx={{ marginLeft: "auto" }} color='error' label="Deshabilitado" />}
            </Grid>
            <Stack gap={2} >
                {entity.description ? <Typography variant="body1">{entity.description}</Typography>
                    : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
                }
                <Divider />
                {entity.campaigns &&
                    <CampaignList selectedWorkspaceId={entity.id} handleSidebar={handleSidebar} />
                }
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
                    <DisableButton active={entity.active} handleActive={() => handleActive(entity)} />
                    <CommonButton handleClick={() => handleSidebar("UPDATE_WSP", entity)} actionType="MODIFY" >Modificar</CommonButton>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}
