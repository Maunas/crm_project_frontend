import { useCallback, useEffect, useMemo, useState } from "react"
import { LeadFormBool, LeadFormDate, LeadFormFile, LeadFormNumber, LeadFormText } from "../shared/LeadFormFields"
import { LeadFormRelatedLead, LeadFormSelector } from "../shared/LeadFormMultipleFields"
import LoadingScreenWrapper from "shared/feedback/LoadingScreen"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { LeadField, LeadFieldValue } from "src/types/leadFields"
import type { Lead, LeadPost, LeadPostValue } from "src/types/leads"
import type { NomenclatorItem } from "src/types/nomenclators"
import { getLeads } from "../leadService"
import { getNomenclatorItems } from "features/nomenclators/nomenclatorService"
import { getLeadFields } from "features/leadFields/leadFieldServices"
import { createFormDataFromLead, setLeadFormErrors, updateSelectorOptions } from "../leadUtils"
import { getListField } from "src/utils/lists"
import { useFieldArray, useForm, type Control, type Path, type UseFormRegister } from "react-hook-form"
import { Grid, ButtonGroup, Stack, Typography, Divider } from "@mui/material"
import { getLeadFormFieldsBySections, orderFieldsBySections } from "src/features/leadFields/leadFieldUtils"

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

    /*
    // Agrupamiento por sección
    const groupedFields = useMemo(() => {
        const groups: Record<string, typeof fields> = {};
        fields.forEach((field) => {
            // Usamos el ID de la sección como clave, o "Sin categoría" si no tiene
            const sectionName = field.fieldData.lead_field_section.id?.toString() || "Información General";
            if (!groups[sectionName]) groups[sectionName] = [];
            groups[sectionName].push(field);
        });
        return groups;
    }, [fields]);
*/
    const submit = (data: LeadPostForm) => {
        return onSubmit(createFormDataFromLead(data))
            .catch(e => setLeadFormErrors(fields, e, setError))
    }

    const { loading: submitLoading, fnWithLoading: submitLoad } = useLoading(submit)

    //Setea el mensaje de error al selector, en el caso de createLead
    useEffect(() => {
        if (setCampaignError) { setCampaignError(errors?.campaign_id?.message) }
    }, [errors.campaign_id, setCampaignError])

    const [leadFields, setLeadFields] = useState<LeadField[]>(existingLeadFields ?? [])
    const [relatedLeads, setRelatedLeads] = useState<Map<number, Lead[]>>(new Map())
    const [selectors, setSelectors] = useState<Map<number, NomenclatorItem[]>>(new Map())

    //Cuando se cargan los leadFields, se formatean y ubican en fieldArray
    const loadFieldValues = useCallback((newLeadFields: LeadField[], existingValues?: LeadFieldValue[]) => {
        //Si ya hay valores, formatea los values para asignarlos al fieldArray. Asigna listas de ids a value.
        if (existingValues) {
            replace(
                orderFieldsBySections(existingValues.filter(value => value.field.field_type_code !== "CALCULATED" && value.field.is_visible))
                    .map(fieldValue => {
                        let value: unknown = fieldValue.value
                        //Si no hay valor, es selector o related_leads. Trae el id, o arreglo de ids
                        if (!value && fieldValue.nomenclator_items.length > 0) {
                            value = getListField(fieldValue.nomenclator_items, "id",
                                ["SELECTOR_MULTIPLE", "CHECKBOX_MULTIPLE"].includes(fieldValue.field.field_subtype_code!))
                        }
                        else if (!value && fieldValue.related_leads.length > 0) {
                            value = getListField(fieldValue.related_leads, "id", true)
                        }
                        return ({
                            field_id: fieldValue.field_id,
                            fieldData: fieldValue.field,
                            value: value
                        }) as LeadPostFormValues
                    })
            )
            //Si no hay valores, solo trae los datos de los leadFields.
        } else {
            replace(
                orderFieldsBySections(newLeadFields.filter(field => field.field_type_code !== "CALCULATED" && field.is_visible))
                    .map(field => ({
                        field_id: field.id,
                        fieldData: field
                    }) as LeadPostFormValues))
        }
    }, [replace])

    //Actualiza los leadFields respecto al campaignId seleccionado. Si ya hay existingLeadFields, no busca.
    const fetchLeadFields = useCallback(async (campaignId: number, existingLeadFields?: LeadField[], existingValues?: LeadFieldValue[]) => {
        if (campaignId == null) return
        if (existingLeadFields) {
            setLeadFields(existingLeadFields)
            loadFieldValues(existingLeadFields, existingValues)
            return
        }
        return getLeadFields({ only_active: true, campaign_id: campaignId, "page_size": 0 }).then(res => {
            const leadFields = res.items.sort((a, b) => a.order - b.order)
            setLeadFields(leadFields)
            loadFieldValues(leadFields, existingValues)
        })
    }, [loadFieldValues])

    const { loading: fieldsLoading, fnWithLoading: fetchFieldsLoad } = useLoading(fetchLeadFields)

    useEffect(() => {
        fetchFieldsLoad(campaignId, existingLeadFields, existingValues)
    }, [fetchFieldsLoad, campaignId, existingLeadFields, existingValues])

    useEffect(() => {
        updateSelectorOptions(leadFields, "related_campaign_id", relatedLeads, ["LEAD"],
            (related_campaign_id: number) => getLeads({ only_active: true, campaign_id: related_campaign_id, page_size: 0 }).then((res) => res.items))
            .then(map => setRelatedLeads(map)).catch(() => setError("root", { message: "No se ha podido obtener la lista de leads relacionados" }))
        updateSelectorOptions(leadFields, "nomenclator_id", selectors, ["SELECTOR", "CHECKBOX"],
            (nomenclator_id: number) => getNomenclatorItems({ only_active: true, nomenclator_id: nomenclator_id, page_size: 0 }).then((res) => res.items))
            .then(map => setSelectors(map)).catch(() => setError("root", { message: "No se ha podido obtener la lista del selector" }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadFields, setError])

    const fieldsBySection = useMemo(() => {
        return getLeadFormFieldsBySections(fields)
    }, [fields])

    return (
        <LoadingScreenWrapper loading={fieldsLoading}>
            <form onSubmit={handleSubmit(submitLoad)}>
                <input type="text" {...register("campaign_id", { setValueAs: value => (value === "" || !value) ? null : Number(value) })} hidden />
                <Stack spacing={3}>
                    {campaignId &&
                        fieldsBySection.map((section) => {
                            return <Stack spacing={1} key={`section-lead-${section.id}`}>
                                <Typography variant="h3">{section.name}</Typography>
                                <Divider />
                                <Grid container sx={{ gap: ".25rem .5rem " }}>
                                    {section.fields.map(sectField =>
                                        <Grid size="grow" sx={{ alignItems: "center", minWidth: "20rem" }} key={sectField.field.id}>
                                            <LeadFormFieldType register={register} control={control} name={`values.${sectField.globalIdx}.value`}
                                                leadField={sectField.field.fieldData}
                                                relatedLeads={relatedLeads.get(sectField.field?.fieldData?.related_campaign_id ?? -1)}
                                                selectors={selectors.get(sectField.field?.fieldData?.nomenclator_id ?? -1)}
                                                errorMessage={errors?.values?.[sectField.globalIdx]?.value?.message} />
                                        </Grid>
                                    )}
                                </Grid>
                            </Stack>
                        })

                    }
                    {errors.root &&
                        <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        {onCancel && <CommonButton actionType="CLOSE" variant="text" color="error" onClick={onCancel} disabled={submitLoading}>Cancelar</CommonButton>}
                        {campaignId &&
                            <CommonButton actionType={existingValues ? "MODIFY" : "CREATE"} loading={submitLoading}
                                type="submit" variant="contained">{submitBtnLabel}</CommonButton>}
                    </ButtonGroup>
                </Stack>
            </form>
        </LoadingScreenWrapper>
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

    const label = leadField.name
    const typeCode = leadField.field_type_code
    const subtypeCode = leadField.field_subtype_code ?? undefined
    const required = leadField.required

    switch (typeCode) {
        case "LEAD":
            return (<LeadFormRelatedLead control={control} name={name} options={relatedLeads}
                label={label} required={required} errorMessage={errorMessage} showAdornment />)
        case "FILE":
            return (<LeadFormFile register={register} name={name} label={label} required={required}
                errorMessage={errorMessage} showAdornment />)
        case "SELECTOR":
            return (<LeadFormSelector control={control} name={name} options={selectors}
                label={label} subtype={subtypeCode} required={required} errorMessage={errorMessage} showAdornment />)
        case "BOOL":
            return (<LeadFormBool control={control} name={name} label={label} errorMessage={errorMessage} />)
        case "DATE_TIME": case "DATE":
            return (<LeadFormDate register={register} name={name} label={label}
                subtype={subtypeCode} required={leadField.required} errorMessage={errorMessage} showAdornment />)
        case "NUMBER": case "INT":
            return (<LeadFormNumber control={control} name={name} label={label}
                subtype={subtypeCode} required={leadField.required} errorMessage={errorMessage} showAdornment />)
        case "STRING":
            return <LeadFormText register={register} name={name} label={label} subtype={subtypeCode}
                required={leadField.required} errorMessage={errorMessage} showAdornment />
    }
}