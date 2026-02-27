import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Button, Grid, ButtonGroup, Stack } from "@mui/material"
import { getLeadFields, getNomenclatorItems } from "../leadFields/leadFieldServices"
import { LeadFormFieldType } from "./LeadFormField"
import type { LeadField, LeadFieldDetailed, LeadFieldValue, NomenclatorItem } from "../../types/leadFields"
import type { Lead, LeadDetailed, LeadPost, LeadPostValue } from "../../types/leads"
import { createFormDataFromLead, getLeads, setLeadFormErrors, updateSelectorOptions } from "./leadService"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents"

//Para permitir mantener los datos de cada campo
export interface LeadPostFormValues extends LeadPostValue {
    fieldData: LeadField
}
export interface LeadPostForm extends LeadPost {
    values: LeadPostFormValues[]
}

interface LeadFormProps {
    existingValues?: LeadFieldValue,
    campaignId?: number,
    onSubmit: (data: FormData) => Promise<void>,
    submitBtnLabel?: string,
    onCancel?: () => void,
    setCampaignError?: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const LeadForm = ({ existingValues, campaignId, onSubmit, submitBtnLabel = "Guardar Lead", onCancel, setCampaignError }: LeadFormProps) => {

    const { register, control, setValue, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<LeadPostForm>({
        defaultValues: {
            campaign_id: campaignId,
            values: []
        }
    })

    const { fields, replace } = useFieldArray({ name: "values", control })

    const submit = (data: LeadPostForm) => {
        onSubmit(createFormDataFromLead(data)).catch(e => setLeadFormErrors(fields, e, setError))
    }
console.log(errors)
    //Actualiza el valor de campaignId recibido para ser usado or el formulario
    useEffect(() => {
        if (campaignId) {
            setValue("campaign_id", campaignId)
        }
        clearErrors()
    }, [setValue, clearErrors, campaignId])
    //Setea el mensaje de error al selector, en el caso de createLead

    useEffect(() => {
        if (setCampaignError) { setCampaignError(errors?.campaign_id?.message) }
    }, [errors.campaign_id, setCampaignError])

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    //Actualiza los leadFields respecto al campaignId seleccionado. Si ya hay existingLeadFields, no busca.
    useEffect(() => {
        if (campaignId) {
            getLeadFields({ only_active: true, campaign_id: campaignId, "page_size": 0 }).then(res =>
                setLeadFields(res.items.sort((a, b) => a.order - b.order))
            )
        }
    }, [campaignId])

    //Cuando se cargan los leadFields, se formatean y ubican en fieldArray
    useEffect(() => {
        //Acomoda los leadFields para funcionar con useFieldArray
        const formatLeadFields = (leadFields: LeadField[]) => {
            return leadFields?.filter(field => field.field_type_code !== "CALCULATED")
                .map(field => ({ field_id: field.id, fieldData: field }) as LeadPostFormValues)
        }
        replace(formatLeadFields(leadFields))
    }, [replace, leadFields])

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadFields])

    return (
        <>
            <input type="text" {...register("campaign_id", { setValueAs: value => (value === "" || !value) ? null : Number(value) })} hidden />
            <Stack spacing={2}>
                <Grid container spacing={2}>

                    {campaignId &&
                        fields.map((field, idx) =>
                            <Grid size="grow" alignItems="center" minWidth="20rem" key={field.id}>
                                <LeadFormFieldType register={register} idx={idx} control={control}
                                    leadField={field} relatedLeads={relatedLeads} selectors={selectors}
                                    errorMessage={errors?.values?.[idx]?.value?.message} />
                            </Grid>
                        )
                    }
                </Grid>
                {errors.root &&
                    <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                <ButtonGroup>
                    {onCancel && <Button onClick={onCancel} >Cancelar</Button>}
                    {campaignId &&
                        <Button onClick={handleSubmit(submit)} variant="contained">{submitBtnLabel}</Button>}
                </ButtonGroup>
            </Stack>
        </>
    )
}