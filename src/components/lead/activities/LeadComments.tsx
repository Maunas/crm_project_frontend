import { useForm } from "react-hook-form"
import { RegisteredTextInput } from "../../common/forms/CustomInputs"
import type { LeadComment, LeadCommentPost } from "../../../types/leads"
import { Box, Button, Grid, IconButton, Paper, Typography } from "@mui/material"
import { createComment, deleteComment, getComments } from "./leadActivitiesService"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { setFormErrors } from "../../../generalService"
import type { Paginable } from "../../../types/common"
import { useListPagination } from "../../hooks/useListPagination"
import { PaginationComponent } from "../../common/lists/PaginationComponent"
import { alpha, styled, useTheme } from "@mui/material/styles"
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import dayjs from "dayjs"
import { Stack } from "@mui/system"

export const LeadComments = ({ leadId }: { leadId: number }) => {

    const [comments, setComments] = useState<Paginable<LeadComment> | null>(null)
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
    const { fetchPage, pageSize, pageComponentProps } = useListPagination(comments)

    useEffect(() => {
        getComments({ detailed: true, leadId, page: fetchPage, page_size: pageSize })
            .then(setComments)
    }, [fetchPage, pageSize, leadId])

    const onDeleteComment = (comId: number) => {
        deleteComment(comId).then(() => {
            getComments({ detailed: true, leadId, page: fetchPage, page_size: pageSize })
                .then(setComments)
        })
    }

    return (
        <Stack spacing="1rem">
            <Grid container spacing={4}>
                {comments?.items.map(com =>
                    <Grid key={com.id} size="grow" minWidth="20rem">
                        {com.id !== selectedCommentId ? (
                            <CommentInstance comment={com} onEdit={() => setSelectedCommentId(com.id)}
                                onDelete={() => onDeleteComment(com.id)}>
                                {com.content}
                            </CommentInstance>
                        )
                            : (
                                <CommentInstance comment={com} key={com.id}>
                                    <CommentForm leadId={leadId} existingComment={com} />
                                </CommentInstance>
                            )
                        }
                    </Grid>
                )}
            </Grid>
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
}

const CommentNote = styled(Paper)(({ theme, ...props }) => ({
    borderRadius: "1.5rem 1.5rem 1.5rem 0",
    border: `1px solid ${theme.palette[`${props.color}`].main}`,
    overflow: "hidden",
    "& .comment-footer, .comment-header": {
        display: "flex",
        flexWrap: "wrap",
    },
    "& .comment-header": {
        justifyContent: "end",
        paddingInline: "1rem",
        backgroundColor: alpha(theme.palette[`${props.color}`].light, .5),
        borderBottom: `1px solid ${theme.palette[`${props.color}`].main}`,
    },
    "& .comment-footer": {
        gap: ".5rem",
        padding: ".25rem 1rem",
        backgroundColor: alpha(theme.palette[`${props.color}`].light, .5),
        borderTop: `1px solid ${theme.palette[`${props.color}`].main}`,
    },
    "& .comment-main": {
        padding: "1rem",
        minHeight: "4rem",
    },
}))

interface CommentInstanceProps {
    comment?: LeadComment,
    isCreating?: boolean,
    onEdit?: () => void,
    onDelete?: () => void,
    children: ReactNode
}

const CommentInstance = ({ comment, isCreating = false, onEdit, onDelete, children }: CommentInstanceProps) => {

    const theme = useTheme()

    return <CommentNote color={comment?.color ?? "secondary"}>
        <Box className="comment-header">
            <IconButton aria-label="edit" size="small" onClick={() => onEdit()}>
                <EditIcon sx={{ color: "black" }} />
            </IconButton>
            <IconButton aria-label="delete" size="small" onClick={() => onDelete()}>
                <CloseIcon sx={{ color: "black" }} />
            </IconButton>
        </Box>
        <Box className="comment-main">
            {children}
        </Box>
        <Box className="comment-footer" width="100%">
            <Grid container spacing=".5rem" minWidth="15rem" size="grow" alignItems="center">
                <IconButton aria-label="edit" size="small" sx={{ bgcolor: theme.palette.contrast.light ?? "darkgray", color: theme.palette.contrast.dark ?? "#000", opacity: .8 }}>
                    <WatchLaterIcon />
                </IconButton>
                <Stack justifyContent="center">
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Creado:</span> {dayjs(comment?.created_at).format("DD/MM/YYYY")}</Typography>
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por:</span> {comment?.created_by}</Typography>
                </Stack>
            </Grid>
            <Grid container spacing=".5rem" minWidth="15rem" size="grow" alignItems="center">
                <IconButton aria-label="delete" size="small" sx={{ bgcolor: theme.palette.contrast.light ?? "darkgray", color: theme.palette.contrast.dark ?? "#000", opacity: .8 }}>
                    <WatchLaterIcon />
                </IconButton>
                <Stack justifyContent="center">
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Modificado:</span> {dayjs(comment?.created_at).format("DD/MM/YYYY")}</Typography>
                    {comment?.updated_by && <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por:</span> {comment?.updated_by}</Typography>}
                </Stack>
            </Grid>
        </Box>
    </CommentNote>
}

const CommentForm = ({ existingComment, leadId }: { existingComment?: LeadComment, leadId: number }) => {

    const defaultValues = useMemo(() => ({
        lead_id: leadId,
        content: existingComment?.content,
        id: existingComment?.id
    }), [existingComment, leadId])

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<LeadCommentPost>({ defaultValues })

    const postComment = handleSubmit(data => {
        createComment(data).then((res) => console.log(res)).catch(e => setFormErrors(e, setError))
        reset(defaultValues)
    })

    return < form onSubmit={postComment} >
        <Grid container spacing={2} alignItems="center" padding=".5rem 1rem">
            <Grid size="grow" minWidth="15rem">
                <RegisteredTextInput register={register} name={"content"} label="Comentario" errorMessage={errors.content?.message} multiline />
            </Grid>
            <Grid size="auto">
                <Button variant="contained" color="primary" type="submit">Guardar Comentario</Button>
            </Grid>
            <Box className="comment-footer">a</Box>
        </Grid>
    </form >
}
