import { useEffect, useMemo } from "react"
import { RegisteredTextInput } from "src/components/ui/forms/CustomInputs"
import { FormErrorMessage } from "src/components/ui/forms/FormFeedback"
import CommonButton from "src/components/ui/buttons/CommonButton"
import { createWorkspace, updateWorkspace } from "./workspaceServices"
import type { Workspace, WorkspaceDetailed, WorkspacePost } from "src/types/campaigns"
import { setFormErrors } from "src/utils/forms"
import { useForm } from "react-hook-form"
import { Typography, Grid, ButtonGroup, Stack } from "@mui/material"

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

    return <WorkspaceForm existingWsp={existingWsp} submit={submit} onCancel={closeSidebar} />
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                <Typography variant="h1">
                    {!existingWsp ? "Crear Espacio de Trabajo"
                        : `Modificar Espacio de Trabajo: ${existingWsp.name}`}
                </Typography>
                <Stack spacing={2}>
                    <Grid container spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <RegisteredTextInput name="name" register={register} label="Nombre"
                                required errorMessage={errors.name?.message} />
                        </Grid>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <RegisteredTextInput name="description" register={register} label="Descripción"
                                errorMessage={errors.description?.message} />
                        </Grid>
                    </Grid>
                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingWsp ? "MODIFY" : "CREATE"} variant="contained" type="submit">
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                </Stack>
            </Stack>
        </form>
    )
}

