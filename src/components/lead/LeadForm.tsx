import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { getCampaigns } from "../campaigns/campaignServices"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { Button, Grid } from "@mui/material"
import { getLeadFields } from "../leadFields/leadFieldServices"
import { LeadFormField } from "./LeadFormField"
import type { LeadField } from "../../types/leadFields"
import type { Campaign } from "../../types/campaigns"
import type { LeadPost, LeadPostValue } from "../../types/leads"

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

    useEffect(() => {
        const newFields = leadFields?.filter(field => field.field_type_code !== "CALCULATED")
            .map(field => ({ field_id: field.id, value:"", fieldData: field }))
        replace(newFields)
    }, [leadFields])

    const submitData = (data) => {
        console.log(data)
    }

    return (
        <form>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <ControlledAutocomplete control={control} label="Campaña" name="campaign_id" getOptionKey={option => option.id}
                        getOptionLabel={option => option.name} optionList={campaigns} returnField="id" />
                </Grid>

                <Grid container spacing={2} size={12}>
                    {
                        fields?.length > 0 &&
                        fields.map((leadField, idx) =>
                            <LeadFormField register={register} control={control} key={leadField.arrayId}
                                idx={idx} leadField={leadField} />
                        )
                    }
                </Grid>

            </Grid>
            <Button variant="contained" color="primary" onClick={handleSubmit(submitData)}>
                Guardar
            </Button>
        </form>
    )
}
