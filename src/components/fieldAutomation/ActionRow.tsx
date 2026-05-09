import React, { useEffect, useState } from 'react';
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

import type {LeadField} from '../../types/leadFields';
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

export const ActionRow: React.FC<ActionRowProps> = ({
  action,
  onUpdate,
  onDelete,
  isOnly,
  index,
  fields,
  readOnly = false,
}) => {
  const targetField = fields.find(f => f.id === action.target_field_id);
  const sourceField = fields.find(f => f.id === action.source_field_id);

  const [selectorOptions, setSelectorOptions] = useState<NomenclatorItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
      const fetchOptions = async () => {
        // Verifica si es un tipo selector y tiene un nomenclator_id asociado
        const isSelector = targetField?.field_type?.code?.startsWith('SELECTOR');
        
        if (isSelector && targetField?.nomenclator_id) {
          setLoadingOptions(true);
          try {
            const response = await getNomenclatorItems({ 
              nomenclator_id: targetField.nomenclator_id, 
              page_size: 0, 
              only_active: true 
            });
            // response.items contiene la lista de NomenclatorItem
            setSelectorOptions(response.items);
          } catch (error) {
            console.error("Error cargando opciones del selector:", error);
          } finally {
            setLoadingOptions(false);
          }
        } else {
          setSelectorOptions([]); // Limpia si cambia a un campo que no es selector
        }
      };
  
      fetchOptions();
    }, [targetField?.id, targetField?.nomenclator_id]);

  const getCompatibleFieldsForCopy = (targetField: LeadField | undefined): LeadField[] => {
    if (!targetField) return fields;
    return fields.filter(f => f.id !== targetField.id && f.field_type === targetField.field_type);
  };

  const getDateFields = (): LeadField[] => {
    return fields.filter(f => f.field_type.code === 'DATE');
  };

  const renderValueInput = () => {
    switch (action.type) {
      case ActionTypeEnum.CLEAR_VALUE:
      case ActionTypeEnum.SET_CURRENT_DATE:
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
          case 'SELECT':
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
                  <InputLabel>Valor</InputLabel>
                  <Select
                    disabled={readOnly}
                    value={action.value ?? ''}
                    label="Valor"
                    onChange={(e) => onUpdate({ ...action, value: e.target.value })}
                  >
                    {selectorOptions.map((opt) => (
                      // opt.id va al value del MenuItem, y opt.value es el texto (según tu interface)
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            );
          case 'BOOLEAN':
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
          case 'NUMBER':
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <TextField
                  disabled={readOnly}
                  size="small"
                  type="number"
                  label="Valor"
                  value={action.value ?? ''}
                  onChange={(e) => onUpdate({ ...action, value: Number(e.target.value) })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
              </>
            );
          case 'DATE': case 'DATE_TIME':
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <TextField
                  disabled={readOnly}
                  size="small"
                  type="date"
                  label="Valor"
                  value={action.value ?? ''}
                  onChange={(e) => onUpdate({ ...action, value: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1, minWidth: 150 }}
                />
              </>
            );
          default:
            return (
              <>
                <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
                <TextField
                  size="small"
                  label="Valor"
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
    const field = fields.find(f => f.id === fieldId);
    const updates: Partial<AutomationAction> = { 
      target_field_id: fieldId,
      value: null,
      source_field_id: null,
    };
    
    // Si es SET_CURRENT_DATE pero el campo no es de fecha, cambiar a SET_VALUE
    if (action.type === ActionTypeEnum.SET_CURRENT_DATE && field?.field_type?.code !== 'DATE') {
      updates.type = ActionTypeEnum.SET_VALUE;
    }

    if (action.type === ActionTypeEnum.SET_CURRENT_DATETIME && field?.field_type?.code !== 'DATE_TIME') {
      updates.type = ActionTypeEnum.SET_VALUE;
    }
    
    onUpdate({ ...action, ...updates });
  };

  const handleTypeChange = (type: ActionTypeEnum) => {
    const updates: Partial<AutomationAction> = { type };
    
    // Limpiar valores según el tipo
    if (type === ActionTypeEnum.CLEAR_VALUE || type === ActionTypeEnum.SET_CURRENT_DATE) {
      updates.value = null;
      updates.source_field_id = null;
    } else if (type === ActionTypeEnum.SET_VALUE) {
      updates.source_field_id = null;
    } else if (type === ActionTypeEnum.COPY_FROM_FIELD) {
      updates.value = null;
    }
    
    onUpdate({ ...action, ...updates });
  };

  const getAvailableActionTypes = (): ActionTypeEnum[] => {
    const types = [
      ActionTypeEnum.SET_VALUE,
      ActionTypeEnum.CLEAR_VALUE,
      ActionTypeEnum.COPY_FROM_FIELD,
    ];
    
    // Solo mostrar SET_CURRENT_DATE si el campo destino es de tipo fecha
    if (targetField?.field_type?.code === 'DATE') {
      types.push(ActionTypeEnum.SET_CURRENT_DATE);
    }

    if (targetField?.field_type?.code === 'DATE_TIME') {
      types.push(ActionTypeEnum.SET_CURRENT_DATETIME);
    }
    
    return types;
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
        bgcolor: alpha(theme.palette['primary'].main, 0.04),
        border: '1px solid',
        borderColor: alpha(theme.palette['primary'].main, 0.2),
        borderRadius: 2,
      })}
    >
      <Chip
        label={`${index + 1}`}
        size="small"
        color={'primary'}
        sx={{ fontWeight: 700, minWidth: 32 }}
      />

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Tipo de acción</InputLabel>
        <Select
          disabled={readOnly}
          value={action.type}
          label="Tipo de acción"
          onChange={(e) => handleTypeChange(e.target.value as ActionTypeEnum)}
        >
          {getAvailableActionTypes().map((type) => (
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
          {(action.type === ActionTypeEnum.SET_CURRENT_DATE || action.type === ActionTypeEnum.SET_CURRENT_DATETIME ? getDateFields() : fields).map((field) => (
            <MenuItem key={field.id} value={field.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {field.name}
                <Typography variant="caption" color="text.secondary">
                  ({field.field_type.description})
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
      </Tooltip>)}
    </Paper>
  );
};
