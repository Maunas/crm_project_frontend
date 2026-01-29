import { TextField, Typography, Button, Grid } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import type { LeadFieldPost } from "../../types/leads"
import { createCampaign, createOrganization, createWorkspace, getOrganizations, getWorkspaces } from "./campaignServices"
import { Link, useNavigate } from "react-router-dom"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { createLeadField } from "../leadFields/leadFieldServices"
import type { CampaignPost, Organization, OrganizationPost, Workspace, WorkspacePost } from "../../types/campaigns"

export const CampaignForm = () => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [organizations, setOrganizations] = useState<Organization[] | []>([])
    const nav = useNavigate()

    useEffect(() => {
        getWorkspaces().then(setWorkspaces)
        getOrganizations().then(setOrganizations)
    }, [])

    const { register, handleSubmit, control } = useForm<CampaignPost & { organization_id?: number }>()

    const selectedOrg = useWatch({
        control,
        name: "organization_id",
    });

    const filteredWorkspaces = useMemo(() => {
        if (!selectedOrg) return []
        return workspaces.filter(workspace => workspace.organization_id === selectedOrg)
    }, [selectedOrg, workspaces])

    const requiredFields: Omit<LeadFieldPost, "campaign_id">[] = [
        {
            "order": 1,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "lead_field_section_id": 1,
            "field_template_code": "FIRST_NAME",
        },
        {
            "order": 2,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "lead_field_section_id": 1,
            "field_template_code": "LAST_NAME",
        }
    ]

    const submit = (data: CampaignPost & { organization_id?: number }) => {
        delete data.organization_id
        createCampaign(data)
            .then((res) =>
                Promise.all(requiredFields.map((field) => createLeadField({ ...field, campaign_id: res.id })))
                    .then(() => nav(`/campaigns/${res.id}`))
                    .catch((e) => console.error(e))
            )
            .catch((e) => console.error(e))
    }

    return (
        <form>
            <Typography variant="h1" color="initial">Crear Campaña</Typography>
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                margin: "1rem"
            }}>
                <Grid container spacing={2} size={12}>
                    <Grid size="grow" minWidth={"20rem"}>
                        <TextField {...register("name")} label="Nombre" fullWidth required />
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <TextField {...register("description")} label="Descripción" fullWidth />
                    </Grid>
                </Grid>
                <Grid container spacing={2} size={12}>

                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Organización" name="organization_id"
                            getOptionLabel={(option) => option.name} getOptionKey={(option) => option.id}
                            optionList={organizations} returnField="id" />
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id"
                            getOptionLabel={(option) => option.name} getOptionKey={(option) => option.id}
                            optionList={filteredWorkspaces} returnField="id" disabled={!selectedOrg} />
                    </Grid>
                </Grid>

            </Grid>
            <Button component={Link} to="/campaigns">
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Campaña
            </Button>
        </form>
    )
}

export const WorkspaceForm = () => {

    const { register, handleSubmit, control } = useForm<WorkspacePost>()
    const nav = useNavigate()

    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getOrganizations().then(setOrganizations)
    }, [])

    const submit = (data: WorkspacePost) => {
        createWorkspace(data).then(() => {
            nav(`/campaigns`)
        }).catch((e) => console.error(e))
    }

    return (
        <form>
            <Typography variant="h1" color="initial">Crear Espacio de Trabajo</Typography>
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                margin: "1rem"
            }}>
                <Grid size="grow" minWidth={"20rem"}>
                    <TextField {...register("name")} required label="Nombre" fullWidth />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <TextField {...register("description")} label="Descripción" fullWidth />
                </Grid>

                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledAutocomplete control={control} name="organization_id" label="Organización"
                        getOptionKey={option => option.id} getOptionLabel={option => option.name} optionList={organizations}
                        returnField="id" />
                </Grid>

            </Grid>
            <Button component={Link} to="/campaigns">
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Espacio de Trabajo
            </Button>
        </form>
    )
}

export const OrganizationForm = () => {

    const { register, handleSubmit } = useForm<WorkspacePost>()
    const nav = useNavigate()

    const submit = (data: OrganizationPost) => {
        createOrganization(data)
            .then(() => nav(`/campaigns`))
            .catch((e) => console.error(e))
    }

    return (
        <form>
            <Typography variant="h1" color="initial">Crear Organización</Typography>
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                margin: "1rem"
            }}>
                <Grid size="grow" minWidth={"20rem"}>
                    <TextField {...register("name")} label="Nombre" required fullWidth />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <TextField {...register("description")} label="Descripción" fullWidth />
                </Grid>

            </Grid>
            <Button component={Link} to="/campaigns">
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Organización
            </Button>
        </form>
    )
}

