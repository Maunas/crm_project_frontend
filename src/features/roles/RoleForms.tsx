import { useCallback, useEffect, useMemo } from "react"
import { RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { Role, RoleDetailed, RolePost } from "src/types/roles"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { setFormErrors } from "src/utils/forms"
import { useForm } from "react-hook-form"
import { useUserContext } from "src/stores/UserContext"
import { ButtonGroup, Stack } from "@mui/material"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "src/components/layout/container/GenericSidebar"
import ACTION_ICONS from "shared/ui/icons/ActionIcons"
import { createRole, updateRole } from "src/services/roleService"

interface RoleSidebarProps {
    existingRole?: RoleDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: RoleDetailed) => void,
    handleSidebar: (mode: string, entity: RoleDetailed | null) => void
}

//Wrapper de RoleForm para funcionar en un Sidebar
export const RoleFormSidebar = ({ existingRole, closeSidebar, handleSidebar, updateEntityOnList }: RoleSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingRole) handleSidebar("DETAILS_ROLE", existingRole)
        else closeSidebar()
    }, [existingRole, closeSidebar, handleSidebar])

    const submit = useCallback((data: RolePost) => {
        const updateList = (res: RoleDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_ROLE", res)
        }
        if (!existingRole) {
            return createRole(data)
                .then(res => {
                    updateList(res)
                    showToast(`El rol "${res.name}" fue creado con éxito`)
                })
                .catch(e => showCommonErrorToast(e))
        } else {
            return updateRole(data, existingRole.id!)
                .then(res => {
                    updateList(res)
                    showToast(`El rol "${res.name}" fue modificado con éxito`)
                })
                .catch(e => showCommonErrorToast(e))
        }
    }, [existingRole, handleSidebar, updateEntityOnList])

    return <SidebarContentWrapper title={`${existingRole ? "Modificar" : "Nuevo"} Rol`}
        subtitle="Roles"
        icon={ACTION_ICONS[existingRole ? "MODIFY" : "CREATE"]}>
        <RoleForm existingRole={existingRole} submit={submit} onCancel={handleClose} />
    </SidebarContentWrapper>
}

interface RoleProps {
    existingRole?: Role | RoleDetailed,
    submit: (data: RolePost) => Promise<void>,
    onCancel: () => void
}

export const RoleForm = ({ existingRole, submit, onCancel }: RoleProps) => {

    const { activeOrg } = useUserContext()

    const defaultValues = useMemo(() => ({
        name: existingRole?.name ?? undefined,
        code: existingRole?.code ?? undefined,
        organization_id: existingRole?.organization_id ?? activeOrg!.id,
    }), [existingRole, activeOrg])

    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<RolePost>({ defaultValues })

    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: RolePost) => {
        return submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const { loading, fnWithLoading: submitLoad } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitLoad)} style={{ height: "100%" }}>
            <SidebarContentActionsWrapper
                actions={
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" variant="outlined" color="error"
                            onClick={onCancel} disabled={loading}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingRole ? "MODIFY" : "CREATE"}
                            variant="contained" type="submit" loading={loading}>
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                }>
                <Stack spacing={2}>
                    <input type="hidden" {...register("organization_id")} />
                    <RegisteredTextInput name="name" register={register} label="Nombre"
                        required errorMessage={errors.name?.message} />
                    <RegisteredTextInput name="code" register={register} label="Código"
                        required errorMessage={errors.code?.message} />
                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                </Stack>
            </SidebarContentActionsWrapper>
        </form>
    )
}
