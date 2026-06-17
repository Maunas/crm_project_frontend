import React, { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Paper, Typography, Tooltip, Chip, alpha, } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConditionOperatorEnum, CONDITION_OPERATOR_LABELS, } from '../../types/automation';
import { getNomenclatorItems } from '../nomenclators/nomenclatorService';
import type { LeadField } from '../../types/leadFields';
import type { RuleCondition } from '../../types/automation';
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
  // 1. FILTRAMOS CAMPOS INVÁLIDOS PARA CONDICIONES (Incluyendo LEAD)
  const allowedFields = useMemo(() => {
    const invalidTypes = ['FILE', 'CALCULATED', 'LEAD'];
    const invalidSubtypes = ['PASSWORD']; // Se pueden agregar otros subtipos no lógicos aquí

    return fields.filter(f => {
      // Rechazar si coincide el tipo principal
      if (invalidTypes.includes(f.field_type.code)) return false;
      // Rechazar si coincide el subtipo (ojo: puede venir nulo)
      if (f.field_subtype_code && invalidSubtypes.includes(f.field_subtype_code)) return false;
      // Si pasa ambos filtros, se permite
      return true;
    });
  }, [fields]);

  const selectedField = allowedFields.find(f => f.id === condition.field_id);

  const [selectorOptions, setSelectorOptions] = useState<NomenclatorItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const isSelector = selectedField?.field_type?.code?.startsWith('SELECTOR');
      if (isSelector && selectedField?.nomenclator_id) {
        setLoadingOptions(true);
        try {
          const response = await getNomenclatorItems({
            nomenclator_id: selectedField.nomenclator_id,
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
  }, [selectedField?.id, selectedField?.nomenclator_id]);

  const getAvailableOperators = (field: LeadField | undefined): ConditionOperatorEnum[] => {
    if (!field) return [ConditionOperatorEnum.EQUALS];

    switch (field.field_type.code) {
      case 'NUMBER': case 'INT': case 'MONEY': case 'CALCULATED': case 'DATE': case 'DATE_TIME':
        return [
          ConditionOperatorEnum.EQUALS, ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.GREATER_THAN, ConditionOperatorEnum.LESS_THAN,
          ConditionOperatorEnum.IS_EMPTY, ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      case 'BOOL':
      case 'BOOLEAN':
        return [
          ConditionOperatorEnum.EQUALS, ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.IS_EMPTY, ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      case 'SELECTOR': case 'CHECKBOX':
        return [
          ConditionOperatorEnum.EQUALS, ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.IS_EMPTY, ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
      default:
        return [
          ConditionOperatorEnum.EQUALS, ConditionOperatorEnum.NOT_EQUALS,
          ConditionOperatorEnum.CONTAINS, ConditionOperatorEnum.NOT_CONTAINS,
          ConditionOperatorEnum.IS_EMPTY, ConditionOperatorEnum.IS_NOT_EMPTY,
        ];
    }
  };

  const renderValueInput = () => {
    if (NO_VALUE_OPERATORS.includes(condition.operator)) return null;

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
                <MenuItem key={opt.id} value={opt.id}>{opt.value}</MenuItem>
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
      case 'NUMBER': case 'INT':
        return (
          <TextField
            size="small"
            type="number"
            label="Valor numérico"
            disabled={readOnly}
            value={condition.value ?? ''}
            onChange={(e) => onUpdate({ ...condition, value: Number(e.target.value) })}
            sx={{ flex: 1, minWidth: 150 }}
          />
        );
      case 'DATE': case 'DATE_TIME': {
        const isDateTime = selectedField.field_type.code === 'DATE_TIME';
        // Revisamos si el valor actual es una de nuestras variables mágicas
        const dynamicOptions = ['{{CURRENT_DATE}}', '{{CURRENT_DATETIME}}', '{{YESTERDAY}}', '{{TOMORROW}}'];
        const isDynamic = dynamicOptions.includes(String(condition.value));
        const selectValue = isDynamic ? String(condition.value) : 'EXACT';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 250 }}>
            {/* SELECTOR DE TIPO DE FECHA */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                disabled={readOnly}
                value={selectValue}
                onChange={(e) => {
                  const val = e.target.value;
                  // Si elige exacta, borramos la variable mágica para que use el calendario
                  if (val === 'EXACT') onUpdate({ ...condition, value: '' });
                  else onUpdate({ ...condition, value: val });
                }}
              >
                <MenuItem value="EXACT"><em>Fecha exacta</em></MenuItem>
                <MenuItem value="{{CURRENT_DATE}}">Hoy</MenuItem>
                <MenuItem value="{{YESTERDAY}}">Ayer</MenuItem>
                <MenuItem value="{{TOMORROW}}">Mañana</MenuItem>
                {isDateTime && <MenuItem value="{{CURRENT_DATETIME}}">Ahora mismo</MenuItem>}
              </Select>
            </FormControl>

            {/* INPUT CALENDARIO (Solo se muestra si elige Fecha Exacta) */}
            {!isDynamic && (
              <TextField
                size="small"
                type={isDateTime ? "datetime-local" : "date"}
                value={condition.value ?? ''}
                onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
                disabled={readOnly}
              />
            )}
          </Box>
        );
      }
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
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.contrast[50], 0.5),
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      })}
    >
      <Chip label="SI" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />

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
            operator: getAvailableOperators(allowedFields.find(f => f.id === e.target.value))[0]
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
            value: NO_VALUE_OPERATORS.includes(e.target.value as ConditionOperatorEnum) ? null : condition.value,
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