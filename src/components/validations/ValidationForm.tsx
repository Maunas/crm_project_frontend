import { useEffect, useMemo, useState } from "react";
import { ControlledTextInput, RegisteredTextInput } from "../common/forms/CustomInputs";
import { ControlledAutocomplete, ControlledRadio } from "../common/forms/CustomMultipleInputs";
import { EnabledIcon } from "../common/lists/Badges";
import type { FieldValidationRule, FieldValidationRulePost, FieldValidationRuleTemplate, LeadFieldDetailed } from "../../types/leadFields";
import { createValidation, deleteValidation, getValidationDataByType, getValidationTemplates, setValFormErrors, updateValidation } from "./validationService";
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFieldArrayRemove, type UseFormClearErrors, type UseFormGetValues, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { Button, Divider, Grid, Stack, Typography, ButtonGroup } from "@mui/material";
import { FormErrorMessage } from "../../styles/styledMUIFormComponents";
import type { DeleteResponse } from "../../types/common";

export interface FieldValidationListPostInstance extends FieldValidationRulePost {
    required_params: string[];
    creation_method?: "manual" | "template",
    to_delete: boolean,
    id?: number
}

export type FieldValidationListPost = {
    validation_rules: FieldValidationListPostInstance[],
}

export interface ValidationSidebarProps {
    leadField: LeadFieldDetailed,
    updateEntityOnList: (entity: LeadFieldDetailed) => void,
    handleSidebar: (
        mode: string,
        entity: LeadFieldDetailed,
    ) => void,
}

export const ValidationFormSidebar = ({ leadField, updateEntityOnList, handleSidebar }: ValidationSidebarProps) => {
    const onSubmit = (val: FieldValidationListPostInstance) => {
        if (val.to_delete && val.id) return deleteValidation(val.id)
        if (val.id) {
            return updateValidation(getValidationDataByType(val, val.creation_method === "template"), val.id)
        } else {
            return createValidation(getValidationDataByType(val, val.creation_method === "template"))
        }
    }
    //Actualiza el leadfield, abre el detalle
    const onSubmitAll = (val: FieldValidationRule[]) => {
        const newLeadField = { ...leadField, validation_rules: val }
        updateEntityOnList(newLeadField)
        handleSidebar("DETAILS_FIELD", newLeadField)
    }
    //Actualiza el leadField, el formulario queda abierto
    const onErrorAll = (val: FieldValidationRule[]) => {
        updateEntityOnList({ ...leadField, validation_rules: val })
    }

    return (
        <ValidationRuleForm leadField={leadField} onSubmit={onSubmit} onSubmitAll={onSubmitAll} onErrorAll={onErrorAll}
            onCancel={() => handleSidebar("DETAILS_FIELD", leadField)} />
    )
}

interface ValidationRuleFormProps {
    leadField: LeadFieldDetailed
    onCancel: () => void
    onSubmit: (data: FieldValidationListPostInstance) => Promise<FieldValidationRule | { action: string; }>
    onSubmitAll: (data: FieldValidationRule[]) => void
    onErrorAll: (data: FieldValidationRule[]) => void
}

