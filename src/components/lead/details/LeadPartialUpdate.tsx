import { Grid, IconButton, ListItem, TextField } from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import CloseIcon from "@mui/icons-material/Close"
import type { LeadFieldValue } from "../../../types/leadFields"
import { useForm } from "react-hook-form"
import { FormErrorMessage } from "../../common/forms/StyledFormComponents"

interface LeadPartialUpdateProps {
    fieldValue: LeadFieldValue,
    onClose: () => void
}

export const LeadPartialUpdate = ({ fieldValue, onClose }: LeadPartialUpdateProps) => {

    const { register, control, setError, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            field_id: fieldValue.field.id,
            value: fieldValue.value
        }
    })

    const onSubmit = (data: { field_id: number, value: string | undefined }) => {
        alert(`${data.field_id} ${data.value}`)
        onClose()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ListItem >
                <Grid container gap={1} alignItems="center" width="100%">
                    <Grid container gap={.5} direction="column" size="grow">
                        <TextField {...register("value")} fullWidth size="small" label={fieldValue.field.name} variant="outlined" />
                        <FormErrorMessage>{errors?.value?.message ?? errors?.root?.message}</FormErrorMessage>
                    </Grid>
                    <IconButton size="small" edge="end" color="primary" title="Guardar" type="submit">
                        <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" edge="end" color="error" title="Cancelar" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Grid>
            </ListItem>
        </form>
    )
}
