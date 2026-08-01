import GenericPaper from 'src/components/layout/container/GenericPaper'
import Typography from '@mui/material/Typography'
import { CustomAvatar } from '../details/CustomAvatar'
import ACTION_ICONS from '../icons/ActionIcons'
import { Badge, Grid, Stack } from '@mui/material'
import CommonButton from '../buttons/CommonButton'
import { useForm, useWatch } from 'react-hook-form'
import { RegisteredDateInput } from '../forms/CustomInputs'
import { ControlledAutocomplete } from '../forms/CustomMultipleInputs'

const DATE_FIELD_OPTIONS = [
    { label: "Creación", value: "created_at" },
    { label: "Modificación", value: "updated_at" }
]

export const FilterMenu = ({ existingFilters, onSubmit }: { existingFilters: Record<string, string>, onSubmit: (filters: Record<string, string>) => void }) => {

    const { register, control, handleSubmit } = useForm<Record<string, string>>({
        defaultValues: existingFilters
    })

    const submit = (data: Record<string, string>) => {
        console.log(data)
        onSubmit(data)
    }

    const dateField = useWatch({ name: "date_field", control })

    return (
        <GenericPaper sx={{ p: 2, display: "flex", gap: 2, flexDirection: "column" }} elevation={2}>
            <Stack spacing={1.5} useFlexGap direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <Stack spacing={1.5} direction="row" sx={{ alignItems: "center" }}>
                    <Badge badgeContent={Array.from(Object.values(existingFilters)).length}>
                        <CustomAvatar size='small' color='secondary' sx={{ height: "2rem", width: "2rem" }} >{ACTION_ICONS.FILTER}</CustomAvatar>
                    </Badge>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Filtros Avanzados</Typography>
                </Stack>
                <CommonButton actionType='FILTER' color="secondary" variant='outlined' size="small"
                    type="submit" form='filter-form' sx={{ ml: "auto" }}>
                    Aplicar
                </CommonButton>
            </Stack>
            <form id="filter-form" onSubmit={handleSubmit(submit)}>
                <Grid container spacing={2}>
                    <ControlledAutocomplete control={control} name="date_field" label="Buscar por fecha"
                        options={DATE_FIELD_OPTIONS} getOptionKey={o => o.value} getOptionLabel={o => o.label}
                        returnField="value" size="small" />
                    {dateField &&
                        <>
                            <RegisteredDateInput register={register} name="start_date" label="Fecha Inicio" size="small" />
                            <RegisteredDateInput register={register} name="end_date" label="Fecha Fin" size="small" />
                        </>
                    }
                </Grid>
            </form>
        </GenericPaper>
    )
}
