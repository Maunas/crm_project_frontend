import { useCallback, useMemo } from "react"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "shared/layout/container/GenericContainer"
import { ControlledSwitch, ControlledTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { TeamDetailed, TeamPost } from "src/types/teams"
import { createTeam, updateTeam } from "./teamServices"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useForm } from "react-hook-form"
import { ButtonGroup, Stack, Typography } from "@mui/material"
import ACTION_ICONS from "src/components/ui/buttons/ActionIcons"

interface TeamFormSidebarProps {
    existingTeam?: TeamDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: TeamDetailed) => void,
    handleSidebar: (mode: string, entity: TeamDetailed | null) => void
}

//Wrapper de TeamForm para funcionar en un Sidebar
export const TeamFormSidebar = ({ existingTeam, handleSidebar, closeSidebar, updateEntityOnList }: TeamFormSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingTeam) handleSidebar("DETAILS_TEAM", existingTeam)
        else closeSidebar()
    }, [existingTeam, closeSidebar, handleSidebar])

    const submit = useCallback((data: TeamPost) => {
        const updateList = (res: TeamDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_TEAM", res)
        }
        if (!existingTeam) {
            return createTeam(data)
                .then(res => {
                    updateList(res)
                    showToast(`El equipo "${res.name}" se ha creado con éxito`)
                })
        } else {
            return updateTeam(data, existingTeam.id)
                .then(res => {
                    updateList(res)
                    showToast(`El equipo "${res.name}" se ha modificado con éxito`)
                })
        }
    }, [existingTeam, handleSidebar, updateEntityOnList])

    return <SidebarContentWrapper title={existingTeam ? `Modificar "${existingTeam.name}"` : "Agregar Equipo"}
        subtitle="Equipos"
        icon={existingTeam ? ACTION_ICONS.MODIFY : ACTION_ICONS.CREATE}>
        <TeamForm existingTeam={existingTeam} submit={submit} onCancel={handleClose} />
    </SidebarContentWrapper>
}

interface TeamFormProps {
    existingTeam?: TeamDetailed,
    submit: (data: TeamPost) => Promise<void>,
    onCancel: () => void
}

export const TeamForm = ({ existingTeam, submit, onCancel }: TeamFormProps) => {

    const defaultValues = useMemo(() => ({
        name: existingTeam?.name ?? "",
        is_visibility_shared: existingTeam?.is_visibility_shared ?? true,
    }), [existingTeam])

    const { control, handleSubmit, formState: { errors }, setError } = useForm<TeamPost>({ defaultValues })

    const onSubmit = (data: TeamPost) => {
        return submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const { loading, fnWithLoading: submitTeamLoad } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitTeamLoad)} style={{ height: "100%" }}>
            <SidebarContentActionsWrapper
                actions={
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" color="error" variant="outlined" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingTeam ? "MODIFY" : "CREATE"} variant="contained"
                            type="submit" loading={loading}>
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                }>
                <Stack spacing={2}>
                    <ControlledTextInput name="name" control={control} label="Nombre"
                        required errorMessage={errors.name?.message} />
                    <Stack spacing={.5}>
                        <ControlledSwitch name="is_visibility_shared" control={control}
                            label="Visibilidad compartida entre los miembros"
                            errorMessage={errors.is_visibility_shared?.message} />
                        <Typography variant="caption" color="textSecondary">
                            Si está activado, todos los miembros ven los leads de todo el equipo.
                            Si está desactivado, cada agente solo ve los leads asignados a él y los que no
                            tienen asignación.
                        </Typography>
                    </Stack>
                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                </Stack>
            </SidebarContentActionsWrapper>
        </form>
    )
}
