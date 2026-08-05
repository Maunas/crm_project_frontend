import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, TextField, Paper, Typography, Chip, alpha, Stack, Autocomplete } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ActionTypeEnum, ACTION_TYPE_LABELS, ACTION_TYPE_DESCRIPTIONS, } from '../../types/automation';
import type { LeadField } from '../../types/leadFields';
import type { FieldAutomationPost } from '../../types/automation';
import { getNomenclatorItems } from '../nomenclators/nomenclatorService';
import type { NomenclatorItem } from '../../types/nomenclators';
import { useWatch, type Control, type Path, type UseFormRegister } from 'react-hook-form';
import { showCommonErrorToast } from 'src/utils/feedback';
import { useLoading } from 'src/hooks/useLoading';
import { ControlledAutocomplete } from 'src/components/ui/forms/CustomMultipleInputs';
import { ChipTooltip } from 'src/components/ui/details/ChipTooltip';
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton';
import { ControlledNumber, RegisteredDateInput, RegisteredTextInput } from 'src/components/ui/forms/CustomInputs';
import { WRITABLE_NATIVE_KEYS, type NativeFieldOptions } from 'src/features/lead/nativeLeadFields';
import { ControlledFieldSelector } from 'src/components/ui/forms/FieldSelector';

// Devuelve las opciones reales {id, label} de un campo nativo tipo NATIVE_ID según su nativeKey
// (mismo criterio que ConditionRow.tsx/LeadFilters.tsx).
const getNativeIdOptions = (nativeKey: string | undefined, nativeOptions?: NativeFieldOptions): { id: number, label: string }[] => {
  if (!nativeKey || !nativeOptions) return [];
  switch (nativeKey) {
    case 'contact_state_id':
      return nativeOptions.contactStates.map(s => ({ id: s.id, label: s.name }));
    case 'current_state_id':
      return nativeOptions.leadStates.map(s => ({ id: s.id, label: s.name }));
    case 'team_id':
      return nativeOptions.teams.map(t => ({ id: t.id, label: t.name }));
    case 'assigned_to_user_id': case 'created_by': case 'updated_by':
      return nativeOptions.users.map(u => ({ id: u.id, label: u.name + (u.last_name ? ` ${u.last_name}` : '') }));
    default:
      return [];
  }
};

const getActionColor = (type: ActionTypeEnum) => {
  switch (type) {
    case ActionTypeEnum.SET_VALUE: return 'primary';
    case ActionTypeEnum.CLEAR_VALUE: return 'error';
    case ActionTypeEnum.COPY_FROM_FIELD: return 'secondary';
    default: return 'primary';
  }
};

interface ActionRowProps {
  control: Control<FieldAutomationPost, unknown, FieldAutomationPost>,
  register: UseFormRegister<FieldAutomationPost>,
  onUpdate: (name: Path<FieldAutomationPost>, value?: string | number | boolean | null) => void
  onDelete: () => void;
  isOnly: boolean;
  index: number;
  fields: LeadField[];
  nativeOptions?: NativeFieldOptions;
  readOnly?: boolean;
}

