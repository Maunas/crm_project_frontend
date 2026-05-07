import { CampaignList } from "../campaigns/CampaignList"
import type { CampaignDetailed, WorkspaceDetailed } from "../../types/campaigns"
import dayjs from "dayjs"
import { Stack, Typography, ButtonGroup, Divider, Grid } from "@mui/material"
import TitleAndActive from "src/components/ui/details/TitleAndActive"
import CommonButton from "src/components/ui/buttons/CommonButton"
import HandleActiveButton from "src/components/ui/buttons/HandleActiveButton"

interface WorkspaceDetailsProps {
    entity: WorkspaceDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}

export const WorkspaceDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: WorkspaceDetailsProps) => {

    if (entity) return (
        <Stack spacing={3} >
            <TitleAndActive active={entity.active}>
                <Typography variant="h2">{entity.name}</Typography>
            </TitleAndActive>
            <Stack spacing={2} >
                {entity.description ? <Typography variant="body1">{entity.description}</Typography>
                    : <Typography variant="body1" sx={{ fontStyle: "italic" }}>No tiene descripción.</Typography>
                }
                <Divider />
                {entity.campaigns &&
                    <CampaignList selectedWorkspaceId={entity.id} handleSidebar={handleSidebar} />
                }
                <Divider />
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
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    <HandleActiveButton active={entity.active} handleActive={() => handleActive(entity)} />
                    <CommonButton onClick={() => handleSidebar("UPDATE_WSP", entity)} actionType="MODIFY" >Modificar</CommonButton>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}
