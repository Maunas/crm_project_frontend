import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { getCampaigns } from "../campaigns/campaignServices"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { Button, Divider, Grid, Typography } from "@mui/material"
import { getLeadFields, getNomenclatorItems } from "../leadFields/leadFieldServices"
import { LeadFormField, LeadFormFieldType } from "./LeadFormField"
import type { LeadField, NomenclatorItem } from "../../types/leadFields"
import type { Campaign } from "../../types/campaigns"
import type { Lead, LeadPost, LeadPostValue } from "../../types/leads"
import { getLeads } from "./leadService"

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

    const [relatedLeads, setRelatedLeads] = useState<Map<number, Lead[]>>(new Map())
    const [selectors, setSelectors] = useState<Map<number, NomenclatorItem[]>>(new Map())

    useEffect(() => {
        getCampaigns().then(setCampaigns)
    }, [])

    const { register, control, handleSubmit } = useForm<LeadPostData>()

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
                if (newRelatedLeads.has(field.fieldData.campaign_id)) return
                if (relatedLeads.has(field.fieldData.campaign_id)) {
                    newRelatedLeads.set(field.fieldData.campaign_id, relatedLeads.get(field.fieldData.campaign_id))
                    return
                }
                promises.push(
                    getLeads({ campaign_id: field.fieldData.campaign_id, only_active: true })
                        .then(newLeadList => { newRelatedLeads.set(field.fieldData.campaign_id, newLeadList) })
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
            await updateRelatedLeads(newFields)
            replace(newFields)
        }

        const newFields = leadFields?.filter(field => field.field_type_code !== "CALCULATED")
            .map(field => ({ field_id: field.id, value: "", fieldData: field }))
        updateFields(newFields)

    }, [leadFields])

    const submitData = (data) => {
        console.log(data)
    }

    return (
        <form>
            <Typography variant="h1" color="initial">Nuevo Lead</Typography>
            <ControlledAutocomplete control={control} label="Campaña" name="campaign_id" getOptionKey={option => option.id}
                getOptionLabel={option => option.name} optionList={campaigns} returnField="id" />
            <Divider sx={{ marginBlock: 2 }} />
            <Grid container spacing={2}>
                {
                    fields?.length > 0 &&
                    fields.map((leadField, idx) =>
                        <Grid size="grow" alignItems="center" minWidth="20rem" key={leadField.arrayId}>
                            <LeadFormFieldType register={register} idx={idx} control={control} 
                            leadField={leadField} relatedLeads={relatedLeads} selectors={selectors}/>
                        </Grid>
                    )
                }
            </Grid>

            <Button variant="contained" color="primary" onClick={handleSubmit(submitData)}>
                Guardar
            </Button>
        </form>
    )
}
