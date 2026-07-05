import { useCallback, useEffect, useMemo } from "react"
import { RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import { createWorkspace, updateWorkspace } from "./workspaceServices"
import type { Workspace, WorkspaceDetailed, WorkspacePost } from "src/types/campaigns"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { setFormErrors } from "src/utils/forms"
import { useForm } from "react-hook-form"
import { Typography, Grid, ButtonGroup, Stack } from "@mui/material"

interface WorkspaceSidebarProps {
    existingWsp?: WorkspaceDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: WorkspaceDetailed) => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | null) => void
}

//Wrapper de WorkspaceForm para funcionar en un Sidebar
export const WorkspaceFormSidebar = ({ existingWsp, closeSidebar, handleSidebar, updateEntityOnList }: WorkspaceSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingWsp) handleSidebar("DETAILS_WSP", existingWsp)
        else closeSidebar()
    }, [existingWsp, closeSidebar, handleSidebar])

    const submit = useCallback((data: WorkspacePost) => {
        const updateList = (res: WorkspaceDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_WSP", res)
        }
        if (!existingWsp) {
            return createWorkspace(data)
                .then(res => {
                    updateList(res)
                    showToast(`El espacio de trabajo "${res.name}" fue creado con éxito`)
                })
                .catch(e => showCommonErrorToast(e))
        } else {
            return updateWorkspace(data, existingWsp.id!)
                .then(res => {
                    updateList(res)
                    showToast(`El espacio de trabajo "${res.name}" fue modificado con éxito`)
                })
                .catch(e => showCommonErrorToast(e))
        }
    }, [existingWsp, handleSidebar, updateEntityOnList])

    return <WorkspaceForm existingWsp={existingWsp} submit={submit} onCancel={handleClose} />
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
        return submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const { loading, fnWithLoading: submitLoad } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitLoad)}>
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
                        <CommonButton actionType="CLOSE" variant="text" color="error"
                            onClick={onCancel} disabled={loading}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingWsp ? "MODIFY" : "CREATE"}
                            variant="contained" type="submit" loading={loading}>
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                </Stack>
            </Stack>
        </form>
    )
}

