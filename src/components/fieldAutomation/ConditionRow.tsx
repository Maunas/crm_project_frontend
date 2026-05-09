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
  Checkbox,          
  FormControlLabel,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  ConditionOperatorEnum,
  CONDITION_OPERATOR_LABELS,
} from '../../types/automation';
import {getNomenclatorItems} from '../nomenclators/nomenclatorService';
import type {LeadField} from '../../types/leadFields';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type {RuleCondition} from '../../types/automation';
import type { NomenclatorItem } from '../../types/nomenclators';

interface ConditionRowProps {
  condition: RuleCondition;
  onUpdate: (condition: RuleCondition) => void;
  onDelete: () => void;
  isOnly: boolean;
  fields: LeadField[];
  readOnly?: boolean;
}

const NO_VALUE_OPERATORS: ConditionOperatorEnum[] = [
  ConditionOperatorEnum.IS_EMPTY,
  ConditionOperatorEnum.IS_NOT_EMPTY,
];

export const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  onUpdate,
  onDelete,
  isOnly,
  fields,
  readOnly = false,
}) => {

  const allowedFields = useMemo(() => {
    const invalidTypes = ['PASSWORD', 'FILE', 'RICH_TEXT', 'ADDRESS'];
    return fields.filter(f => !invalidTypes.includes(f.field_type.code));
  }, [fields]);

  const selectedField = allowedFields.find(f => f.id === condition.field_id);

  const [selectorOptions, setSelectorOptions] = useState<NomenclatorItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      // Verifica si es un tipo selector y tiene un nomenclator_id asociado
      const isSelector = selectedField?.field_type?.code?.startsWith('SELECTOR');
      
      if (isSelector && selectedField?.nomenclator_id) {
        setLoadingOptions(true);
        try {
          const response = await getNomenclatorItems({ 
            nomenclator_id: selectedField.nomenclator_id, 
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
  }, [selectedField?.id, selectedField?.nomenclator_id]);

  const getAvailableOperators = (field: LeadField | undefined): ConditionOperatorEnum[] => {
    if (!field) return Object.values(ConditionOperatorEnum);
    
    switch (field.field_type.code) {
      case 'NUMBER':
      case 'INT':
      case 'MONEY':
      case 'CALCULATED':
      case 'DATE':
      case 'DATE_TIME':
        return [
          ConditionOperatorEnum.EQUALS,
          ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.GREATER_THAN,
          ConditionOperatorEnum.LESS_THAN,
          ConditionOperatorEnum.IS_EMPTY,
          ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      case 'BOOL':
        return [
          ConditionOperatorEnum.EQUALS,
          ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.IS_EMPTY,
          ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      case 'SELECTOR':
      case 'CHECKBOX':
        return [
          ConditionOperatorEnum.EQUALS,
          ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.IS_EMPTY,
          ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      case 'STRING':
      case 'EMAIL':
      case 'URL':
      case 'PHONE':
        return [
          ConditionOperatorEnum.EQUALS,
          ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.CONTAINS,
          ConditionOperatorEnum.NOT_CONTAINS,
          ConditionOperatorEnum.IS_EMPTY,
          ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      default:
        return [
          ConditionOperatorEnum.EQUALS,
          ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.IS_EMPTY,
          ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
    }
  };

  const renderValueInput = () => {
    if (NO_VALUE_OPERATORS.includes(condition.operator)) {
      return null;
    }

    if (!selectedField) {
      return (
        <TextField
          disabled={readOnly}
          size="small"
          label="Valor"
          value={condition.value ?? ''}
          onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
          sx={{ flex: 1, minWidth: 150 }}
        />
      );
    }

    switch (selectedField.field_type.code) {
      case 'SELECTOR':
      case 'CHECKBOX':
        return (
          <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>{loadingOptions ? 'Cargando...' : 'Valor'}</InputLabel>
            <Select
              disabled={readOnly || loadingOptions}
              value={condition.value ?? ''}
              label={loadingOptions ? 'Cargando...' : 'Valor'}
              onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            >
              {selectorOptions.map((opt) => (
                // opt.id va al value del MenuItem, y opt.value es el texto (según tu interface)
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'BOOL':
        return (
          <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>Valor</InputLabel>
            <Select
              disabled={readOnly}
              value={condition.value?.toString() ?? ''}
              label="Valor"
              onChange={(e) => onUpdate({ ...condition, value: e.target.value === 'true' })}
            >
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        );
      case 'NUMBER':
      case 'INT':
      case 'MONEY':
      case 'CALCULATED':
      case 'RATING':
        return (
          <TextField

            size="small"
            type="number"
            label="Valor"
            value={condition.value ?? ''}
            onChange={(e) => onUpdate({ ...condition, value: Number(e.target.value) })}
            disabled={readOnly}
            sx={{ flex: 1, minWidth: 150 }}
          />
        );
      case 'DATE': case 'DATE_TIME':
        const isCurrentDate = condition.value === '{{CURRENT_DATE}}';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 250 }}>
            {/* Solo mostramos el TextField si NO está marcada la fecha actual */}
            {!isCurrentDate && (
              <TextField
                size="small"
                type="date"
                label="Valor"
                value={condition.value ?? ''}
                onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
                disabled={readOnly} // Si tienes el prop readOnly del paso anterior
              />
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: isCurrentDate ? 0 : 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={isCurrentDate}
                    onChange={(e) => onUpdate({ 
                      ...condition, 
                      value: e.target.checked ? '{{CURRENT_DATE}}' : '' 
                    })}
                    disabled={readOnly}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: isCurrentDate ? 600 : 400, color: isCurrentDate ? 'primary.main' : 'text.primary' }}>Fecha de ejecución</Typography>}
                sx={{ m: 0, mr: 0.5, whiteSpace: 'nowrap' }}
              />
              <Tooltip title="Compara con el día exacto en el que se dispara la automatización, NO con la fecha en la que estás creando esta regla.">
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          </Box>
        );

        default:
        return (
          <TextField
            size="small"
            label="Valor texto"
            disabled={readOnly}
            value={condition.value ?? ''}
            onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            sx={{ flex: 1, minWidth: 150 }}
          />
        );
      }
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
        label="SI"
        size="small"
        color="primary"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Campo</InputLabel>
        <Select
          disabled={readOnly}
          value={condition.field_id ?? ''}
          label="Campo"
          onChange={(e) => onUpdate({ 
            ...condition, 
            field_id: e.target.value as number,
            value: null,
          })}
        >
          {allowedFields.map((field) => (
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

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Operador</InputLabel>
        <Select
          disabled={readOnly}
          value={condition.operator}
          label="Operador"
          onChange={(e) => onUpdate({ 
            ...condition, 
            operator: e.target.value as ConditionOperatorEnum,
            value: NO_VALUE_OPERATORS.includes(e.target.value as ConditionOperatorEnum) 
              ? null 
              : condition.value,
          })}
        >
          {getAvailableOperators(selectedField).map((op) => (
            <MenuItem key={op} value={op}>
              {CONDITION_OPERATOR_LABELS[op]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {renderValueInput()}

      <Tooltip title={isOnly ? "Debe haber al menos una condición" : "Eliminar condición"}>
        <span>
          <IconButton
            size="small"
            onClick={onDelete}
            disabled={isOnly || readOnly}
            color="error"
            sx={{ ml: 'auto' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Paper>
  );
};
