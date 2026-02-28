import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFieldArrayRemove, type UseFormClearErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import type { FieldValidationRule, FieldValidationRulePost, FieldValidationRuleTemplate, LeadFieldDetailed } from "../../types/leadFields";
import { useEffect, useMemo, useState } from "react";
import { createValidation, getValidationDataByType, getValidationTemplates, updateValidation } from "../leadFields/leadFieldServices";
import { Button, Divider, Grid, Stack, Typography, ButtonGroup } from "@mui/material";
import { ControlledTextInput, RegisteredTextInput } from "../common/forms/CustomInputs";
import { ControlledAutocomplete, ControlledRadio } from "../common/forms/CustomMultipleInputs";
import { EnabledIcon } from "../common/lists/Badges";


export interface FieldValidationListPostInstance extends FieldValidationRulePost {
    required_params: string[];
    creation_method?: "manual" | "template",
    id?: number
}

export interface FieldValidationListPost {
    validation_rules: FieldValidationListPostInstance[],
}

interface ValidationSidebarProps {
    leadField: LeadFieldDetailed,
    updateEntityOnList: (entity: LeadFieldDetailed) => void,
    handleSidebar: (
        mode: string,
        entity: LeadFieldDetailed,
    ) => void,
    closeSidebar: () => void,
}

export const ValidationFormSidebar = ({ leadField, updateEntityOnList, closeSidebar, handleSidebar }: ValidationSidebarProps) => {

    const onSubmit = (data: FieldValidationListPost) => {
        return Promise.all(
            data.validation_rules.map(val => {
                if (val.id) {
                    return updateValidation(getValidationDataByType(val, val.creation_method === "template"), val.id).then(res => res)
                } else {
                    return createValidation(getValidationDataByType(val, val.creation_method === "template")).then(res => res)
                }
            })
        ).then(newList => {
            const newLeadField = {...leadField, validation_rules: newList}
            updateEntityOnList(newLeadField)
            handleSidebar("DETAILS_FIELD", newLeadField)
        })
    }

    return (
        <ValidationRuleForm leadField={leadField} onSubmit={onSubmit} onCancel={closeSidebar} />
    )
}

interface ValidationRuleFormProps {
    leadField: LeadFieldDetailed
    onCancel: () => void
    onSubmit: (data: FieldValidationListPost) => Promise<void>
}

