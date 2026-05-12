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
import { Grid, ButtonGroup, Stack } from "@mui/material"

//Para permitir mantener los datos de cada campo
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

    const submit = (data: LeadPostForm) => {
        onSubmit(createFormDataFromLead(data)).catch(e => setLeadFormErrors(fields, e, setError))
    }

    //Setea el mensaje de error al selector, en el caso de createLead
    useEffect(() => {
        if (setCampaignError) { setCampaignError(errors?.campaign_id?.message) }
    }, [errors.campaign_id, setCampaignError])

    const [leadFields, setLeadFields] = useState<LeadField[]>(existingLeadFields ?? [])

    //Actualiza los leadFields respecto al campaignId seleccionado. Si ya hay existingLeadFields, no busca.
    useEffect(() => {
        if (campaignId == null) return
        if (existingLeadFields) {
            setLeadFields(existingLeadFields)
            return
        }
        getLeadFields({ only_active: true, campaign_id: campaignId, "page_size": 0 }).then(res =>
            setLeadFields(res.items.sort((a, b) => a.order - b.order))
        )
    }, [campaignId, existingLeadFields])

    //Cuando se cargan los leadFields, se formatean y ubican en fieldArray
    useEffect(() => {
        //Si ya hay valores, formatea los values para asignarlos al fieldArray. Asigna listas de ids a value.
        if (existingValues) {
            replace(
                existingValues
                    .filter(value => value.field.field_type_code !== "CALCULATED")
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
                leadFields?.filter(field => field.field_type_code !== "CALCULATED")
                    .map(field => ({
                        field_id: field.id,
                        fieldData: field
                    }) as LeadPostFormValues))
        }
    }, [replace, leadFields, existingValues])

    // Objetos que contienen todos los leads de campañas relacionadas, y todos los nomencladores necesarios para el formulario.
    // Se identifican en un Map or sus ids.
    const [relatedLeads, setRelatedLeads] = useState<Map<number, Lead[]>>(new Map())
    const [selectors, setSelectors] = useState<Map<number, NomenclatorItem[]>>(new Map())

    useEffect(() => {
        updateSelectorOptions(leadFields, "related_campaign_id", relatedLeads, ["LEAD"],
            (related_campaign_id: number) => getLeads({ only_active: true, campaign_id: related_campaign_id, page_size: 0 }).then((res) => res.items))
            .then(map => setRelatedLeads(map)).catch(() => setError("root", { message: "No se ha podido obtener la lista de leads relacionados" }))
        updateSelectorOptions(leadFields, "nomenclator_id", selectors, ["SELECTOR", "CHECKBOX"],
            (nomenclator_id: number) => getNomenclatorItems({ only_active: true, nomenclator_id: nomenclator_id, page_size: 0 }).then((res) => res.items))
            .then(map => setSelectors(map)).catch(() => setError("root", { message: "No se ha podido obtener la lista del selector" }))
    }, [leadFields, setError])

    return (
        <form onSubmit={handleSubmit(submit)}>
            <input type="text" {...register("campaign_id", { setValueAs: value => (value === "" || !value) ? null : Number(value) })} hidden />
            <Stack spacing={2}>
                <Grid container spacing={.5}>
                    {campaignId &&
                        fields.map((field, idx) =>
                            <Grid size="grow" sx={{ alignItems: "center", minWidth: "20rem" }} key={field.id}>
                                <LeadFormFieldType register={register} name={`values.${idx}.value`} control={control}
                                    leadField={field.fieldData} relatedLeads={relatedLeads.get(field?.fieldData?.related_campaign_id ?? -1)}
                                    selectors={selectors.get(field?.fieldData?.nomenclator_id ?? -1)}
                                    errorMessage={errors?.values?.[idx]?.value?.message} />
                            </Grid>
                        )
                    }
                </Grid>
                {errors.root &&
                    <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                <ButtonGroup sx={{ marginLeft: "auto" }}>
                    {onCancel && <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel} >Cancelar</CommonButton>}
                    {campaignId &&
                        <CommonButton actionType={existingValues ? "MODIFY" : "CREATE"}
                            type="submit" variant="contained">{submitBtnLabel}</CommonButton>}
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