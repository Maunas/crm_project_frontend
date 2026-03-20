import { useEffect, useMemo, useState } from "react";
import { ControlledCheckbox, ControlledTextInput } from "../common/forms/CustomInputs";
import { ControlledAutocomplete, ControlledRadio } from "../common/forms/CustomMultipleInputs";
import type {
  FieldValidationRulePost, FieldValidationRuleTemplate, LeadFieldDetailed, LeadFieldPost, LeadFieldSection, LeadFieldTemplate, LeadFieldTypeDetailed, Nomenclator,
} from "../../types/leadFields";
import type { Campaign, CampaignDetailed } from "../../types/campaigns";
import { setFormErrors } from "../../generalService";
import { createLeadField, getFieldDataByType, getFieldSections, getFieldTemplates, getFieldTypes, updateLeadField } from "./leadFieldServices";
import { getCampaigns } from "../campaigns/campaignServices";
import { useForm, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Button, Grid, FormGroup, Typography, ButtonGroup, Stack } from "@mui/material";
import { FormErrorMessage } from "../../styles/styledMUIFormComponents";
import { getNomenclators } from "../nomenclators/nomenclatorService";


interface LeadFieldSidebarProps {
  existingLF?: LeadFieldDetailed,
  campaign: CampaignDetailed,
  updateEntityOnList: (entity: LeadFieldDetailed) => void,
  handleSidebar: (
    mode: string,
    entity: LeadFieldDetailed,
  ) => void,
  closeSidebar: () => void,
}
//Wrapper de CampaignForm para crear desde un Sidebar
export const LeadFieldFormSidebar = ({ existingLF, campaign, updateEntityOnList, closeSidebar, handleSidebar }: LeadFieldSidebarProps) => {

  const submit = (data: LeadFieldPost, reset: boolean = false) => {
    const updateInfo = (data: LeadFieldDetailed) => {
      updateEntityOnList(data)
      handleSidebar("DETAILS_FIELD", data)
    }
    if (!existingLF) {
      return createLeadField(data).then(res => {
        if (reset) updateEntityOnList(res) //No cierra el sidebar
        else updateInfo(res)
      })
    } else {
      return updateLeadField(data, existingLF.id).then(updateInfo)
    }
  }
  return <LeadFieldForm existingLF={existingLF} campaign={campaign} submit={submit} onCancel={closeSidebar} />
}

export interface FieldValidationRuleData extends FieldValidationRulePost {
  creation_method?: string;
  template?: FieldValidationRuleTemplate;
}
export interface LeadFieldPostCreation extends LeadFieldPost {
  creation_method?: string;
}

interface LeadFieldFormProps {
  existingLF?: LeadFieldDetailed,
  campaign: Campaign,
  submit: (data: LeadFieldPost, reset?: boolean) => Promise<void>,
  onCancel: () => void,
}
export const LeadFieldForm = ({ existingLF, campaign, submit, onCancel }: LeadFieldFormProps) => {

  const [fieldTemplates, setFieldTemplates] = useState<LeadFieldTemplate[]>([]);
  const [fieldSections, setFieldSections] = useState<LeadFieldSection[]>([]);
  const [fieldTypes, setFieldTypes] = useState<LeadFieldTypeDetailed[]>([]);
  const [nomenclators, setNomenclators] = useState<Nomenclator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);


  useEffect(() => {
    getFieldTemplates().then(setFieldTemplates);
    getFieldSections({ only_active: true, page_size: 0 }).then(res => setFieldSections(res.items));
    getFieldTypes({ detailed: true, page_size: 0 }).then(res => setFieldTypes(res.items));
    getCampaigns({ only_active: true, page_size: 0 }).then(res => setCampaigns(res.items));
  }, []);

  useEffect(() => {
    if (!campaign.id) return;
    getNomenclators({ global_nomenclator: true, campaign_id: campaign.id, page_size: 0 }).then(
      res => setNomenclators(res.items),
    );
  }, [campaign.id]);

  const defaultValues: LeadFieldPostCreation = useMemo(() => (
    {
      campaign_id: campaign.id,
      name: existingLF?.name ?? null,
      lead_field_section_id: existingLF?.lead_field_section?.id ?? 1,
      field_type_code: existingLF?.field_type_code ?? null,
      field_subtype_code: existingLF?.field_subtype_code ?? null,
      calculation_expression: existingLF?.calculation_expression ?? null,
      default_value: existingLF?.default_value ?? null,
      input_mask: existingLF?.input_mask ?? null,
      nomenclator_id: existingLF?.nomenclator?.id ?? null,
      related_campaign_id: existingLF?.related_campaign?.id ?? null,
      required: existingLF?.required ?? false,
      is_primary: existingLF?.is_primary ?? false,
      is_visible: existingLF?.is_visible ?? true,
      field_template_code: existingLF?.field_template_code ?? "FIRST_NAME",
      creation_method: existingLF ? "manual" : "template"
    })
    , [existingLF, campaign])


  const { register, control, handleSubmit, reset, formState: { errors }, setError } = useForm<LeadFieldPostCreation>({ defaultValues });

  //Activa cuando cambian el LeadField seleccionado o la campaña.
  useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

  const creationMethod = useWatch({ name: "creation_method", control });

  const onSaveLeadField = async (data: LeadFieldPostCreation, reset: boolean = false) => {
    const newData = getFieldDataByType(data, creationMethod === "template");
    return submit(newData, reset)
      .catch(e => {
        setFormErrors(e, setError)
        throw (e)
      });
  }

  const onSubmitAndReset = async (data: LeadFieldPostCreation) => {
    return onSaveLeadField(data, true)
      .then(() => {
        alert("Creado");
        reset(defaultValues);
      })
  };


  return (
    <form>
      <Stack spacing={2}>
        {!existingLF ? (
          <>
            <Typography variant="h1" color="initial">
              Crear Campo para: "{campaign?.name}"
            </Typography>
          </>
        ) : (
          <Typography variant="h1" color="initial">
            Modificar el Campo {existingLF?.name} para: {campaign?.name}
          </Typography>
        )}

        <LeadFieldFormFields templates={fieldTemplates} sections={fieldSections}
          nomenclators={nomenclators} campaigns={campaigns} types={fieldTypes}
          errors={errors} register={register} control={control}
          campaignId={campaign.id} existingLFId={existingLF?.id}
        />

        <ButtonGroup>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit((data) => onSaveLeadField(data))}>
            Guardar Cambios
          </Button>
          {!existingLF && (
            <Button variant="contained" onClick={handleSubmit(onSubmitAndReset)} >
              Guardar y crear otro
            </Button>
          )}
        </ButtonGroup>
      </Stack>
    </form>
  );
};

