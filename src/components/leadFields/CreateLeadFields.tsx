import { useEffect, useMemo, useState } from "react"
import { getCampaigns } from "../campaigns/campaignServices"
import { createLeadField, createValidation, getFieldTemplates, getFieldTypes, getNomenclators } from "../leadFields/leadFieldServices"
import { Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Typography, RadioGroup, Container, Paper, Radio } from "@mui/material"
import { getFieldSections } from "../lead/leadService"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { ControlledCheckbox } from "../common/forms/ControlledCheckbox"
import { ValidationRuleForm } from "./ValidationRuleForm"

export const CreateLeadFields = () => {

  const [fieldTemplates, setFieldTemplates] = useState<any[]>([])
  const [fieldSections, setFieldSections] = useState<any[]>([])
  const [fieldTypes, setFieldTypes] = useState<any[]>([])
  const [nomenclators, setNomenclators] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])

  const { id } = useParams()
  const nav = useNavigate()

  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      required: false,
      is_primary: false,
      is_visible: false,
      default_value: null
    }
  })

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections().then(setFieldSections)
    getFieldTypes().then(setFieldTypes)
    getNomenclators().then(setNomenclators)
    getCampaigns().then(setCampaigns)
    return () => setFieldTemplates([])
  }, [id])

  const saveLeadField = async (data) => {
    try {
      const newLeadField = await createLeadField({ ...data, campaign_id: id })
      const newValidationList = await Promise.all(data?.validation_rules.map(validation => createValidation({ ...validation, "field_id": newLeadField.id })))
      return { ...newLeadField, validation_rules: newValidationList }
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  const submit = async (data) => {
    await saveLeadField(data)
    nav(`/campaigns/${id}`)
  }

  const submitAndReset = async (data) => {
    await saveLeadField(data)
    alert("Creado")
    reset()
  }

  const fieldType = watch("field_type_code")

  return (
    <Container >
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h1" color="initial">Crear Campo</Typography>
        <form>
          <Typography variant="h3" color="initial">Campaña {id}</Typography>
          <LeadField templates={fieldTemplates} sections={fieldSections} register={register}
            types={fieldTypes} control={control} fieldType={fieldType}
            nomenclators={nomenclators} campaigns={campaigns} />

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
const LeadField = ({ templates, sections, types, nomenclators, campaigns, register, control, fieldType }) => {

  const [fieldMethod, setFieldMethod] = useState<string | null>("Por Plantilla")

  const changeFieldMethod = (e, data) => {
    setFieldMethod(data)
  }

  const fieldTypeObject = useMemo(() => types ? types?.find(i => i.code === fieldType) : null, [types, fieldType])

  return (
    <>
      <Divider sx={{ marginBlock: ".5rem" }} />
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
            <RadioGroup row
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="Por Plantilla"
              name="radio-buttons-group"
              onChange={changeFieldMethod}
            >
              <FormControlLabel value="Por Plantilla" defaultChecked control={<Radio />} label="Por Plantilla" />
              <FormControlLabel value="Manual" control={<Radio />} label="Manual" />
            </RadioGroup>
          </Grid>
          {fieldMethod === "Por Plantilla" ?

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
          {(fieldMethod === "Por Plantilla" || ["NUMBER", "INT", "STRING", "BOOL"].includes(fieldType)) &&

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