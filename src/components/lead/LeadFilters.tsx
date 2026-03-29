import { alpha, Button, Divider, Grid, Typography, IconButton, Stack, ButtonGroup } from '@mui/material'
import { ControlledCheckbox, ControlledNumber, ControlledTextInput } from '../common/forms/CustomInputs'
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFieldArrayRemove } from 'react-hook-form'
import type { DictionaryItem, LeadFilter, LeadListParams } from '../../types/common'
import { useEffect, useMemo, useState } from 'react'
import { getLeadFields } from '../leadFields/leadFieldServices'
import { getDictionaries } from '../../generalService'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { FormErrorMessage } from '../../styledComponents/styledMUIFormComponents'
import type { LeadField } from '../../types/leadFields'
import theme from '../../styledComponents/theme'
import CloseIcon from '@mui/icons-material/Close';

interface LeadListFilters {
    filters: LeadFilter[],
    headers: LeadListParams
}

interface LeadFiltersProps {
    campaignId: number,
    filters: LeadListParams & LeadListFilters,
    applyFilters: (data: LeadListParams & LeadListFilters) => void
}

export const LeadFilters = ({ campaignId, filters, applyFilters }: LeadFiltersProps) => {

    const [leadFields, setLeadFields] = useState<LeadField[]>([])
    const [operators, setOperators] = useState<DictionaryItem[]>([])

    useEffect(() => {
        getDictionaries("lead_search_operators")
            .then(res => setOperators(res.lead_search_operators ?? []))
    }, [])

    useEffect(() => {
        getLeadFields({ campaign_id: campaignId, only_active: true, page_size: 0 })
            .then(res => setLeadFields(res.items))
    }, [campaignId])

    const defaultValues = useMemo(() => ({
        headers: {
            only_active: filters?.headers?.only_active,
            page_size: filters?.headers?.page_size,
        },
        leadFilters: filters?.filters
    }), [filters])

    const { control, handleSubmit, formState: { errors } } = useForm<LeadListFilters>({ defaultValues })

    const { append, remove, fields } = useFieldArray({ control, name: "filters" })

    return (
        <form onSubmit={handleSubmit(applyFilters)} >
            <Grid container direction="column" spacing="1rem">
                <Grid container size="grow" spacing={2}>
                    <Grid size="grow" minWidth="20rem">
                        <ControlledCheckbox control={control} name="headers.only_active" label="Mostrar sólo Leads habilitados"
                            errorMessage={errors.headers?.only_active?.message} />
                    </Grid>
                    <Grid size="grow" minWidth="20rem">
                        <ControlledNumber control={control} name="headers.page_size" label="Items por página" min={5} step={5}
                            errorMessage={errors.headers?.page_size?.message} />
                    </Grid>
                </Grid>
                <Divider />
                {!!campaignId &&
                    <>
                        <Typography variant="h4">Filtros por Campo</Typography>

                        <Stack spacing=".5rem" direction="column">
                            {fields.map((filter, idx) => (
                                <LeadFiltersItem key={filter.id} idx={idx} control={control} leadFields={leadFields}
                                    operators={operators} errors={errors} remove={remove} />
                            ))}
                        </Stack>
                    </>
                }
                {errors.root && (
                    <FormErrorMessage>{errors.root.message}</FormErrorMessage>
                )}
                <Grid alignSelf="end">
                    <ButtonGroup >
                        {!!campaignId &&
                            <Button variant="outlined" color="secondary" onClick={() => append({})}>
                                Agregar Filtro
                            </Button>
                        }
                        <Button variant="contained" color="secondary" type='submit'>
                            Aplicar Filtros
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        </form >
    )
}

interface LeadFiltersItemProps {
    idx: number,
    leadFields: LeadField[],
    operators: DictionaryItem[],
    control: Control<LeadListParams & LeadListFilters, unknown, LeadListParams & LeadListFilters>,
    errors: FieldErrors<LeadListParams & LeadListFilters>,
    remove: UseFieldArrayRemove
}


export const LeadFiltersItem = ({ idx, leadFields, operators, control, errors, remove }: LeadFiltersItemProps) => {

    const selLeadFieldId = useWatch({ control, name: `filters.${idx}.field_id` })

    const selLeadField = useMemo(() => leadFields.find(i => i.id === selLeadFieldId)
        , [selLeadFieldId, leadFields])

    return (
        <Grid container direction="row" spacing="1rem" overflow="hidden"
            border={`1px solid ${alpha(theme.palette.contrast.light, .5)}`} borderRadius=".5rem">
            <Grid container size="grow" spacing=".5rem" direction="column" padding="0 1rem .5rem 1rem">
                <Typography variant="h5">Filtro N° {idx + 1}</Typography>
                <Grid container direction="row" spacing=".5rem">
                    <Grid spacing=".5rem" size={4}>
                        <ControlledAutocomplete control={control} name={`filters.${idx}.field_id`} options={leadFields}
                            getOptionKey={option => `${option.id}`} getOptionLabel={option => `${option.name}`} returnField="id"
                            label="Campo a Filtrar" size="small"
                            errorMessage={errors.filters?.[idx]?.field_id?.message} />
                    </Grid>
                    <Grid spacing=".5rem" size={3}>

                        <ControlledAutocomplete control={control} name={`filters.${idx}.operator`} options={operators}
                            getOptionKey={option => option.code} getOptionLabel={option => option.label} returnField="code"
                            label="Operación" size="small"
                            errorMessage={errors.filters?.[idx]?.operator?.message} />
                    </Grid>
                    <Grid spacing=".5rem" size={5}>
                        <ControlledTextInput control={control} name={`filters.${idx}.value`} label="Valor de Comparación"
                            errorMessage={errors.filters?.[idx]?.value?.message} size="small" />
                    </Grid>
                </Grid>
            </Grid>
            <Grid component={Button} container alignItems="center" onClick={() => remove(idx)} sx={{
                backgroundColor: alpha(theme.palette.error.light, .5),
                borderRadius:"0",
                color: theme.palette.error.dark,
                "&:hover": {
                    backgroundColor: alpha(theme.palette.error.light, .7)
                }
            }}>
                <CloseIcon />
            </Grid>
        </Grid>
    )
}
