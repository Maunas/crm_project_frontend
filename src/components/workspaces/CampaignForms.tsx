import { Typography, Button, Grid, FormHelperText } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import type { LeadFieldPost } from "../../types/leadFields"
import { createCampaign, createWorkspace, getOrganizations, getWorkspaces, updateCampaign, updateWorkspace } from "./campaignServices"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { createLeadField } from "../leadFields/leadFieldServices"
import type { Campaign, CampaignDetailed, CampaignPost, Organization, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import { setFormErrors } from "../../generalService"
import { RegisteredTextInput } from "../common/forms/CustomInputs"

export const CampaignForm = ({ existingCmp, closeSidebar, updateEntityOnList, handleSidebar }
    : {
        existingCmp?: Campaign, closeSidebar: () => void,
        updateEntityOnList: (
            entity: WorkspaceDetailed | CampaignDetailed | null,
        ) => void,
        handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void
    }) => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 })
            .then(res => setWorkspaces(res.items))
        getOrganizations({ only_active: true, page_size: 0 })
            .then(res => setOrganizations(res.items))
    }, [])

    const { register, handleSubmit, control, formState: { errors }, setError }
        = useForm<CampaignPost & { organization_id?: number }>({
            defaultValues: {
                name: existingCmp?.name,
                description: existingCmp?.description,
                workspace_id: existingCmp?.workspace_id,
                organization_id: existingCmp?.organization_id,
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
                            updateEntityOnList(res)
                            handleSidebar("DETAILS_CMP", res)
                        })
                        .catch((e) => console.error(e))
                )
                .catch((e) => {
                    setFormErrors(e, setError)
                })
        } else {
            updateCampaign(data, existingCmp.id)
                .then((res) => {
                    updateEntityOnList(res)
                    handleSidebar("DETAILS_CMP", res)
                })
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
                        options={organizations} returnField="id" required disabled={!!existingCmp} />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id"
                        getOptionLabel={(option) => option.name} errorMessage={errors?.workspace_id?.message}
                        options={filteredWorkspaces} returnField="id" disabled={!selectedOrg} required disabled={!!existingCmp} />
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

interface WorkspaceSidebarProps {
    existingWsp?: Workspace,
    closeSidebar: () => void,
    updateEntityOnList: (entity: WorkspaceDetailed) => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | null) => void
}

//Wrapper de WorkspaceForm para funcionar en un Sidebar
export const WorkspaceFormSidebar = ({ existingWsp, closeSidebar, handleSidebar, updateEntityOnList }: WorkspaceSidebarProps) => {

    const submit = (data: WorkspacePost) => {
        const updateList = (res: WorkspaceDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_WSP", res)
        }
        if (!existingWsp) {
            return createWorkspace(data)
                .then(updateList)
        } else {
            return updateWorkspace(data, existingWsp.id)
                .then(updateList)
        }
    }

    return (
        <WorkspaceForm existingWsp={existingWsp} submit={submit} onCancel={closeSidebar} />
    )
}

interface WorkspaceProps {
    existingWsp?: Workspace | WorkspaceDetailed,
    submit: (data: WorkspacePost) => Promise<void>,
    onCancel: () => void
}

export const WorkspaceForm = ({ existingWsp, submit, onCancel }: WorkspaceProps) => {

    const { register, handleSubmit, control, formState: { errors }, setError } = useForm<WorkspacePost>({
        defaultValues: {
            name: existingWsp?.name,
            description: existingWsp?.description,
            organization_id: existingWsp?.organization_id,
        }
    })

    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getOrganizations({ only_active: true, page_size: 0 }).then(res => setOrganizations(res.items))
    }, [])

    const onSubmit = (data: WorkspacePost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Typography variant="h1" color="initial">
                {!existingWsp ? "Crear Espacio de Trabajo"
                    : `Modificar Espacio de Trabajo: ${existingWsp.name}`}
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
                        getOptionLabel={option => option.name} options={organizations} hidden={!!existingWsp}
                        returnField="id" errorMessage={errors.organization_id?.message} required />
                </Grid>

            </Grid>
            {errors?.root &&
                <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}
            <Button onClick={onCancel}>
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(onSubmit)} sx={{ marginBlock: "1rem" }}>
                Guardar Espacio de Trabajo
            </Button>
        </form>
    )
}

