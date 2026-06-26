import { useEffect, useMemo } from "react"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { LeadTag, LeadTagPost } from "src/types/leads"
import { createTag, updateTag } from "features/lead/details/LeadDetailsService"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useForm, useWatch } from "react-hook-form"
import { alpha, ButtonGroup, Popover, Stack, TextField, Typography, useTheme } from "@mui/material"
import { ControlledColorPicker } from "src/components/ui/forms/ColorPicker"
import { getColorShades } from "src/utils/formatters"


interface TagFormMenuProps {
    formAnchor: null | HTMLElement,
    handleClose: () => void,
    handleTagsUpdate: (modifiedTag?: LeadTag | undefined) => void,
    existingTag: LeadTag | null
}

export const TagFormMenuWrapper = ({ existingTag, formAnchor, handleClose, handleTagsUpdate }: TagFormMenuProps) => {

    const onPostTag = (data: LeadTagPost) => {
        if (existingTag) {
            return updateTag(data, existingTag.id)
                .then(res => {
                    handleTagsUpdate(res)
                    showToast(`Etiqueta "${res.name}" actualizada con éxito`)
                    handleClose()
                })
        }
        return createTag(data)
            .then(res => {
                handleTagsUpdate()
                showToast(`Etiqueta "${res.name}" creada con éxito`)
                handleClose()
            })
    }

    return (
        <Popover disableScrollLock disableAutoFocus id="basic-menu"
            anchorEl={formAnchor} open={Boolean(formAnchor)} onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <Stack spacing={2} sx={{ p: 2 }}>
                <Typography variant="h4" component="h3">{existingTag ? "Modificar Etiqueta" : "Crear Etiqueta"}</Typography>
                <LeadTagForm existingTag={existingTag} onCancel={handleClose} onSubmit={onPostTag} />
            </Stack>
        </Popover >
    )
}

interface LeadTagFormProps {
    existingTag: LeadTag | null,
    onCancel: () => void,
    onSubmit: (data: LeadTagPost) => Promise<void>,
}

export const LeadTagForm = ({ existingTag, onCancel, onSubmit }: LeadTagFormProps) => {

    const theme = useTheme()

    const defaultValues = useMemo(() => ({
        name: existingTag?.name ?? undefined,
        color: existingTag?.color ?? "secondary"
    }), [existingTag])

    const { register, control, formState: { errors }, reset, handleSubmit, setError } = useForm<LeadTagPost>({
        defaultValues
    })

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, reset])

    const onPostTag = (data: LeadTagPost) => {
        return onSubmit(data)
            .then(() => reset(defaultValues))
            .catch(e => setFormErrors(e, setError))
    }

    const { fnWithLoading: postLoad, loading } = useLoading(onPostTag)

    const handleCancel = () => {
        reset(defaultValues)
        onCancel()
    }

    const color = useWatch({ name: "color", control })

    const colorShades = useMemo(() => getColorShades(color ?? "primary", theme), [color, theme])

    return (
        <form onSubmit={handleSubmit(postLoad)} style={{ minWidth: "15rem" }}>
            <Stack spacing={1}>
                <Stack spacing={.5}>
                    <TextField id="tag-name" label="Nombre" size="small" {...register("name")}
                        sx={{ backgroundColor: alpha(colorShades.DARKER, .2) }} />
                    {errors?.name?.message && <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>}
                </Stack>
                <ControlledColorPicker control={control} name="color" size="small" row />
                <ButtonGroup fullWidth>
                    <CommonButton actionType="CLOSE" variant="outlined" color="error" onClick={handleCancel} disabled={loading}>
                        Cancelar
                    </CommonButton>
                    <CommonButton actionType={existingTag ? "MODIFY" : "CREATE"} variant="contained" type="submit" loading={loading}>
                        Guardar
                    </CommonButton>
                </ButtonGroup>
            </Stack>
        </form>
    )
}

