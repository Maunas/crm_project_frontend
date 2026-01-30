import { useEffect, useMemo, useState } from "react"
import { getCampaigns } from "../campaigns/campaignServices"
import { createLeadField, createValidation, getFieldSections, getFieldTemplates, getFieldTypes, getNomenclators } from "../leadFields/leadFieldServices"
import { Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Typography } from "@mui/material"
import { useForm, useWatch, type Control, type UseFormRegister } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ControlledAutocomplete } from "../common/forms/ControlledAutocomplete"
import { ControlledCheckbox, ControlledRadio } from "../common/forms/ControlledInputs"
import { ValidationRuleForm } from "./ValidationRuleForm"
import type { FieldValidationRule, LeadFieldPost, LeadFieldSection, LeadFieldTemplate, LeadFieldTypeDetailed, Nomenclator } from "../../types/leads"
import type { Campaign } from "../../types/campaigns"
import { GenericContainer } from "../common/forms/GenericContainer"

export interface LeadFieldData extends LeadFieldPost {
  creation_method?: string,
  validation_rules: FieldValidationRule[]
}

export const CreateLeadFields = () => {

  const [fieldTemplates, setFieldTemplates] = useState<LeadFieldTemplate[]>([])
  const [fieldSections, setFieldSections] = useState<LeadFieldSection[]>([])
  const [fieldTypes, setFieldTypes] = useState<LeadFieldTypeDetailed[]>([])
  const [nomenclators, setNomenclators] = useState<Nomenclator[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const { id } = useParams()
  const nav = useNavigate()

  const defaultValues = {
    name: "",
    default_value: "",
    required: false,
    is_primary: false,
    is_visible: false,
    creation_method: "template",
    validation_rules: []
  }

  const { register, control, handleSubmit, reset, setValue, formState } = useForm<LeadFieldData>({
    shouldUnregister: true,
    defaultValues
  })

  console.log("dirty",formState.dirtyFields)

  useEffect(() => {
    if (!id) return
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections({ only_active: true }).then(setFieldSections)
    getFieldTypes({ detailed: true }).then(setFieldTypes)
    getNomenclators({ global_nomenclator: true, campaign_id: parseInt(id) }).then(setNomenclators)
    getCampaigns({ only_active: true }).then(setCampaigns)
  }, [id])

  const saveLeadField = async (data: LeadFieldData) => {
    if (!id) return
    try {
      delete data.creation_method
      const newLeadField = await console.log(data)
      if (!data?.validation_rules) return newLeadField
      const newValidationList = await Promise.all(data?.validation_rules.map(val => console.log({ ...val, field_id: newLeadField?.id ?? 1 })))
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
    await saveLeadField(data)
    alert("Creado")
    reset(defaultValues, {
      keepDirty: false,
      keepTouched: false,
    })
  }

  const currentCampaign = useMemo(
    () => campaigns.find(campaign => (campaign && id) && campaign?.id === parseInt(id)),
    [campaigns, id])

  return (
    <GenericContainer>
      {id &&
        <>
          <Typography variant="h1" color="initial">Crear Campo para: {currentCampaign?.name}</Typography>
          <form>
            <LeadFieldForm templates={fieldTemplates} sections={fieldSections} nomenclators={nomenclators}
              campaigns={campaigns} types={fieldTypes}
              register={register} control={control} campaignId={parseInt(id)} />

            <Divider sx={{ paddingBlock: 2 }} />

            <ValidationRuleForm control={control} register={register} setValue={setValue} />

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
        </>}
    </GenericContainer>
  )
}

interface LeadFieldFormProps {
  templates: LeadFieldTemplate[],
  sections: LeadFieldSection[],
  types: LeadFieldTypeDetailed[],
  nomenclators: Nomenclator[],
  campaigns: Campaign[],
  register: UseFormRegister<LeadFieldData>,
  control: Control,
  campaignId: number
}

const LeadFieldForm = ({ templates, sections, types, nomenclators, campaigns, register, control, campaignId }: LeadFieldFormProps) => {

  const fieldTypeCode = useWatch({ name: "field_type_code", control })
  const creationMethod = useWatch({ control, name: "creation_method" })

  const creationMethodRadioOptions = [
    { label: "Por Plantilla", value: "template" },
    { label: "Manual", value: "manual" }
  ]
  //Busca el objeto del Tipo seleccionado a partir de su código
  const fieldTypeObject = useMemo(
    () => types ? types?.find(i => i.code === fieldTypeCode) : null,
    [types, fieldTypeCode])

  return (
    <Grid container spacing={2} justifyContent="center">
      <input type="hidden" {...register("campaign_id", { value: campaignId })} />
      <Grid size={12} container minWidth="20rem">
        <Grid size="grow" minWidth="20rem">
          <TextField
            id="name"
            label="Nombre del Campo"
            fullWidth
            {...register(`name`)}
          />
        </Grid>
        <Grid size="grow" minWidth="20rem" justifyContent="center">
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
      </Grid>

      <Grid size={12} container minWidth="20rem">
        <Grid size={4} minWidth="20rem" justifyContent="center">
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
            {fieldTypeObject?.subtypes && fieldTypeObject?.subtypes?.length > 0 &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="field_subtype_code" label="Subtipo de Campo"
                  control={control} optionList={fieldTypeObject?.subtypes} returnField="code"
                  getOptionKey={(option) => option.id} getOptionLabel={(option) => `${option.code} - ${option.description}`}
                />
              </Grid>
            }
            {(fieldTypeCode === "SELECTOR" || fieldTypeCode === "CHECKBOX") &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="nomenclator_id" label="Lista de Opciones"
                  control={control} optionList={nomenclators} returnField="id"
                  getOptionKey={(option) => option.id} getOptionLabel={(option) => option.name}
                />
              </Grid>
            }
            {(fieldTypeCode === "LEAD") &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="related_campaign_id" label="Campaña del Lead Relacionado"
                  control={control} optionList={campaigns} returnField="id"
                  getOptionKey={(option) => option.id} getOptionLabel={(option) => option.name}
                />
              </Grid>
            }
            {fieldTypeCode === "CALCULATED" &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <TextField
                  id="calculation_expression"
                  label="Fórmula"
                  fullWidth
                  {...register(`calculation_expression`)}
                />
              </Grid>
            }
            {fieldTypeCode === "STRING" &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <TextField
                  id="input_mask"
                  label="Máscara de Input"
                  fullWidth
                  {...register(`input_mask`)}
                />
              </Grid>
            }
          </>
        }
        {(creationMethod === "template" || (fieldTypeCode && ["NUMBER", "INT", "STRING", "BOOL"].includes(fieldTypeCode))) &&

          <Grid size="grow" minWidth="20rem">
            <TextField
              id="default_value"
              label="Valor por Defecto"
              fullWidth
              {...register(`default_value`)}
            />
          </Grid>
        }
      </Grid>
    </Grid>
  )
}