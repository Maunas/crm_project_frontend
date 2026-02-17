import { useForm } from 'react-hook-form'
import { RegisteredTextInput } from '../common/forms/CustomInputs'
import type { Organization, OrganizationDetailed, OrganizationPost } from '../../types/campaigns'
import { setFormErrors } from '../../generalService'
import { createOrganization, updateOrganization } from '../campaigns/campaignServices'
import { Button, FormHelperText, Grid, Typography } from '@mui/material'


interface OrganizationSidebarProps {
    existingOrg?: Organization,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: OrganizationDetailed,
    ) => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void
}
export const OrganizationFormSidebar = ({ existingOrg, closeSidebar, handleSidebar, updateEntityOnList }
    : OrganizationSidebarProps) => {

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

    return (
        <OrganizationForm existingOrg={existingOrg} submit={submit} onCancel={closeSidebar} />
    )
}


interface OrganizationProps {
    existingOrg?: Organization | OrganizationDetailed,
    submit: (data: OrganizationPost) => Promise<void>,
    onCancel: () => void
}

const OrganizationForm = ({ existingOrg, submit, onCancel }: OrganizationProps) => {

    const { register, handleSubmit, formState: { errors }, setError } = useForm<OrganizationPost>({
        defaultValues: {
            name: existingOrg?.name,
            description: existingOrg?.description,
        }
    })

    const onSubmit = (data: OrganizationPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Typography variant="h1" color="initial">
                {!existingOrg ? "Crear Organización" : `Modificar Organización: ${existingOrg.name}`}
            </Typography>
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                margin: "1rem 1rem 2rem 1rem"
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
                <FormHelperText color="error">{errors?.root?.message}</FormHelperText>}
            <Button onClick={onCancel}>
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                Guardar Organización
            </Button>
        </form>
    )
}