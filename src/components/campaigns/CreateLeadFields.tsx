import { useEffect, useState } from "react"
import { createLeadField, getFieldTemplates, getFieldTypes, getNomenclators } from "./campaignServices"
import { Autocomplete, Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Checkbox, Typography, RadioGroup, Container, Paper, Radio } from "@mui/material"
import { getFieldSections } from "../lead/leadService"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"

export const CreateLeadFields = () => {

  const [fieldTemplates, setFieldTemplates] = useState<any[]>([])
  const [fieldSections, setFieldSections] = useState<any[]>([])
  const [fieldTypes, setFieldTypes] = useState<any[]>([])
  const [nomenclators, setNomenclators] = useState<any[]>([])

  const { id } = useParams()
  const nav = useNavigate()

  const { register, control, handleSubmit, watch, reset } = useForm()

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections().then(setFieldSections)
    getFieldTypes().then(setFieldTypes)
    getNomenclators().then(setNomenclators)
    return () => setFieldTemplates([])
  }, [id])

  const submit = (data) => {
    createLeadField({ ...data, campaign_id: id, order: 2 })
      .then(res => nav(`/campaigns/${id}`))
      .catch(e => console.log(data))
  }

  const submitAndReset = (data) => {
    createLeadField({ ...data, campaign_id: id, order: 2 })
      .then(() => {alert("Creado"); reset()})
      .catch (e => console.log(data))
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
          nomenclators={nomenclators} />
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
const LeadField = ({ templates, sections, types, nomenclators, register, control, fieldType }) => {

  const [fieldMethod, setFieldMethod] = useState<string | null>("Por Plantilla")

  const changeFieldMethod = (e, data) => {
    setFieldMethod(data)
  }
  console.log(fieldType)
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
            :
            <>
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
              {fieldType === "NOMENCLATOR" &&
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <Controller name={`nomenclator_id`} control={control} render={({ field }) =>
                    <Autocomplete
                      {...field}
                      disablePortal
                      options={nomenclators}
                      renderInput={(params) => <TextField {...params} label="Selector" />}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.id}
                      onChange={(e, data) => field.onChange(data.id)}
                      value={field.value}
                    />
                  }>

                  </Controller>
                </Grid>
              }
            </>
          }
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