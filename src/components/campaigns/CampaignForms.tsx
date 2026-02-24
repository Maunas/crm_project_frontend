import { useEffect, useMemo, useState } from "react"
import { RegisteredTextInput } from "../common/forms/CustomInputs"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import type { Campaign, CampaignDetailed, CampaignPost, Organization, Workspace, WorkspaceDetailed } from "../../types/campaigns"
import type { LeadFieldPost } from "../../types/leadFields"
import { setFormErrors } from "../../generalService"
import { getOrganizations, getWorkspace, getWorkspaces } from "../workspaces/workspaceServices"
import { createCampaign, updateCampaign } from "./campaignServices"
import { createLeadField } from "../leadFields/leadFieldServices"
import { useForm, useWatch } from "react-hook-form"
import { Button, ButtonGroup, FormHelperText, Grid, Typography } from "@mui/material"


interface UpdateCampaignSidebarProps {
    existingCmp: CampaignDetailed,
    updateEntityOnList?: (
        entity: CampaignDetailed,
    ) => void,
    closeSidebar: () => void,
}
//Wrapper de CampaignForm para modificar desde un Sidebar
export const UpdateCampaignFormSidebar = ({ existingCmp, closeSidebar, updateEntityOnList }: UpdateCampaignSidebarProps) => {
    const submit = (data: CampaignPost) => {
        return updateCampaign(data, existingCmp.id)
            .then(res => {
                if (!updateEntityOnList) return
                updateEntityOnList(res)
                closeSidebar()
            })
    }
    return <CampaignForm existingCmp={existingCmp} submit={submit} onCancel={closeSidebar} />
}

interface CreateCampaignSidebarProps {
    updateEntityOnList?: (entity: CampaignDetailed) => void,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: CampaignDetailed | WorkspaceDetailed | null) => void
}
//Wrapper de CampaignForm para crear desde un Sidebar
export const CreateCampaignFormSidebar = ({ closeSidebar, handleSidebar }: CreateCampaignSidebarProps) => {

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

    const submit = (data: CampaignPost) => {
        return createCampaign(data)
            .then(res => {
                //Busca el workspace y muestra su detalle.
                getWorkspace(res.workspace_id)
                    .then(wsp => handleSidebar("DETAILS_WSP", wsp))
                //Crea los dos campos obligatorios. Luego actualiza la lista.
                //Si falla, igualmente actualiza la lista, ya que está creada la campaña.
                Promise.all(requiredFields.map(field => createLeadField({ ...field, campaign_id: res.id })))
                    .catch(e => {
                        console.error(e)
                    })
            })
    }

    return <CampaignForm submit={submit} onCancel={closeSidebar} />
}
interface CampaignProps {
    existingCmp?: Campaign | CampaignDetailed,
    submit: (data: CampaignPost) => Promise<void>,
    onCancel: () => void
}
export const CampaignForm = ({ existingCmp, submit, onCancel }: CampaignProps) => {

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

    const onSubmit = (data: CampaignPost & { organization_id?: number }) => {
        delete data.organization_id
        submit(data)
            .catch(e => setFormErrors(e, setError))
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
                        getOptionLabel={option => option.name} errorMessage={errors.organization_id?.message}
                        options={organizations} returnField="id" required hidden={!!existingCmp} />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id"
                        getOptionLabel={option => option.name} errorMessage={errors?.workspace_id?.message}
                        options={filteredWorkspaces} returnField="id" disabled={!selectedOrg} required hidden={!!existingCmp} />
                </Grid>
            </Grid>
            {errors?.root &&
                <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}

            <ButtonGroup fullWidth>
                <Button variant="outlined" onClick={onCancel} fullWidth>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)} fullWidth>
                    Guardar Campaña
                </Button>
            </ButtonGroup>
        </form>
    )
}