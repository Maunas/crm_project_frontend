import { useEffect, useMemo, useState } from "react";
import { ControlledTextInput, RegisteredTextInput } from "shared/ui/forms/CustomInputs";
import { ControlledAutocomplete, ControlledRadio } from "shared/ui/forms/CustomMultipleInputs";
import { EnabledIcon } from "shared/ui/lists/Icons";
import CommonButton from "shared/ui/buttons/CommonButton";
import { FormErrorMessage } from "shared/ui/forms/FormFeedback";
import { createValidation, deleteValidation, getValidationTemplates, updateValidation } from "./validationService";
import { getValidationDataByType, setValFormErrors } from "./validationUtils";
import type { FieldValidationRule, FieldValidationRulePost, FieldValidationRuleTemplate, LeadFieldDetailed } from "src/types/leadFields";
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFieldArrayRemove, type UseFormClearErrors, type UseFormGetValues, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { Divider, Grid, Stack, Typography, ButtonGroup } from "@mui/material";

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
        let errorFlag = false
        const idxToDelete: number[] = []
        const newLeadFieldValidationList: FieldValidationRule[] = [] //Para la lista dentro del detalle de leadField

        //Promise.allSettled guarda los resultados de todas las peticiones, sin interrumpir si falla.
        await Promise.allSettled(
            data.validation_rules.map((val, idx) => {
                return onSubmit(val)
                    .then(savedVal => {
                        //Si no elimina, guarda los datos nuevos de los campos creados para habilitar su modificación
                        if (!val.to_delete && "id" in savedVal) {
                            setValue(`validation_rules.${idx}`, { ...val, ...savedVal })
                            setValue(`validation_rules.${idx}.creation_method`, "manual")
                            newLeadFieldValidationList.push(savedVal)
                        }
                        else idxToDelete.push(idx) //Guarda los indices a eliminar
                    })
                    .catch(e => {
                        setValFormErrors(idx, val.creation_method === "template", e, setError)
                        //Si falla la modificación, guarda el valor anterior al formulario
                        if (val.id) newLeadFieldValidationList.push(leadField.validation_rules[idx])
                        errorFlag = true
                        throw (e)
                    })
            })
        )
        //Se eliminan todos los campos a la vez, despues de setear todos los errores, para evitar inconsistencias.
        remove(idxToDelete)
        return errorFlag ? onErrorAll(newLeadFieldValidationList) : onSubmitAll(newLeadFieldValidationList)
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h2">{leadField.name}</Typography>
            <Stack spacing={2}>
                <Typography variant="h3">Reglas de Validación</Typography>
                <Divider />
                {fields?.length > 0 ?
                    fields.map((field, idx) => (
                        <ValidationInstance key={field.array_id} idx={idx} templates={templates}
                            register={register} control={control} setValue={setValue} remove={remove} getValues={getValues}
                            errors={errors} clearErrors={clearErrors} />
                    ))
                    : <Typography variant="h5" sx={{ textAlign: "center" }}>No hay validaciones cargadas</Typography>
                }
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel}>Cancelar</CommonButton>
                    <CommonButton actionType="CREATE" variant="outlined" onClick={() =>
                        append({
                            name: "",
                            error_message: "",
                            creation_method: "template",
                            template_params: {},
                            required_params: [],
                            field_id: leadField.id,
                            to_delete: false
                        })
                    } color="secondary">
                        Agregar
                    </CommonButton>
                    <CommonButton actionType="MODIFY" onClick={handleSubmit(submit)}>Guardar</CommonButton>
                </ButtonGroup>
            </Stack>
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
        <Stack spacing={2}>
            <Grid container sx={{ justifyContent: "space-between", alignContent: "center" }}>
                <Stack spacing={1} direction="row" sx={{ alignItems: "center" }} >
                    <Typography variant="h4" color={toDelete ? "error" : "textPrimary"} >Validación {idx + 1}</Typography>
                    {existingValId && <EnabledIcon active={!!existingValId && !toDelete} trueTooltip="Creado" falseTooltip="Para eliminar" />}
                </Stack>
                <CommonButton actionType={toDelete ? "ENABLE" : "DISABLE"} variant="outlined"
                    color={!toDelete ? "error" : "success"} onClick={() => handleRemove(idx)}
                    sx={{ marginLeft: "auto" }} size="small">
                    {!toDelete ? "Eliminar Validación" : "Cancelar Eliminación"}
                </CommonButton>
            </Grid >

            <input {...register(`validation_rules.${idx}.field_id`)} readOnly hidden />
            <input {...register(`validation_rules.${idx}.required_params`)} readOnly hidden />

            <Grid container spacing={1} sx={{ justifyContent: "center", alignItems: "start" }}>
                <Grid container spacing={1} sx={{ minWidth: "20rem", alignItems: "center" }} size={12} >
                    <Grid size="grow" sx={{ minWidth: "12rem" }}>
                        <RegisteredTextInput
                            name={`validation_rules.${idx}.name`}
                            register={register}
                            label="Nombre de la Regla"
                            required
                            size="small"
                            errorMessage={errors?.validation_rules?.[idx]?.name?.message}
                        />
                    </Grid>
                    {!toDelete && !existingValId &&
                        <Grid size="grow" sx={{ minWidth: "15rem", justifyContent: "center" }} >
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
                        <Grid container spacing={1} size="grow" sx={{ minWidth: "20rem", alignItems: "center" }} >
                            <Grid size="grow" sx={{ minWidth: "12rem", justifyContent: "center" }}>
                                <ControlledTextInput
                                    control={control}
                                    label="Mensaje de Error"
                                    name={`validation_rules.${idx}.error_message`}
                                    size="small"
                                    errorMessage={
                                        errors?.validation_rules?.[idx]?.error_message?.message
                                    }
                                />
                            </Grid>
                            {creationMethod === "template" &&
                                selectedTemplate?.error_message && (
                                    <Grid size="auto" sx={{ justifyContent: "center" }}>
                                        <CommonButton actionType="NONE" variant="outlined"
                                            onClick={generateErrorMessage} fullWidth>
                                            Generar
                                        </CommonButton>
                                    </Grid>
                                )}
                        </Grid>

                        <Grid container spacing={1} sx={{ minWidth: "20rem" }} size="grow">
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
                                <Grid size="grow" sx={{ minWidth: "15rem" }}>
                                    <ControlledAutocomplete control={control} name={`validation_rules.${idx}.template_code`} options={templates}
                                        label="Plantilla" getOptionKey={(op) => op.code} getOptionLabel={(op) => op.name} returnField="code"
                                        required errorMessage={errors?.validation_rules?.[idx]?.template_code?.message}
                                        helper={selectedTemplate?.description} size="small" disabled={Boolean(existingValId)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                        {creationMethod === "template" && selectedTemplate &&
                            selectedTemplate.required_params?.length > 0 &&
                            <Grid container spacing={1} size="grow" sx={{ minWidth: "8rem" }}>
                                {selectedTemplate?.required_params.map((param) => (
                                    <Grid container size="grow" sx={{ minWidth: "4rem" }} spacing={2} key={`${idx}-${param}`} >
                                        <RegisteredTextInput register={register} name={`validation_rules.${idx}.template_params.${param}`}
                                            label={param} id={`validation_rules.${idx}.template_params.${param}-${selectedTemplate.name}`}
                                            required size="small"
                                            errorMessage={errors?.validation_rules?.[idx]?.template_params?.[param]?.message}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        }
                    </>
                }
            </Grid>
            {errors.validation_rules?.[idx]?.root &&
                <FormErrorMessage>{errors.validation_rules?.[idx]?.root?.message}</FormErrorMessage>}
            {errors.validation_rules?.[idx] &&
                <FormErrorMessage>{errors.validation_rules?.[idx]?.message}</FormErrorMessage>}
            <Divider />
        </Stack>
    );
};
