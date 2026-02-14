import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFormHandleSubmit, type UseFormRegister, type UseFormSetError } from "react-hook-form"
import { getCampaigns } from "../campaigns/campaignServices"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { Button, Divider, FormHelperText, Grid, Typography, ButtonGroup, TextField } from "@mui/material"
import { getLeadFields, getNomenclatorItems } from "../leadFields/leadFieldServices"
import { LeadFormFieldType } from "./LeadFormField"
import type { LeadField, LeadFieldDetailed, LeadFieldValueDetailed, NomenclatorItem, NomenclatorItemDetailed } from "../../types/leadFields"
import type { Campaign } from "../../types/campaigns"
import type { Lead, LeadDetailed, LeadPost, LeadPostValue } from "../../types/leads"
import { createLead, getLeads, simulateCreateLead, updateLead } from "./leadService"
import { Link, useNavigate } from "react-router-dom"

//Para permitir mantener los datos de cada campo
export interface LeadPostValueData extends LeadPostValue {
    fieldData: LeadField
}
export interface LeadPostData extends LeadPost {
    values: LeadPostValueData[]
}

export const CreateLead = () => {

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        getCampaigns({ "page_size": 200 }).then(setCampaigns)
    }, [])

    const { register, control, handleSubmit, setError, formState: { errors } } = useForm<LeadPostData>()

    const campaignId = useWatch({ name: "campaign_id", control })

    useEffect(() => {
        if (campaignId) {
            getLeadFields({ only_active: true, campaign_id: campaignId, "page_size": 200 }).then(res =>
                setLeadFields(res.sort((a, b) => a.order - b.order))
            )
        }
    }, [campaignId])

    return (
        <form autoComplete="off">
            <Typography variant="h1" color="initial">Nuevo Lead</Typography>
            <ControlledAutocomplete control={control} label="Campaña" name="campaign_id" required
                getOptionLabel={option => option.name} options={campaigns} returnField="id"
                errorMessage={errors?.campaign_id?.message}
            />
            <Divider sx={{ marginBlock: 2 }} />
            <LeadFormValues leadFields={leadFields}
                register={register} control={control} handleSubmit={handleSubmit} setError={setError} errors={errors} />
        </form>
    )
}

interface SimulateProps {
    campaignId: number,
    leadFields: LeadFieldDetailed[]
}
export const SimulateLead = ({ campaignId, leadFields }: SimulateProps) => {

    const { register, control, handleSubmit, setError, formState: { errors } } = useForm<LeadPostData>()

    const filteredLeadFields = useMemo(()=>leadFields.filter(field=>field.active),[leadFields])

    return (
        <form autoComplete="off">
            <Typography variant="h1" color="initial">Simulación de Nuevo Lead: Campaña {campaignId}</Typography>
            <input type="text" id="campaign_id" value={campaignId} hidden
                {...register("campaign_id", { valueAsNumber: true })} />
            <LeadFormValues leadFields={filteredLeadFields} simulate
                register={register} control={control} handleSubmit={handleSubmit} setError={setError} errors={errors} />
        </form>
    )
}


