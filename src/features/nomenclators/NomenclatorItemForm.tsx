import { useEffect, useMemo, useState } from "react"
import { ControlledTextInput } from "../../components/ui/forms/CustomInputs"
import { ControlledAutocomplete } from "src/components/ui/forms/CustomMultipleInputs"
import CommonButton from "src/components/ui/buttons/CommonButton"
import { FormErrorMessage } from "src/components/ui/forms/FormFeedback"
import { createNomenclatorItem, getNomenclatorItems, updateNomenclatorItem } from "./nomenclatorService"
import type { NomenclatorDetailed, NomenclatorItem, NomenclatorItemDetailed, NomenclatorItemPost } from "src/types/nomenclators"
import { setFormErrors } from "src/utils/forms"
import { useForm } from "react-hook-form"
import { Typography, Grid, ButtonGroup, Stack } from "@mui/material"

interface NomenclatorSidebarProps {
    existingNom?: NomenclatorItemDetailed,
    nomenclator: NomenclatorDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (entity: NomenclatorItemDetailed) => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void
}

//Wrapper de NomenclatorItemForm para funcionar en un Sidebar
export const NomenclatorItemFormSidebar = ({ existingNom, nomenclator, closeSidebar, handleSidebar, updateEntityOnList }: NomenclatorSidebarProps) => {

    const submit = (data: NomenclatorItemPost, reset = false) => {
        const updateList = (res: NomenclatorItemDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_NOM", res)
        }
        if (!existingNom) {
            return createNomenclatorItem(data)
                .then(res => reset ? updateEntityOnList(res) : updateList(res))
        } else {
            return updateNomenclatorItem(data, existingNom.id)
                .then(updateList)
        }
    }

    return (
        <NomenclatorItemForm existingNom={existingNom} nomenclator={nomenclator} submit={submit} onCancel={closeSidebar} />
    )
}

interface NomenclatorProps {
    existingNom?: NomenclatorItemDetailed,
    nomenclator: NomenclatorDetailed | null,
    submit: (data: NomenclatorItemPost, reset?: boolean) => Promise<void>,
    onCancel: () => void
}

export const NomenclatorItemForm = ({ existingNom, nomenclator, submit, onCancel }: NomenclatorProps) => {

    const defaultValues = useMemo(() => ({
        value: existingNom?.value ?? null,
        nomenclator_id: existingNom?.nomenclator_id ?? nomenclator?.id ?? null,
        parent_item_id: existingNom?.parent_item?.id ?? null,
    }), [existingNom, nomenclator])

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<NomenclatorItemPost>({ defaultValues })

    const [nomenclatorItems, setNomenclatorItems] = useState<NomenclatorItem[]>([])

    useEffect(() => {
        if (!nomenclator?.parent_nomenclator?.id) return
        getNomenclatorItems({ detailed: false, only_active: true, page_size: 0, nomenclator_id: nomenclator.parent_nomenclator.id }).then(res => setNomenclatorItems(res.items))
    }, [existingNom, nomenclator])

    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: NomenclatorItemPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const onSubmitReset = (data: NomenclatorItemPost) => {
        submit(data, true)
            .then(() => reset(defaultValues))
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Stack spacing={3}>
                <Typography variant="h2">
                    {!existingNom ? "Crear Opciones de Nomenclador"
                        : `Modificar Opción: ${existingNom.value}`}
                </Typography>
                <Stack spacing={2}>
                    <Grid container spacing={1} sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <ControlledTextInput name="value" control={control} label="Valor"
                                required errorMessage={errors.value?.message} />
                        </Grid>
                        {nomenclator?.parent_nomenclator?.id && !existingNom &&
                            <Grid size="grow" sx={{ minWidth: "20rem" }}>
                                <ControlledAutocomplete control={control} label="Item del que depende" name="parent_item_id" options={nomenclatorItems}
                                    getOptionLabel={option => `${option.value!}`} getOptionKey={option => `${option.id}`} returnField="id"
                                    errorMessage={errors?.parent_item_id?.message} />
                            </Grid>
                        }
                    </Grid>
                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                    <Stack spacing={.5}>
                        <ButtonGroup sx={{ marginLeft: "auto" }} fullWidth >
                            <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel} fullWidth>
                                Cancelar
                            </CommonButton>
                            <CommonButton actionType={existingNom ? "MODIFY" : "CREATE"} variant="contained"
                                onClick={handleSubmit(onSubmit)} fullWidth>
                                Guardar Opción
                            </CommonButton>
                        </ButtonGroup>
                        {!existingNom &&
                            <CommonButton actionType="CREATE" variant="contained" onClick={handleSubmit(onSubmitReset)} fullWidth>
                                Guardar y crear otro
                            </CommonButton>}
                    </Stack>
                </Stack>
            </Stack>

        </form>
    )
}

