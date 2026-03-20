import { useMemo, useState } from "react"
import { CommentInstance } from "./LeadComments"
import { RegisteredTextInput } from "../../common/forms/CustomInputs"
import type { LeadComment, LeadCommentPost } from "../../../types/leads"
import { setFormErrors } from "../../../generalService"
import { createComment, updateComment } from "./leadActivitiesService"
import { useForm } from "react-hook-form"
import { Button, Grid, IconButton, Stack } from "@mui/material"
import CircleIcon from '@mui/icons-material/Circle';
import { useTheme } from "@mui/material/styles"

interface CommentFromNoteProps {
    leadId: number,
    existingComment?: LeadComment,
    onUpdate?: (com: LeadComment) => void,
    onClose?: () => void,
    onCreate?: () => void,
}

export const CommentFromNote = ({ existingComment, leadId, onUpdate, onCreate, onClose }: CommentFromNoteProps) => {

    const [commentColor, setCommentColor] = useState<string>(existingComment?.color ?? "secondary")
    const [openForm, setOpenForm] = useState<boolean>(false)

    const postComment = ((data: LeadCommentPost) => {
        if (existingComment) return updateComment(data, existingComment.id).then((res) => {
            onUpdate!({ ...res, color: commentColor })
        })
        else return createComment(data).then(() => {
            onCreate!()
        })
    })

    const onNoteClose = () => {
        if (existingComment && onClose) return onClose()
        else return setOpenForm(false)
    }

    return (
        <Grid container justifyContent="end">
            {(openForm || existingComment) &&
                <Grid size="grow">
                    <CommentInstance onDelete={() => onNoteClose()} color={commentColor} title={existingComment ? "Modificar Comentario" : "Agregar Comentario"}
                        footerContent={<CommentColorSelector commentColor={commentColor} setCommentColor={setCommentColor} />}
                    >
                        <CommentForm existingComment={existingComment} leadId={leadId} submit={postComment} onClose={() => onNoteClose()} />
                    </CommentInstance>
                </Grid>
            }
            {(!openForm && !existingComment) &&
                <Button variant="contained" onClick={() => setOpenForm(true)}>Agregar Comentario</Button>
            }
        </Grid>
    )
}

interface CommentFormProps {
    existingComment?: LeadComment,
    leadId: number,
    onClose: () => void,
    submit: (data: LeadCommentPost) => Promise<void>
}

const CommentForm = ({ existingComment, leadId, onClose, submit }: CommentFormProps) => {

    const defaultValues = useMemo(() => ({
        lead_id: leadId,
        content: existingComment?.content,
    }), [existingComment, leadId])

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<LeadCommentPost>({ defaultValues })

    const onSubmit = ((data: LeadCommentPost) => {
        submit(data).then(() => {
            reset(defaultValues)
            onClose()
        })
            .catch(e => setFormErrors(e, setError))
    })

    return < form onSubmit={handleSubmit(onSubmit)} >
        <Grid container spacing={2} alignItems="center" justifyContent="end">
            <Grid size="grow" minWidth="15rem">
                <RegisteredTextInput register={register} name={"content"} label="Comentario" errorMessage={errors.content?.message} multiline />
            </Grid>
            <Grid size="auto">
                <Button variant="contained" color="primary" type="submit">Guardar Comentario</Button>
            </Grid>
        </Grid>
    </form >
}

const CommentColorSelector = ({ commentColor, setCommentColor }: { commentColor: string, setCommentColor: React.Dispatch<React.SetStateAction<string>> }) => {

    const COLORS = ["primary", "secondary", "contrast", "info", "success", "warning", "error"]
    const theme = useTheme()
    return (
        <Stack direction="row" justifyContent="end" width="100%">
            {COLORS.map(color => {
                const paletteColor = theme.palette[color]
                return <IconButton size="small" key={color} onClick={() => setCommentColor(color)}>
                    <CircleIcon sx={{
                        color: commentColor === color ? paletteColor.main : paletteColor.light,
                        borderRadius: "50%",
                        border: commentColor === color ? "2px solid gray" : ""
                    }} fontSize="small" />
                </IconButton>
            })
            }
        </Stack>
    )
}