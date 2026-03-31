import { alpha, Button, Divider, Grid, Typography, Stack, ButtonGroup, useColorScheme, useTheme } from '@mui/material'
import { ControlledCheckbox, ControlledNumber, ControlledTextInput } from '../common/forms/CustomInputs'
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFieldArrayRemove } from 'react-hook-form'
import type { DictionaryItem, LeadFilter, LeadListParams } from '../../types/common'
import { useEffect, useMemo, useState } from 'react'
import { getLeadFields } from '../leadFields/leadFieldServices'
import { getDictionaries, setFormErrors } from '../../generalService'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { FormErrorMessage } from '../../styledComponents/styledMUIFormComponents'
import type { LeadField } from '../../types/leadFields'
import CloseIcon from '@mui/icons-material/Close';

interface LeadListFilters {
    filters: LeadFilter[],
    headers: LeadListParams
}

interface LeadFiltersProps {
    campaignId: number,
    filters: LeadListParams & LeadListFilters,
    applyFilters: (data: LeadListParams & LeadListFilters) => Promise<void>
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

    const { control, handleSubmit, formState: { errors }, setError } = useForm<LeadListFilters>({ defaultValues })

    const { append, remove, fields } = useFieldArray({ control, name: "filters" })

    const onSubmit = (data: LeadListFilters) => {
        applyFilters(data).catch(e => setFormErrors(e, setError,
            (e) => e.map(error => setError(`root`, { message: error.message }))
        ))
    }

    return (
        <Stack spacing="1.5rem">
            <Typography variant="h2">Filtros de Búsqueda</Typography>
            <form onSubmit={handleSubmit(onSubmit)} >
                <Grid container direction="column" spacing="1rem">
                    <Grid container size="grow" spacing=".5rem">
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
        </Stack>
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

    const { systemMode } = useColorScheme()
    const theme = useTheme()

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
            <Button onClick={() => remove(idx)} sx={{
                backgroundColor: systemMode === "light" ? alpha(theme.palette.error.light, .3) : alpha(theme.palette.error.darker, .2),
                color: systemMode === "light" ? theme.palette.error.darker : theme.palette.error.light,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                "&:hover": {
                    backgroundColor: systemMode === "light" ? alpha(theme.palette.error.light, .4) : alpha(theme.palette.error.darker, .3)
                }
            }}>
                <CloseIcon/>
            </Button>
        </Grid>
    )
}
