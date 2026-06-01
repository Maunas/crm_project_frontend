import { memo, useEffect, useMemo, useState } from 'react'
import { FilterItem } from './LeadFilterItem'
import { ControlledCheckbox, ControlledNumber } from 'shared/ui/forms/CustomInputs'
import { ControlledAutocomplete } from 'shared/ui/forms/CustomMultipleInputs'
import { FormErrorMessage } from 'shared/ui/forms/FormFeedback'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { useLoading } from 'src/hooks/useLoading'
import type { LeadField } from 'src/types/leadFields'
import type { LeadFilter, LeadListParams } from 'src/types/shared'
import { getLeadFields } from 'src/features/leadFields/leadFieldServices'
import { setFormErrors } from 'src/utils/forms'
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type Path, type UseFieldArrayRemove, type UseFormRegister } from 'react-hook-form'
import { Button, Divider, Grid, Typography, Stack, ButtonGroup, Fade, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { LeadFormRelatedLead, LeadFormSelector } from '../shared/LeadFormMultipleFields'
import { LeadFormBool, LeadFormDate, LeadFormFile, LeadFormNumber, LeadFormText } from '../shared/LeadFormFields'
import { OPERATORS_BY_LEAD_TYPE } from '../leadUtils'

interface LeadListFilters {
    filters: LeadFilter[],
    headers: LeadListParams
}

interface LeadFiltersProps {
    campaignId: number,
    filters: LeadListParams & LeadListFilters,
    applyFilters: (data: LeadListParams & LeadListFilters) => Promise<void>,
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

    const onSubmit = async (data: LeadListFilters) => {
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
        return applyFilters(formattedData)
            .catch(e => setFormErrors(e, setError,
                (e) => e.map(error => setError(`root`, { message: error.message }))
            ))
    }

    const { loading, fnWithLoading: applyFilterLoad } = useLoading(onSubmit)

    const pageSize = useWatch({ control, name: "headers.page_size" })

    return (
        <Stack spacing={3}>
            <Typography variant="h2">Filtros de Búsqueda</Typography>
            <form onSubmit={handleSubmit(applyFilterLoad)} >
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
                    {Boolean(campaignId) &&
                        <>
                            <Divider />
                            <Typography variant="h3">Filtros por Campo</Typography>
                            <Stack spacing={1}>
                                {fields.map((filter, idx) => (
                                    <LeadFiltersItem key={filter.id} idx={idx} control={control} register={register} leadFields={leadFields}
                                        errors={errors} remove={remove} disabled={loading} />
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
                                <CommonButton actionType='CLOSE' variant="outlined" color="primary" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </CommonButton>
                            }
                            {!!campaignId &&
                                <CommonButton actionType='CREATE' variant="outlined" color="secondary" onClick={() => append({})} disabled={loading}>
                                    Agregar Filtro
                                </CommonButton>
                            }
                            <CommonButton actionType='FILTER' variant="contained" color="primary" type='submit' loading={loading}>
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
    remove: UseFieldArrayRemove,
    disabled?: boolean
}

export const LeadFiltersItem = memo(({ idx, leadFields, control, register, errors, remove, disabled = false }: LeadFiltersItemProps) => {

    const filteredFields = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return []
        return leadFields.filter(field => !(["LEAD", "SELECTOR", "FILE", "CALCULATED"].includes(field.field_type_code)) && ([]))
    }, [leadFields])

    const selectedFieldId = useWatch({ name: `filters.${idx}.field_id`, control })
    const selectedField = useMemo(() => filteredFields.find(i => i.id === selectedFieldId)
        , [filteredFields, selectedFieldId])

    const filteredOperators = useMemo(() => {
        if (!selectedField) return []
        return OPERATORS_BY_LEAD_TYPE[(selectedField.field_subtype_code ?? "CALCULATED") as keyof typeof OPERATORS_BY_LEAD_TYPE]
    }, [selectedField])

    return (
        <FilterItem direction="row" spacing={2} >
            <Stack spacing={1} sx={{ py: 1, pl: 2, flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Filtro N° {idx + 1}</Typography>
                <Stack direction="row" spacing={.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ flexGrow: 2, minWidth: "12rem" }}>
                        <ControlledAutocomplete control={control} name={`filters.${idx}.field_id`} options={filteredFields}
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
                                <LeadFormFieldType register={register} control={control} name={`filters.${idx}.value`}
                                    errorMessage={errors.filters?.[idx]?.value?.message} leadField={selectedField} />
                            </Box>
                        </>
                    }
                </Stack>
            </Stack>
            <Button className='delete-filter-btn' onClick={() => remove(idx)} disabled={disabled}>
                <CloseIcon />
            </Button>
        </FilterItem >
    )
})

interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadListFilters>,
    control: Control<LeadListFilters>,
    name: Path<LeadListFilters>,
    leadField?: LeadField,
    errorMessage?: string
}

const LEAD_FORM_LABEL = "Valor de Comparación"

const LeadFormFieldType = memo(({ register, control, name, leadField, errorMessage }: LeadFormFieldTypeProps) => {
    if (!leadField) return

    const { field_type_code: typeCode, required } = { ...leadField }
    const subtypeCode = leadField.field_subtype_code ?? undefined



    switch (typeCode) {
        case "LEAD":
            return (<LeadFormRelatedLead control={control} name={name} options={[]} size="small"
                label={LEAD_FORM_LABEL} required={required} errorMessage={errorMessage} />)
        case "FILE":
            return (<LeadFormFile register={register} name={name} required={required} size="small" label={LEAD_FORM_LABEL}
                errorMessage={errorMessage} />)
        case "SELECTOR":
            return (<LeadFormSelector control={control} name={name} options={[]} size="small"
                label={LEAD_FORM_LABEL} subtype={subtypeCode} required={required} errorMessage={errorMessage} />)
        case "BOOL":
            return (<LeadFormBool control={control} name={name} label={LEAD_FORM_LABEL} errorMessage={errorMessage} size="small" />)
        case "DATE_TIME": case "DATE":
            return (<LeadFormDate register={register} name={name} label={LEAD_FORM_LABEL} size="small"
                subtype={subtypeCode} required={leadField.required} errorMessage={errorMessage} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber control={control} name={name} label={LEAD_FORM_LABEL} size="small"
                subtype={subtypeCode} required={leadField.required} errorMessage={errorMessage} />)
        case "STRING":
            return <LeadFormText register={register} name={name} label={LEAD_FORM_LABEL} size="small"
                required={leadField.required} errorMessage={errorMessage} subtype={subtypeCode} />
    }
})