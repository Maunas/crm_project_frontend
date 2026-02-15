import { Typography, Button, Grid, FormHelperText } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import type { LeadFieldPost } from "../../types/leadFields"
import { createCampaign, createOrganization, createWorkspace, getOrganizations, getWorkspaces, updateCampaign, updateOrganization, updateWorkspace } from "./campaignServices"
import { useNavigate } from "react-router-dom"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { createLeadField } from "../leadFields/leadFieldServices"
import type { Campaign, CampaignDetailed, CampaignPost, Organization, OrganizationDetailed, OrganizationPost, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import { setFormErrors } from "../../generalService"
import { RegisteredTextInput } from "../common/forms/CustomInputs"

export const CampaignForm = ({ existingCmp, closeSidebar,createEntityOnList}
    : { existingCmp?: Campaign, closeSidebar: () => void, createEntityOnList: (
            entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        ) => void }) => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [organizations, setOrganizations] = useState<Organization[] | []>([])
    const nav = useNavigate()

    useEffect(() => {
        getWorkspaces({ only_active: true })
        .then(res=>setWorkspaces(res.items))
        getOrganizations({ only_active: true })
        .then(res=>setOrganizations(res.items))
    }, [])

    const { register, handleSubmit, control, formState: { errors }, setError }
        = useForm<CampaignPost & { organization_id?: number }>({
            defaultValues: {
                name: existingCmp?.name || null,
                description: existingCmp?.description || null,
                workspace_id: existingCmp?.workspace_id || null,
                organization_id: existingCmp?.organization_id || null,
            }
        })

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
        if (!existingCmp) {
            createCampaign(data)
                .then((res) =>
                    Promise.all(requiredFields.map((field) => createLeadField({ ...field, campaign_id: res.id })))
                        .then(() => {
                            createEntityOnList(res)
                            closeSidebar()
                        })
                        .catch((e) => console.error(e))
                )
                .catch((e) => {
                    setFormErrors(e, setError)
                })
        } else {
            updateCampaign(data, existingCmp.id)
                .then((res) => nav(`/campaigns/${res.id}`))
                .catch((e) => setFormErrors(e, setError))
        }
    }

    return (
        <form>
            <Typography variant="h1" color="initial">
                {!existingCmp ? "Crear Campaña" : `Modificar Campaña ${existingCmp.name}`}
            </Typography>
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
                    <ControlledAutocomplete control={control} label="Organización" name="organization_id"
                        getOptionLabel={(option) => option.name} errorMessage={errors.organization_id?.message}
                        options={organizations} returnField="id" required />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id"
                        getOptionLabel={(option) => option.name} errorMessage={errors?.workspace_id?.message}
                        options={filteredWorkspaces} returnField="id" disabled={!selectedOrg} required />
                </Grid>
            </Grid>
            {errors?.root &&
                <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}
            <Button onClick={closeSidebar}>
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Campaña
            </Button>
        </form>
    )
}

export const WorkspaceForm = ({ existingWksp, closeSidebar, createEntityOnList }
    : {
        existingWksp?: Workspace, closeSidebar: () => void, createEntityOnList: (
            entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        ) => void
    }) => {

    const { register, handleSubmit, control, formState: { errors }, setError } = useForm<WorkspacePost>({
        defaultValues: {
            name: existingWksp?.name || null,
            description: existingWksp?.description || null,
            organization_id: existingWksp?.organization_id || null,
        }
    })
    const nav = useNavigate()

    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getOrganizations({ only_active: true }).then(res => setOrganizations(res.items))
    }, [])

    const submit = (data: WorkspacePost) => {
        if (!existingWksp) {
            createWorkspace(data).then((res) => {
                createEntityOnList(res)
                closeSidebar()
            }).catch((e) => setFormErrors(e, setError))
        } else {
            updateWorkspace(data, existingWksp.id).then(() => {
                nav(`/campaigns`)
            }).catch((e) => setFormErrors(e, setError))
        }
    }

    return (
        <form>
            <Typography variant="h1" color="initial">
                {!existingWksp ? "Crear Espacio de Trabajo"
                    : `Modificar Espacio de Trabajo: ${existingWksp.name}`}
            </Typography>
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
            <Button onClick={closeSidebar}>
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Espacio de Trabajo
            </Button>
        </form>
    )
}

export const OrganizationForm = ({ existingOrg, closeSidebar, createEntityOnList }
    : {
        existingOrg?: Organization, closeSidebar: () => void, createEntityOnList: (
            entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        ) => void
    }) => {

    const { register, handleSubmit, formState: { errors }, setError } = useForm<OrganizationPost>({
        defaultValues: {
            name: existingOrg?.name || undefined,
            description: existingOrg?.description || undefined,
        }
    })

    const submit = (data: OrganizationPost) => {
        if (!existingOrg) {
            createOrganization(data)
                .then((res) => {
                    createEntityOnList(res)
                    closeSidebar()
                })
                .catch((e) => setFormErrors(e, setError))
        } else {
            updateOrganization(data, existingOrg.id)
                .then((res) => {
                    createEntityOnList(res)
                    closeSidebar()
                })
                .catch((e) => setFormErrors(e, setError))
        }
    }

    return (
        <form>
            <Typography variant="h1" color="initial">
                {!existingOrg ? "Crear Organización" : `Modificar Organización: ${existingOrg.name}`}
            </Typography>
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
            <Button onClick={closeSidebar}>
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Organización
            </Button>
        </form>
    )
}

