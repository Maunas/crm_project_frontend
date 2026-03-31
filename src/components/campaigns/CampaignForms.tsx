import { useEffect, useMemo, useState } from "react"
import { RegisteredTextInput } from "../common/forms/CustomInputs"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { FormErrorMessage } from "../../styledComponents/styledMUIFormComponents"
import type { CampaignDetailed, CampaignPost, Workspace, WorkspaceDetailed } from "../../types/campaigns"
import type { LeadFieldPost } from "../../types/leadFields"
import { setFormErrors } from "../../generalService"
import { getWorkspace, getWorkspaces } from "../workspaces/workspaceServices"
import { createCampaign, updateCampaign } from "./campaignServices"
import { createLeadField } from "../leadFields/leadFieldServices"
import { useForm } from "react-hook-form"
import { Button, ButtonGroup, Grid, Stack, Typography } from "@mui/material"

interface UpdateCampaignSidebarProps {
    existingCmp: CampaignDetailed,
    updateEntityOnList: (entity: CampaignDetailed) => void,
    closeSidebar: () => void,
}
//Wrapper de CampaignForm para modificar desde un Sidebar
export const UpdateCampaignFormSidebar = ({ existingCmp, updateEntityOnList, closeSidebar }: UpdateCampaignSidebarProps) => {

    const submit = (data: CampaignPost) => {
        return updateCampaign(data, existingCmp.id)
            .then(res => {
                updateEntityOnList(res)
                closeSidebar()
            })
    }
    return <CampaignForm existingCmp={existingCmp} submit={submit} onCancel={closeSidebar} />
}

interface CreateCampaignSidebarProps {
    handleSidebar: (mode: string, entity: CampaignDetailed | WorkspaceDetailed | null) => void
    closeSidebar: () => void,
}
//Wrapper de CampaignForm para crear desde un Sidebar
export const CreateCampaignFormSidebar = ({ handleSidebar, closeSidebar }: CreateCampaignSidebarProps) => {

    const requiredFields: Omit<LeadFieldPost, "campaign_id">[] = [
        {
            "order": 1,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "lead_field_section_id": 1,
            "field_template_code": "FIRST_NAME",
        },
    ]

    const submit = (data: CampaignPost) => {
        return createCampaign(data)
            .then(res => {
                //Busca el workspace y muestra su detalle.
                getWorkspace(res.workspace_id)
                    .then(wsp => handleSidebar("DETAILS_WSP", wsp))
                //Crea los campo requeridos.
                Promise.all(requiredFields.map(field => createLeadField({ ...field, campaign_id: res.id })))
                    .catch(e => { console.error(e) })
            })
    }

    return <CampaignForm submit={submit} onCancel={closeSidebar} />
}

interface CampaignProps {
    existingCmp?: CampaignDetailed,
    submit: (data: CampaignPost) => Promise<void>,
    onCancel: () => void
}

export const CampaignForm = ({ existingCmp, submit, onCancel }: CampaignProps) => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 })
            .then(res => setWorkspaces(res.items))
    }, [])

    const defaultValues = useMemo(() => ({
        name: existingCmp?.name,
        description: existingCmp?.description,
        workspace_id: existingCmp?.workspace_id,
    }), [existingCmp])

    const { register, handleSubmit, reset, control, formState: { errors }, setError }
        = useForm<CampaignPost>({ defaultValues })

    //Reinicia los defaultValues si se cambia la campaña que se está creando/modificando.
    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: CampaignPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing="1.5rem">
                <Typography variant="h2">
                    {!existingCmp ? "Crear Campaña" : `Modificar Campaña ${existingCmp.name}`}
                </Typography>
                <Stack direction="column" spacing="1rem">
                    <Grid container spacing=".5rem" sx={{
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Grid size="grow" minWidth={"20rem"}>
                            <RegisteredTextInput name="name" register={register} label="Nombre"
                                required errorMessage={errors.name?.message} />
                        </Grid>
                        <Grid size="grow" minWidth={"20rem"}>
                            <RegisteredTextInput name="description" register={register} label="Descripción"
                                errorMessage={errors.description?.message} multiline />
                        </Grid>
                        {!existingCmp &&
                            <Grid size="grow" minWidth={"20rem"}>
                                <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id" options={workspaces}
                                    getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                                    errorMessage={errors?.workspace_id?.message} required />
                            </Grid>
                        }
                    </Grid>
                    {errors?.root &&
                        <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>}
                    <ButtonGroup fullWidth>
                        <Button variant="outlined" onClick={onCancel} fullWidth>
                            Cancelar
                        </Button>
                        <Button variant="contained" type="submit" fullWidth>
                            Guardar Campaña
                        </Button>
                    </ButtonGroup>
                </Stack>
            </Stack>
        </form>
    )
}