import { useForm } from "react-hook-form"
import { RegisteredTextInput } from "../../common/forms/CustomInputs"
import type { LeadComment, LeadCommentPost } from "../../../types/leads"
import { Button, Grid } from "@mui/material"
import { createComment, getComments } from "./leadActivitiesService"
import { useEffect, useMemo, useState } from "react"
import { setFormErrors } from "../../../generalService"
import type { Paginable } from "../../../types/common"
import { useListPagination } from "../../hooks/useListPagination"
import { PaginationComponent } from "../../common/lists/PaginationComponent"

export const LeadComments = ({ leadId }: { leadId: number }) => {

    const [comments, setComments] = useState<Paginable<LeadComment> | null>(null)
    const { fetchPage, pageSize, pageComponentProps } = useListPagination(comments)

    useEffect(() => {
        getComments({ detailed: true, leadId, page: fetchPage, page_size: pageSize })
        .then(setComments)
    }, [fetchPage, pageSize, leadId])
    console.log(comments)
    return (
        <>
            <CommentForm leadId={leadId} />
            {comments?.items.map(com => <p>{com.content}</p>)}
            <PaginationComponent {...pageComponentProps} />
        </>
    )
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
        <Grid container spacing={2} alignItems="center">
            <Grid size="grow" minWidth="15rem">
                <RegisteredTextInput register={register} name={"content"} label="Comentario" errorMessage={errors.content?.message} multiline />
            </Grid>
            <Grid size="auto">
                <Button variant="contained" color="primary" type="submit">Guardar Comentario</Button>
            </Grid>
        </Grid>
    </form >
}
