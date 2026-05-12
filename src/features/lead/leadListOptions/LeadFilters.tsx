import { memo, useEffect, useMemo, useState } from 'react'
import { FilterItem } from './LeadFilterItem'
import { LeadFormBool, LeadFormMoney, LeadFormNumber, LeadFormRating, LeadFormText } from '../shared/LeadFormFields'
import { ControlledCheckbox, ControlledNumber } from 'src/components/ui/forms/CustomInputs'
import { ControlledAutocomplete } from 'src/components/ui/forms/CustomMultipleInputs'
import { FormErrorMessage } from 'src/components/ui/forms/FormFeedback'
import CommonButton from 'src/components/ui/buttons/CommonButton'
import type { LeadField } from 'src/types/leadFields'
import type { LeadFilter, LeadListParams } from 'src/types/shared'
import { getLeadFields } from 'src/features/leadFields/leadFieldServices'
import { setFormErrors } from 'src/utils/forms'
import { dictOperatorsMock } from 'src/mocks/operators'
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type Path, type UseFieldArrayRemove, type UseFormRegister } from 'react-hook-form'
import { Button, Divider, Grid, Typography, Stack, ButtonGroup, Fade, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

interface LeadListFilters {
    filters: LeadFilter[],
    headers: LeadListParams
}

interface LeadFiltersProps {
    campaignId: number,
    filters: LeadListParams & LeadListFilters,
    applyFilters: (data: LeadListParams & LeadListFilters) => Promise<void> | null | undefined,
    onClose: () => void
}

export const LeadFilters = memo(({ campaignId, filters, applyFilters, onClose }: LeadFiltersProps) => {

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

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
        applyFilters(formattedData)?.catch(e => setFormErrors(e, setError,
            (e) => e.map(error => setError(`root`, { message: error.message }))
        ))
    }

    const pageSize = useWatch({ control, name: "headers.page_size" })

    return (
        <Stack spacing={3}>
            <Typography variant="h2">Filtros de Búsqueda</Typography>
            <form onSubmit={handleSubmit(onSubmit)} >
                <Stack spacing={2}>
                    <Stack spacing={.5}>
                        <Grid container sx={{ alignItems: "center", flexWrap: "wrap" }} spacing={1}>
                            <Grid size="grow" spacing={.5} sx={{ minWidth: "10rem" }}>
                                <ControlledNumber control={control} size="small" name="headers.page_size" label="Items por página" min={5} step={5}
                                    errorMessage={errors.headers?.page_size?.message} />
                            </Grid>
                            <Grid size="grow" sx={{ minWidth: "18rem" }}>
                                <ControlledCheckbox control={control} name="headers.only_active" label="Mostrar sólo Leads habilitados"
                                    errorMessage={errors.headers?.only_active?.message} />
                            </Grid>
                        </Grid>
                        <Fade in={(pageSize ?? 0) >= 20} >
                            <Typography variant="subtitle2" color="warning" sx={{ fontWeight: 600 }}>
                                Advertencia: Muchas filas pueden ralentizar la carga.
                            </Typography>
                        </Fade>
                    </Stack>
                    {!!campaignId &&
                        <>
                            <Divider />
                            <Typography variant="h3">Filtros por Campo</Typography>
                            <Stack spacing={1}>
                                {fields.map((filter, idx) => (
                                    <LeadFiltersItem key={filter.id} idx={idx} control={control} register={register} leadFields={leadFields}
                                        errors={errors} remove={remove} />
                                ))}
                            </Stack>
                        </>
                    }
                    {errors.root && (
                        <FormErrorMessage>{errors.root.message}</FormErrorMessage>
                    )}
                    <Grid sx={{ alignSelf: "end" }}>
                        <ButtonGroup >
                            {!!campaignId &&
                                <CommonButton actionType='CLOSE' variant="outlined" color="primary" onClick={onClose}>
                                    Cancelar
                                </CommonButton>
                            }
                            {!!campaignId &&
                                <CommonButton actionType='CREATE' variant="outlined" color="secondary" onClick={() => append({})}>
                                    Agregar Filtro
                                </CommonButton>
                            }
                            <CommonButton actionType='FILTER' variant="contained" color="primary" type='submit'>
                                Aplicar Filtros
                            </CommonButton>
                        </ButtonGroup>
                    </Grid>
                </Stack>
            </form >
        </Stack>
    )
})

interface LeadFiltersItemProps {
    idx: number,
    leadFields: LeadField[],
    control: Control<LeadListFilters, unknown, LeadListFilters>,
    register: UseFormRegister<LeadListFilters>,
    errors: FieldErrors<LeadListParams & LeadListFilters>,
    remove: UseFieldArrayRemove
}

export const LeadFiltersItem = memo(({ idx, leadFields, control, register, errors, remove }: LeadFiltersItemProps) => {

    const selectedFieldId = useWatch({ name: `filters.${idx}.field_id`, control })
    const selectedField = useMemo(() => leadFields.find(i => i.id === selectedFieldId)
        , [leadFields, selectedFieldId])

    const operators = dictOperatorsMock

    const filteredOperators = useMemo(() => {
        if (!selectedField) return []
        return operators.filter(op => {
            switch (selectedField?.field_type_code) {
                case "CALCULATED": return true
                case "BOOL": {
                    return op.type.includes("bool")
                }
                case "DATE": case "DATE_TIME": {
                    return op.type.includes("date")
                }
                case "NUMBER": case "INT": case "RATING": case "MONEY": {
                    return op.type.includes("number")
                }
                default: return op.type.includes("string")
            }
        })
    }, [selectedField, operators])

    return (
        <FilterItem direction="row" spacing={2} >
            <Stack spacing={1} sx={{ py: 1, pl: 2, flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Filtro N° {idx + 1}</Typography>
                <Stack direction="row" spacing={.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ flexGrow: 2, minWidth: "12rem" }}>
                        <ControlledAutocomplete control={control} name={`filters.${idx}.field_id`} options={leadFields}
                            getOptionKey={option => `${option.id}`} getOptionLabel={option => `${option.name}`} returnField="id"
                            label="Campo a Filtrar" size="small"
                            errorMessage={errors.filters?.[idx]?.field_id?.message} />
                    </Box>
                    {selectedFieldId &&
                        <>
                            <Box sx={{ flexGrow: 1, minWidth: "10rem" }}>
                                <ControlledAutocomplete control={control} name={`filters.${idx}.operator`} options={filteredOperators}
                                    getOptionKey={option => option.code} getOptionLabel={option => option.label} returnField="code"
                                    label="Operación" size="small"
                                    errorMessage={errors.filters?.[idx]?.operator?.message} />
                            </Box>
                            <Box sx={{ flexGrow: 2, minWidth: "12rem" }}>
                                <LeadFormFieldType register={register} control={control} name={`filters.${idx}.value`} label="Valor de Comparación"
                                    errorMessage={errors.filters?.[idx]?.value?.message} leadField={selectedField} />
                            </Box>
                        </>
                    }
                </Stack>
            </Stack>
            <Button className='delete-filter-btn' onClick={() => remove(idx)}>
                <CloseIcon />
            </Button>
        </FilterItem >
    )
})

interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadListFilters>,
    control: Control<LeadListFilters>,
    name: Path<LeadListFilters>,
    label: string,
    leadField?: LeadField,
    errorMessage?: string
}

const LeadFormFieldType = memo(({ register, control, name, label, leadField, errorMessage }: LeadFormFieldTypeProps) => {
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
})