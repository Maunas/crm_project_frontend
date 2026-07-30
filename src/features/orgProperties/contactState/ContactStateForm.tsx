import { useEffect, useMemo } from "react"
import { ControlledSwitch, RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { ControlledColorPicker } from "shared/ui/forms/ColorPicker"
import { CustomAvatar } from "shared/ui/details/CustomAvatar"
import CommonButton from "shared/ui/buttons/CommonButton"
import ACTION_ICONS from "shared/ui/icons/ActionIcons"
import { useLoading } from "src/hooks/useLoading"
import type { LeadContactStateDetailed, LeadContactStatePost } from "src/types/orgProperties"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useForm, useWatch } from "react-hook-form"
import { ButtonGroup, Grid, Stack, Typography } from "@mui/material"
import { createLeadContactState, updateLeadContactState } from "./contactStatesServices"

interface ContactStateFormProps {
    existingState?: LeadContactStateDetailed,
    onClose: () => void,
    onSubmit: (entity?: LeadContactStateDetailed | undefined, update?: boolean) => void
}

export const ContactStateForm = ({ existingState, onClose, onSubmit }: ContactStateFormProps) => {

    const defaultValues: LeadContactStatePost = useMemo(() => ({
        name: existingState?.name ?? '',
        color: existingState?.color ?? "primary",
        is_initial: existingState?.is_initial ?? false,
        order: existingState?.order
    }), [existingState])

    const { register, control, reset, setError, formState: { errors }, handleSubmit } = useForm<LeadContactStatePost>({ defaultValues })

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, reset])

    const saveState = (data: LeadContactStatePost) => {
        if (existingState) return updateLeadContactState(data, existingState.id)
            .then(res => {
                onSubmit(res, true)
                onClose()
                showToast(`Estado "${res.name}" actualizado con éxito`)
            })
            .catch(e => setFormErrors(e, setError))
        else return createLeadContactState(data)
            .then(res => {
                onSubmit()
                onClose()
                showToast(`Estado "${res.name}" creado con éxito`)
            })
            .catch(e => setFormErrors(e, setError))
    }

    const { fnWithLoading: saveStateLoad, loading } = useLoading(saveState)

    const color = useWatch({ control, name: "color" })

    return (
        <form onSubmit={handleSubmit(saveStateLoad)}>
            <Stack spacing={2}>
                <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
                    <CustomAvatar size="small" color={color}>{ACTION_ICONS[existingState ? "MODIFY" : "CREATE"]}</CustomAvatar>
                    <Typography variant="h3">{existingState ? `Modificar "${existingState.name}"` : "Agregar Estado"}</Typography>
                </Stack>
                <Grid container spacing={1} sx={{ alignItems: "center" }}>
                    <Grid sx={{ minWidth: "15rem" }} size="grow">
                        <RegisteredTextInput register={register} name="name" label="Nombre" errorMessage={errors?.name?.message} />
                    </Grid>
                    <Grid sx={{ minWidth: "15rem" }} size="grow">
                        <ControlledColorPicker control={control} name="color" />
                    </Grid>
                    <Grid sx={{ minWidth: "15rem" }} size="grow">
                        <ControlledSwitch control={control} name="is_initial" label="Es inicial" errorMessage={errors?.is_initial?.message} />
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
