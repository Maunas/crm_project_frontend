import { useCallback, useEffect, useMemo, useState } from "react"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "shared/layout/container/GenericSidebar"
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
import { ButtonGroup, Stack, ListItem } from "@mui/material"
import ACTION_ICONS from "shared/ui/icons/ActionIcons"

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

import { CommonIconButton } from "src/components/ui/buttons/CommonIconButton"
import { EnabledIcon } from "src/components/ui/lists/Icons"

interface NomenclatorItemFormInlineProps {
    item: NomenclatorItemDetailed,
    nom: NomenclatorDetailed,
    updateEntityOnList: (entity: NomenclatorItemDetailed) => void,
    onCancel: () => void
}

export const NomenclatorItemFormInline = ({ item, nom, updateEntityOnList, onCancel }: NomenclatorItemFormInlineProps) => {

    const submit = useCallback((data: NomenclatorItemPost) => {
        const updateList = (res: NomenclatorItemDetailed) => {
            updateEntityOnList(res)
            onCancel()
        }
        return updateNomenclatorItem(data, item.id)
            .then(res => {
                updateList(res)
                showToast(`La opción "${res.value}" se ha modificado con éxito`)
            })
    }, [item, onCancel, updateEntityOnList])

    return (
        <ListItem secondaryAction={
            <Stack direction="row" sx={{ alignItems: "center", width: "100%", mr: -1 }}>
                <CommonIconButton actionType='CLOSE' size='small' title='Cancelar' color="error" onClick={onCancel} />
                <CommonIconButton actionType='SAVE' size='small' title="Guardar" type="submit" form="nom_item_form" />
            </Stack>
        }>
            <Stack spacing={.5} direction="row" sx={{ alignItems: "center", width: "100%", mr: 3 }}>
                <EnabledIcon active={nom.active} size="small" />
                <NomenclatorItemForm existingNom={item} nomenclator={nom} inline size="small" onCancel={onCancel} submit={submit} />
            </Stack>
        </ListItem>
    )
}


interface NomenclatorProps {
    existingNom?: NomenclatorItemDetailed,
    nomenclator: NomenclatorDetailed | null,
    submit: (data: NomenclatorItemPost, reset?: boolean) => Promise<void>,
    onCancel: () => void
    inline?: boolean
    size?: "small" | "medium"
}

export const NomenclatorItemForm = ({ existingNom, nomenclator, submit, onCancel, inline = false, size = "medium" }: NomenclatorProps) => {

    const defaultValues = useMemo(() => ({
        value: existingNom?.value ?? null,
        // nomenclator_id es siempre el catálogo abierto (nomenclator.id, su public_uuid) --
        // existingNom.nomenclator_id es la FK embebida sin migrar (id interno viejo, ver
        // backend/AGENTS.md §18) y ya no sirve acá directo.
        nomenclator_id: nomenclator?.id ?? null,
        parent_item_ids: existingNom?.parent_items?.map(parent => parent.id) ?? [],
    }), [existingNom, nomenclator])

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<NomenclatorItemPost>({ defaultValues })

    const [nomenclatorItems, setNomenclatorItems] = useState<NomenclatorItem[]>([])

    //Los ítems padre válidos son los de cualquiera de los nomencladores declarados como padre del catálogo (M2M)
    const parentNomenclatorIds = useMemo(() => nomenclator?.parent_nomenclators?.map(parent => parent.id) ?? [], [nomenclator])

    //Nombre del nomenclador padre por id, para poder diferenciar ítems homónimos de distintos catálogos padre en el selector
    const parentNomenclatorNameById = useMemo(() =>
        new Map(nomenclator?.parent_nomenclators?.map(parent => [parent.id, parent.name]) ?? []),
        [nomenclator]
    )
    // ^ mapa indexado por public_uuid de Nomenclator (Nomenclator.id). Por eso, más abajo, el
    // lookup usa option.nomenclator?.id (objeto anidado, uuid real -- Fase 4, ver
    // backend/AGENTS.md §18) y NO option.nomenclator_id (FK embebida, id interno viejo, que
    // nunca matcheaba contra este mapa y siempre caía al fallback "Otro").

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parentNomenclatorIds.length === 0) return setNomenclatorItems([])
        Promise.all(parentNomenclatorIds.map(nomId =>
            getNomenclatorItems({ detailed: false, only_active: true, page_size: 0, nomenclator_id: nomId })
        )).then(results => {
            const merged = new Map<string, NomenclatorItem>()
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
        <SidebarContentActionsWrapper unstyled={inline} actions={
            !inline &&
            <ButtonGroup sx={{ ml: "auto" }} size="small" >
                <CommonButton actionType="CLOSE" variant="outlined" color="error" disabled={loading}
                    onClick={onCancel}>
                    Cancelar
                </CommonButton>
                {!existingNom &&
                    <CommonButton actionType="REPEAT" variant="outlined" loading={loading}
                        onClick={handleSubmit(onSubmitReset)}>
                        Guardar y crear otro
                    </CommonButton>}
                <CommonButton actionType={existingNom ? "MODIFY" : "CREATE"} loading={loading}
                    variant="contained" type="submit">
                    Guardar
                </CommonButton>
            </ButtonGroup>
        }>
            <form onSubmit={handleSubmit(onSubmit)} id="nom_item_form" style={{ height: "100%", width: "100%" }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <ControlledTextInput name="value" control={control} label="Valor" size={size}
                            required errorMessage={errors.value?.message} autoFocus />
                        {parentNomenclatorIds.length > 0 &&
                            <ControlledAutocomplete control={control} multiple label="Ítems de los que depende" name="parent_item_ids" options={parentItemOptions}
                                getOptionLabel={option => parentNomenclatorIds.length > 1
                                    ? `${option.value!} (${parentNomenclatorNameById.get(option.nomenclator?.id ?? "") ?? "Otro"})`
                                    : `${option.value!}`}
                                groupBy={parentNomenclatorIds.length > 1
                                    ? option => parentNomenclatorNameById.get(option.nomenclator?.id ?? "") ?? "Otro"
                                    : undefined}
                                getOptionKey={option => `${option.id}`} returnField="id"
                                errorMessage={errors?.parent_item_ids?.message} />
                        }
                    </Stack>
                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                </Stack>
            </form >
        </SidebarContentActionsWrapper>
    )
}