export const ActionRow = ({ control, register, onDelete, isOnly, index, fields, nativeOptions, readOnly = false, onUpdate }: ActionRowProps) => {
  // 1. FILTRADO DE CAMPOS PARA ACCIONES
  const allowedTargetFields = useMemo(() => {
    const invalidTargetTypes = ['CALCULATED', 'LEAD', 'FILE'];
    const invalidTargetSubtypes = ['PASSWORD'];

    return fields.filter(f => {
      if (invalidTargetTypes.includes(f.field_type.code)) return false;
      if (f.field_subtype_code && invalidTargetSubtypes.includes(f.field_subtype_code)) return false;
      // Campos nativos de solo lectura (Fecha de creación/actualización, Usuario Creador/Modificación).
      // Se pueden leer en condiciones y usar como origen de "Copiar de otro campo", pero no "setearlos" a mano.
      if (f.id < 0 && f.nativeKey && !WRITABLE_NATIVE_KEYS.includes(f.nativeKey)) return false;
      return true;
    });
  }, [fields]);

  const allowedSourceFields = useMemo(() => {
    const invalidSourceTypes = ['LEAD', 'FILE'];
    const invalidSourceSubtypes = ['PASSWORD'];

    return fields.filter(f => {
      if (invalidSourceTypes.includes(f.field_type.code)) return false;
      if (f.field_subtype_code && invalidSourceSubtypes.includes(f.field_subtype_code)) return false;
      return true;
    });
  }, [fields]);

  const currentActionType = useWatch({ control, name: `actions.${index}.type` })

  useEffect(() => {
    if (currentActionType === ActionTypeEnum.SET_VALUE || currentActionType === ActionTypeEnum.CLEAR_VALUE) {
      onUpdate(`actions.${index}.source_field_id`, null)
    }
    if (currentActionType === ActionTypeEnum.COPY_FROM_FIELD || currentActionType === ActionTypeEnum.CLEAR_VALUE) {
      onUpdate(`actions.${index}.value`, null)
    }
  }, [currentActionType, index, onUpdate])


  const currentTargetId = useWatch({ control, name: `actions.${index}.target_field_id` })
  const targetField = useMemo(() => allowedTargetFields.find(f => f.id === currentTargetId), [allowedTargetFields, currentTargetId]);

  const actionColor = useMemo(() => getActionColor(currentActionType), [currentActionType]);

  const updateTypeValue = (value?: LeadField | LeadField[] | null) => {
    if (!value || Array.isArray(value)) onUpdate(`actions.${index}.value`, null)
    else if (["NUMBER", "INT"].includes(value.field_type.code)) onUpdate(`actions.${index}.value`, 0)
    else onUpdate(`actions.${index}.value`, null)
  }

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 2,
        bgcolor: alpha(theme.palette[actionColor].main, 0.04),
        border: '1px solid',
        borderColor: alpha(theme.palette[actionColor].main, 0.2),
        borderRadius: 2,
      })}
    >
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Chip label={`${index + 1}`} size="small" color={actionColor} sx={{ fontWeight: 700, minWidth: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <ControlledAutocomplete
            control={control}
            name={`actions.${index}.type`}
            options={[ActionTypeEnum.SET_VALUE, ActionTypeEnum.CLEAR_VALUE, ActionTypeEnum.COPY_FROM_FIELD]}
            label='Tipo de acción'
            disabled={readOnly}
            size="small"
            getOptionKey={op => op} getOptionLabel={op => ACTION_TYPE_LABELS[op]}
            renderOption={({ key, ...props }, op) => (
              <ChipTooltip title={ACTION_TYPE_DESCRIPTIONS[op]} key={key} placement='right'>
                <Typography {...props}>{ACTION_TYPE_LABELS[op]}</Typography>
              </ChipTooltip>
            )}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          en
        </Typography>

        <Box sx={{ flexGrow: 1 }}>
          <ControlledFieldSelector
            control={control}
            name={`actions.${index}.target_field_id`}
            fields={allowedTargetFields}
            label='Campo destino'
            disabled={readOnly}
            size="small"
            onChangeBefore={updateTypeValue}
          />
        </Box>

        <ValueInput control={control} register={register} index={index} currentActionType={currentActionType} onUpdate={onUpdate}
          targetField={targetField} allowedSourceFields={allowedSourceFields} nativeOptions={nativeOptions} readOnly={readOnly} />

        {!readOnly && (
          <ChipTooltip title={isOnly ? "Debe haber al menos una acción" : "Eliminar acción"} color={isOnly ? "contrast" : "error"}>
            <span style={{ marginLeft: 'auto' }}>
              <CommonIconButton
                actionType='DISABLE'
                noTooltip
                size="small"
                onClick={onDelete}
                disabled={isOnly}
                color="error" />
            </span>
          </ChipTooltip>
        )}
      </Stack>
    </Paper >
  );
};

const DATE_OPTIONS = [
  { value: "", label: "Fecha exacta" },
  { value: "{{CURRENT_DATE}}", label: "Hoy" },
  { value: "{{YESTERDAY}}", label: "Ayer" },
  { value: "{{TOMORROW}}", label: "Mañana" },
];

const DATETIME_OPTION = [{ value: "{{CURRENT_DATETIME}}", label: "Ahora mismo" }]

interface ValueInputProps {
  control: Control<FieldAutomationPost, unknown, FieldAutomationPost>,
  register: UseFormRegister<FieldAutomationPost>,
  index: number,
  currentActionType: ActionTypeEnum,
  targetField?: LeadField,
  allowedSourceFields: LeadField[],
  nativeOptions?: NativeFieldOptions,
  readOnly: boolean,
  onUpdate: (name: Path<FieldAutomationPost>, value?: string | number | boolean | null) => void
}

