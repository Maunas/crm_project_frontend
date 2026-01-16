import { useEffect, useState } from "react"
import { createLeadField, getFieldTemplates, getFieldTypes, getNomenclators } from "./campaignServices"
import { Autocomplete, Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Checkbox, Avatar, useTheme, IconButton, Typography, RadioGroup } from "@mui/material"
import { getFieldSections } from "../lead/leadService"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import DeleteIcon from '@mui/icons-material/Delete';
import { Radio } from "@mui/icons-material"

export const CreateLeadFields = ({ newCampaign }) => {

  const [fieldTemplates, setFieldTemplates] = useState<any[]>([])
  const [fieldSections, setFieldSections] = useState<any[]>([])
  const [fieldTypes, setFieldTypes] = useState<any[]>([])
  const [nomenclators, setNomenclators] = useState<any[]>([])

  const { register, control, handleSubmit } = useForm()

  const { append, fields, remove } = useFieldArray({ name: "user_fields", control })

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections().then(setFieldSections)
    getFieldTypes().then(setFieldTypes)
    getNomenclators().then(setNomenclators)
    return () => setFieldTemplates([])
  }, [newCampaign])

  useEffect(() => {
    append({})
    return () => remove()
  }, [])

  const submit = (data) => {
    Promise.all(data.user_fields.map((i) => createLeadField({ ...i, campaign_id: newCampaign.id })))
      .then(res => console.log(res))
  }

  return (
    <form>
      <Typography variant="h3" color="initial">{newCampaign.name}</Typography>
      {fieldSections?.length > 0 && fieldTemplates.length > 0 &&
        nomenclators.length > 0 && fieldTypes.length > 0 &&
        <>
          {fields?.length > 0 &&
            fields.map((field, idx) =>
              <LeadField templates={fieldTemplates} sections={fieldSections} key={field.id} idx={idx} register={register} remove={remove}
                types={fieldTypes} control={control}
                nomenclators={nomenclators} />
            )
          }
          <Button variant="contained" onClick={handleSubmit(submit)}>
            Guardar
          </Button>
          <Button variant="contained" onClick={() => append({})}>
            Agregar Campo
          </Button>
        </>
      }
    </form>
  )
}
const LeadField = ({ templates, sections, types, nomenclators, idx, register, remove, control }) => {

  return (
    <>
      <Divider sx={{ marginBlock: ".5rem" }} />
      <Grid container spacing={2} justifyContent="center">
        <Grid size={1} justifyContent="center" alignContent="center" minWidth="40px">
          <TextField
            disabled
            id=""
            label="Orden"
            fullWidth
            value={idx + 1}
            {...register(`user_fields.${idx}.order`)}
          />
        </Grid>
        <Grid size="grow" container minWidth="20rem">
          <Grid size="grow" minWidth="15rem">
            <TextField
              id=""
              label="Nombre del Campo"
              fullWidth
              {...register(`user_fields.${idx}.name`)}
            />
          </Grid>
          <Grid size="grow" minWidth="15rem" justifyContent="center">
            <Controller name={`user_fields.${idx}.lead_field_section_id`} control={control} render={({ field }) =>
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
              <FormControlLabel control={<Checkbox />} label="Obligatorio" {...register(`user_fields.${idx}.required`)} />
              <FormControlLabel control={<Checkbox />} label="Único" {...register(`user_fields.${idx}.is_primary`)} />
              <FormControlLabel control={<Checkbox />} label="Visible" {...register(`user_fields.${idx}.is_visible`)} />
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
            <Controller name={`user_fields.${idx}.field_type_code`} control={control} render={({ field }) =>
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
            <Controller name={`user_fields.${idx}.field_template_code`} control={control} render={({ field }) =>
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
            <Controller name={`user_fields.${idx}.nomenclator_id`} control={control} render={({ field }) =>
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
              {...register(`user_fields.${idx}.default_value`)}
            />
          </Grid>
        </Grid>
        <Grid size={1} justifyContent="center" alignContent="center" minWidth="40px">
          <IconButton aria-label="delete" onClick={() => remove(idx)}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider sx={{ marginBlock: ".5rem" }} />
    </>
  )
}