import { useEffect, useMemo, useState } from "react"
import { ControlledTextInput } from "../common/forms/CustomInputs"
import { setFormErrors } from "../../generalService"
import { useForm } from "react-hook-form"
import { Typography, Button, Grid, ButtonGroup } from "@mui/material"
import { FormErrorMessage } from "../../styledComponents/styledMUIFormComponents"
import { createNomenclatorItem, getNomenclatorItems, updateNomenclatorItem } from "./nomenclatorService"
import type { NomenclatorDetailed, NomenclatorItem, NomenclatorItemDetailed, NomenclatorItemPost } from "../../types/nomenclators"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"

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
        code: existingNom?.code ?? null,
        value: existingNom?.value ?? null,
        nomenclator_id: existingNom?.nomenclator_id ?? nomenclator?.id ?? null,
        parent_item_id: existingNom?.parent_item_id ?? null,
    }), [existingNom, nomenclator])

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<NomenclatorItemPost>({ defaultValues })

    const [nomenclatorItems, setNomenclatorItems] = useState<NomenclatorItem[]>([])

    useEffect(() => {
        if (!nomenclator?.parent_nomenclator_id) return
        getNomenclatorItems({ detailed: false, only_active: true, page_size: 0, nomenclator_id: nomenclator?.parent_nomenclator_id }).then(res => setNomenclatorItems(res.items))
    }, [existingNom, nomenclator])

    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: NomenclatorItemPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const onSubmitReset = (data: NomenclatorItemPost) => {
        submit(data, true)
        .then(()=>reset(defaultValues))
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Typography variant="h1">
                {!existingNom ? "Crear Elemento de Nomenclador"
                    : `Modificar Elemento: ${existingNom.code} - ${existingNom.value}`}
            </Typography>
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                margin: "1rem"
            }}>
                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledTextInput name="code" control={control} label="Código"
                        required errorMessage={errors.code?.message} />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <ControlledTextInput name="value" control={control} label="Valor"
                        required errorMessage={errors.value?.message} />
                </Grid>
                {nomenclator?.parent_nomenclator_id &&
                    <Grid size="grow" minWidth={"20rem"}>
                    <ControlledAutocomplete control={control} label="Item del que depende" name="parent_item_id" options={nomenclatorItems}
                        getOptionLabel={option => `${option.code!} - ${option.value!}`} getOptionKey={option => `${option.id}`} returnField="id"
                        errorMessage={errors?.parent_item_id?.message} />
                </Grid>}
            </Grid>
            {errors?.root &&
                <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
            }
            <ButtonGroup fullWidth>
                <Button variant="outlined" onClick={onCancel} fullWidth>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)} fullWidth>
                    Guardar Nomenclador
                </Button>
                {!existingNom &&
                    <Button variant="contained" onClick={handleSubmit(onSubmitReset)} fullWidth>
                    Guardar y crear otro
                </Button>}
            </ButtonGroup>
        </form>
    )
}

