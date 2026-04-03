import { useEffect, useMemo, useState } from 'react'
import type { LeadField } from '../../types/leadFields'
import { ControlledCheckbox, ControlledNumber } from '../common/forms/CustomInputs'
import { ControlledAutocomplete } from '../common/forms/CustomMultipleInputs'
import { LeadFormBool, LeadFormMoney, LeadFormNumber, LeadFormRating, LeadFormText } from './LeadFormFieldTypes'
import { FormErrorMessage } from '../../styledComponents/styledMUIFormComponents'
import type { DictionaryItem, LeadFilter, LeadListParams } from '../../types/common'
import { getLeadFields } from '../leadFields/leadFieldServices'
import { getDictionaries, setFormErrors } from '../../generalService'
import { dictOperatorsMock } from '../../mocks/operators'
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type Path, type UseFieldArrayRemove, type UseFormRegister } from 'react-hook-form'
import { alpha, Button, Divider, Grid, Typography, Stack, ButtonGroup, useColorScheme, useTheme } from '@mui/material'
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

    const defaultValues = useMemo<LeadListFilters>(() => ({
        headers: {
            only_active: filters?.headers?.only_active,
            page_size: filters?.headers?.page_size,
        },
        filters: filters?.filters ?? []
    }), [filters])

    const { control, register, handleSubmit, formState: { errors }, setError } = useForm<LeadListFilters>({ defaultValues })

    const { append, remove, fields } = useFieldArray({ control, name: "filters" })

    const onSubmit = (data: LeadListFilters) => {
        const formattedData = {
            ...data,
            filters: data.filters.map(item => {
                let newValue
                if (typeof item.value === "boolean" && item.value) newValue = 1
                if (typeof item.value === "boolean" && !item.value) newValue = 0
                if (typeof item.value !== "boolean") newValue = item.value
                return { ...item, value: newValue }
            }) as LeadFilter[]
        }
        applyFilters(formattedData).catch(e => setFormErrors(e, setError,
            (e) => e.map(error => setError(`root`, { message: error.message }))
        ))
    }

    return (
        <Stack spacing="1.5rem">
            <Typography variant="h2">Filtros de Búsqueda</Typography>
            <form onSubmit={handleSubmit(onSubmit)} >
                <Grid container direction="column" spacing="1rem">
                    <Grid container size="grow" alignItems="center" spacing=".5rem">
                        <Grid size="grow" minWidth="10rem">
                            <ControlledNumber control={control} size="small" name="headers.page_size" label="Items por página" min={5} step={5}
                                errorMessage={errors.headers?.page_size?.message} />
                        </Grid>
                        <Grid size="grow" minWidth="18rem">
                            <ControlledCheckbox control={control} name="headers.only_active" label="Mostrar sólo Leads habilitados"
                                errorMessage={errors.headers?.only_active?.message} />
                        </Grid>
                    </Grid>
                    <Divider />
                    {!!campaignId &&
                        <>
                            <Typography variant="h4">Filtros por Campo</Typography>
                            <Stack spacing=".5rem" direction="column">
                                {fields.map((filter, idx) => (
                                    <LeadFiltersItem key={filter.id} idx={idx} control={control} register={register} leadFields={leadFields}
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
                                <Button variant="outlined" color="primary" onClick={() => append({})}>
                                    Agregar Filtro
                                </Button>
                            }
                            <Button variant="contained" color="primary" type='submit'>
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
    register: UseFormRegister<LeadListFilters>,
    errors: FieldErrors<LeadListParams & LeadListFilters>,
    remove: UseFieldArrayRemove
}

export const LeadFiltersItem = ({ idx, leadFields, control, register, errors, remove }: LeadFiltersItemProps) => {

    const { systemMode } = useColorScheme()
    const theme = useTheme()

    const selectedFieldId = useWatch({ name: `filters.${idx}.field_id`, control })
    const selectedField = useMemo(() => leadFields.find(i => i.id === selectedFieldId)
        , [leadFields, selectedFieldId])

    const operators = dictOperatorsMock

    const filteredOperators = useMemo(() => {
        if (!selectedField) return []
        switch (selectedField?.field_type_code) {
            case "BOOL": {
                return operators.filter(op => op.type.includes("bool"))
            }
            case "DATE": case "DATE_TIME": {
                return operators.filter(op => op.type.includes("date"))
            }
            case "NUMBER": case "INT": case "RATING": case "MONEY": {
                return operators.filter(op => op.type.includes("number"))
            }
            default: return operators.filter(op => op.type.includes("string"))
        }
    }, [selectedField, operators])

    return (
        <Grid container direction="row" spacing="1rem" overflow="hidden"
            border={`1px solid ${alpha(theme.palette.contrast.light, .5)}`} borderRadius=".5rem">
            <Grid container size="grow" spacing=".5rem" direction="column" padding="0 1rem .5rem 1rem">
                <Typography variant="h5">Filtro N° {idx + 1}</Typography>
                <Grid container direction="row" spacing=".5rem" alignItems="center">
                    <Grid spacing=".5rem" size="grow" minWidth="12rem">
                        <ControlledAutocomplete control={control} name={`filters.${idx}.field_id`} options={leadFields}
                            getOptionKey={option => `${option.id}`} getOptionLabel={option => `${option.name}`} returnField="id"
                            label="Campo a Filtrar" size="small"
                            errorMessage={errors.filters?.[idx]?.field_id?.message} />
                    </Grid>
                    {selectedFieldId &&
                        <>
                            <Grid spacing=".5rem" size={3} minWidth="10rem">
                                <ControlledAutocomplete control={control} name={`filters.${idx}.operator`} options={filteredOperators}
                                    getOptionKey={option => option.code} getOptionLabel={option => option.label} returnField="code"
                                    label="Operación" size="small"
                                    errorMessage={errors.filters?.[idx]?.operator?.message} />
                            </Grid>
                            <Grid spacing=".5rem" size="grow" minWidth="20rem">
                                <LeadFormFieldType register={register} control={control} name={`filters.${idx}.value`} label="Valor de Comparación"
                                    errorMessage={errors.filters?.[idx]?.value?.message} leadField={selectedField} />
                            </Grid>
                        </>
                    }
                </Grid>
            </Grid>
            <Button onClick={() => remove(idx)} sx={{
                backgroundColor: systemMode === "light" ? alpha(theme.palette.error.light, .3) : alpha(theme.palette.error.darker, .2),
                color: systemMode === "light" ? theme.palette.error.darker : theme.palette.error.light,
                borderRadius: 0,
                minWidth: 0,
                padding: "1rem",
                "&:hover": {
                    backgroundColor: systemMode === "light" ? alpha(theme.palette.error.light, .4) : alpha(theme.palette.error.darker, .3)
                }
            }}>
                <CloseIcon />
            </Button>
        </Grid>
    )
}
interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadListFilters>,
    control: Control<LeadListFilters>,
    name: Path<LeadListFilters>,
    label: string,
    leadField?: LeadField,
    errorMessage?: string
}

const LeadFormFieldType = ({ register, control, name, label, leadField, errorMessage }: LeadFormFieldTypeProps) => {
    if (!leadField) return
    switch (leadField.field_type_code) {
        case "DATE":
            return (<LeadFormText label={label} name={name} register={register} type="date" size="small"
                errorMessage={errorMessage} />)
        case "DATE_TIME":
            return (<LeadFormText label={label} name={name} register={register} type="datetime-local" size="small"
                errorMessage={errorMessage} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={label} name={name} control={control} size="small"
                errorMessage={errorMessage} />)
        case "RATING":
            return (<LeadFormRating label={label} field_subtype_code={leadField.field_subtype_code!} name={name} control={control} size="small"
                errorMessage={errorMessage} />)
        case "MONEY":
            return (<LeadFormMoney label={label} name={name} register={register} size="small"
                errorMessage={errorMessage} />)
        case "BOOL":
            return (<LeadFormBool label={label} name={name} control={control} errorMessage={errorMessage} size="small" />)
        default:
            return <LeadFormText label={label} name={name} register={register} size="small"
                errorMessage={errorMessage} />
    }
}