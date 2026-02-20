import { useEffect, useMemo, useState } from "react";
import { getCampaigns } from "../workspaces/campaignServices";
import {
  createLeadField,
  createValidation,
  getFieldDataByType,
  getFieldSections,
  getFieldTemplates,
  getFieldTypes,
  getNomenclators,
  getValidationDataByType,
  updateLeadField,
  updateValidation,
} from "./leadFieldServices";
import {
  Divider,
  Button,
  Grid,
  FormGroup,
  Typography,
  ButtonGroup,
  Chip,
  FormHelperText,
} from "@mui/material";
import {
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  ControlledAutocomplete,
  ControlledRadio,
} from "../common/forms/CustomMultipleInputs";
import {
  ControlledCheckbox,
  ControlledTextInput,
  RegisteredTextInput,
} from "../common/forms/CustomInputs";
import { ValidationRuleForm } from "./ValidationRuleForm";
import type {
  FieldValidationRulePost,
  FieldValidationRuleTemplate,
  LeadFieldDetailed,
  LeadFieldPost,
  LeadFieldSection,
  LeadFieldTemplate,
  LeadFieldTypeDetailed,
  Nomenclator,
} from "../../types/leadFields";
import type { Campaign } from "../../types/campaigns";
import { GenericContainer } from "../common/layout/GenericContainer";
import { setFormErrors } from "../../generalService";

export interface FieldValidationRuleData extends FieldValidationRulePost {
  creation_method?: string;
  template?: FieldValidationRuleTemplate;
}
export interface LeadFieldData extends LeadFieldPost {
  creation_method?: string;
  validation_rules: FieldValidationRuleData[];
}

