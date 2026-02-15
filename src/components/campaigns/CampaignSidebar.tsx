import { Stack, Typography, ButtonGroup, Button, Divider, Grid, Chip } from "@mui/material"
import type { CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { CampaignForm, OrganizationForm, WorkspaceForm } from "./CampaignForms"

interface SidebarProps {
    mode: string | null,
    entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    createEntityOnList: (
        entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        mode: string | null,
    ) => void,
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void
}
export const CampaignSidebar = ({ mode, entity, closeSidebar, createEntityOnList, handleSidebar }: SidebarProps) => {

    switch (mode) {
        case "CREATE_ORG":
            return <OrganizationForm closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)} />
        case "CREATE_WSP":
            return <WorkspaceForm closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)} />
        case "CREATE_CMP":
            return <CampaignForm closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)} />
        case "UPDATE_ORG":
            return <OrganizationForm existingOrg={entity} closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)} />
        case "UPDATE_WSP":
            return <WorkspaceForm existingOrg={entity} closeSidebar={closeSidebar} />
        case "UPDATE_CMP":
            return <CampaignForm existingOrg={entity} closeSidebar={closeSidebar} />
        case "DETAILS_ORG":
            return <OrganizationDetails entity={entity} closeSidebar={closeSidebar} handleSidebar={handleSidebar} />
        case "DETAILS_WSP":
            return <WorkspaceForm entity={entity} closeSidebar={closeSidebar} />
        case "DETAILS_CMP":
            return <CampaignForm entity={entity} closeSidebar={closeSidebar} />
    }

}
interface DetailsProps {
    entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void
}
const OrganizationDetails = ({ entity, closeSidebar, handleSidebar }: DetailsProps) => {
    if(entity) return (
        <Stack spacing={2} >
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.name}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            {entity.description ? <Typography variant="body1" color="initial">{entity.description}</Typography>
            : <Typography variant="body1" fontStyle="italic"> "No tiene descripción."</Typography>
}
            <Divider />
                <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                <Typography variant="body1" paddingInlineStart={2}>
                    {entity?.created_at}
                </Typography>
            <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>
                <Typography variant="body1" paddingInlineStart={2}>
                    {entity?.updated_at}
                </Typography>
            <Divider />

            <ButtonGroup variant="contained" >
                <Button onClick={closeSidebar} variant="outlined" fullWidth>Cerrar</Button>
                <Button onClick={() => handleSidebar("UPDATE_ORG", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
        </Stack>
    )
}
