import { useEffect, useMemo, useState } from "react"
import { getCampaigns } from "../campaigns/campaignServices"
import { createLeadField, createValidation, getFieldDataByType, getFieldSections, getFieldTemplates, getFieldTypes, getNomenclators } from "../leadFields/leadFieldServices"
import { Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Typography, RadioGroup, Container, Paper, Radio } from "@mui/material"
import { useForm, useWatch } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { ControlledCheckbox, ControlledRadio } from "../common/forms/ControlledCheckbox"
import { ValidationRuleForm } from "./ValidationRuleForm"
import type { FieldValidationRule, LeadFieldPost, LeadFieldSection, LeadFieldTemplate, LeadFieldTypeDetailed, Nomenclator } from "../../types/leads"
import type { Campaign } from "../../types/campaigns"

export const CreateLeadFields = () => {

  const [fieldTemplates, setFieldTemplates] = useState<LeadFieldTemplate[]>([])
  const [fieldSections, setFieldSections] = useState<LeadFieldSection[]>([])
  const [fieldTypes, setFieldTypes] = useState<LeadFieldTypeDetailed[]>([])
  const [nomenclators, setNomenclators] = useState<Nomenclator[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const { id } = useParams()
  const nav = useNavigate()

  const { register, control, handleSubmit, watch, reset, setValue } = useForm<LeadFieldData>({
    defaultValues: {
      required: false,
      is_primary: false,
      is_visible: false,
      creation_method: "template"
    }
  })

  useEffect(() => {
    if (!id) return
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections({ only_active: true }).then(setFieldSections)
    getFieldTypes({ detailed: true }).then(setFieldTypes)
    getNomenclators({ global_nomenclator: true, campaign_id: parseInt(id) }).then(setNomenclators)
    getCampaigns({ only_active: true }).then(setCampaigns)
  }, [id])

  interface LeadFieldData extends LeadFieldPost {
    creation_method: string,
    validation_rules: FieldValidationRule[]
  }

  const saveLeadField = async (data: LeadFieldData) => {
    if (!id) return
    try {
      const newLeadField = await createLeadField(getFieldDataByType(data, data.creation_method === "template"))
      const newValidationList = await Promise.all(data?.validation_rules.map(val => createValidation({ ...val, field_id: newLeadField.id })))
      return { ...newLeadField, validation_rules: newValidationList }
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  const submit = async (data: LeadFieldData) => {
    await saveLeadField(data)
    nav(`/campaigns/${id}`)
  }

  const submitAndReset = async (data: LeadFieldData) => {
    console.log(data)
    alert("Creado")
    reset()
  }

  const fieldType = useWatch({ name: "field_type_code", control })

  return (
    <Container >
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h1" color="initial">Crear Campo</Typography>
        <form>
          <Typography variant="h3" color="initial">Campaña {id}</Typography>
          <LeadField templates={fieldTemplates} sections={fieldSections} register={register}
            types={fieldTypes} control={control} fieldType={fieldType}
            nomenclators={nomenclators} campaigns={campaigns} campaignId={id} />

          <ValidationRuleForm control={control} register={register} watch={watch} setValue={setValue} />
          <Button variant="outlined" component={Link} to={`/campaigns/${id}`}>
            Volver
          </Button>
          <Button variant="contained" onClick={handleSubmit(submit)}>
            Guardar
          </Button>
          <Button variant="contained" onClick={handleSubmit(submitAndReset)}>
            Guardar y crear otro
          </Button>
        </form>
      </Paper>
    </Container >
  )
}
const LeadField = ({ templates, sections, types, nomenclators, campaigns, register, control, fieldType, campaignId }) => {

  const creationMethod = useWatch({ control, name: "creation_method" })

  const creationMethodRadioOptions = [
    { label: "Por Plantilla", value: "template" },
    { label: "Manual", value: "manual" }
  ]

  const fieldTypeObject = useMemo(() => types ? types?.find(i => i.code === fieldType) : null, [types, fieldType])

  return (
    <>
      <Divider sx={{ marginBlock: ".5rem" }} />
      <input type="hidden" {...register("campaign_id", { value: parseInt(campaignId) })} />
      <Grid container spacing={2} justifyContent="center">
        <Grid size="grow" container minWidth="20rem">
          <Grid size="grow" minWidth="15rem">
            <TextField
              id=""
              label="Nombre del Campo"
              fullWidth
              {...register(`name`)}
            />
          </Grid>
          <Grid size="grow" minWidth="15rem" justifyContent="center">
            <ControlledAutocomplete name="lead_field_section_id" label="Sección"
              control={control} optionList={sections} returnField="id"
              getOptionKey={(option) => option.id} getOptionLabel={(option) => option.name}
            />
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <FormGroup row>
              <FormControlLabel control={<ControlledCheckbox control={control} name="required" />} label="Obligatorio" />
              <FormControlLabel control={<ControlledCheckbox control={control} name="is_primary" />} label="Único" />
              <FormControlLabel control={<ControlledCheckbox control={control} name="is_visible" />} label="Visible" />
            </FormGroup>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <ControlledRadio control={control} name="creation_method" options={creationMethodRadioOptions} />
          </Grid>

          {creationMethod === "template" ?
            <Grid size="grow" minWidth="20rem" justifyContent="center">
              <ControlledAutocomplete name="field_template_code" label="Plantillas"
                control={control} optionList={templates} returnField="code"
                getOptionKey={(option) => option.code} getOptionLabel={(option) => option.name}
              />
            </Grid>
            :
            <>
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="field_type_code" label="Tipo de Dato"
                  control={control} optionList={types} returnField="code"
                  getOptionKey={(option) => option.code} getOptionLabel={(option) => `${option.code} - ${option.description}`}
                />
              </Grid>
              {(fieldType === "SELECTOR" || fieldType === "CHECKBOX") &&
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <ControlledAutocomplete name="nomenclator_id" label="Lista de Opciones"
                    control={control} optionList={nomenclators} returnField="id"
                    getOptionKey={(option) => option.id} getOptionLabel={(option) => option.name}
                  />
                </Grid>
              }
              {fieldTypeObject?.subtypes?.length > 0 &&
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <ControlledAutocomplete name="field_subtype_code" label="Subtipo de Campo"
                    control={control} optionList={fieldTypeObject?.subtypes} returnField="code"
                    getOptionKey={(option) => option.id} getOptionLabel={(option) => `${option.code} - ${option.description}`}
                  />
                </Grid>
              }
              {fieldType === "STRING" &&
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <TextField
                    id=""
                    label="Máscara de Input"
                    fullWidth
                    {...register(`input_mask`)}
                  />
                </Grid>
              }
              {(fieldType === "LEAD") &&
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <ControlledAutocomplete name="related_campaign_id" label="Campaña del Lead Relacionado"
                    control={control} optionList={campaigns} returnField="id"
                    getOptionKey={(option) => option.id} getOptionLabel={(option) => option.name}
                  />
                </Grid>
              }
              {fieldType === "CALCULATED" &&
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <TextField
                    id=""
                    label="Fórmula"
                    fullWidth
                    {...register(`calculation_expression`)}
                  />
                </Grid>
              }
            </>
          }
          {(creationMethod === "template" || ["NUMBER", "INT", "STRING", "BOOL"].includes(fieldType)) &&

            <Grid size="grow" minWidth="20rem">
              <TextField
                id=""
                label="Valor por Defecto"
                fullWidth
                {...register(`default_value`)}
              />
            </Grid>
          }

        </Grid>

      </Grid>
      <Divider sx={{ marginBlock: ".5rem" }} />
    </>
  )
}