interface LeadFieldFormProps {
  leadField?: LeadFieldDetailed | null;
  campaignId: number;
}
export const LeadFieldForm = ({
  leadField = null,
  campaignId,
}: LeadFieldFormProps) => {
  const [fieldTemplates, setFieldTemplates] = useState<LeadFieldTemplate[]>([]);
  const [fieldSections, setFieldSections] = useState<LeadFieldSection[]>([]);
  const [fieldTypes, setFieldTypes] = useState<LeadFieldTypeDetailed[]>([]);
  const [nomenclators, setNomenclators] = useState<Nomenclator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const nav = useNavigate();

  const defaultValues: LeadFieldData = {
    fieldId: leadField?.id || null,
    campaign_id: campaignId,
    name: leadField?.name || null,
    lead_field_section_id: leadField?.lead_field_section?.id || null,
    field_type_code: leadField?.field_type_code || null,
    field_subtype_code: leadField?.field_subtype_code || null,
    calculation_expression: leadField?.calculation_expression || null,
    default_value: leadField?.default_value || null,
    input_mask: leadField?.input_mask || null,
    nomenclator_id: leadField?.nomenclator?.id || null,
    related_campaign_id: leadField?.related_campaign?.id || null,
    required: leadField?.required || false,
    is_primary: leadField?.is_primary || false,
    is_visible: leadField?.is_visible || true,
    creation_method:
      !leadField || leadField.field_template_code ? "template" : "manual",
    field_template_code:
      leadField?.field_template_code || leadField ? null : {},
    validation_rules: leadField?.validation_rules || [],
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
    setError, clearErrors
  } = useForm<LeadFieldData>({
    defaultValues,
  });

  const fieldId = useWatch({ name: "fieldId", control });

  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates);
    getFieldSections({ only_active: true }).then(setFieldSections);
    getFieldTypes({ detailed: true }).then(setFieldTypes);
    getCampaigns({ only_active: true }).then(setCampaigns);
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    getNomenclators({ global_nomenclator: true, campaign_id: campaignId }).then(
      setNomenclators,
    );
  }, [campaignId]);

  const findError = (error) => {
    return setFormErrors(error, setError)
  };

  const findValError = (error, val, idx) => {
    return setFormErrors(error, setError,
      (error) => {
        return error.response.data.detail?.map((error) => {
          if (error.field === "body")
            return setError(
              `validation_rules.${idx}.${val.creation_method === "template"
                ? "template_code"
                : "expression"
              }`,
              { message: error.message },
            );
          else if (error.field === "template_params")
            return setError(
              error.message.split("'")?.[1]
                ? `validation_rules.${idx}.template_params.${error.message.split("'")?.[1]}`
                : `validation_rules.${idx}.template_params`
              , { message: error.message },
            );
          else
            return setError(`validation_rules.${idx}.${error.field}`, {
              message: error.message,
            });
        });
      }
    )
  };

  const saveLeadField = async (data: LeadFieldData) => {
    const newData = getFieldDataByType(
      data,
      data.creation_method === "template",
    );
    let newLeadField;
    //Update
    if (fieldId) {
      newLeadField = await updateLeadField(newData, fieldId).catch((e) => {
        findError(e);
        throw e;
      });
    }
    //Create
    else {
      newLeadField = await createLeadField(newData)
        .then((leadField) => {
          setValue("fieldId", leadField.id)
          setValue("name", leadField.name)
          return leadField
        })
        .catch((e) => {
          findError(e);
          throw e;
        });
    }
    if (!data?.validation_rules) return newLeadField;

    const newValidationList = await Promise.all(
      data?.validation_rules.map((val, idx) =>
        submitValidation(val, newLeadField?.id)
          .then((newVal) => {
            setValue(`validation_rules.${idx}.id`, newVal.id)
            setValue(`validation_rules.${idx}.name`, newVal.name)
            setValue(`validation_rules.${idx}.error_message`, newVal.error_message)
            return newVal
          })
          .catch((e) => {
            findValError(e, val, idx);
            throw e;
          }),
      ),
    );
    return { ...newLeadField, validation_rules: newValidationList };
  };
  const submitValidation = (val: FieldValidationRuleData, fieldId: number) => {
    const newVal = getValidationDataByType(
      { ...val, field_id: fieldId },
      val.creation_method === "template",
    );
    if (val.id) {
      return updateValidation(newVal, val.id);
    } else {
      return createValidation(newVal);
    }
  };

  const submit = async () => {
    clearErrors(); // Clears all validation errors
    const data = getValues();
    await saveLeadField(data);
    nav(`/campaigns/${campaignId}`);
  };

  const submitAndReset = async () => {
    clearErrors(); // Clears all validation errors
    const data = getValues();
    await saveLeadField(data);
    alert("Creado");
    reset(defaultValues);
  };

  const currentCampaign = useMemo(() => {
    if (!campaigns || !campaignId) return null;
    return campaigns.find((campaign) => campaign?.id === campaignId);
  }, [campaigns, campaignId]);

  return (
    <GenericContainer>
      <>
        {!leadField ? (
          <>
            <Typography variant="h1" color="initial">
              Crear Campo para: {currentCampaign?.name}
            </Typography>
            {fieldId && <Chip sx={{ mb: 2 }} color="success" label="Creado" />}
          </>
        ) : (
          <Typography variant="h1" color="initial">
            Modificar el Campo {leadField?.name} para: {currentCampaign?.name}
          </Typography>
        )}
        <form>
          <LeadFieldFormFields
            templates={fieldTemplates}
            sections={fieldSections}
            nomenclators={nomenclators}
            campaigns={campaigns}
            types={fieldTypes}
            errors={errors}
            register={register}
            control={control}
            campaignId={campaignId}
          />

          <Divider sx={{ paddingBlock: 2 }} />

          <ValidationRuleForm
            control={control}
            register={register}
            setValue={setValue}
            reset={reset}
            errors={errors}
            clearErrors={clearErrors}
          />
          {errors.root && (
            <FormHelperText error sx={{ marginBlock: 1 }}>
              {errors?.root?.message}
            </FormHelperText>
          )}
          <ButtonGroup>
            <Button
              variant="outlined"
              component={Link}
              to={`/campaigns/${campaignId}`}
            >
              Volver
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)}>
              Guardar Cambios
            </Button>
            {!leadField && (
              <Button
                variant="contained"
                onClick={handleSubmit(submitAndReset)}
              >
                Guardar y crear otro
              </Button>
            )}
          </ButtonGroup>
        </form>
      </>
    </GenericContainer>
  );
};

interface LeadFieldFormFieldsProps {
  templates: LeadFieldTemplate[];
  sections: LeadFieldSection[];
  types: LeadFieldTypeDetailed[];
  nomenclators: Nomenclator[];
  campaigns: Campaign[];
  register: UseFormRegister<LeadFieldData>;
  control: Control<LeadFieldData>;
  campaignId: number;
  errors: FieldErrors<LeadFieldData>;
}

