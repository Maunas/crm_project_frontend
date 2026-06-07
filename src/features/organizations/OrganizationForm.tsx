import { useCallback, useEffect, useMemo } from 'react'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { RegisteredTextInput } from 'shared/ui/forms/CustomInputs'
import { FormErrorMessage } from 'shared/ui/forms/FormFeedback'
import { useLoading } from 'src/hooks/useLoading'
import type { Organization, OrganizationDetailed, OrganizationPost } from 'src/types/campaigns'
import { createOrganization, updateOrganization } from './organizationServices'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { setFormErrors } from "src/utils/forms"
import { useForm } from 'react-hook-form'
import { Grid, Typography, ButtonGroup, Stack } from '@mui/material'

interface OrganizationSidebarProps {
    existingOrg?: OrganizationDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: OrganizationDetailed) => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void
}
//Wrapper de OrganizationForm para funcionar en un Sidebar
export const OrganizationFormSidebar = ({ existingOrg, closeSidebar, handleSidebar, updateEntityOnList }: OrganizationSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingOrg) handleSidebar("DETAILS_ORG", existingOrg)
        else closeSidebar()
    }, [existingOrg, closeSidebar, handleSidebar])

    const submit = useCallback((data: OrganizationPost) => {
        const updateList = (res: OrganizationDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_ORG", res)
        }
        if (!existingOrg) {
            return createOrganization(data)
                .then(res => {
                    updateList(res)
                    showToast(`La organización "${res.name}" fue creada con éxito`)
                })
                .catch(e => showCommonErrorToast(e))
        } else {
            return updateOrganization(data, existingOrg.id)
                .then(res => {
                    updateList(res)
                    showToast(`La organización "${res.name}" fue modificada con éxito`)
                })
                .catch(e => showCommonErrorToast(e))
        }
    }, [existingOrg, handleSidebar, updateEntityOnList])
    return <OrganizationForm existingOrg={existingOrg} submit={submit} onCancel={handleClose} />
}

interface OrganizationProps {
    existingOrg?: Organization | OrganizationDetailed,
    submit: (data: OrganizationPost) => Promise<void>,
    onCancel: () => void
}

const OrganizationForm = ({ existingOrg, submit, onCancel }: OrganizationProps) => {

    const defaultValues = useMemo(() => ({
        name: existingOrg?.name ?? null,
        description: existingOrg?.description ?? null,
    }), [existingOrg])

    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<OrganizationPost>({ defaultValues })

    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: OrganizationPost) => {
        return submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const { loading, fnWithLoading: submitLoad } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitLoad)}>
            <Stack spacing={3}>
                <Typography variant="h2">
                    {!existingOrg ? "Crear Organización" : `Modificar Organización: ${existingOrg.name}`}
                </Typography>
                <Stack spacing={2} sx={{ alignItems: "start" }}>
                    <Grid container spacing={1} sx={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
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
                        <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>}
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" variant="text" color="error"
                            onClick={onCancel} disabled={loading}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingOrg ? "MODIFY" : "CREATE"}
                            variant="contained" type="submit" loading={loading}>
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                </Stack>
            </Stack>
        </form>
    )
}