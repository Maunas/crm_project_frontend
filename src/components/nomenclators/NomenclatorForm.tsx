import { useEffect, useMemo, useState } from "react"
import { ControlledTextInput } from "../common/forms/CustomInputs"
import { setFormErrors } from "../../generalService"
import { useForm } from "react-hook-form"
import { Typography, Button, Grid, ButtonGroup, Stack } from "@mui/material"
import { FormErrorMessage } from "../common/forms/StyledFormComponents"
import { createNomenclator, getNomenclators, updateNomenclator } from "./nomenclatorService"
import type { Nomenclator, NomenclatorDetailed, NomenclatorPost } from "../../types/nomenclators"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"

interface NomenclatorSidebarProps {
    existingNom?: NomenclatorDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: NomenclatorDetailed) => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void
}

//Wrapper de NomenclatorForm para funcionar en un Sidebar
export const NomenclatorFormSidebar = ({ existingNom, closeSidebar, handleSidebar, updateEntityOnList }: NomenclatorSidebarProps) => {

    const submit = (data: NomenclatorPost) => {
        const updateList = (res: NomenclatorDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_NOM", res)
        }
        if (!existingNom) {
            return createNomenclator(data)
                .then(updateList)
        } else {
            return updateNomenclator(data, existingNom.id)
                .then(updateList)
        }
    }

    return <NomenclatorForm existingNom={existingNom} submit={submit} onCancel={closeSidebar} />
}

interface NomenclatorProps {
    existingNom?: NomenclatorDetailed,
    submit: (data: NomenclatorPost) => Promise<void>,
    onCancel: () => void
}

export const NomenclatorForm = ({ existingNom, submit, onCancel }: NomenclatorProps) => {

    const defaultValues = useMemo(() => ({
        name: existingNom?.name ?? null,
        parent_nomenclator_id: existingNom?.parent_nomenclator?.id ?? null,
    }), [existingNom])

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<NomenclatorPost>({ defaultValues })

    const [nomenclators, setNomenclators] = useState<Nomenclator[]>([])

    useEffect(() => {
        getNomenclators({ detailed: false, only_active: true, page_size: 0 }).then(res => setNomenclators(res.items))
    }, [])

    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: NomenclatorPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Stack spacing={2}>
                <Typography variant="h2">
                    {!existingNom ? "Crear Nomenclador"
                        : `Modificar Nomenclador: ${existingNom.name}`}
                </Typography>
                <Grid container spacing={1} sx={{
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Grid size="grow" sx={{ minWidth: "20rem" }}>
                        <ControlledTextInput name="name" control={control} label="Nombre"
                            required errorMessage={errors.name?.message} />
                    </Grid>
                    {!existingNom &&
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <ControlledAutocomplete control={control}
                                options={nomenclators} label="Nomenclador Padre" name="parent_nomenclator_id"
                                getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                                errorMessage={errors?.parent_nomenclator_id?.message} />
                        </Grid>
                    }
                </Grid>
                {errors?.root &&
                    <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                }
                <ButtonGroup>
                    <Button variant="outlined" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                        Guardar Nomenclador
                    </Button>
                </ButtonGroup>
            </Stack>
        </form>
    )
}

