import { useEffect, useMemo, useState } from "react"
import { getCampaigns } from "../campaigns/campaignServices"
import { createLeadField, createValidation, getFieldDataByType, getFieldSections, getFieldTemplates, getFieldTypes, getNomenclators, getValidationDataByType, updateLeadField, updateValidation } from "./leadFieldServices"
import { Divider, TextField, Button, Grid, FormGroup, Typography, ButtonGroup } from "@mui/material"
import { useForm, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { ControlledAutocomplete, ControlledRadio } from "../common/forms/CustomMultipleInputs"
import { ControlledCheckbox, ControlledTextInput, RegisteredTextInput } from "../common/forms/CustomInputs"
import { ValidationRuleForm } from "./ValidationRuleForm"
import type { FieldValidationRulePost, FieldValidationRuleTemplate, LeadFieldDetailed, LeadFieldPost, LeadFieldSection, LeadFieldTemplate, LeadFieldTypeDetailed, Nomenclator } from "../../types/leadFields"
import type { Campaign } from "../../types/campaigns"
import { GenericContainer } from "../common/layout/GenericContainer"

export interface FieldValidationRuleData extends FieldValidationRulePost {
  creation_method?: string,
  template?: FieldValidationRuleTemplate
}
export interface LeadFieldData extends LeadFieldPost {
  creation_method?: string,
  validation_rules: FieldValidationRuleData[]
}

interface LeadFieldFormProps {
  leadField?: LeadFieldDetailed | null,
  campaignId: number
}
export const LeadFieldForm = ({ leadField = null, campaignId }: LeadFieldFormProps) => {

  const [fieldTemplates, setFieldTemplates] = useState<LeadFieldTemplate[]>([])
  const [fieldSections, setFieldSections] = useState<LeadFieldSection[]>([])
  const [fieldTypes, setFieldTypes] = useState<LeadFieldTypeDetailed[]>([])
  const [nomenclators, setNomenclators] = useState<Nomenclator[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const nav = useNavigate()

  const defaultValues = {
    required: leadField?.required || false,
    is_primary: leadField?.is_primary || false,
    is_visible: leadField?.is_visible || true,
    creation_method: (!leadField || leadField.field_template_code) ? "template" : "manual",
    field_template_code: leadField?.field_template_code || null,
    validation_rules: leadField?.validation_rules || []
  }

  const { register, control, handleSubmit, reset, setValue, formState: { errors }, setError } = useForm<LeadFieldData>({
    defaultValues
  })

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections({ only_active: true }).then(setFieldSections)
    getFieldTypes({ detailed: true }).then(setFieldTypes)
    getCampaigns({ only_active: true }).then(setCampaigns)
  }, [])

  useEffect(() => {
    if (!campaignId) return
    getNomenclators({ global_nomenclator: true, campaign_id: campaignId }).then(setNomenclators)
  }, [campaignId])

  const findError = (error) => {
    const errorDetail = error?.response?.data?.detail
    if (!errorDetail) return setError("root", { message: error.message })
    if (!errorDetail.field) return setError("root", { message: errorDetail })

    setError(errorDetail.field, { message: errorDetail.message })
  }

  const saveLeadField = async (data: LeadFieldData) => {
    try {
      const newData = getFieldDataByType(data, data.creation_method === "template")
      //Update
      if (leadField) {
        const newLeadField = await updateLeadField(newData, leadField.id)
        if (!data?.validation_rules) return newLeadField
        const newValidationList = await Promise.all(
          data?.validation_rules.map(val =>
            submitValidation(val, newLeadField?.id)
          )
        )
        return { ...newLeadField, validation_rules: newValidationList }
      }
      //Create 
      else {
        const newLeadField = await createLeadField(newData)
        if (!data?.validation_rules) return newLeadField
        const newValidationList = await Promise.all(
          data?.validation_rules.map(val => submitValidation(val, newLeadField?.id) )
        )
        return { ...newLeadField, validation_rules: newValidationList }
      }
    } catch (e) {
      findError(e)
      throw e
    }
  }

  const submitValidation = (val: FieldValidationRuleData, fieldId: number) => {
    const newVal = getValidationDataByType({ ...val, field_id: fieldId }, val.creation_method === "template")
    if (val.id) {
      return updateValidation(newVal, val.id)
    } else {
      return createValidation(newVal)
    }
  }

  const submit = async (data: LeadFieldData) => {
    await saveLeadField(data)
    nav(`/campaigns/${campaignId}`)
  }

  const submitAndReset = async (data: LeadFieldData) => {
    await saveLeadField(data)
    alert("Creado")
    reset(defaultValues)
  }

  const currentCampaign = useMemo(() => {
    if (!campaigns || !campaignId) return null
    return campaigns.find(campaign => campaign?.id === campaignId)
  }, [campaigns, campaignId])

  return (
    <GenericContainer>
      <>
        {!leadField
          ? <Typography variant="h1" color="initial">
            Crear Campo para: {currentCampaign?.name}
          </Typography>
          : <Typography variant="h1" color="initial">
            Modificar el Campo {leadField?.name} para: {currentCampaign?.name}
          </Typography>
        }
        <form>
          <LeadFieldFormFields templates={fieldTemplates} sections={fieldSections} nomenclators={nomenclators}
            campaigns={campaigns} types={fieldTypes} errors={errors}
            register={register} control={control} campaignId={campaignId} />

          <Divider sx={{ paddingBlock: 2 }} />

          <ValidationRuleForm control={control} register={register} setValue={setValue} reset={reset} />

          <ButtonGroup>
            <Button variant="outlined" component={Link} to={`/campaigns/${campaignId}`}>
              Volver
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)}>
              Guardar Cambios
            </Button>
            {!leadField &&
              <Button variant="contained" onClick={handleSubmit(submitAndReset)}>
                Guardar y crear otro
              </Button>
            }
          </ButtonGroup>
        </form>
      </>
    </GenericContainer>
  )
}

