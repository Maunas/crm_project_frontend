import { useCallback, useEffect, useMemo, useState } from "react"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "shared/layout/container/GenericContainer"
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
import { Grid, ButtonGroup, Stack } from "@mui/material"
import ACTION_ICONS from "src/components/ui/buttons/ActionIcons"

interface NomenclatorSidebarProps {
    existingNom?: NomenclatorItemDetailed,
    nomenclator: NomenclatorDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (entity: NomenclatorItemDetailed) => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void
}

//Wrapper de NomenclatorItemForm para funcionar en un Sidebar
export const NomenclatorItemFormSidebar = ({ existingNom, nomenclator, closeSidebar, updateEntityOnList }: NomenclatorSidebarProps) => {

    const submit = useCallback((data: NomenclatorItemPost, reset = false) => {
        const updateList = (res: NomenclatorItemDetailed) => {
            updateEntityOnList(res)
            closeSidebar()
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
    }, [existingNom, closeSidebar, updateEntityOnList])

    return (
        <SidebarContentWrapper title={existingNom ? `Modificar "${existingNom.value}"` : "Agregar Opción"}
            subtitle={nomenclator?.name}
            icon={existingNom ? ACTION_ICONS.MODIFY : ACTION_ICONS.CREATE}>
            <NomenclatorItemForm existingNom={existingNom} nomenclator={nomenclator} submit={submit}
                onCancel={closeSidebar} />
        </SidebarContentWrapper>
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
        parent_item_ids: existingNom?.parent_items?.map(parent => parent.id) ?? [],
    }), [existingNom, nomenclator])

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<NomenclatorItemPost>({ defaultValues })

    const [nomenclatorItems, setNomenclatorItems] = useState<NomenclatorItem[]>([])

    //Los ítems padre válidos son los de cualquiera de los nomencladores declarados como padre del catálogo (M2M)
    const parentNomenclatorIds = useMemo(() => nomenclator?.parent_nomenclators?.map(parent => parent.id) ?? [], [nomenclator])

    useEffect(() => {
        if (parentNomenclatorIds.length === 0) return setNomenclatorItems([])
        Promise.all(parentNomenclatorIds.map(nomId =>
            getNomenclatorItems({ detailed: false, only_active: true, page_size: 0, nomenclator_id: nomId })
        )).then(results => {
            const merged = new Map<number, NomenclatorItem>()
            results.forEach(res => res.items.forEach(item => merged.set(item.id, item)))
            setNomenclatorItems(Array.from(merged.values()))
        })
    }, [parentNomenclatorIds])

    //No puede ser padre de si mismo
    const parentItemOptions = useMemo(() => nomenclatorItems.filter(item => item.id !== existingNom?.id), [nomenclatorItems, existingNom?.id])

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
        <form onSubmit={handleSubmit(onSubmit)} style={{ height: "100%" }}>
            <SidebarContentActionsWrapper
                actions={
                    <ButtonGroup sx={{ ml: "auto" }} >
                        <CommonButton actionType="CLOSE" variant="outlined" color="error" disabled={loading}
                            onClick={onCancel}>
                            Cancelar
                        </CommonButton>
                        {!existingNom &&
                            <CommonButton actionType="CREATE" variant="outlined" loading={loading}
                                onClick={handleSubmit(onSubmitReset)}>
                                Guardar y crear otro
                            </CommonButton>}
                        <CommonButton actionType={existingNom ? "MODIFY" : "CREATE"} loading={loading}
                            variant="contained" type="submit">
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                }>
                <Stack spacing={2}>
                    <Grid container spacing={1} sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <ControlledTextInput name="value" control={control} label="Valor"
                                required errorMessage={errors.value?.message} />
                        </Grid>
                        {parentNomenclatorIds.length > 0 &&
                            <Grid size="grow" sx={{ minWidth: "20rem" }}>
                                <ControlledAutocomplete control={control} multiple label="Ítems de los que depende" name="parent_item_ids" options={parentItemOptions}
                                    getOptionLabel={option => `${option.value!}`} getOptionKey={option => `${option.id}`} returnField="id"
                                    errorMessage={errors?.parent_item_ids?.message} />
                            </Grid>
                        }
                    </Grid>
                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                </Stack>
            </SidebarContentActionsWrapper>
        </form >
    )
}