export const ValidationRuleForm = ({ leadField, onSubmit, onSubmitAll, onErrorAll, onCancel }: ValidationRuleFormProps) => {

    const setCreationMethod = (validation_rules: FieldValidationRule[]) => {
        return validation_rules.map(val => ({
            ...val,
            creation_method: val.template_code ? "template" : "manual",
        }) as FieldValidationListPostInstance
        )
    }

    const { control, register, handleSubmit, setError, setValue, getValues, clearErrors, formState: { errors } } = useForm<FieldValidationListPost>({
        defaultValues: { validation_rules: setCreationMethod(leadField.validation_rules) }
    })

    const { append, remove, fields } = useFieldArray({ control, name: "validation_rules", keyName: "array_id" });

    useEffect(() => {
        if (!leadField) onCancel()
    }, [leadField, onCancel])

    const [templates, setTemplates] = useState<FieldValidationRuleTemplate[]>([]);

    useEffect(() => {
        getValidationTemplates().then(setTemplates);
    }, []);

    const submit = async (data: FieldValidationListPost) => {
        //Promise.allSettled guarda los resultados de todas las peticiones, con:
        //{status:"fullfilled" value: respuesta} En exito
        //{status:"rejected" reason: error} En error
        const results = await Promise.allSettled(
            data.validation_rules.map((val, idx) => {
                return onSubmit(val)
                    .then(savedVal => {
                        //Si no elimina, guarda los datos nuevos de los campos creados para habilitar su modificación
                        if (!val.to_delete && "id" in savedVal) {
                            setValue(`validation_rules.${idx}`, { ...val, ...savedVal })
                            return savedVal
                        }
                        else return (savedVal as DeleteResponse).action //Guarda solo el string "deleted"
                    })
                    .catch(e => {
                        setValFormErrors(idx, val.creation_method === "template", e, setError)
                        throw (e)
                    })
            })
        )
        let errorFlag = false
        const idxToDelete: number[] = []
        const newLeadFieldValidationList: FieldValidationRule[] = [] //Para la lista dentro del detalle de leadField
        results.forEach((result, idx) => {
            if (result.status === "rejected") {
                errorFlag = true
                //Guarda los valores previos al formulario
                if (leadField.validation_rules[idx]) newLeadFieldValidationList.push(leadField.validation_rules[idx])
            }
            else if (typeof result.value === "string") idxToDelete.push(idx) //Si falla lo quita del formulario

            else newLeadFieldValidationList.push(result.value)
        })
        remove(idxToDelete) //Se eliminan todos a la vez para evitar errores despues de setear errores.
        return errorFlag ? onErrorAll(newLeadFieldValidationList) : onSubmitAll(newLeadFieldValidationList)
    }
    
    return (
        <Stack spacing={2}>
            <Stack>
                <Typography variant="h2">{leadField.name}</Typography>
                <Typography variant="h3">Reglas de Validación</Typography>
            </Stack>
            <Divider />
            {fields?.length > 0 ?
                fields.map((field, idx) => (
                    <ValidationInstance key={field.array_id} idx={idx} templates={templates}
                        register={register} control={control} setValue={setValue} remove={remove} getValues={getValues}
                        errors={errors} clearErrors={clearErrors} />
                ))
                : <Typography variant="h4" textAlign="center">No hay reglas de Validación.</Typography>
            }
            <ButtonGroup>
                <Button onClick={onCancel} fullWidth>Cerrar</Button>
                <Button variant="contained" onClick={() =>
                    append({
                        name: "",
                        error_message: "",
                        expression: "",
                        creation_method: "template",
                        template_params: {},
                        required_params: [],
                        field_id: leadField.id,
                        to_delete: false
                    })
                } fullWidth>
                    Agregar Validación
                </Button>
                <Button onClick={handleSubmit(submit)} fullWidth>Guardar Cambios</Button>
            </ButtonGroup>
        </Stack>
    );
};

