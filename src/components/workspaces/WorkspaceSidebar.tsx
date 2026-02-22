import type { CampaignDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { WorkspaceFormSidebar } from "./WorkspaceForms"
import { CampaignFormSidebar } from "../campaigns/CampaignForms"
import dayjs from "dayjs"
import { Stack, Typography, ButtonGroup, Button, Divider, Grid, Chip } from "@mui/material"
import { CampaignList } from "../campaigns/CampaignList"

interface SidebarProps {
    mode: string | null,
    entity: WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: WorkspaceDetailed | CampaignDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}
export const WorkspaceSidebar = ({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    switch (mode) {
        case "CREATE_WSP":
            return <WorkspaceFormSidebar closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "CREATE_CMP":
            return <CampaignFormSidebar closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} />
        case "UPDATE_WSP":
            return <WorkspaceFormSidebar existingWsp={entity as WorkspaceDetailed} closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "DETAILS_WSP":
            return <WorkspaceDetails entity={entity as WorkspaceDetailed} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }

}
interface WorkspaceDetailsProps {
    entity: WorkspaceDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}

const WorkspaceDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: WorkspaceDetailsProps) => {

    if (entity) return (
        <Stack spacing={2} >
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.name}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            {entity.description ? <Typography variant="body1" color="initial">{entity.description}</Typography>
                : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
            }
            <Divider />
            {entity.campaigns &&
                <>
                    <Typography variant="h3" color="initial">Lista de Campañas</Typography>
                    <CampaignList selectedWorkspaceId={entity.id} handleSidebar={handleSidebar} />
                </>
            }
            <Divider />
            <Grid container spacing={2} >
                <Grid size="grow" minWidth="18rem">
                    <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                    <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                        {dayjs( entity?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                    </Typography>
                </Grid>
                <Grid size="grow" minWidth="18rem">
                    <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>

                    <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                        {dayjs( entity?.updated_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                    </Typography>
                </Grid>
            </Grid>
            <Divider />

            <ButtonGroup variant="contained" >
                <Button onClick={closeSidebar} variant="outlined" fullWidth>Cerrar</Button>
                <Button color="secondary" fullWidth onClick={() => handleActive(entity)}>
                    {
                        entity.active ? "Deshabilitar" : "Habilitar"
                    }
                </Button>
                <Button onClick={() => handleSidebar("UPDATE_WSP", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
        </Stack>
    )
}
