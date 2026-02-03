import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { getCampaigns } from "../campaigns/campaignServices"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { Button, Divider, FormHelperText, Grid, Typography, ButtonGroup } from "@mui/material"
import { getLeadFields, getNomenclatorItems } from "../leadFields/leadFieldServices"
import { LeadFormFieldType } from "./LeadFormField"
import type { LeadField, NomenclatorItem } from "../../types/leadFields"
import type { Campaign } from "../../types/campaigns"
import type { Lead, LeadPost, LeadPostValue } from "../../types/leads"
import { createLead, getLeads, simulateCreateLead } from "./leadService"
import { useNavigate } from "react-router-dom"

//Para permitir mantener los datos de cada campo
export interface LeadPostValueData extends LeadPostValue {
    fieldData: LeadField
}
export interface LeadPostData extends LeadPost {
    values: LeadPostValue[]
}

export const LeadForm = () => {

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [leadFields, setLeadFields] = useState<LeadField[]>([])
    const nav = useNavigate()

    const [relatedLeads, setRelatedLeads] = useState<Map<number, Lead[]>>(new Map())
    const [selectors, setSelectors] = useState<Map<number, NomenclatorItem[]>>(new Map())


    useEffect(() => {
        getCampaigns().then(setCampaigns)
    }, [])

    const { register, control, handleSubmit, setError, formState: { errors } } = useForm<LeadPostData>()

    const campaignId = useWatch({ name: "campaign_id", control })

    useEffect(() => {
        if (campaignId) {
            getLeadFields({ only_active: true, campaign_id: campaignId }).then(res =>
                setLeadFields(res.sort((a, b) => a.order - b.order))
            )
        }
    }, [campaignId])

    const { fields, replace } = useFieldArray<LeadPostData>({ name: "values", control, keyName: "arrayId" })

    const updateRelatedLeads = async (newFields: LeadPostValueData[]) => {
        const newRelatedLeads = new Map()
        const newSelectors = new Map()
        const promises: Array<Promise<void>> = []

        newFields.forEach(async (field) => {
            if (!field?.fieldData?.field_type_code) return
            if (field.fieldData.field_type_code === "LEAD") {
                const relatedCampaignId = field.fieldData.related_campaign_id
                if (!relatedCampaignId) return
                if (newRelatedLeads.has(relatedCampaignId)) return
                if (relatedLeads.has(relatedCampaignId)) {
                    newRelatedLeads.set(relatedCampaignId, relatedLeads.get(relatedCampaignId))
                    return
                }
                promises.push(
                    getLeads({ campaign_id: relatedCampaignId, only_active: true })
                        .then(newLeadList => { newRelatedLeads.set(relatedCampaignId, newLeadList) })
                )
            }
            if (["CHECKBOX", "SELECTOR"].includes(field?.fieldData?.field_type_code)) {
                if (!field.fieldData.nomenclator_id) return
                if (newSelectors.has(field.fieldData.nomenclator_id)) return
                if (selectors.has(field?.fieldData?.nomenclator_id)) {
                    newSelectors.set(field.fieldData.nomenclator_id, selectors.get(field.fieldData.nomenclator_id))
                    return
                }
                promises.push(
                    getNomenclatorItems({ nomenclator_id: field.fieldData.nomenclator_id, only_active: true })
                        .then(newSelectorList => { newSelectors.set(field.fieldData.nomenclator_id, newSelectorList) })
                )
            }
        })
        await Promise.all(promises)
        setRelatedLeads(newRelatedLeads)
        setSelectors(newSelectors)
    }

    useEffect(() => {
        const updateFields = async (newFields: LeadPostValueData[]) => {
            updateRelatedLeads(newFields)
            replace(newFields)
        }

        const newFields = leadFields?.filter(field => field.field_type_code !== "CALCULATED")
            .map(field => ({ field_id: field.id, fieldData: field }))
        updateFields(newFields)

    }, [leadFields])

    const submitData = (data, simulate = false) => {
        data.values.forEach(value => delete value.fieldData)
        if (!data.campaign_id) return setError("campaign_id", { message: "Este campo es obligatorio." })
        if (simulate) {
            console.log(data)
            return simulateCreateLead(data)
                .then(r => { alert("Creado Exitosamente"); console.log(r) })
                .catch(e => findError(e))
        }
        createLead(data)
            .then(r => nav(`/leads/${r.id}`))
            .catch(e => findError(e))
    }

    const findError = (error) => {
        const errorDetail = error?.response?.data?.detail
        if (!errorDetail) return setError("root", { message: error.message })
        const errorIndex = fields.findIndex(field => field.fieldData.name === errorDetail.field) ?? null
        setError(`values.${errorIndex}.value`, { message: errorDetail.message })
    }

    return (
        <form autoComplete="off">
            <Typography variant="h1" color="initial">Nuevo Lead</Typography>
            <ControlledAutocomplete control={control} label="Campaña" name="campaign_id" required
                getOptionLabel={option => option.name} options={campaigns} returnField="id"
                errorMessage={errors?.campaign_id?.message}
            />
            <Divider sx={{ marginBlock: 2 }} />
            <Grid container spacing={2}>
                {
                    fields?.length > 0 &&
                    fields.map((leadField, idx) =>
                        <Grid size="grow" alignItems="center" minWidth="20rem" key={leadField.arrayId}>
                            <LeadFormFieldType register={register} idx={idx} control={control}
                                leadField={leadField} relatedLeads={relatedLeads} selectors={selectors} 
                                errorMessage={errors?.values?.[idx]?.value?.message}
                                />
                        </Grid>
                    )
                }
            </Grid>
            {errors?.root &&
                <FormHelperText error sx={{ marginBlock: 1 }}>{errors?.root.message}</FormHelperText>
            }
            <ButtonGroup sx={{ marginBlock: 1 }}>
                <Button variant="outlined" color="primary" onClick={handleSubmit((data) => submitData(data, true))}>
                    Validar Datos
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit((data) => submitData(data))}>
                    Guardar
                </Button>
            </ButtonGroup>
        </form>
    )
}