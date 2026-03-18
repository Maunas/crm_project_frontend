import { useForm } from "react-hook-form"
import { RegisteredTextInput } from "../../common/forms/CustomInputs"
import type { LeadCommentPost } from "../../../types/leads"
import { Button, Grid } from "@mui/material"
import { createComment } from "./LeadActivitiesService"
import { useMemo } from "react"
import { setFormErrors } from "../../../generalService"

export const LeadComments = ({ leadId }: { leadId: number }) => {

    const defaultValues = useMemo(() => ({
        lead_id: leadId,
        content: undefined
    }), [leadId])

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<LeadCommentPost>({ defaultValues })

    const postComment = handleSubmit(data => {
        createComment(data).then((res) => console.log(res)).catch(e => setFormErrors(e, setError))
        reset(defaultValues)
    })

    return (
        <form onSubmit={postComment} >
            <Grid container spacing={2} alignItems="center">
                <Grid size="grow" minWidth="15rem">
                    <RegisteredTextInput register={register} name={"content"} label="Comentario" errorMessage={errors.content?.message} multiline />
                </Grid>
                <Grid size="auto">
                    <Button variant="contained" color="primary" type="submit">Agregar Comentario</Button>
                </Grid>
            </Grid>
        </form>
    )
}
