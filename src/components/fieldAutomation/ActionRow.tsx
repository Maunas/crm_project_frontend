import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Paper,
  Typography,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  ActionTypeEnum,
  ACTION_TYPE_LABELS,
  ACTION_TYPE_DESCRIPTIONS,
} from '../../types/automation';

import type { LeadField } from '../../types/leadFields';
import type { AutomationAction } from '../../types/automation';
import { getNomenclatorItems } from '../nomenclators/nomenclatorService';
import type { NomenclatorItem } from '../../types/nomenclators';

interface ActionRowProps {
  action: AutomationAction;
  onUpdate: (action: AutomationAction) => void;
  onDelete: () => void;
  isOnly: boolean;
  index: number;
  fields: LeadField[];
  readOnly?: boolean;
}

const getActionColor = (type: ActionTypeEnum) => {
  switch (type) {
    case ActionTypeEnum.SET_VALUE: return 'primary';
    case ActionTypeEnum.CLEAR_VALUE: return 'error';
    case ActionTypeEnum.COPY_FROM_FIELD: return 'secondary';
    default: return 'primary';
  }
};

export const ActionRow: React.FC<ActionRowProps> = ({
  action,
  onUpdate,
  onDelete,
  isOnly,
  index,
  fields,
  readOnly = false,
}) => {
  
  // 1. FILTRADO DE CAMPOS PARA ACCIONES
  const allowedTargetFields = useMemo(() => {
    const invalidTargetTypes = ['CALCULATED', 'LEAD', 'FILE'];
    const invalidTargetSubtypes = ['PASSWORD'];

    return fields.filter(f => {
      if (invalidTargetTypes.includes(f.field_type.code)) return false;
      if (f.field_subtype_code && invalidTargetSubtypes.includes(f.field_subtype_code)) return false;
      return true;
    });
  }, [fields]);

  const allowedSourceFields = useMemo(() => {
    const invalidSourceTypes = ['FILE', 'LEAD'];
    const invalidSourceSubtypes = ['PASSWORD'];

    return fields.filter(f => {
      if (invalidSourceTypes.includes(f.field_type.code)) return false;
      if (f.field_subtype_code && invalidSourceSubtypes.includes(f.field_subtype_code)) return false;
      return true;
    });
  }, [fields]);

  const targetField = allowedTargetFields.find(f => f.id === action.target_field_id);
  const actionColor = getActionColor(action.type);

  const [selectorOptions, setSelectorOptions] = useState<NomenclatorItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const isSelector = targetField?.field_type?.code?.startsWith('SELECTOR');
      if (isSelector && targetField?.nomenclator_id) {
        setLoadingOptions(true);
        try {
          const response = await getNomenclatorItems({ 
            nomenclator_id: targetField.nomenclator_id, 
            page_size: 0, 
            only_active: true 
          });
          setSelectorOptions(response.items);
        } catch (error) {
          console.error("Error cargando opciones del selector:", error);
        } finally {
          setLoadingOptions(false);
        }
      } else {
        setSelectorOptions([]); 
      }
    };
    fetchOptions();
  }, [targetField?.id, targetField?.nomenclator_id]);

  const getCompatibleFieldsForCopy = (targetField: LeadField | undefined): LeadField[] => {
    if (!targetField) return allowedSourceFields;
    // Solo permitimos copiar de campos que sean del mismo tipo
    return allowedSourceFields.filter(f => f.id !== targetField.id && f.field_type.code === targetField.field_type.code);
  };

  const renderValueInput = () => {
    switch (action.type) {
      case ActionTypeEnum.CLEAR_VALUE:
        return null;
        
      case ActionTypeEnum.COPY_FROM_FIELD:
        const compatibleFields = getCompatibleFieldsForCopy(targetField);
        return (
          <>
            <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Campo origen</InputLabel>
              <Select
                disabled={readOnly}
                value={action.source_field_id ?? ''}
                label="Campo origen"
                onChange={(e) => onUpdate({ ...action, source_field_id: e.target.value as number })}
              >
                {compatibleFields.map((field) => (
                  <MenuItem key={field.id} value={field.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {field.name}
                      <Typography variant="caption" color="text.secondary">
                        ({field.field_type.code})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
        
      case ActionTypeEnum.SET_VALUE:
        if (!targetField) {
          return (
            <>
              <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
              <TextField
                disabled={readOnly}
                size="small"
                label="Valor"
                value={action.value ?? ''}
                onChange={(e) => onUpdate({ ...action, value: e.target.value })}
                sx={{ flex: 1, minWidth: 150 }}
              />
            </>
          );
        }

        switch (targetField.field_type.code) {
          case 'SELECTOR':
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
                  <InputLabel>Valor</InputLabel>
                  <Select
                    disabled={readOnly || loadingOptions}
                    value={action.value ?? ''}
                    label="Valor"
                    onChange={(e) => onUpdate({ ...action, value: e.target.value })}
                  >
                    {selectorOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>{opt.value || opt.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            );
          case 'BOOL':
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
                  <InputLabel>Valor</InputLabel>
                  <Select
                    disabled={readOnly}
                    value={action.value?.toString() ?? ''}
                    label="Valor"
                    onChange={(e) => onUpdate({ ...action, value: e.target.value === 'true' })}
                  >
                    <MenuItem value="true">Sí</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </>
            );
          case 'NUMBER': case 'INT':
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <TextField
                  disabled={readOnly}
                  size="small"
                  type="number"
                  label="Valor numérico"
                  value={action.value ?? ''}
                  onChange={(e) => onUpdate({ ...action, value: Number(e.target.value) })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
              </>
            );
          case 'DATE': case 'DATE_TIME':
            const isDateTime = targetField.field_type.code === 'DATE_TIME';
            const dynamicOptions = ['{{CURRENT_DATE}}', '{{CURRENT_DATETIME}}', '{{YESTERDAY}}', '{{TOMORROW}}'];
            const isDynamic = dynamicOptions.includes(String(action.value));
            const selectValue = isDynamic ? String(action.value) : 'EXACT';

            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 250 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      disabled={readOnly}
                      value={selectValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'EXACT') onUpdate({ ...action, value: '' });
                        else onUpdate({ ...action, value: val });
                      }}
                    >
                      <MenuItem value="EXACT"><em>Fecha exacta</em></MenuItem>
                      <MenuItem value="{{CURRENT_DATE}}">Hoy</MenuItem>
                      <MenuItem value="{{YESTERDAY}}">Ayer</MenuItem>
                      <MenuItem value="{{TOMORROW}}">Mañana</MenuItem>
                      {isDateTime && <MenuItem value="{{CURRENT_DATETIME}}">Ahora mismo</MenuItem>}
                    </Select>
                  </FormControl>

                  {!isDynamic && (
                    <TextField
                      size="small"
                      type={isDateTime ? "datetime-local" : "date"}
                      value={action.value ?? ''}
                      onChange={(e) => onUpdate({ ...action, value: e.target.value })}
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{ flex: 1 }}
                      disabled={readOnly}
                    />
                  )}
                </Box>
              </>
            );
          default:
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <TextField
                  size="small"
                  label="Valor texto"
                  disabled={readOnly}
                  value={action.value ?? ''}
                  onChange={(e) => onUpdate({ ...action, value: e.target.value })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
              </>
            );
        }
      default:
        return null;
    }
  };

  const handleTargetFieldChange = (fieldId: number) => {
    onUpdate({ 
      ...action, 
      target_field_id: fieldId,
      value: null,
      source_field_id: null,
    });
  };

  const handleTypeChange = (type: ActionTypeEnum) => {
    const updates: Partial<AutomationAction> = { type };
    if (type === ActionTypeEnum.CLEAR_VALUE) {
      updates.value = null;
      updates.source_field_id = null;
    } else if (type === ActionTypeEnum.SET_VALUE) {
      updates.source_field_id = null;
    } else if (type === ActionTypeEnum.COPY_FROM_FIELD) {
      updates.value = null;
    }
    onUpdate({ ...action, ...updates });
  };

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        bgcolor: alpha(theme.palette[actionColor].main, 0.04),
        border: '1px solid',
        borderColor: alpha(theme.palette[actionColor].main, 0.2),
        borderRadius: 2,
      })}
    >
      <Chip label={`${index + 1}`} size="small" color={actionColor} sx={{ fontWeight: 700, minWidth: 32 }} />

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Tipo de acción</InputLabel>
        <Select
          disabled={readOnly}
          value={action.type}
          label="Tipo de acción"
          onChange={(e) => handleTypeChange(e.target.value as ActionTypeEnum)}
        >
          {/* Eliminamos el SET_CURRENT_DATE viejo del Dropdown, ahora vive en SET_VALUE */}
          {[ActionTypeEnum.SET_VALUE, ActionTypeEnum.CLEAR_VALUE, ActionTypeEnum.COPY_FROM_FIELD].map((type) => (
            <MenuItem key={type} value={type}>
              <Tooltip title={ACTION_TYPE_DESCRIPTIONS[type]} placement="right">
                <span>{ACTION_TYPE_LABELS[type]}</span>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        en
      </Typography>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Campo destino</InputLabel>
        <Select
          disabled={readOnly}
          value={action.target_field_id ?? ''}
          label="Campo destino"
          onChange={(e) => handleTargetFieldChange(e.target.value as number)}
        >
          {allowedTargetFields.map((field) => (
            <MenuItem key={field.id} value={field.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {field.name}
                <Typography variant="caption" color="text.secondary">
                  ({field.field_type.code})
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {renderValueInput()}

      {!readOnly && (
        <Tooltip title={isOnly ? "Debe haber al menos una acción" : "Eliminar acción"}>
          <span style={{ marginLeft: 'auto' }}>
            <IconButton
              size="small"
              onClick={onDelete}
              disabled={isOnly}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Paper>
  );
};