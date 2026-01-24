import { Divider, Typography, Button, Grid, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { getValidationTemplates } from '../leadFields/leadFieldServices'
import { ControlledAutocomplete } from '../common/forms/ControlledAutocomplete'

export const ValidationRuleForm = ({ control, register, watch, setValue }) => {

    const { append, remove, fields } = useFieldArray({ control, name: "validation_rules" })
    const [templates, setTemplates] = useState<any[]>([])

    useEffect(() => {
        getValidationTemplates().then(setTemplates)
        return () => setTemplates([])
    }, [])

    return (
        <>
            <Typography variant="h3">Validaciones</Typography>
            <Divider sx={{ marginBlock: "1rem" }} />
            {fields?.length > 0 &&
                fields.map((field, idx) =>
                    <ValidationInstance key={field.id} register={register} idx={idx} remove={remove} templates={templates} control={control} watch={watch} setValue={setValue} />
                )
            }
            <Button variant="contained" onClick={() => append({})}>
                Agregar Validación
            </Button>
            <Divider sx={{ marginBlock: "1rem" }} />

        </>
    )
}


export const ValidationInstance = ({ idx, register, templates, control, remove, watch, setValue }) => {

    const [validationMethod, setValidationMethod] = useState("Por Plantilla")

    const selectedCode = watch(`validation_rules.${idx}.template_code`)
    const requiredParamsValue = watch(`validation_rules.${idx}.template_params`)

    const changeValidationMethod = (e) => {
        setValidationMethod(e.target.value)
    }
    const selectedTemplate = useMemo(() => {
        if (validationMethod === "Por Plantilla" && selectedCode) {
            return templates.find(template => selectedCode === template.code)
        }
    }, [selectedCode, validationMethod, templates])

    const generateErrorMessage = () => {
        let errorMessage = selectedTemplate.error_message

        for (let item of selectedTemplate?.required_params) {
            errorMessage = errorMessage.replace(`{${item}}`, requiredParamsValue[item])
        }
        setValue(`validation_rules.${idx}.error_message`, errorMessage)
    }

    return (
        <>
            <Typography variant="h4">Validación {idx + 1}</Typography>
            <Grid container spacing={2} justifyContent="center">
                <Grid container spacing={2} size={11}>

                    <Grid container spacing={2} minWidth="20rem">
                        <Grid size="grow" minWidth="20rem">
                            <TextField
                                id=""
                                label="Nombre de Validación"
                                fullWidth
                                {...register(`validation_rules.${idx}.name`)}
                            />
                        </Grid>
                        <Grid size="grow" minWidth="20rem" justifyContent="center">
                            <RadioGroup row
                                aria-labelledby="demo-radio-buttons-group-label"
                                defaultValue="Por Plantilla"
                                name="radio-buttons-group"
                                onChange={changeValidationMethod}
                            >
                                <FormControlLabel value="Por Plantilla" defaultChecked control={<Radio />} label="Por Plantilla" />
                                <FormControlLabel value="Manual" control={<Radio />} label="Manual" />
                            </RadioGroup>
                        </Grid>
                    </Grid>

                    {validationMethod === "Manual" &&
                        <Grid container size={12} spacing={2}>
                            <TextField
                                id=""
                                label={`Expresión de Validación`}
                                fullWidth
                                {...register(`validation_rules.${idx}.expression`)}
                            />
                        </Grid>}

                    {validationMethod === "Por Plantilla" &&
                        <>
                            <Grid size={12} spacing={2}>
                                <ControlledAutocomplete control={control} label='Plantilla' name={`validation_rules.${idx}.template_code`}
                                    optionList={templates} getOptionKey={op => op.code} getOptionLabel={op => op.name} returnField="code" />
                            </Grid>
                            {
                                selectedTemplate?.required_params?.length > 0 &&
                                selectedTemplate?.required_params.map(i => {
                                    return (
                                        <Grid container size={4} minWidth="15rem" spacing={2} key={`${i}`}>
                                            <TextField
                                                id=""
                                                label={i}
                                                fullWidth
                                                {...register(`validation_rules.${idx}.template_params.${i}`)}
                                            />
                                        </Grid>)
                                })
                            }
                        </>
                    }

                    <Grid container spacing={2} size={12}>
                        <Grid size="grow" minWidth="20rem" justifyContent="center">
                            <TextField
                                id=""
                                label={`Mensaje de Error`}
                                fullWidth
                                {...register(`validation_rules.${idx}.error_message`)}
                                defaultValue=" "
                            />
                        </Grid>
                        {
                            validationMethod === "Por Plantilla" && selectedTemplate?.error_message &&
                            <Grid size="auto" justifyContent="center">
                                <Button variant="outlined" onClick={generateErrorMessage}>
                                    Generar
                                </Button>
                            </Grid>

                        }
                    </Grid>
                </Grid>
                <Grid><Button variant="outlined" color="error" onClick={() => remove(idx)}>
                    Eliminar
                </Button></Grid>
            </Grid>
            <Divider sx={{ marginBlock: "1rem" }} />

        </>
    )
}
