import { useEffect, useState } from "react"
import { getFieldTemplates, getFieldTypes, getNomenclators } from "./campaignServices"
import { Autocomplete, Divider, TextField, Button, Grid, FormControlLabel, FormGroup, Checkbox, Avatar, useTheme } from "@mui/material"
import { getFieldSections } from "../lead/leadService"

export const CreateLeadFields = ({ campaignId }) => {

  const [fieldTemplates, setFieldTemplates] = useState<any[]>([])
  const [fieldSections, setFieldSections] = useState<any[]>([])
  const [fieldTypes, setFieldTypes] = useState<any[]>([])
  const [nomenclators, setNomenclators] = useState<any[]>([])

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates)
    getFieldSections().then(setFieldSections)
    getFieldTypes().then(setFieldTypes)
    getNomenclators().then(setNomenclators)
    return () => setFieldTemplates([])
  }, [campaignId])

  return (
    <>
      {fieldSections?.length > 0 && fieldTemplates.length > 0 &&
        nomenclators.length > 0 && fieldTypes.length > 0 &&
        <>
          <Divider sx={{ marginBlock: ".5rem" }} />
          <LeadField templates={fieldTemplates} sections={fieldSections}
            types={fieldTypes}
            nomenclators={nomenclators} />
          <Divider sx={{ marginBlock: ".5rem" }} />
          <Button variant="contained" >
            Agregar Campo
          </Button>
        </>
      }
    </>
  )
}
const LeadField = ({ templates, sections, types, nomenclators }) => {

  const theme = useTheme();

  return (
    <form style={{ padding: "1rem" }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid size={1} justifyContent="center" alignContent="center" minWidth="40px">
          <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>1</Avatar>
        </Grid>
        <Grid size="grow" container minWidth="20rem">
          <Grid size="grow" minWidth="20rem">
            <TextField
              id=""
              label="Nombre del Campo"
              fullWidth
            />
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Autocomplete
              disablePortal
              options={sections}
              renderInput={(params) => <TextField {...params} label="Sección" />}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
            />
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <FormGroup row>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Obligatorio" />
              <FormControlLabel control={<Checkbox />} label="Único" />
              <FormControlLabel control={<Checkbox />} label="Visible" />
            </FormGroup>
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Autocomplete
              disablePortal
              options={types}
              renderInput={(params) => <TextField {...params} label="Tipos" />}
              getOptionLabel={(option) => `${option.code} - ${option.description}`}
              getOptionKey={(option) => option.code}
            />
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Autocomplete
              disablePortal
              options={templates}
              renderInput={(params) => <TextField {...params} label="Plantillas" />}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.code}
            />
          </Grid>
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <Autocomplete
              disablePortal
              options={nomenclators}
              renderInput={(params) => <TextField {...params} label="Selectores" />}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.code}
            />
          </Grid>
        </Grid>

      </Grid>
    </form>
  )
}