const LeadFieldFormFields = ({
  templates,
  sections,
  types,
  nomenclators,
  campaigns,
  register,
  control,
  campaignId,
  errors,
}: LeadFieldFormFieldsProps) => {
  const fieldTypeCode = useWatch({ name: "field_type_code", control });
  const creationMethod = useWatch({ control, name: "creation_method" });

  const creationMethodRadioOptions = [
    { label: "Por Plantilla", value: "template" },
    { label: "Manual", value: "manual" },
  ];
  //Busca el objeto del Tipo seleccionado a partir de su código
  const fieldTypeObject = useMemo(
    () => (types ? types?.find((i) => i.code === fieldTypeCode) : null),
    [types, fieldTypeCode],
  );

  return (
    <Grid container spacing={2} justifyContent="center">
      <input
        type="hidden"
        {...register("campaign_id", { value: campaignId })}
      />
      <Grid size={12} container minWidth="20rem">
        <Grid size="grow" minWidth="20rem">
          <ControlledTextInput
            control={control}
            label="Nombre del Campo"
            name="name"
            required
            errorMessage={errors.name?.message}
          />
        </Grid>
        <Grid size="grow" minWidth="20rem" justifyContent="center">
          <ControlledAutocomplete
            name="lead_field_section_id"
            label="Sección"
            control={control}
            options={sections}
            returnField="id"
            getOptionLabel={(option) => option.name}
            required
            errorMessage={errors.lead_field_section_id?.message}
          />
        </Grid>
        <Grid size="grow" minWidth="20rem" justifyContent="center">
          <FormGroup row>
            <ControlledCheckbox
              control={control}
              name="required"
              label="Obligatorio"
              errorMessage={errors?.required?.message}
            />
            <ControlledCheckbox
              control={control}
              name="is_primary"
              label="Único"
              errorMessage={errors?.is_primary?.message}
            />
            <ControlledCheckbox
              control={control}
              name="is_visible"
              label="Visible"
              errorMessage={errors?.is_visible?.message}
            />
          </FormGroup>
        </Grid>
      </Grid>

      <Grid size={12} container minWidth="20rem">
        <Grid size={4} minWidth="20rem" justifyContent="center">
          <ControlledRadio
            control={control}
            name="creation_method"
            options={creationMethodRadioOptions}
            returnField="value"
            radioLabel={(option) => option.label}
            label="Método de Creación"
          />
        </Grid>

        {creationMethod === "template" ? (
          <Grid size="grow" minWidth="20rem" justifyContent="center">
            <ControlledAutocomplete
              name="field_template_code"
              label="Plantillas"
              control={control}
              options={templates}
              returnField="code"
              errorMessage={errors?.field_template_code?.message}
              getOptionKey={(option) => option.code}
              getOptionLabel={(option) => option.name}
              required
            />
          </Grid>
        ) : (
          <>
            <Grid size="grow" minWidth="20rem" justifyContent="center">
              <ControlledAutocomplete
                name="field_type_code"
                label="Tipo de Dato"
                required
                control={control}
                options={types}
                returnField="code"
                errorMessage={errors?.field_type_code?.message}
                getOptionKey={(option) => option.code}
                getOptionLabel={(option) =>
                  `${option.code} - ${option.description}`
                }
              />
            </Grid>
            {fieldTypeObject?.subtypes &&
              fieldTypeObject?.subtypes?.length > 0 && (
                <Grid size="grow" minWidth="20rem" justifyContent="center">
                  <ControlledAutocomplete
                    name="field_subtype_code"
                    label="Subtipo de Campo"
                    errorMessage={errors?.field_subtype_code?.message}
                    required
                    control={control}
                    options={fieldTypeObject?.subtypes}
                    returnField="code"
                    getOptionLabel={(option) =>
                      `${option.code} - ${option.description}`
                    }
                  />
                </Grid>
              )}
            {(fieldTypeCode === "SELECTOR" || fieldTypeCode === "CHECKBOX") && (
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete
                  name="nomenclator_id"
                  label="Lista de Opciones"
                  errorMessage={errors?.nomenclator_id?.message}
                  required
                  control={control}
                  options={nomenclators}
                  returnField="id"
                  getOptionLabel={(option) => option.name}
                />
              </Grid>
            )}
            {fieldTypeCode === "LEAD" && (
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledAutocomplete
                  name="related_campaign_id"
                  label="Campaña del Lead Relacionado"
                  errorMessage={errors?.related_campaign_id?.message}
                  required
                  control={control}
                  options={campaigns}
                  returnField="id"
                  getOptionLabel={(option) => option.name}
                />
              </Grid>
            )}
            {fieldTypeCode === "CALCULATED" && (
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <RegisteredTextInput
                  name="calculation_expression"
                  label="Fórmula"
                  register={register}
                  errorMessage={errors?.calculation_expression?.message}
                  required
                />
              </Grid>
            )}
            {fieldTypeCode === "STRING" && (
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <RegisteredTextInput
                  name="input_mask"
                  label="Máscara de Input"
                  register={register}
                  errorMessage={errors?.input_mask?.message}
                />
              </Grid>
            )}
          </>
        )}
        {(creationMethod === "template" ||
          (fieldTypeCode &&
            ["NUMBER", "INT", "STRING", "BOOL"].includes(fieldTypeCode))) && (
            <Grid size="grow" minWidth="20rem">
              <ControlledTextInput
                control={control}
                label="Valor por Defecto"
                name="default_value"
                errorMessage={errors?.default_value?.message}
              />
            </Grid>
          )}
      </Grid>
    </Grid>
  );
};
