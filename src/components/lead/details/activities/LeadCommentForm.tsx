import { useMemo, useState } from "react"
import { CommentInstance } from "./LeadComments"
import { RegisteredTextInput } from "../../../common/forms/CustomInputs"
import { CommonButton } from "../../../common/details/DetailsCommonButton"
import { FormErrorMessage } from "../../../common/forms/StyledFormComponents"
import type { LeadComment, LeadCommentPost } from "../../../../types/leads"
import type { ColorTypes } from "../../../../types/mui-theme.d"
import { COLORS, setFormErrors } from "../../../../generalService"
import { createComment, updateComment } from "./leadActivitiesService"
import { Controller, useForm, type Control } from "react-hook-form"
import { Box, Grid, IconButton, Stack } from "@mui/material"
import CircleIcon from '@mui/icons-material/Circle';
import { alpha, styled, useTheme } from "@mui/material/styles"
import type { PaletteColor } from "@mui/material/styles"

interface CommentFromNoteProps {
    leadId: number,
    existingComment: LeadComment,
    onUpdate: (com: LeadComment) => void,
    onClose: () => void,
}

export const UpdateCommentFromNote = ({ existingComment, leadId, onUpdate, onClose }: CommentFromNoteProps) => {

    const [color, setColor] = useState<ColorTypes>(existingComment?.color ?? "secondary")

    const postComment = ((data: LeadCommentPost) => {
        return updateComment({ ...data }, existingComment.id).then((res) => {
            onUpdate(res)
        })
    })

    return (
        <Grid container sx={{ justifyContent: "end" }}>
            <Grid size="grow">
                <CommentInstance color={color} onDelete={() => onClose()}
                    title={existingComment ? "Modificar Comentario" : "Agregar Comentario"}>
                    <CommentForm existingComment={existingComment} leadId={leadId} submit={postComment}
                        onClose={() => onClose()} setColor={setColor} size="small" />
                </CommentInstance>
            </Grid>
        </Grid>
    )
}

const NewCommentBox = styled(Box)(({ theme, color = "secondary" }) => {
    const paletteColor = theme.palette[color as ColorTypes] ?? theme.palette.secondary
    const OPACITY = .12
    return [{
        border: "1px solid",
        borderColor: alpha(paletteColor.main, .5),
        backgroundColor: alpha(paletteColor.light, OPACITY),
        width: "100%",
        "& .MuiInputBase-root": {
            backgroundColor: theme.palette.background.paper,
        }
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(paletteColor.darker, OPACITY),
        borderColor: alpha(paletteColor.dark, .5),
    })
    ]
})

interface CommentWrapperProps {
    leadId: number,
    onCreate: (com: LeadComment) => void,
}

export const CreateCommentWrapper = ({ leadId, onCreate }: CommentWrapperProps) => {

    const [color, setColor] = useState<ColorTypes>("secondary")

    const { palette } = useTheme()

    const postComment = ((data: LeadCommentPost) => {
        return createComment(data).then((res) => {
            onCreate(res)
        })
    })

    return (
        <Box sx={{ width: "100%", bgcolor: alpha(palette.background.default, .5), borderRadius: 3 }} >
            <NewCommentBox color={color} sx={{ boxShadow: "inherit", borderRadius: 3, py: 2, px: 3 }}>
                <CommentForm leadId={leadId} submit={postComment} setColor={setColor} size="medium" />
            </NewCommentBox>
        </Box>
    )
}

interface CommentFormProps {
    existingComment?: LeadComment,
    leadId: number,
    submit: (data: LeadCommentPost) => Promise<void>,
    onClose?: () => void,
    setColor: React.Dispatch<React.SetStateAction<ColorTypes>>,
    size?: "small" | "medium"
}

const CommentForm = ({ existingComment, leadId, onClose, submit, setColor, size = "medium" }: CommentFormProps) => {

    const defaultValues = useMemo(() => ({
        lead_id: leadId,
        content: existingComment?.content,
        color: existingComment?.color ?? "secondary"
    }), [existingComment, leadId])

    const { control, register, handleSubmit, reset, setError, formState: { errors } } = useForm<LeadCommentPost>({ defaultValues })

    const onSubmit = ((data: LeadCommentPost) => {
        submit(data)
            .then(() => {
                reset(defaultValues)
                if (onClose) onClose()
            })
            .catch(e => setFormErrors(e, setError))
    })

    return (
        < form onSubmit={handleSubmit(onSubmit)} >
            <Stack spacing={1} sx={{ alignItems: "center", justifyContent: "end" }}>
                <RegisteredTextInput register={register} name={"content"} label="Comentario"
                    errorMessage={errors.content?.message} size={size} multiline />
                <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: "space-between", flexWrap: "wrap", width: "100%" }}>
                    <CommentColorSelector control={control} setColor={setColor} />
                    <CommonButton actionType="SAVE" variant="contained" color="primary" type="submit" size={size} sx={{ ml: "auto" }}>
                        Guardar
                    </CommonButton>
                </Stack >
            </Stack >
        </form >
    )
}

interface CommentColorSelectorProps {
    control: Control<LeadCommentPost>,
    setColor?: React.Dispatch<React.SetStateAction<ColorTypes>>
}

const CommentColorSelector = ({ control, setColor }: CommentColorSelectorProps) => {

    const { palette } = useTheme()
    return (
        <Controller control={control} name="color"
            render={({ field, fieldState }) => (
                <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "center" }}>
                    {fieldState.error?.message && typeof fieldState.error?.message === "string" && (
                        <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
                    )}
                    {COLORS.map(colorName => {
                        const paletteColor: PaletteColor = palette[colorName]
                        return <IconButton size="small" key={colorName}
                            onClick={() => {
                                field.onChange(colorName)
                                if (setColor) setColor(colorName)
                            }}>
                            <CircleIcon sx={{
                                color: field.value === colorName ? paletteColor.main : paletteColor.light,
                                borderRadius: "50%",
                                border: field.value === colorName ? `2px solid ${palette.text.secondary}` : ""
                            }} fontSize="small" />
                        </IconButton>
                    })
                    }
                </Stack>
            )}
        />

    )
}