interface LeadFieldFormFieldsProps {
  templates: LeadFieldTemplate[];
  sections: LeadFieldSection[];
  types: LeadFieldTypeDetailed[];
  nomenclators: Nomenclator[];
  campaigns: Campaign[];
  register: UseFormRegister<LeadFieldPostCreation>;
  control: Control<LeadFieldPostCreation>;
  campaignId: number;
  errors: FieldErrors<LeadFieldPostCreation>;
  existingLFId?: number
}

const LeadFieldFormFields = ({ templates, sections, types, nomenclators, campaigns,
  register, control, campaignId, existingLFId, errors }: LeadFieldFormFieldsProps) => {

  const creationMethod = useWatch({ name: "creation_method", control });
  const creationMethodRadioOptions = [
    { label: "Por Plantilla", value: "template" },
    { label: "Manual", value: "manual" },
  ];

  const fieldTypeCode = useWatch({ name: "field_type_code", control });
  //Busca el objeto del Tipo seleccionado a partir de su código
  const fieldTypeObject = useMemo(
    () => (types ? types?.find(i => i.code === fieldTypeCode) : null),
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
            errorMessage={errors?.name?.message}
          />
        </Grid>
        <Grid size="grow" minWidth="20rem" justifyContent="center">
          <ControlledAutocomplete
            name="lead_field_section_id"
            label="Sección"
            control={control}
            options={sections}
            returnField="id"
            getOptionLabel={option => option.name!}
            getOptionKey={option => `${option.id}`}
            required
            errorMessage={errors?.lead_field_section_id?.message}
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
        {!existingLFId &&
          <Grid size={4} minWidth="20rem" justifyContent="center">
            <ControlledRadio control={control} name="creation_method" label="Método de Creación" options={creationMethodRadioOptions}
              getRadioLabel={option => option.label} keyField="value" returnField="value" row />
          </Grid>}

        {creationMethod === "template" && !existingLFId ? (
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
                    getOptionLabel={option =>
                      `${option.code} - ${option.description}`
                    }
                    getOptionKey={option => option.code}
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
                  getOptionLabel={option => option.name}
                  getOptionKey={option => `${option.id}`}
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
                  getOptionLabel={option => option.name!}
                  getOptionKey={option => `${option.id}`}
                />
              </Grid>
            )}
            {fieldTypeCode === "CALCULATED" && (
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledTextInput
                  name="calculation_expression"
                  label="Fórmula"
                  control={control}
                  errorMessage={errors?.calculation_expression?.message}
                  required
                />
              </Grid>
            )}
            {fieldTypeCode === "STRING" && (
              <Grid size="grow" minWidth="20rem" justifyContent="center">
                <ControlledTextInput
                  name="input_mask"
                  label="Máscara de Input"
                  control={control}
                  errorMessage={errors?.input_mask?.message}
                />
              </Grid>
            )}
          </>
        )}
        {(creationMethod === "template" ||
          (fieldTypeCode &&
            ["NUMBER", "INT", "STRING", "BOOL", "RATING"].includes(fieldTypeCode))) && (
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
      {errors.root && (
        <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>
      )}
    </Grid>
  );
};
