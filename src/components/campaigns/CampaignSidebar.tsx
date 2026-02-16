import { Stack, Typography, ButtonGroup, Button, Divider, Grid, Chip, Breadcrumbs, Link } from "@mui/material"
import type { CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { CampaignForm, OrganizationForm, WorkspaceForm } from "./CampaignForms"
import { disableOrganization, enableOrganization, getWorkspace } from "./campaignServices"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

interface SidebarProps {
    mode: string | null,
    entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    createEntityOnList: (
        entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void
}
export const CampaignSidebar = ({ mode, entity, closeSidebar, createEntityOnList, handleSidebar }: SidebarProps) => {

    switch (mode) {
        case "CREATE_ORG":
            return <OrganizationForm closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "CREATE_WSP":
            return <WorkspaceForm closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "CREATE_CMP":
            return <CampaignForm closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_ORG":
            return <OrganizationForm existingOrg={entity as OrganizationDetailed} closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_WSP":
            return <WorkspaceForm existingWksp={entity as WorkspaceDetailed} closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_CMP":
            return <CampaignForm existingCmp={entity as CampaignDetailed} closeSidebar={closeSidebar}
                createEntityOnList={(entity) => createEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "DETAILS_ORG":
            return <OrganizationDetails entity={entity} closeSidebar={closeSidebar}
                updateActive={(entity) => createEntityOnList(entity, "UPDATE_ORG")}
                handleSidebar={handleSidebar} />
        case "DETAILS_WSP":
            return <WorkspaceDetails entity={entity} closeSidebar={closeSidebar}
                updateActive={(entity) => createEntityOnList(entity, "UPDATE_WSP")}
                handleSidebar={handleSidebar} />
        case "DETAILS_CMP":
            return <CampaignDetails entity={entity} closeSidebar={closeSidebar}
                updateActive={(entity) => createEntityOnList(entity, "UPDATE_CMP")}
                handleSidebar={handleSidebar} />
    }

}
interface DetailsProps {
    entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void,
    updateActive: (
        entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    ) => void
}
const OrganizationDetails = ({ entity, closeSidebar, handleSidebar, updateActive }: DetailsProps) => {

    const handleActive = () => {
        if (!entity) return
        if (entity.active) {
            disableOrganization(entity.id).then(res => {
                console.log(res)
                updateActive({ ...entity, active: false })
                handleSidebar("DETAILS_ORG", { ...entity, active: false })
            })
        } else {
            enableOrganization(entity.id).then(res => {
                console.log(res)
                updateActive({ ...entity, active: true })
                handleSidebar("DETAILS_ORG", { ...entity, active: true })
            })
        }
    }

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
                <Button onClick={handleActive} color="secondary" fullWidth>
                    {
                        entity.active ? "Deshabilitar" : "Habilitar"
                    }
                </Button>
                <Button onClick={() => handleSidebar("UPDATE_ORG", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
        </Stack>
    )
}

const WorkspaceDetails = ({ entity, closeSidebar, handleSidebar, updateActive }: DetailsProps) => {

    const handleActive = () => {
        if (!entity) return
        if (entity.active) {
            disableOrganization(entity.id).then(res => {
                console.log(res)
                updateActive({ ...entity, active: false })
                handleSidebar("KEEP", { ...entity, active: false })
            })
        } else {
            enableOrganization(entity.id).then(res => {
                console.log(res)
                updateActive({ ...entity, active: true })
                handleSidebar("KEEP", { ...entity, active: true })
            })
        }
    }

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
                <Button color="secondary" fullWidth onClick={handleActive}>
                    {
                        entity.active ? "Deshabilitar" : "Habilitar"
                    }
                </Button>
                <Button onClick={() => handleSidebar("UPDATE_WSP", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
        </Stack>
    )
}

const CampaignDetails = ({ entity, closeSidebar, handleSidebar }: DetailsProps) => {

    const [wsp, setWsp] = useState<WorkspaceDetailed | null>(null)

    useEffect(() => {
        const cmp = entity as CampaignDetailed
        getWorkspace(cmp.workspace_id)
            .then(setWsp)
    }, [entity])

    const handleActive = () => {
        if (!entity) return
        if (entity.active) {
            disableOrganization(entity.id).then(() => {
                handleSidebar("KEEP", { ...entity, active: false })
            })
        } else {
            enableOrganization(entity.id).then(() => {
                handleSidebar("KEEP", { ...entity, active: true })
            })
        }
    }

    const nav = useNavigate()
    if (entity) return (
        <Stack spacing={2} >
            <Breadcrumbs aria-label="breadcrumb">
                {wsp &&
                    <Link underline="hover" color="inherit" sx={{cursor:"pointer"}}
                    onClick={() => handleSidebar("DETAILS_WSP", wsp)}>
                        {wsp?.name}
                    </Link>}
                <Typography sx={{ color: 'text.primary' }}>{entity.name}</Typography>
            </Breadcrumbs>
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.name}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            {entity.description ? <Typography variant="body1" color="initial">{entity.description}</Typography>
                : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
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

            <ButtonGroup variant="contained" fullWidth >
                <Button onClick={closeSidebar} variant="outlined" fullWidth>Cerrar</Button>
                <Button color="secondary" fullWidth onClick={handleActive}>
                    {
                        entity.active ? "Deshabilitar" : "Habilitar"
                    }
                </Button>
                <Button onClick={() => handleSidebar("UPDATE_CMP", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
            <Button variant="contained" onClick={() => nav(`/campaigns/${entity.id}`)} fullWidth>Ver Campos de Formulario</Button>

        </Stack>
    )
}