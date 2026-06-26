import { useMemo, useState } from "react"
import { CommentInstance } from "./LeadComments"
import { RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { LeadComment, LeadCommentPost } from "src/types/leads"
import { createComment, updateComment } from "./leadActivitiesService"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useForm } from "react-hook-form"
import { Box, Grid, Stack } from "@mui/material"
import { alpha, styled, useTheme } from "@mui/material/styles"
import { ControlledColorPicker } from "src/components/ui/forms/ColorPicker"
import { getColorShades } from "src/utils/formatters"

interface CommentFromNoteProps {
    leadId: number,
    existingComment: LeadComment,
    onUpdate: (com: LeadComment) => void,
    onClose: () => void,
}

export const UpdateCommentFromNote = ({ existingComment, leadId, onUpdate, onClose }: CommentFromNoteProps) => {

    const [color, setColor] = useState<string>(existingComment?.color ?? "secondary")

    const postComment = ((data: LeadCommentPost) => {
        return updateComment({ ...data }, existingComment.id).then((res) => {
            onUpdate(res)
            showToast("Comentario modificado con éxito.")
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
    const colorShades = getColorShades(color ?? "secondary", theme)
    const OPACITY = .12
    return [{
        border: "1px solid",
        borderColor: alpha(colorShades.MAIN, .5),
        backgroundColor: alpha(colorShades.LIGHT, OPACITY),
        width: "100%",
        "& .MuiInputBase-root": {
            backgroundColor: theme.palette.background.paper,
        }
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(colorShades.DARKER, OPACITY),
        borderColor: alpha(colorShades.DARK, .5),
    })
    ]
})

interface CommentWrapperProps {
    leadId: number,
    onCreate: (com: LeadComment) => void,
}

export const CreateCommentWrapper = ({ leadId, onCreate }: CommentWrapperProps) => {

    const [color, setColor] = useState<string>("secondary")

    const { palette } = useTheme()

    const postComment = ((data: LeadCommentPost) => {
        return createComment(data).then(res => {
            onCreate(res)
            showToast("Comentario creado con éxito.")
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
    setColor: React.Dispatch<React.SetStateAction<string>>,
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
        return submit(data)
            .then(() => {
                reset(defaultValues)
                if (onClose) onClose()
            })
            .catch(e => setFormErrors(e, setError))
    })

    const { fnWithLoading: submitLoad, loading } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitLoad)} >
            <Stack spacing={1} sx={{ alignItems: "start", justifyContent: "end" }}>
                <RegisteredTextInput register={register} name={"content"} label="Comentario"
                    errorMessage={errors.content?.message} size={size} multiline />
                <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: "space-between", flexWrap: "wrap", width: "100%" }}>
                    <ControlledColorPicker control={control} name="color" size={size} row onBeforeChange={setColor} />
                    <CommonButton actionType="SAVE" variant="contained" color="primary" loading={loading}
                        type="submit" size={size} sx={{ ml: "auto" }}>
                        Guardar
                    </CommonButton>
                </Stack >
            </Stack >
        </form >
    )
}
