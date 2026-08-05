import { useEffect, useMemo } from "react"
import { ControlledColorPicker } from "shared/ui/forms/ColorPicker"
import { RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { CustomAvatar } from "shared/ui/details/CustomAvatar"
import CommonButton from "shared/ui/buttons/CommonButton"
import ACTION_ICONS from "shared/ui/icons/ActionIcons"
import { useLoading } from "src/hooks/useLoading"
import type { LeadFieldSectionDetailed, LeadFieldSectionPost } from "src/types/orgProperties"
import { createFieldSection, updateFieldSection } from "./fieldSectionsServices"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useForm, useWatch } from "react-hook-form"
import { ButtonGroup, Grid, Stack, Typography } from "@mui/material"

interface FieldSectionFormProps {
    existingSection?: LeadFieldSectionDetailed,
    onClose: () => void,
    onSubmit: (entity?: LeadFieldSectionDetailed | undefined, update?: boolean) => void
}

export const FieldSectionForm = ({ existingSection, onClose, onSubmit }: FieldSectionFormProps) => {

    const defaultValues: LeadFieldSectionPost = useMemo(() => ({
        name: existingSection?.name ?? '',
        color: existingSection?.color ?? "primary",
    }), [existingSection])

    const { register, control, reset, setError, formState: { errors }, handleSubmit } = useForm<LeadFieldSectionPost>({ defaultValues })

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, reset])

    const saveState = (data: LeadFieldSectionPost) => {
        if (existingSection) return updateFieldSection(data, existingSection.id)
            .then(res => {
                onSubmit(res, true)
                onClose()
                showToast(`Sección "${res.name}" actualizada con éxito`)
            })
            .catch(e => setFormErrors(e, setError))
        else return createFieldSection(data)
            .then(res => {
                onSubmit()
                onClose()
                showToast(`Sección "${res.name}" creada con éxito`)
            })
            .catch(e => setFormErrors(e, setError))
    }

    const { fnWithLoading: saveStateLoad, loading } = useLoading(saveState)

    const color = useWatch({ control, name: "color" })

    return (
        <form onSubmit={handleSubmit(saveStateLoad)}>
            <Stack spacing={2}>
                <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
                    <CustomAvatar size="small" color={color}>{ACTION_ICONS[existingSection ? "MODIFY" : "CREATE"]}</CustomAvatar>
                    <Typography variant="h3">{existingSection ? `Modificar "${existingSection.name}"` : "Agregar Sección"}</Typography>
                </Stack>
                <Grid container spacing={1} sx={{ alignItems: "center" }}>
                    <Grid sx={{ minWidth: "15rem" }} size="grow">
                        <RegisteredTextInput register={register} name="name" label="Nombre" errorMessage={errors?.name?.message} />
                    </Grid>
                    <Grid sx={{ minWidth: "15rem" }} size="grow">
                        <ControlledColorPicker control={control} name="color" />
                    </Grid>
                </Grid>
                <ButtonGroup sx={{ ml: "auto", alignSelf: "end" }}>
                    <CommonButton actionType="CLOSE" color="error" variant="outlined" onClick={onClose}>Cancelar</CommonButton>
                    <CommonButton actionType="SAVE" type="submit" loading={loading}>Guardar</CommonButton>
                </ButtonGroup>
            </Stack>
        </form>
    )
}