interface ValidationInstanceProps {
    idx: number;
    templates: FieldValidationRuleTemplate[];
    register: UseFormRegister<FieldValidationListPost>;
    control: Control<FieldValidationListPost>;
    setValue: UseFormSetValue<FieldValidationListPost>;
    getValues: UseFormGetValues<FieldValidationListPost>,
    remove: UseFieldArrayRemove;
    errors: FieldErrors<FieldValidationListPost>;
    clearErrors: UseFormClearErrors<FieldValidationListPost>

}
export const ValidationInstance = ({ idx, templates, register, control, setValue, getValues, remove, errors }: ValidationInstanceProps) => {

    const existingValId = useWatch({ name: `validation_rules.${idx}.id`, control });

    const selectedTemplateCode = useWatch({
        name: `validation_rules.${idx}.template_code`,
        control,
    });
    const creationMethod = useWatch({
        name: `validation_rules.${idx}.creation_method`,
        control,
    });
    const toDelete = useWatch({
        name: `validation_rules.${idx}.to_delete`,
        control,
    });
    const selectedTemplate = useMemo(
        () => templates.find(template => template.code === selectedTemplateCode),
        [selectedTemplateCode, templates]
    );

    useEffect(() => {
        setValue(`validation_rules.${idx}.required_params`, selectedTemplate?.required_params ?? [])
    }, [selectedTemplate, templates, idx, setValue]);

    const creationMethodOptions = [
        { label: "Por Plantilla", value: "template" },
        { label: "Manual", value: "manual" },
    ];
    const generateErrorMessage = () => {
        if (selectedTemplate) {
            let errorMessage = selectedTemplate.error_message;
            for (const param of selectedTemplate.required_params) {
                errorMessage = errorMessage.replace(
                    `{${param}}`, getValues(`validation_rules.${idx}.template_params`)?.[param] ?? `[${param}]`,
                );
            }
            setValue(`validation_rules.${idx}.error_message`, errorMessage);
        }
    };

    const handleRemove = (idx: number) => {
        if (!existingValId) remove(idx)
        else setValue(`validation_rules.${idx}.to_delete`, !toDelete)
    }

    return (
        <>
            <Grid container justifyContent="center" marginBlock={2}>
                <Grid size="grow">
                    <Stack gap={1} direction="row" alignItems="center" >
                        <Typography variant="h4" color={toDelete ? "error" : "textPrimary"} >Validación {idx + 1}</Typography>
                        {existingValId && <EnabledIcon active={!!existingValId && !toDelete} trueTooltip="Creado" falseTooltip="Para eliminar" />}
                    </Stack>
                </Grid>
                <Grid size="auto">
                    <Button variant="outlined" color={!toDelete ? "error" : "success"} onClick={() => handleRemove(idx)}>
                        {!toDelete ? "Eliminar Validación" : "Cancelar Eliminación"}
                    </Button>
                </Grid>
            </Grid >

            <input {...register(`validation_rules.${idx}.field_id`)} readOnly hidden />
            <input {...register(`validation_rules.${idx}.required_params`)} readOnly hidden />

            <Grid container spacing={2} justifyContent="center">
                <Grid container spacing={2} minWidth="20rem" size={12}>
                    <Grid size="grow" minWidth="20rem">
                        <RegisteredTextInput
                            name={`validation_rules.${idx}.name`}
                            register={register}
                            label="Nombre de la Regla"
                            required
                            errorMessage={errors?.validation_rules?.[idx]?.name?.message}
                        />
                    </Grid>
                    {!toDelete &&
                        <Grid size="grow" minWidth="15rem" justifyContent="center">
                            <ControlledRadio
                                control={control}
                                name={`validation_rules.${idx}.creation_method`}
                                options={creationMethodOptions}
                                returnField="value"
                                getRadioLabel={(option) => option.label}
                                label="Método de Creación"
                                keyField="value"
                            />
                        </Grid>
                    }
                </Grid>
                {!toDelete &&
                    <>
                        <Grid container spacing={2} size="grow" minWidth="20rem">
                            <Grid size="grow" minWidth="15rem" justifyContent="center">
                                <ControlledTextInput
                                    control={control}
                                    label="Mensaje de Error"
                                    name={`validation_rules.${idx}.error_message`}
                                    errorMessage={
                                        errors?.validation_rules?.[idx]?.error_message?.message
                                    }
                                />
                            </Grid>
                            {creationMethod === "template" &&
                                selectedTemplate?.error_message && (
                                    <Grid size="auto" justifyContent="center">
                                        <Button variant="outlined" onClick={generateErrorMessage} fullWidth>
                                            Generar
                                        </Button>
                                    </Grid>
                                )}
                        </Grid>

                        <Grid container spacing={2} minWidth="20rem" size="grow">
                            {creationMethod === "manual" && (
                                <Grid size="grow">
                                    <RegisteredTextInput
                                        name={`validation_rules.${idx}.expression`}
                                        register={register}
                                        required
                                        label={`Expresión de Validación`}
                                        errorMessage={
                                            errors?.validation_rules?.[idx]?.expression?.message
                                        }
                                    />
                                </Grid>
                            )}
                            {creationMethod === "template" && (
                                <>
                                    <Grid size="grow" spacing={2} minWidth="15rem">
                                        <ControlledAutocomplete control={control} name={`validation_rules.${idx}.template_code`} options={templates}
                                            label="Plantilla" getOptionKey={(op) => op.code} getOptionLabel={(op) => op.name} returnField="code"
                                            required errorMessage={errors?.validation_rules?.[idx]?.template_code?.message}
                                        />
                                    </Grid>

                                </>

                            )}
                        </Grid>
                        {selectedTemplate &&
                            selectedTemplate.required_params?.length > 0 &&
                            <Grid container spacing={2} size="grow" minWidth="8rem">
                                {selectedTemplate?.required_params.map((param) => (
                                    <Grid container size="grow" minWidth="4rem" spacing={2} key={`${idx}-${param}`} >
                                        <RegisteredTextInput register={register} name={`validation_rules.${idx}.template_params.${param}`}
                                            label={param} id={`validation_rules.${idx}.template_params.${param}-${selectedTemplate.name}`}
                                            required errorMessage={errors?.validation_rules?.[idx]?.template_params?.[param]?.message}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        }
                    </>
                }
            </Grid>
            <FormErrorMessage>{errors.validation_rules?.[idx]?.root?.message}</FormErrorMessage>
            <Divider sx={{ marginBlock: "1rem" }} />
        </>
    );
};
