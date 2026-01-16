import { useEffect, useState } from "react"
import { createLeadField, getFieldTemplates, getFieldTypes, getNomenclators } from "./campaignServices"
import { Autocomplete, Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Checkbox, Typography, RadioGroup, Container, Paper } from "@mui/material"
import { getFieldSections } from "../lead/leadService"
import { Controller, useForm } from "react-hook-form"
import { Radio } from "@mui/icons-material"
import { useParams } from "react-router-dom"

export const CreateLeadFields = () => {

  const { campaignId } = useParams()

  const [fieldTemplates, setFieldTemplates] = useState<any[]>([])
  const [fieldSections, setFieldSections] = useState<any[]>([])
  const [fieldTypes, setFieldTypes] = useState<any[]>([])
  const [nomenclators, setNomenclators] = useState<any[]>([])

  const { register, control, handleSubmit } = useForm()

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections().then(setFieldSections)
    getFieldTypes().then(setFieldTypes)
    getNomenclators().then(setNomenclators)
    return () => setFieldTemplates([])
  }, [campaignId])

  const submit = (data) => {
    createLeadField({ ...data, campaign_id: campaignId })
      .then(res => console.log(res))
      .catch(e=>console.log(data))
  }

  return (
    <Container >
      <Paper sx={{ padding: 2 }}>
        <form>
          <Typography variant="h3" color="initial">{campaignId}</Typography>
          <LeadField templates={fieldTemplates} sections={fieldSections} register={register}
            types={fieldTypes} control={control}
            nomenclators={nomenclators} />
          <Button variant="contained" onClick={handleSubmit(submit)}>
            Guardar
          </Button>
      </form>
    </Paper>
    </Container >
  )
}
const LeadField = ({ templates, sections, types, nomenclators, register, control }) => {

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
            <Controller name={`lead_field_section_id`} control={control} render={({ field }) =>
              <Autocomplete
                {...field}
                disablePortal
                options={sections}
                renderInput={(params) => <TextField {...params} label="Sección" />}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.id}
                onChange={(e, data) => field.onChange(data.id)}
                value={field.value}
              />
            }>

            </Controller>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <FormGroup row>
              <FormControlLabel control={<Checkbox />} label="Obligatorio" {...register(`required`)} />
              <FormControlLabel control={<Checkbox />} label="Único" {...register(`is_primary`)} />
              <FormControlLabel control={<Checkbox />} label="Visible" {...register(`is_visible`)} />
            </FormGroup>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <RadioGroup row
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Controller name={`field_type_code`} control={control} render={({ field }) =>
              <Autocomplete
                {...field}
                disablePortal
                options={types}
                renderInput={(params) => <TextField {...params} label="Tipos" />}
                getOptionLabel={(option) => `${option.code} - ${option.description}`}
                getOptionKey={(option) => option.code}
                onChange={(e, data) => field.onChange(data.code)}
                value={field.value}
              />
            }>
            </Controller>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Controller name={`field_template_code`} control={control} render={({ field }) =>
              <Autocomplete
                {...field}
                disablePortal
                options={templates}
                renderInput={(params) => <TextField {...params} label="Plantillas" />}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.code}
                onChange={(e, data) => field.onChange(data.code)}
                value={field.value}
              />
            }>

            </Controller>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Controller name={`nomenclator_id`} control={control} render={({ field }) =>
              <Autocomplete
                {...field}
                disablePortal
                options={nomenclators}
                renderInput={(params) => <TextField {...params} label="Selectores" />}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.id}
                onChange={(e, data) => field.onChange(data.id)}
                value={field.value}
              />
            }>

            </Controller>
          </Grid>
          <Grid size="grow" minWidth="20rem">
            <TextField
              id=""
              label="Valor por Defecto"
              fullWidth
              {...register(`default_value`)}
            />
          </Grid>
        </Grid>

      </Grid>
      <Divider sx={{ marginBlock: ".5rem" }} />
    </>
  )
}