import { useEffect, useMemo } from "react"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { LeadTag, LeadTagPost } from "src/types/leads"
import type { ColorTypes } from "src/types/mui-theme.d"
import { createTag, updateTag } from "./LeadDetailsService"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { COLORS } from "src/utils/constants"
import { Controller, useForm, useWatch, type Control, type FieldValues, type Path } from "react-hook-form"
import { alpha, IconButton, Popover, Stack, TextField, Typography, useTheme, type PaletteColor } from "@mui/material"
import CircleIcon from '@mui/icons-material/Circle'


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

    const { palette } = useTheme()

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

    return (
        <form onSubmit={handleSubmit(postLoad)}>
            <Stack spacing={1}>
                <Stack spacing={.5}>
                    <TextField id="tag-name" label="Nombre" size="small" {...register("name")}
                        sx={{ backgroundColor: alpha(palette[color as ColorTypes].darker, .2) }} />
                    {errors?.name?.message && <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>}
                </Stack>
                <ControlledColorPicker control={control} name="color" />
                <Stack>
                    <CommonButton actionType="CLOSE" variant="text" color="error" onClick={handleCancel} disabled={loading}>
                        Cancelar
                    </CommonButton>
                    <CommonButton actionType={existingTag ? "MODIFY" : "CREATE"} variant="contained" type="submit" loading={loading}>
                        Guardar
                    </CommonButton>
                </Stack>
            </Stack>
        </form>
    )
}

interface ColorSelectorProps<T extends FieldValues> {
    control: Control<T>,
    name: Path<T>
}

export const ControlledColorPicker = <T extends FieldValues>({ control, name }: ColorSelectorProps<T>) => {
    const { palette } = useTheme()
    return (
        <Controller control={control} name={name}
            render={({ field, fieldState }) => {
                return (
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                            {COLORS.map(colorName => {
                                const paletteColor: PaletteColor = palette[colorName]
                                return (
                                    <IconButton size="small" key={colorName}
                                        onClick={() => {
                                            field.onChange(colorName)
                                        }}>
                                        <CircleIcon sx={{
                                            color: field.value === colorName ? paletteColor.main : paletteColor.light,
                                            borderRadius: "50%",
                                            border: field.value === colorName ? `2px solid ${palette.text.secondary}` : ""
                                        }} fontSize="small" />
                                    </IconButton>
                                )
                            })
                            }
                        </Stack>
                        {fieldState.error?.message && typeof fieldState.error?.message === "string" && (
                            <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
                        )}
                    </Stack>
                )
            }} />

    )
}
