import {
  Divider,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldError,
  type FieldErrors,
  type UseFieldArrayRemove,
  type UseFormClearErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { getValidationTemplates } from "../leadFields/leadFieldServices";
import {
  ControlledAutocomplete,
  ControlledRadio,
} from "../common/forms/CustomMultipleInputs";
import type { FieldValidationRuleTemplate } from "../../types/leadFields";
import type { LeadFieldData } from "./LeadFieldForm";
import {
  ControlledTextInput,
  RegisteredTextInput,
} from "../common/forms/CustomInputs";

interface ValidationRuleFormProps {
  control: Control<LeadFieldData>;
  register: UseFormRegister<LeadFieldData>;
  setValue: UseFormSetValue<LeadFieldData>;
  errors: FieldErrors<LeadFieldData>;
  clearErrors: UseFormClearErrors
}

export const ValidationRuleForm = ({
  control,
  register,
  setValue,
  clearErrors,
  errors,
}: ValidationRuleFormProps) => {
  const { append, remove, fields } = useFieldArray<LeadFieldData>({
    control,
    name: "validation_rules",
  });
  const [templates, setTemplates] = useState<FieldValidationRuleTemplate[]>([]);

  useEffect(() => {
    getValidationTemplates().then(setTemplates);
  }, []);

  const validationRules = useWatch({ name: "validation_rules", control });

  return (
    <>
      <Typography variant="h2">Reglas de Validación</Typography>
      {fields?.length > 0 &&
        fields.map((field, idx) => (
          <ValidationInstance
            key={field.id}
            idx={idx}
            templates={templates}
            register={register}
            control={control}
            setValue={setValue}
            remove={remove}
            valId={validationRules?.[idx]?.id || null}
            errors={errors} clearErrors={clearErrors}
          />
        ))}
      <Button
        variant="contained"
        onClick={() =>
          append({
            name: "",
            error_message: "",
            creation_method: "template",
            template_params: {},
          })
        }
      >
        Agregar Validación
      </Button>
      <Divider sx={{ marginBlock: "1rem" }} />
    </>
  );
};

interface ValidationInstanceProps {
  idx: number;
  templates: FieldValidationRuleTemplate[];
  register: UseFormRegister<LeadFieldData>;
  control: Control<LeadFieldData>;
  setValue: UseFormSetValue<LeadFieldData>;
  remove: UseFieldArrayRemove;
  valId: number | null;
  errors: FieldErrors<LeadFieldData>;
  clearErrors: UseFormClearErrors

}
export const ValidationInstance = ({
  idx,
  templates,
  register,
  control,
  setValue,
  remove,
  errors,
  valId,
  clearErrors
}: ValidationInstanceProps) => {
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
          <Typography variant="h4">Validación {idx + 1}</Typography>
          {valId && <Chip sx={{ mb: 2 }} color="success" label="Creado" />}
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
            <RegisteredTextInput
              name={`validation_rules.${idx}.name`}
              register={register}
              label="Nombre de la Regla"
              required
              errorMessage={errors?.validation_rules?.[idx]?.name?.message}
            />
          </Grid>
          <Grid container spacing={2} size="grow" minWidth="20rem">
            <Grid size="grow" minWidth="20rem" justifyContent="center">
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
                  <Button variant="outlined" onClick={generateErrorMessage}>
                    Generar Mensaje
                  </Button>
                </Grid>
              )}
          </Grid>
        </Grid>

        <Grid container spacing={2} minWidth="20rem" size={12}>
          <Grid size={4} minWidth="20rem" justifyContent="center">
            <ControlledRadio
              control={control}
              name={`validation_rules.${idx}.creation_method`}
              options={creationMethodOptions}
              returnField="value"
              radioLabel={(option) => option.label}
              label="Método de Creación"
            />
          </Grid>
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
            <Grid size="grow" spacing={2}>
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
          )}
        </Grid>
        <Grid container spacing={2} size="grow" justifyContent="end">
          <FormControl error={!!errors?.validation_rules?.[idx]?.template_params}>
            {selectedTemplate &&
              selectedTemplate.required_params?.length > 0 &&
              selectedTemplate?.required_params.map((param) => (
                <Grid
                  container
                  size={3}
                  minWidth="15rem"
                  spacing={2}
                  key={`${param}-${selectedTemplate.name}`}
                >
                  <RegisteredTextInput
                    name={`validation_rules.${idx}.template_params.${param}`}
                    required
                    id={`validation_rules.${idx}.template_params.${param}-${selectedTemplate.name}`}
                    label={param}
                    register={register}
                    errorMessage={errors?.validation_rules?.[idx]?.template_params?.[param]?.message}
                    onChange={(e) => { 
                      clearErrors(`validation_rules.${idx}.template_params`) 
                      //TO DO mejorar
                      setValue(`validation_rules.${idx}.template_params`, {...requiredParamsValue, [param]: e.target.value})
                    }}
                  />
                </Grid>
              ))}
          </FormControl>
        </Grid>
      </Grid>
      <Divider sx={{ marginBlock: "1rem" }} />
    </>
  );
};
