import GenericPaper from 'src/components/layout/container/GenericPaper'
import Typography from '@mui/material/Typography'
import { CustomAvatar } from '../details/CustomAvatar'
import ACTION_ICONS from '../icons/ActionIcons'
import { Badge, Grid, Stack, ButtonGroup } from '@mui/material'
import CommonButton from '../buttons/CommonButton'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { RegisteredDateInput, RegisteredTextInput } from '../forms/CustomInputs'
import { ControlledAutocomplete } from '../forms/CustomMultipleInputs'

const DATE_FIELD_OPTIONS = [
    { label: "Creación", value: "created_at" },
    { label: "Modificación", value: "updated_at" }
]

interface FilterMenuProps {
    existingFilters: Record<string, string>,
    onSubmit: (filters: Record<string, string>) => void,
    filterOptions: {
        label: string;
        value: string;
        options: { label: string, value: string }[];
    }[]
}

export const FilterMenu = ({ existingFilters, filterOptions, onSubmit }: FilterMenuProps) => {

    //Id único por instancia: cuando hay dos FilterMenu montados a la vez (ej. lista principal + sidebar de detalles),
    //el atributo form del botón debe apuntar al formulario de SU propia instancia y no al primero del DOM.
    const formId = useId()

    const { register, control, reset, handleSubmit } = useForm<Record<string, string>>({
        defaultValues: existingFilters
    })

    const submit = (data: Record<string, string>) => {
        onSubmit(data)
    }

    const cancel = () => {
        reset()
        onSubmit({})
    }

    const activeFilters = Object.values(existingFilters).filter(Boolean).length > 0

    const dateField = useWatch({ name: "date_field", control })

    return (
        <GenericPaper sx={{ p: 2, display: "flex", gap: 2, flexDirection: "column" }} elevation={2}>
            <Stack spacing={1.5} useFlexGap direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <Stack spacing={1.5} direction="row" sx={{ alignItems: "center" }}>
                    <Badge variant="dot" color='success' invisible={!activeFilters} >
                        <CustomAvatar size='small' color='secondary' sx={{ height: "2rem", width: "2rem" }} >{ACTION_ICONS.FILTER}</CustomAvatar>
                    </Badge>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Filtros Avanzados</Typography>
                </Stack>
                <ButtonGroup>
                    <CommonButton actionType='CLOSE' color="error" variant='outlined' size="small"
                        onClick={cancel} sx={{ ml: "auto" }}>
                        Eliminar
                    </CommonButton>
                    <CommonButton actionType='FILTER' color="secondary" variant='outlined' size="small"
                        type="submit" form={formId} sx={{ ml: "auto" }}>
                        Aplicar
                    </CommonButton>
                </ButtonGroup>
            </Stack>
            <form id={formId} onSubmit={handleSubmit(submit)}>
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
                    {
                        filterOptions.map(op => {
                            return op.options ?
                                <ControlledAutocomplete control={control} name={op.value} label={op.label} key={op.value}
                                    options={op.options} getOptionKey={o => o.value} getOptionLabel={o => o.label}
                                    returnField="value" size="small" />
                                :
                                <RegisteredTextInput register={register} name={op.value} label={op.label} key={op.value} />
                        })
                    }
                </Grid>
            </form>
        </GenericPaper>
    )
}