export const ValidationRuleForm = ({ leadField, onSubmit, onCancel }: ValidationRuleFormProps) => {

    const setCreationMethod = (validation_rules: FieldValidationRule[]) => {
        return validation_rules.map(val => ({
            ...val,
            creation_method: val.template_code ? "template" : "manual"
        }) as FieldValidationListPostInstance
        )
    }

    const { control, register, handleSubmit, setValue, clearErrors, formState: { errors } } = useForm<FieldValidationListPost>({
        defaultValues: { validation_rules: setCreationMethod(leadField.validation_rules) }
    })

    const { append, remove, fields } = useFieldArray({ control, name: "validation_rules" });

    const [templates, setTemplates] = useState<FieldValidationRuleTemplate[]>([]);

    useEffect(() => {
        getValidationTemplates().then(setTemplates);
    }, []);

    const validationRules = useWatch({ name: "validation_rules", control });

    const submit = (data: FieldValidationListPost) => {
        onSubmit(data).catch(e => console.log(e))
    }

    return (
        <Stack spacing={2}>
            <Typography variant="h2">Reglas de Validación</Typography>
            {fields?.length > 0 ?
                fields.map((field, idx) => (
                    <ValidationInstance key={field.id} idx={idx} templates={templates}
                        register={register} control={control} setValue={setValue} remove={remove}
                        existingVal={validationRules?.[idx]?.id || null} errors={errors} clearErrors={clearErrors} />
                ))
                : <Typography variant="h4" textAlign="center">No hay reglas de Validación.</Typography>
            }
            <ButtonGroup>
                <Button onClick={onCancel} fullWidth>Cerrar</Button>
                <Button variant="contained" onClick={() =>
                    append({
                        name: "",
                        error_message: "",
                        creation_method: "template",
                        template_params: {},
                        required_params: [],
                        field_id: leadField.id
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
    existingVal: number | null,
    templates: FieldValidationRuleTemplate[];
    register: UseFormRegister<FieldValidationListPost>;
    control: Control<FieldValidationListPost>;
    setValue: UseFormSetValue<FieldValidationListPost>;
    remove: UseFieldArrayRemove;
    errors: FieldErrors<FieldValidationListPost>;
    clearErrors: UseFormClearErrors<FieldValidationListPost>

}
export const ValidationInstance = ({ idx, existingVal, templates, register, control, setValue, remove, errors, clearErrors }: ValidationInstanceProps) => {
    const selectedTemplateCode = useWatch({
        name: `validation_rules.${idx}.template_code`,
        control,
    });
    const requiredParamsValue = useWatch({
        name: `validation_rules.${idx}.template_params`,
        control,
    });
    const creationMethod = useWatch({
        name: `validation_rules.${idx}.creation_method`,
        control,
    });

    const selectedTemplate = useMemo(
        () => templates.find((template) => template.code === selectedTemplateCode),
        [selectedTemplateCode, templates],
    );

    useEffect(() => {
        setValue(`validation_rules.${idx}.required_params`,
            selectedTemplate?.required_params
        )
    }, [selectedTemplate, templates]);

    const creationMethodOptions = [
        { label: "Por Plantilla", value: "template" },
        { label: "Manual", value: "manual" },
    ];
    const generateErrorMessage = () => {
        if (selectedTemplate) {
            let errorMessage = selectedTemplate.error_message;
            for (const param of selectedTemplate.required_params) {
                errorMessage = errorMessage.replace(
                    `{${param}}`,
                    requiredParamsValue[param] ?? `[${param}]`,
                );
            }
            setValue(`validation_rules.${idx}.error_message`, errorMessage);
        }
    };

    return (
        <>
            <Grid container justifyContent="center" marginBlock={2}>
                <Grid size="grow">
                    <Stack gap={1} direction="row" alignItems="center" >
                        <Typography variant="h4">Validación {idx + 1}</Typography>
                        {existingVal && <EnabledIcon active={!!existingVal} trueTooltip="Creado" />}
                    </Stack>
                </Grid>
                <Grid size="auto">
                    <Button variant="outlined" color="error" onClick={() => remove(idx)}>
                        Eliminar Validación
                    </Button>
                </Grid>
            </Grid>

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
                </Grid>
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
                                <ControlledAutocomplete
                                    control={control}
                                    label="Plantilla"
                                    name={`validation_rules.${idx}.template_code`}
                                    options={templates}
                                    getOptionKey={(op) => op.code}
                                    getOptionLabel={(op) => op.name}
                                    returnField="code"
                                    required
                                    errorMessage={
                                        errors?.validation_rules?.[idx]?.template_code?.message
                                    }
                                />
                            </Grid>
                            {selectedTemplate &&
                                selectedTemplate.required_params?.length > 0 &&
                                <Grid container spacing={2} size="grow" minWidth="8rem">
                                    {selectedTemplate?.required_params.map((param) => (
                                        <Grid
                                            container size="grow"
                                            minWidth="4rem"
                                            spacing={2}
                                            key={`${idx}-${param}`}
                                        >
                                            <RegisteredTextInput
                                                name={`validation_rules.${idx}.template_params.${param}`}
                                                required
                                                id={`validation_rules.${idx}.template_params.${param}-${selectedTemplate.name}`}
                                                label={param}
                                                register={register}
                                                errorMessage={errors?.validation_rules?.[idx]?.template_params?.[param]?.message}
                                                onChange={e => {
                                                    clearErrors(`validation_rules.${idx}.template_params`)
                                                    //TO DO mejorar
                                                    setValue(`validation_rules.${idx}.template_params`, { ...requiredParamsValue, [param]: e.target.value })
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            }
                        </>
                    )}
                </Grid>

            </Grid>
            <Divider sx={{ marginBlock: "1rem" }} />
        </>
    );
};