interface LeadFormProps {
    leadFields: LeadFieldDetailed[],
    simulate?: boolean,
    register: UseFormRegister<LeadPostData>,
    control: Control<LeadPostData>,
    handleSubmit: UseFormHandleSubmit<LeadPostData>,
    setError: UseFormSetError<LeadPostData>,
    errors: FieldErrors<LeadPostData>,
    idLead?: number | null
}
export const LeadFormValues = ({ leadFields, simulate = false, register, control, handleSubmit, setError, errors, idLead = null }: LeadFormProps) => {

    const [relatedLeads, setRelatedLeads] = useState<Map<number, Lead[] | LeadDetailed[]>>(new Map())
    const [selectors, setSelectors] = useState<Map<number, NomenclatorItem[] | NomenclatorItemDetailed[]>>(new Map())
    const nav = useNavigate()

    const { fields, replace } = useFieldArray<LeadPostData>({ name: "values", control, keyName: "arrayId" })

    const updateSelectors = async (newFields: LeadPostValueData[]) => {
        const newRelatedLeads = new Map()
        const newSelectors = new Map()
        const promises: Array<Promise<void>> = []

        newFields.forEach(async (field) => {
            if (!field?.fieldData?.field_type_code) return
            if (field.fieldData.field_type_code === "LEAD") {
                const relatedCampaignId = field?.fieldData?.related_campaign_id ?? field?.fieldData?.related_campaign?.id
                if (!relatedCampaignId) return
                if (newRelatedLeads.has(relatedCampaignId)) return
                if (relatedLeads.has(relatedCampaignId)) {
                    newRelatedLeads.set(relatedCampaignId, relatedLeads.get(relatedCampaignId))
                    return
                }
                promises.push(
                    getLeads({ campaign_id: relatedCampaignId, only_active: true, page_size: 200 })
                        .then(newLeadList => { newRelatedLeads.set(relatedCampaignId, newLeadList.items) })
                )
            }
            if (["CHECKBOX", "SELECTOR"].includes(field?.fieldData?.field_type_code)) {
                const nomenclatorId = field?.fieldData?.nomenclator_id ?? field?.fieldData?.nomenclator?.id
                if (!nomenclatorId) return
                if (newSelectors.has(nomenclatorId)) return
                if (selectors.has(nomenclatorId)) {
                    newSelectors.set(nomenclatorId, selectors.get(nomenclatorId))
                    return
                }
                promises.push(
                    getNomenclatorItems({ nomenclator_id: nomenclatorId, only_active: true, page_size: 200 })
                        .then(newSelectorList => { newSelectors.set(nomenclatorId, newSelectorList) })
                )
            }
        })
        await Promise.all(promises)
        setRelatedLeads(newRelatedLeads)
        setSelectors(newSelectors)
    }

    useEffect(() => {
        const updateFields = async (newFields: LeadPostValueData[]) => {
            updateSelectors(newFields)
            replace(newFields)
        }
        let newFields
        if (idLead) {
            newFields = leadFields?.filter(field => field?.field?.field_type_code !== "CALCULATED")
                .map(field => ({ field_id: field?.field_id, fieldData: field?.field, value: field?.value }))
        } else {
            newFields = leadFields?.filter(field => field.field_type_code !== "CALCULATED")
                .map(field => ({ field_id: field.id, fieldData: field }))
        }
        updateFields(newFields)
    }, [leadFields, idLead])


    const createFormData = (data) => {
        const formData = new FormData()
        const formValues = []
        data?.values?.forEach(fieldValue => {
            if (fieldValue?.fieldData?.field_type_code === "FILE") {
                if (typeof fieldValue?.value === "string") {
                    formValues.push({ field_id: fieldValue?.field_id, value: fieldValue?.value })
                } else if (fieldValue?.value?.length > 0) {
                    formData.set(`file-${fieldValue.field_id}`, fieldValue?.value?.[0])
                    formValues.push({ field_id: fieldValue?.field_id, value: fieldValue?.value?.[0].name })
                }
            } else {
                formValues.push({ field_id: fieldValue?.field_id, value: fieldValue?.value })
            }
        })
        formData.set("data", JSON.stringify({ ...data, values: formValues }))
        return formData
    }

    const submitData = (data: LeadPostData, isSimulating: boolean) => {

        if (!data.campaign_id) return setError("campaign_id", { message: "Este campo es obligatorio." })

        const formData = createFormData(data)

        if (isSimulating) {
            console.log("Datos no procesados", data)
            console.log("Datos enviados", new Map(formData.entries()))

            return simulateCreateLead(formData)
                .then(r => { alert("Creado Exitosamente"); console.log(r) })
                .catch(e => findError(e))
        }
        createLead(formData)
            .then(r => nav(`/leads/${r.id}`))
            .catch(e => findError(e))
    }

    const updateData = (data: LeadPostData) => {
        if (!data.campaign_id) return setError("campaign_id", { message: "Este campo es obligatorio." })

        const formData = createFormData(data)

        updateLead(formData, idLead!)
            .then(r => nav(`/leads/${r.id}`))
            .catch(e => findError(e))
    }

    const findError = (error) => {
        const errorDetail = error?.response?.data?.detail
        if (!errorDetail) return setError("root", { message: error.message })
        if (!errorDetail.field) return setError("root", { message: errorDetail.message })
        const errorIndex = fields.findIndex(field => field.fieldData.name === errorDetail.field) ?? null
        setError(`values.${errorIndex}.value`, { message: errorDetail.message })
    }

    return (
        <>
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
                <Button variant="outlined" color="primary" component={Link} 
                to={idLead ? `/leads/${idLead}` : "/leads"}>
                        Cancelar
                    </Button>
                { //Disponible en todas como debug, bloquear al terminar
                    //simulate &&
                    <Button variant={simulate ? "contained" : "outlined"} color="primary" onClick={handleSubmit((data) => submitData(data, true))}>
                        Validar Datos
                    </Button>
                }
                {!simulate && !idLead &&
                    <Button variant="contained" color="primary" onClick={handleSubmit((data) => submitData(data, false))}>
                        Guardar Lead
                    </Button>
                }
                {!simulate && idLead &&
                    <Button variant="contained" color="primary" onClick={handleSubmit(updateData)}>
                        Actualizar Lead
                    </Button>
                }
            </ButtonGroup>
        </>
    )
}