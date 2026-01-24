import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { getCampaigns } from "../campaigns/campaignServices"
import { getLeadFieldsByCampaign } from "../leadFields/leadFieldServices"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { TextField, Button, Grid, Container, Typography } from "@mui/material"

export const LeadForm = () => {

    const [campaigns, setCampaigns] = useState([])
    const [leadFields, setLeadFields] = useState([])

    useEffect(() => {
        getCampaigns().then(setCampaigns)
    }, [])

    const { register, control, watch, handleSubmit } = useForm()

    const campaignId = watch("campaign_id")

    useEffect(() => {
        if (campaignId) {
            getLeadFieldsByCampaign(campaignId).then(res =>
                setLeadFields(res.sort((a, b) => a.order - b.order))
            )
        }
    }, [campaignId])


    const { fields, replace } = useFieldArray({ name: "values", control, keyName: "arrayId" })

    useEffect(() => {
        const newFields = leadFields?.filter(i => i.field_type_code !== "CALCULATED")
        .map(i => ({ fieldData: i }))
        replace(newFields)
    }, [leadFields])

    const submitData = (data) => {
        data?.values?.forEach(i => delete i.fieldData)
    }

    return (
        <form>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <ControlledAutocomplete control={control} label="Campaña" name="campaign_id" getOptionKey={option => option.id}
                        getOptionLabel={option => option.name} optionList={campaigns} returnField="id" />
                </Grid>

                {
                    fields?.length > 0 &&
                    fields.map((leadField, idx) =>
                        <Grid size={12} container spacing={2} key={leadField.arrayId}>
                            <Grid size={2} >
                                <TextField
                                    id=""
                                    label="Id"
                                    fullWidth
                                    {...register(`values.${idx}.field_id`)}
                                    value={leadField.fieldData.id}
                                    disabled
                                />
                            </Grid>
                            <Grid size="grow" minWidth="20rem">

                                <TextField
                                    id=""
                                    label={leadField.fieldData.name}
                                    fullWidth
                                    {...register(`values.${idx}.value`)}
                                />
                                <Typography color="initial">{leadField.fieldData.field_template_code && `${leadField.fieldData.field_template_code} - `}{leadField.fieldData.field_type_code}</Typography>
                            </Grid>
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
