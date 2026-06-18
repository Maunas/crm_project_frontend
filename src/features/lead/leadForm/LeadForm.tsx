/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react"
import { LeadFormAddress, LeadFormBool, LeadFormCheckbox, LeadFormFile, LeadFormMoney, LeadFormNumber, LeadFormPassword, LeadFormRating, LeadFormRelatedLead, LeadFormSelector, LeadFormText } from "../shared/LeadFormFields"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { LeadField, LeadFieldValue } from "src/types/leadFields"
import type { Lead, LeadPost, LeadPostValue } from "src/types/leads"
import type { NomenclatorItem } from "src/types/nomenclators"
import { getLeads } from "../leadService"
import { getNomenclatorItems } from "src/features/nomenclators/nomenclatorService"
import { getLeadFields } from "src/features/leadFields/leadFieldServices"
import { createFormDataFromLead, setLeadFormErrors, updateSelectorOptions } from "../leadUtils"
import { getListField } from "src/utils/lists"
import { useFieldArray, useForm, type Control, type Path, type UseFormRegister } from "react-hook-form"
import { Grid, ButtonGroup, Stack, Paper, Typography, Divider } from "@mui/material"

export interface LeadPostFormValues extends LeadPostValue {
    fieldData: LeadField
}
export interface LeadPostForm extends LeadPost {
    values: LeadPostFormValues[]
}

