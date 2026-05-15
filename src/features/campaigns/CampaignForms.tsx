import { useEffect, useMemo, useState } from "react"
import { RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { ControlledAutocomplete } from "shared/ui/forms/CustomMultipleInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { CampaignDetailed, CampaignPost, Workspace, WorkspaceDetailed } from "src/types/campaigns"
import { createCampaign, updateCampaign } from "./campaignServices"
import { getWorkspace, getWorkspaces } from "../workspaces/workspaceServices"
import { createLeadField } from "../leadFields/leadFieldServices"
import type { LeadFieldPost } from "src/types/leadFields"
import { setFormErrors } from "src/utils/forms"
import { useForm } from "react-hook-form"
import { ButtonGroup, Grid, Stack, Typography } from "@mui/material"

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
    workspace: WorkspaceDetailed,
}
//Wrapper de CampaignForm para crear desde un Sidebar
export const CreateCampaignFormSidebar = ({ handleSidebar, workspace }: CreateCampaignSidebarProps) => {

    const requiredFields: Omit<LeadFieldPost, "campaign_id">[] = [
        {
            "order": 1,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "field_template_code": "FIRST_NAME",
            "title_order": 1
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
    const handleClose = () => handleSidebar("DETAILS_WSP", workspace)

    return <CampaignForm submit={submit} onCancel={handleClose} workspaceId={workspace.id} />
}

interface CampaignProps {
    existingCmp?: CampaignDetailed,
    submit: (data: CampaignPost) => Promise<void>,
    onCancel: () => void
    workspaceId?: number | null,
}

export const CampaignForm = ({ existingCmp, workspaceId, submit, onCancel }: CampaignProps) => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [audiences, setAudiences] = useState<string[] | []>([])

    useEffect(() => {
        setAudiences(["B2C", "B2B"])
    }, [])

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 })
            .then(res => setWorkspaces(res.items))
    }, [])

    const defaultValues = useMemo(() => ({
        name: existingCmp?.name,
        description: existingCmp?.description,
        workspace_id: existingCmp?.workspace_id ?? workspaceId ?? undefined,
        target_audience: existingCmp?.target_audience ?? undefined,
    }), [existingCmp, workspaceId])

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
            <Stack spacing={3}>
                <Typography variant="h2">
                    {!existingCmp ? "Crear Campaña" : `Modificar Campaña ${existingCmp.name}`}
                </Typography>
                <Stack spacing={2}>
                    <Grid container spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                        {!existingCmp &&
                            <Grid size="grow" sx={{ minWidth: "20rem" }}>
                                <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id" options={workspaces}
                                    getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                                    errorMessage={errors?.workspace_id?.message} required />
                            </Grid>
                        }
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <RegisteredTextInput name="name" register={register} label="Nombre"
                                required errorMessage={errors.name?.message} />
                        </Grid>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <RegisteredTextInput name="description" register={register} label="Descripción"
                                errorMessage={errors.description?.message} multiline />
                        </Grid>
                        {!existingCmp &&
                            <Grid size="grow" sx={{ minWidth: "20rem" }}>
                                <ControlledAutocomplete control={control} label="Audiencia Objetivo" name="target_audience" options={audiences}
                                    getOptionLabel={option => option} getOptionKey={option => `${option}`}
                                    errorMessage={errors?.target_audience?.message} />
                            </Grid>
                        }
                    </Grid>
                    {errors?.root &&
                        <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>}
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingCmp ? "MODIFY" : "CREATE"} variant="contained" type="submit">
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                </Stack>
            </Stack>
        </form>
    )
}