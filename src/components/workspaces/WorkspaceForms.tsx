import { useEffect, useMemo } from "react"
import { RegisteredTextInput } from "../common/forms/CustomInputs"
import type { Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import { setFormErrors } from "../../generalService"
import { createWorkspace, updateWorkspace } from "./workspaceServices"
import { useForm } from "react-hook-form"
import { Typography, Button, Grid, ButtonGroup } from "@mui/material"
import { FormErrorMessage } from "../../theme/styledMUIFormComponents"

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
            return updateWorkspace(data, existingWsp.id!)
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

    const defaultValues = useMemo(() => ({
        name: existingWsp?.name ?? null,
        description: existingWsp?.description ?? null,
    }), [existingWsp])

    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<WorkspacePost>({ defaultValues })

    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: WorkspacePost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Typography variant="h1">
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
            </Grid>
            {errors?.root &&
                <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
            }
            <ButtonGroup fullWidth>
                <Button variant="outlined" onClick={onCancel} fullWidth>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)} fullWidth>
                    Guardar Espacio de Trabajo
                </Button>
            </ButtonGroup>
        </form>
    )
}