interface LeadFormProps {
    existingValues?: LeadFieldValue[],
    existingLeadFields?: LeadField[],
    campaignId?: number,
    onSubmit: (data: FormData) => Promise<void>,
    submitBtnLabel?: string,
    onCancel?: () => void,
    setCampaignError?: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const LeadForm = ({ existingValues, existingLeadFields, campaignId, onSubmit, submitBtnLabel = "Guardar", onCancel, setCampaignError }: LeadFormProps) => {

    const defaultValues = useMemo(() => ({
        campaign_id: campaignId,
        values: []
    }), [campaignId])

    const { register, control, handleSubmit, setError, reset, formState: { errors } } = useForm<LeadPostForm>({ defaultValues })

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, reset])

    const { fields, replace } = useFieldArray({ name: "values", control })

    // Agrupamiento por sección
    const groupedFields = useMemo(() => {
        const groups: Record<string, typeof fields> = {};
        fields.forEach((field) => {
            // Usamos el ID de la sección como clave, o "Sin categoría" si no tiene
            const sectionName = field.fieldData.lead_field_section_id?.toString() || "Información General";
            if (!groups[sectionName]) groups[sectionName] = [];
            groups[sectionName].push(field);
        });
        return groups;
    }, [fields]);

    const submit = (data: LeadPostForm) => {
        onSubmit(createFormDataFromLead(data)).catch(e => setLeadFormErrors(fields, e, setError))
    }

    // ... (useEffect de carga de campos y selectores igual que tenías)
    const [leadFields, setLeadFields] = useState<LeadField[]>(existingLeadFields ?? [])
    const [relatedLeads, setRelatedLeads] = useState<Map<number, Lead[]>>(new Map())
    const [selectors, setSelectors] = useState<Map<number, NomenclatorItem[]>>(new Map())

    useEffect(() => {
        if (campaignId == null) return
        if (existingLeadFields) { setLeadFields(existingLeadFields); return }
        getLeadFields({ only_active: true, campaign_id: campaignId, "page_size": 0 }).then(res =>
            setLeadFields(res.items.sort((a, b) => a.order - b.order))
        )
    }, [campaignId, existingLeadFields])

    useEffect(() => {
        if (existingValues) {
            replace(existingValues.filter(v => v.field.field_type_code !== "CALCULATED" && v.field.is_visible).map(fv => ({ field_id: fv.field_id, fieldData: fv.field, value: fv.value })))
        } else {
            replace(leadFields?.filter(f => f.field_type_code !== "CALCULATED" && f.is_visible).map(f => ({ field_id: f.id, fieldData: f })))
        }
    }, [replace, leadFields, existingValues])

    useEffect(() => {
        updateSelectorOptions(leadFields, "related_campaign_id", relatedLeads, ["LEAD"], (id) => getLeads({ only_active: true, campaign_id: id, page_size: 0 }).then(res => res.items)).then(setRelatedLeads)
        updateSelectorOptions(leadFields, "nomenclator_id", selectors, ["SELECTOR", "CHECKBOX"], (id) => getNomenclatorItems({ only_active: true, nomenclator_id: id, page_size: 0 }).then(res => res.items)).then(setSelectors)
    }, [leadFields])

    return (
        <form onSubmit={handleSubmit(submit)}>
            <input type="text" {...register("campaign_id", { setValueAs: v => (v === "" || !v) ? null : Number(v) })} hidden />
            <Stack spacing={4}>
                {Object.entries(groupedFields).map(([sectionName, sectionFields]) => (
                    <Paper key={sectionName} elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                            {sectionName}
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            {sectionFields.map((field) => {
                                // Buscamos el índice real del campo para el register
                                const idx = fields.findIndex(f => f.id === field.id);
                                return (
                                    <Grid item xs={12} md={6} key={field.id}>
                                        <LeadFormFieldType 
                                            register={register} 
                                            name={`values.${idx}.value`} 
                                            control={control}
                                            leadField={field.fieldData} 
                                            relatedLeads={relatedLeads.get(field.fieldData.related_campaign_id ?? -1)}
                                            selectors={selectors.get(field.fieldData.nomenclator_id ?? -1)}
                                            errorMessage={errors?.values?.[idx]?.value?.message} 
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                ))}

                {errors.root && <FormErrorMessage>{errors.root.message}</FormErrorMessage>}

                <ButtonGroup sx={{ alignSelf: "end" }}>
                    {onCancel && <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel} >Cancelar</CommonButton>}
                    {campaignId && <CommonButton actionType={existingValues ? "MODIFY" : "CREATE"} type="submit" variant="contained">{submitBtnLabel}</CommonButton>}
                </ButtonGroup>
            </Stack>
        </form>
    )
}

/***************************************** Mostrar un campo respecto al tipo de dato. ******************************************* */
interface LeadFormFieldTypeProps {
    register: UseFormRegister<LeadPostForm>,
    control: Control<LeadPostForm>,
    name: Path<LeadPostForm>,
    leadField: LeadField,
    relatedLeads?: Lead[],
    selectors?: NomenclatorItem[],
    errorMessage?: string
}

const LeadFormFieldType = ({ register, control, name, leadField, relatedLeads, selectors, errorMessage }: LeadFormFieldTypeProps) => {

    const label = leadField.name ?? undefined

    switch (leadField.field_type_code) {
        case "LEAD":
            return (<LeadFormRelatedLead label={label} name={name} control={control} options={relatedLeads}
                leadField={leadField} required={leadField.required} errorMessage={errorMessage} />)
        case "SELECTOR":
            return (<LeadFormSelector label={label} name={name} control={control} options={selectors}
                leadField={leadField} required={leadField.required} errorMessage={errorMessage} />)
        case "CHECKBOX":
            return (<LeadFormCheckbox label={label} name={name} control={control} options={selectors}
                leadField={leadField} returnField="id" required={leadField.required} errorMessage={errorMessage} />)
        case "URL":
            return (<LeadFormText label={label} name={name} register={register} type="url"
                required={leadField.required} errorMessage={errorMessage} />)
        case "ADDRESS":
            return (<LeadFormAddress label={label} name={name} register={register} leadField={leadField}
                required={leadField.required} errorMessage={errorMessage} />)
        case "PHONE":
            return (<LeadFormText label={label} name={name} register={register} type="tel"
                required={leadField.required} errorMessage={errorMessage} />)
        case "EMAIL":
            return (<LeadFormText label={label} name={name} register={register} type="email"
                required={leadField.required} errorMessage={errorMessage} />)
        case "DATE":
            return (<LeadFormText label={label} name={name} register={register} type="date"
                required={leadField.required} errorMessage={errorMessage} />)
        case "DATE_TIME":
            return (<LeadFormText label={label} name={name} register={register} type="datetime-local"
                required={leadField.required} errorMessage={errorMessage} />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber label={label} name={name} control={control}
                required={leadField.required} errorMessage={errorMessage} />)
        case "RICH_TEXT":
            return (<LeadFormText label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} multiline />)
        case "RATING":
            return (<LeadFormRating label={label} field_subtype_code={leadField.field_subtype_code!} name={name} control={control}
                required={leadField.required} errorMessage={errorMessage} size="small" />)
        case "MONEY":
            return (<LeadFormMoney label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />)
        case "PASSWORD":
            return (<LeadFormPassword label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />)
        case "BOOL":
            return (<LeadFormBool label={label} name={name} control={control} errorMessage={errorMessage} />)
        case "FILE":
            return (<LeadFormFile label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />)
        default:
            return <LeadFormText label={label} name={name} register={register}
                required={leadField.required} errorMessage={errorMessage} />
    }
}