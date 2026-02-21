import { useEffect, useState } from "react"
import { RegisteredTextInput } from "../common/forms/CustomInputs"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import type { Organization, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import { setFormErrors } from "../../generalService"
import { createWorkspace, getOrganizations, updateWorkspace } from "./workspaceServices"
import { useForm } from "react-hook-form"
import { Typography, Button, Grid, FormHelperText } from "@mui/material"

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

