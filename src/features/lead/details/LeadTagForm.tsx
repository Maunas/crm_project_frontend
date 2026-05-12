import { useEffect, useMemo } from "react"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { LeadTag, LeadTagPost } from "src/types/leads"
import type { ColorTypes } from "src/types/mui-theme.d"
import { setFormErrors } from "src/utils/forms"
import { COLORS } from "src/utils/constants"
import { Controller, useForm, useWatch, type Control, type FieldValues, type Path } from "react-hook-form"
import { alpha, IconButton, Stack, TextField, useTheme, type PaletteColor } from "@mui/material"
import CircleIcon from '@mui/icons-material/Circle'

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
        onSubmit(data)
            .then(() => reset(defaultValues))
            .catch(e => setFormErrors(e, setError))
    }

    const handleCancel = () => {
        reset(defaultValues)
        onCancel()
    }

    const color = useWatch({ name: "color", control })

    return (
        <form onSubmit={handleSubmit(onPostTag)}>
            <Stack spacing={1}>
                <Stack spacing={.5}>
                    <TextField id="tag-name" label="Nombre" size="small" {...register("name")}
                        sx={{ backgroundColor: alpha(palette[color as ColorTypes].darker, .2) }} />
                    {errors?.name?.message && <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>}
                </Stack>
                <ControlledColorPicker control={control} name="color" />
                <Stack spacing={.5}>
                    <CommonButton actionType="CLOSE" variant="text" onClick={handleCancel}>Cancelar</CommonButton>
                    <CommonButton actionType={existingTag ? "MODIFY" : "CREATE"} variant="contained" type="submit">Guardar</CommonButton>
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
