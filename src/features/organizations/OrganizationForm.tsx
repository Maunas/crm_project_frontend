import { useForm } from 'react-hook-form'
import { RegisteredTextInput } from '../../components/ui/forms/CustomInputs'
import type { Organization, OrganizationDetailed, OrganizationPost } from '../../types/campaigns'
import { setFormErrors } from "src/utils/forms"
import { createOrganization, updateOrganization } from '../workspaces/workspaceServices'
import { Grid, Typography, ButtonGroup, Stack } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { FormErrorMessage } from '../../components/ui/forms/FormFeedback'
import CommonButton from 'src/components/ui/buttons/CommonButton'

interface OrganizationSidebarProps {
    existingOrg?: Organization,
    closeSidebar: () => void,
    updateEntityOnList: (entity: OrganizationDetailed) => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void
}
//Wrapper de OrganizationForm para funcionar en un Sidebar
export const OrganizationFormSidebar = ({ existingOrg, closeSidebar, handleSidebar, updateEntityOnList }: OrganizationSidebarProps) => {

    const submit = (data: OrganizationPost) => {
        const updateList = (res: OrganizationDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_ORG", res)
        }
        if (!existingOrg) {
            return createOrganization(data)
                .then(updateList)
        } else {
            return updateOrganization(data, existingOrg.id)
                .then(updateList)
        }
    }

    return <OrganizationForm existingOrg={existingOrg} submit={submit} onCancel={closeSidebar} />
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
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Stack spacing={2}>
                <Typography variant="h2">
                    {!existingOrg ? "Crear Organización" : `Modificar Organización: ${existingOrg.name}`}
                </Typography>
                <Grid container spacing={2} sx={{
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
                <ButtonGroup sx={{ marginLeft: "auto" }}>
                    <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel}>
                        Cancelar
                    </CommonButton>
                    <CommonButton actionType={existingOrg ? "MODIFY" : "CREATE"} variant="contained"
                        onClick={handleSubmit(onSubmit)}>
                        Guardar Organización
                    </CommonButton>
                </ButtonGroup>
            </Stack>
        </form>
    )
}