const ValueInput = ({ control, register, index, currentActionType, targetField, allowedSourceFields, nativeOptions, readOnly, onUpdate }: ValueInputProps) => {

  /** Obtiene los campos del mismo tipo para duplicar */
  const compatibleFieldsForCopy = useMemo(() => {
    if (!targetField) return allowedSourceFields;
    // Solo se permite copiar de campos que sean del mismo tipo
    return allowedSourceFields.filter(f => f.id !== targetField.id && f.field_type.code === targetField.field_type.code);
  }, [targetField, allowedSourceFields])

  const [selectorOptions, setSelectorOptions] = useState<NomenclatorItem[]>([]);

  /** Recupera las opciones al seleccionar un campo Selector */
  const fetchOptions = useCallback(async () => {
    const isSelector = targetField?.field_type?.code === 'SELECTOR';

    if (!isSelector || !targetField?.nomenclator_id) return setSelectorOptions([]);

    return getNomenclatorItems({
      nomenclator_id: targetField.nomenclator_id,
      page_size: 0,
      only_active: true
    })
      .then(res => setSelectorOptions(res.items))
      .catch(e => showCommonErrorToast(e, "Error cargando opciones del selector"))

  }, [targetField])

  const { fnWithLoading: fetchOptionsLoad, loading: loadingOptions } = useLoading(fetchOptions)

  useEffect(() => {
    fetchOptionsLoad();
  }, [fetchOptionsLoad]);

  const currentValue = useWatch({ control, name: `actions.${index}.value` })


  switch (currentActionType) {
    case ActionTypeEnum.CLEAR_VALUE:
      return null;

    case ActionTypeEnum.COPY_FROM_FIELD: {
      return (
        <>
          <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
          <Box sx={{ flexGrow: 1 }}>
            <ControlledFieldSelector
              control={control}
              name={`actions.${index}.source_field_id`}
              fields={compatibleFieldsForCopy}
              label='Campo origen'
              disabled={readOnly}
              size="small"
            />
          </Box>
        </>
      );
    }
    case ActionTypeEnum.SET_VALUE:
      if (!targetField) {
        return (
          <>
            <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
            <RegisteredTextInput
              register={register}
              name={`actions.${index}.value`}
              disabled={readOnly}
              size="small"
              label="Valor"
            />
          </>
        );
      }

      switch (targetField.field_type.code) {
        case 'SELECTOR':
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              <Box sx={{ flexGrow: 1 }}>
                <ControlledAutocomplete
                  control={control}
                  name={`actions.${index}.value`}
                  options={selectorOptions}
                  label='Valor'
                  disabled={readOnly || loadingOptions}
                  size="small"
                  returnField="id"
                  getOptionKey={op => `${op.id}`} getOptionLabel={op => `${op.value ?? op.id}`}
                />
              </Box>
            </>
          );
        case 'BOOL':
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              <Box sx={{ flexGrow: 1 }}>
                <ControlledAutocomplete
                  control={control}
                  name={`actions.${index}.value`}
                  options={[{ label: "Si", value: true }, { label: "No", value: false }]}
                  label='Valor'
                  disabled={readOnly}
                  size="small"
                  returnField="value"
                  getOptionKey={op => `${op.label}`} getOptionLabel={op => op.label}
                />
              </Box>
            </>
          );
        case 'NATIVE_ID': {
          const nativeIdOptions = getNativeIdOptions(targetField.nativeKey, nativeOptions);
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              <Box sx={{ flexGrow: 1 }}>
                <ControlledAutocomplete
                  control={control}
                  name={`actions.${index}.value`}
                  options={nativeIdOptions}
                  label='Valor'
                  disabled={readOnly}
                  size="small"
                  returnField="id"
                  getOptionKey={op => `${op.id}`} getOptionLabel={op => op.label}
                />
              </Box>
            </>
          );
        }
        case 'NUMBER': case 'INT':
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              <ControlledNumber
                control={control}
                name={`actions.${index}.value`}
                label="Valor numérico"
                disabled={readOnly}
                size="small"
              />
            </>
          );
        case 'DATE': case 'DATE_TIME': {
          const isDateTime = targetField.field_type.code === 'DATE_TIME';
          const isTime = targetField.field_subtype?.code === 'TIME_ONLY';
          const dynamicOptions = ['{{CURRENT_DATE}}', '{{CURRENT_DATETIME}}', '{{YESTERDAY}}', '{{TOMORROW}}'];
          const showDateInput = currentValue !== null && !dynamicOptions.includes(String(currentValue));
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 250 }}>
                <Autocomplete
                  options={[...DATE_OPTIONS, ...(isDateTime ? DATETIME_OPTION : [])]}
                  disabled={readOnly} size="small"
                  onChange={(_, option) => {
                    if (!option) onUpdate(`actions.${index}.value`, null)
                    else onUpdate(`actions.${index}.value`, option.value)
                  }}
                  getOptionLabel={op => op.label}
                  renderInput={(params) =>
                    <TextField {...params} label="Valor" size="small" fullWidth />
                  } />
                {showDateInput && (
                  <RegisteredDateInput
                    register={register}
                    name={`actions.${index}.value`}
                    label="Fecha Exacta"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    disabled={readOnly}
                    dateType={isDateTime ? "DATE_TIME" : (isTime ? "TIME" : "DATE")}
                  />
                )}
              </Box>
            </>
          );
        }
        default:
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              <RegisteredTextInput
                register={register}
                name={`actions.${index}.value`}
                disabled={readOnly}
                size="small"
                label="Valor texto"
              />
            </>
          );
      }
    default:
      return null;
  }
}
