import { useCallback, useEffect, useMemo, useState } from "react"
import { ControlledAutocomplete } from "shared/ui/forms/CustomMultipleInputs"
import { ControlledTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { NomenclatorDetailed, NomenclatorItem, NomenclatorItemDetailed, NomenclatorItemPost } from "src/types/nomenclators"
import { createNomenclatorItem, getNomenclatorItems, updateNomenclatorItem } from "./nomenclatorService"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
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
export const NomenclatorItemFormSidebar = ({ existingNom, nomenclator, handleSidebar, closeSidebar, updateEntityOnList }: NomenclatorSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingNom) handleSidebar("DETAILS_NOM", existingNom)
        else closeSidebar()
    }, [existingNom, closeSidebar, handleSidebar])

    const submit = useCallback((data: NomenclatorItemPost, reset = false) => {
        const updateList = (res: NomenclatorItemDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_NOM", res)
        }
        if (!existingNom) {
            return createNomenclatorItem(data)
                .then(res => {
                    if (reset) updateEntityOnList(res)
                    else updateList(res)
                    showToast(`La opción "${res.value}" se ha creado con éxito`)
                })
        } else {
            return updateNomenclatorItem(data, existingNom.id)
                .then(res => {
                    updateList(res)
                    showToast(`La opción "${res.value}" se ha modificado con éxito`)
                })
        }
    }, [existingNom, handleSidebar, updateEntityOnList])

    return (
        <NomenclatorItemForm existingNom={existingNom} nomenclator={nomenclator} submit={submit}
            onCancel={handleClose} />
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

    const { loading, fnWithLoading: submitItemLoad } = useLoading(submit)

    const onSubmit = (data: NomenclatorItemPost) => {
        return submitItemLoad(data)
            .catch(e => setFormErrors(e, setError))
    }

    const onSubmitReset = (data: NomenclatorItemPost) => {
        return submitItemLoad(data, true)
            .then(() => reset(defaultValues))
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                            <CommonButton actionType="CLOSE" variant="text" color="error" disabled={loading}
                                onClick={onCancel} fullWidth>
                                Cancelar
                            </CommonButton>
                            <CommonButton actionType={existingNom ? "MODIFY" : "CREATE"} loading={loading}
                                variant="contained" type="submit" fullWidth>
                                Guardar
                            </CommonButton>
                        </ButtonGroup>
                        {!existingNom &&
                            <CommonButton actionType="CREATE" variant="contained" loading={loading}
                                onClick={handleSubmit(onSubmitReset)} fullWidth>
                                Guardar y crear otro
                            </CommonButton>}
                    </Stack>
                </Stack>
            </Stack>

        </form>
    )
}

