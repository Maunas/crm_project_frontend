import { Divider, Typography, Button, Grid, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { useFieldArray, useWatch, type Control, type UseFieldArrayRemove, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { getValidationTemplates } from '../leadFields/leadFieldServices'
import { ControlledAutocomplete, ControlledRadio } from '../common/forms/CustomMultipleInputs'
import type { FieldValidationRuleTemplate } from '../../types/leadFields'
import type { LeadFieldData } from './CreateLeadFields'
import { ControlledTextInput } from '../common/forms/CustomInputs'

interface ValidationRuleFormProps {
    control: Control<LeadFieldData>,
    register: UseFormRegister<LeadFieldData>,
    setValue: UseFormSetValue<LeadFieldData>
}

export const ValidationRuleForm = ({ control, register, setValue }: ValidationRuleFormProps) => {

    const { append, remove, fields } = useFieldArray<LeadFieldData>({ control, name: "validation_rules" })
    const [templates, setTemplates] = useState<FieldValidationRuleTemplate[]>([])

    useEffect(() => {
        getValidationTemplates().then(setTemplates)
    }, [])

    return (
        <>
            <Typography variant="h2">Reglas de Validación</Typography>
            {fields?.length > 0 &&
                fields.map((field, idx) =>
                    <ValidationInstance key={field.id} idx={idx} templates={templates}
                        register={register} control={control} setValue={setValue} remove={remove} />
                )
            }
            <Button variant="contained" onClick={() =>
                append({ name: "", error_message: "", creation_method: "template", template_params: {} })}>
                Agregar Validación
            </Button>
            <Divider sx={{ marginBlock: "1rem" }} />
        </>
    )
}


interface ValidationInstanceProps {
    idx: number,
    templates: FieldValidationRuleTemplate[],
    register: UseFormRegister<LeadFieldData>,
    control: Control<LeadFieldData>,
    setValue: UseFormSetValue<LeadFieldData>,
    remove: UseFieldArrayRemove

}
export const ValidationInstance = ({ idx, templates, register, control, setValue, remove }: ValidationInstanceProps) => {

    const selectedTemplate = useWatch({ name: `validation_rules.${idx}.template`, control })
    const requiredParamsValue = useWatch({ name: `validation_rules.${idx}.template_params`, control })
    const creationMethod = useWatch({ name: `validation_rules.${idx}.creation_method`, control })

    const creationMethodOptions = [
        { label: "Por Plantilla", value: "template" },
        { label: "Manual", value: "manual" }
    ]

    const generateErrorMessage = () => {
        if (selectedTemplate) {
            let errorMessage = selectedTemplate.error_message
            for (const param of selectedTemplate.required_params) {
                errorMessage = errorMessage.replace(`{${param}}`, requiredParamsValue[param] ?? `[${param}]`)
            }
            setValue(`validation_rules.${idx}.error_message`, errorMessage)
        }
    }

    return (
        <>
            <Grid container justifyContent="center" marginBlock={2}>
                <Grid size="grow">
                    <Typography variant="h4">Validación {idx + 1}</Typography>
                </Grid>
                <Grid size="auto">
                    <Button variant="outlined" color="error" onClick={() => remove(idx)}>
                        Eliminar Validación
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={2} justifyContent="center">
                <Grid container spacing={2} minWidth="20rem" size={12}>
                    <Grid size={4} minWidth="20rem">
                        <TextField
                            id={`validation_rules.${idx}.name`}
                            label="Nombre de la Regla"
                            fullWidth
                            {...register(`validation_rules.${idx}.name`)}
                        />
                    </Grid>
                    <Grid container spacing={2} size="grow" minWidth="20rem">
                        <Grid size="grow" minWidth="20rem" justifyContent="center">
                            <ControlledTextInput control={control} label='Mensaje de Error' name={`validation_rules.${idx}.error_message`} />
                        </Grid>
                        {
                            creationMethod === "template" && selectedTemplate?.error_message &&
                            <Grid size="auto" justifyContent="center">
                                <Button variant="outlined" onClick={generateErrorMessage}>
                                    Generar Mensaje
                                </Button>
                            </Grid>

                        }
                    </Grid>
                </Grid>

                <Grid container spacing={2} minWidth="20rem" size={12}>
                    <Grid size={4} minWidth="20rem" justifyContent="center">
                        <ControlledRadio control={control} name={`validation_rules.${idx}.creation_method`} options={creationMethodOptions} 
                        returnField="value" radioLabel={option=>option.label} label="Método de Creación" />
                    </Grid>
                    {creationMethod === "manual" &&
                        <Grid size="grow">
                            <TextField
                                id={`validation_rules.${idx}.expression`}
                                label={`Expresión de Validación`}
                                fullWidth
                                {...register(`validation_rules.${idx}.expression`)}
                            />
                        </Grid>
                    }
                    {creationMethod === "template" &&
                        <Grid size="grow" spacing={2}>
                            <ControlledAutocomplete control={control} label='Plantilla' name={`validation_rules.${idx}.template`}
                                options={templates} getOptionKey={op => op.code} getOptionLabel={op => op.name}/>
                        </Grid>
                    }
                </Grid>
                <Grid container spacing={2} size="grow" justifyContent="end">
                    {
                        selectedTemplate && selectedTemplate.required_params?.length > 0 &&
                        selectedTemplate?.required_params.map(param =>
                            <Grid container size={3} minWidth="15rem" spacing={2} key={`${param}-${selectedTemplate.name}`}>
                                <TextField
                                    id={`validation_rules.${idx}.template_params.${param}-${selectedTemplate.name}`}
                                    label={param}
                                    fullWidth
                                    {...register(`validation_rules.${idx}.template_params.${param}`)}
                                />
                            </Grid>
                        )
                    }
                </Grid>
            </Grid>
            <Divider sx={{ marginBlock: "1rem" }} />
        </>
    )
}
