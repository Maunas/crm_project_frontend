import { TextField, Typography, Button, Grid, FormHelperText } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import type { LeadFieldPost } from "../../types/leadFields"
import { createCampaign, createOrganization, createWorkspace, getOrganizations, getWorkspaces } from "./campaignServices"
import { Link, useNavigate } from "react-router-dom"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { createLeadField } from "../leadFields/leadFieldServices"
import type { CampaignPost, Organization, OrganizationPost, Workspace, WorkspacePost } from "../../types/campaigns"
import { setFormErrors } from "../../generalService"
import { RegisteredTextInput } from "../common/forms/CustomInputs"

export const CampaignForm = () => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [organizations, setOrganizations] = useState<Organization[] | []>([])
    const nav = useNavigate()

    useEffect(() => {
        getWorkspaces({only_active:true}).then(setWorkspaces)
        getOrganizations({only_active:true}).then(setOrganizations)
    }, [])

    const { register, handleSubmit, control, formState:{errors}, setError } = useForm<CampaignPost & { organization_id?: number }>()

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
            .catch((e) => {
                setFormErrors(e,setError)
            })
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
                        <RegisteredTextInput name="name" register={register} label="Nombre"
                        required errorMessage={errors.name?.message} />
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <RegisteredTextInput name="description" register={register} label="Descripción"
                        errorMessage={errors.description?.message} />
                    </Grid>
                </Grid>
                <Grid container spacing={2} size={12}>

                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Organización" name="organization_id"
                            getOptionLabel={(option) => option.name} errorMessage={errors.organization_id?.message}
                            options={organizations} returnField="id" required/>
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id"
                            getOptionLabel={(option) => option.name} errorMessage={errors?.workspace_id?.message}
                            options={filteredWorkspaces} returnField="id" disabled={!selectedOrg} required/>
                    </Grid>
                </Grid>

            </Grid>
            {errors?.root && 
            <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}
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

    const { register, handleSubmit, control, formState:{errors}, setError} = useForm<WorkspacePost>()
    const nav = useNavigate()

    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getOrganizations({only_active: true}).then(setOrganizations)
    }, [])

    const submit = (data: WorkspacePost) => {
        createWorkspace(data).then(() => {
            nav(`/campaigns`)
        }).catch((e) => setFormErrors(e,setError))
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
                    <RegisteredTextInput name="name" register={register} label="Nombre"
                        required errorMessage={errors.name?.message} />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <RegisteredTextInput name="description" register={register} label="Descripción"
                        errorMessage={errors.description?.message} />
                </Grid>

                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledAutocomplete control={control} name="organization_id" label="Organización"
                        getOptionLabel={option => option.name} options={organizations}
                        returnField="id" errorMessage={errors.organization_id?.message} required />
                </Grid>

            </Grid>
            {errors?.root && 
            <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}
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

    const { register, handleSubmit, formState:{errors}, setError } = useForm<WorkspacePost>()
    const nav = useNavigate()

    const submit = (data: OrganizationPost) => {
        createOrganization(data)
            .then(() => nav(`/campaigns`))
            .catch((e) => setFormErrors(e,setError))
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
                    <RegisteredTextInput name="name" register={register} label="Nombre"
                        required errorMessage={errors.name?.message} />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <RegisteredTextInput name="description" register={register} label="Descripción"
                        errorMessage={errors.description?.message} />
                </Grid>

            </Grid>
            {errors?.root && 
            <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}
            <Button component={Link} to="/campaigns">
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Organización
            </Button>
        </form>
    )
}