interface LeadFieldFormFieldsProps {
  templates: LeadFieldTemplate[],
  sections: LeadFieldSection[],
  types: LeadFieldTypeDetailed[],
  nomenclators: Nomenclator[],
  campaigns: Campaign[],
  register: UseFormRegister<LeadFieldData>,
  control: Control<LeadFieldData>,
  campaignId: number,
  errors: FieldErrors<LeadFieldData>
}

const LeadFieldFormFields = ({ templates, sections, types, nomenclators, campaigns, register, control, campaignId, errors }: LeadFieldFormFieldsProps) => {

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
          <ControlledTextInput control={control} label="Nombre del Campo" name="name" required
            errorMessage={errors.name?.message} />
        </Grid>
        <Grid size="grow" minWidth="20rem" justifyContent="center">
          <ControlledAutocomplete name="lead_field_section_id" label="Sección"
            control={control} options={sections} returnField="id"
            getOptionLabel={(option) => option.name} required errorMessage={errors.lead_field_section_id?.message}
          />
        </Grid>
        <Grid size="grow" minWidth="20rem" justifyContent="center">
          <FormGroup row>
            <ControlledCheckbox control={control} name="required" label="Obligatorio" errorMessage={errors?.required?.message} />
            <ControlledCheckbox control={control} name="is_primary" label="Único" errorMessage={errors?.is_primary?.message} />
            <ControlledCheckbox control={control} name="is_visible" label="Visible" errorMessage={errors?.is_visible?.message} />
          </FormGroup>
        </Grid>
      </Grid>

      <Grid size={12} container minWidth="20rem">
        <Grid size={4} minWidth="20rem" justifyContent="center">
          <ControlledRadio control={control} name="creation_method" options={creationMethodRadioOptions}
            returnField="value" radioLabel={option => option.label} label="Método de Creación" />
        </Grid>

        {creationMethod === "template" ?
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <ControlledAutocomplete name="field_template_code" label="Plantillas"
              control={control} options={templates} returnField="code" errorMessage={errors?.field_template_code?.message}
              getOptionKey={(option) => option.code} getOptionLabel={(option) => option.name} required
            />
          </Grid>
          :
          <>
            <Grid size="grow" minWidth="20rem" justifyContent="center">
              <ControlledAutocomplete name="field_type_code" label="Tipo de Dato" required
                control={control} options={types} returnField="code" errorMessage={errors?.field_type_code?.message}
                getOptionKey={(option) => option.code} getOptionLabel={(option) => `${option.code} - ${option.description}`}
              />
            </Grid>
            {fieldTypeObject?.subtypes && fieldTypeObject?.subtypes?.length > 0 &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="field_subtype_code" label="Subtipo de Campo"
                  errorMessage={errors?.field_subtype_code?.message} required
                  control={control} options={fieldTypeObject?.subtypes} returnField="code"
                  getOptionLabel={(option) => `${option.code} - ${option.description}`}
                />
              </Grid>
            }
            {(fieldTypeCode === "SELECTOR" || fieldTypeCode === "CHECKBOX") &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="nomenclator_id" label="Lista de Opciones"
                  errorMessage={errors?.nomenclator_id?.message} required
                  control={control} options={nomenclators} returnField="id"
                  getOptionLabel={(option) => option.name}
                />
              </Grid>
            }
            {(fieldTypeCode === "LEAD") &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete name="related_campaign_id" label="Campaña del Lead Relacionado"
                  errorMessage={errors?.related_campaign_id?.message} required
                  control={control} options={campaigns} returnField="id"
                  getOptionLabel={(option) => option.name}
                />
              </Grid>
            }
            {fieldTypeCode === "CALCULATED" &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <RegisteredTextInput name="calculation_expression" label="Fórmula" register={register}
                  errorMessage={errors?.calculation_expression?.message} required />
              </Grid>
            }
            {fieldTypeCode === "STRING" &&
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <RegisteredTextInput name="input_mask" label="Máscara de Input" register={register}
                  errorMessage={errors?.input_mask?.message} required />
              </Grid>
            }
          </>
        }
        {(creationMethod === "template" || (fieldTypeCode && ["NUMBER", "INT", "STRING", "BOOL"].includes(fieldTypeCode))) &&

          <Grid size="grow" minWidth="20rem">
            <ControlledTextInput control={control} label="Valor por Defecto" name="default_value"
              errorMessage={errors?.default_value?.message} />
          </Grid>
        }
      </Grid>
    </Grid>
  )
}