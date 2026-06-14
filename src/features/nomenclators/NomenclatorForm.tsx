import { useCallback, useEffect, useMemo, useState } from "react"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "shared/layout/container/GenericContainer"
import { ControlledAutocomplete } from "shared/ui/forms/CustomMultipleInputs"
import { ControlledTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton, { CommonAvatar } from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { Nomenclator, NomenclatorDetailed, NomenclatorPost } from "src/types/nomenclators"
import { createNomenclator, getNomenclators, updateNomenclator } from "./nomenclatorService"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useForm } from "react-hook-form"
import { Grid, ButtonGroup, Stack } from "@mui/material"

interface NomenclatorSidebarProps {
    existingNom?: NomenclatorDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: NomenclatorDetailed) => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void
}

//Wrapper de NomenclatorForm para funcionar en un Sidebar
export const NomenclatorFormSidebar = ({ existingNom, handleSidebar, closeSidebar, updateEntityOnList }: NomenclatorSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingNom) handleSidebar("DETAILS_NOM", existingNom)
        else closeSidebar()
    }, [existingNom, closeSidebar, handleSidebar])

    const submit = useCallback((data: NomenclatorPost) => {
        const updateList = (res: NomenclatorDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_NOM", res)
        }
        if (!existingNom) {
            return createNomenclator(data)
                .then(res => {
                    updateList(res)
                    showToast(`El nomenclador "${res.name}" se ha creado con éxito`)
                })
        } else {
            return updateNomenclator(data, existingNom.id)
                .then(res => {
                    updateList(res)
                    showToast(`El nomenclador "${res.name}" se ha modificado con éxito`)
                })
        }
    }, [existingNom, handleSidebar, updateEntityOnList])

    return <SidebarContentWrapper title={existingNom ? `Modificar "${existingNom.name}"` : "Agregar Nomenclador"}
        subtitle="Nomencladores"
        avatar={<CommonAvatar actionType={existingNom ? "MODIFY" : "CREATE"} />}>
        <NomenclatorForm existingNom={existingNom} submit={submit} onCancel={handleClose} />
    </SidebarContentWrapper>
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
        return submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const { loading, fnWithLoading: submitNomLoad } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitNomLoad)} style={{ height: "100%" }}>
            <SidebarContentActionsWrapper
                actions={
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" color="error" variant="outlined" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingNom ? "MODIFY" : "CREATE"} variant="contained"
                            type="submit" loading={loading}>
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
                </Stack>
            </SidebarContentActionsWrapper>
        </form>
    )
}

