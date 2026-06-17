import React, { useState } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Card, CardContent, Typography, Divider, Chip, Alert, Snackbar, Paper, IconButton, Collapse, alpha, } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { v4 as uuidv4 } from 'uuid';
import {
  TriggerEventEnum, LogicalOperatorEnum, ConditionOperatorEnum,
  ActionTypeEnum, TRIGGER_EVENT_LABELS,
} from '../../types/automation';
import type { FieldAutomationPost, RuleGroup, FieldAutomationDetailed, AutomationAction } from '../../types/automation';
import { ConditionBuilder } from './ConditionBuilder';
import { ActionBuilder } from './ActionBuilder';
import type { LeadField } from '../../types/leadFields';

// ==========================================
// FUNCIONES DE INICIALIZACIÓN Y REHIDRATACIÓN
// ==========================================
const createEmptyCondition = (): any => ({
  id: uuidv4(), type: 'condition', field_id: null, operator: ConditionOperatorEnum.EQUALS, value: null,
});

const createInitialConditions = (): RuleGroup => ({
  id: uuidv4(), type: 'group', operator: LogicalOperatorEnum.AND, rules: [createEmptyCondition()],
});

const createInitialActions = (): AutomationAction[] => [
  { id: uuidv4(), type: ActionTypeEnum.SET_VALUE, target_field_id: null, value: null },
];

// REHIDRATAR: Le devuelve los IDs y el 'type' a la data que viene del Backend
const rehydrateConditions = (node: any): any => {
  if (!node) return createInitialConditions();

  if ('rules' in node && Array.isArray(node.rules)) {
    return {
      ...node,
      id: node.id || uuidv4(),
      type: 'group',
      rules: node.rules.map(rehydrateConditions),
    };
  } else {
    return {
      ...node,
      id: node.id || uuidv4(),
      type: 'condition',
    };
  }
};

const rehydrateActions = (actions: any[]): any[] => {
  return (actions || []).map((action) => ({
    ...action,
    id: action.id || uuidv4(),
  }));
};
interface AutomationFormProps {
  initialData?: FieldAutomationDetailed; // Si viene data, estamos editando
  campaignId: number;
  onSave: (data: FieldAutomationPost) => Promise<void>;
  fields?: LeadField[];
  readOnly?: boolean;
  isDuplicating?: boolean;
  submitRef?: React.MutableRefObject<(() => void) | null>;
}

export const AutomationForm: React.FC<AutomationFormProps> = ({
  initialData,
  onSave,
  campaignId = 1,
  fields = [],
  readOnly = false,
  isDuplicating = false,
  submitRef = null,

}) => {
  const [isSaving, setIsSaving] = useState(false);

  // INICIALIZACIÓN INTELIGENTE: Si hay initialData lo rehidrata, si no, lo crea vacío.
  const [automation, setAutomation] = useState<FieldAutomationPost & { id?: number }>(() => {
    if (initialData) {
      return {
        ...initialData,
        conditions: rehydrateConditions(initialData.conditions),
        actions: rehydrateActions(initialData.actions),
      };
    }
    return {
      name: '',
      description: '',
      campaign_id: campaignId,
      trigger_events: [TriggerEventEnum.ON_UPDATE],
      priority: 1,
      conditions: createInitialConditions(),
      actions: createInitialActions(),
    };
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    conditions: true,
    actions: true,
    preview: false,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    if (submitRef) {
      submitRef.current = handleSave;
    }
  }, [automation, submitRef]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTriggerChange = (events: TriggerEventEnum[]) => {
    if (events.length > 0) {
      setAutomation((prev) => ({ ...prev, trigger_events: events }));
    }
  };

  const handleConditionsChange = (conditions: RuleGroup) => {
    setAutomation((prev) => ({ ...prev, conditions }));
  };

  const handleActionsChange = (actions: AutomationAction[]) => {
    setAutomation((prev) => ({ ...prev, actions }));
  };

  const validateAutomation = (): string[] => {
    const errors: string[] = [];

    if (!automation.name.trim()) {
      errors.push('El nombre es requerido');
    }

    if (automation.trigger_events.length === 0) {
      errors.push('Debe seleccionar al menos un evento disparador');
    }

    // Validar condiciones
    const validateConditions = (group: RuleGroup): void => {
      for (const rule of group.rules) {
        if (rule.type === 'condition') {
          if (rule.field_id === null) {
            errors.push('Todas las condiciones deben tener un campo seleccionado');
          }
        } else {
          validateConditions(rule);
        }
      }
    };
    validateConditions(automation.conditions);

    // Validar acciones
    for (const action of automation.actions) {
      if (action.target_field_id === null) {
        errors.push('Todas las acciones deben tener un campo destino');
      }
      if (action.type === ActionTypeEnum.COPY_FROM_FIELD && !action.source_field_id) {
        errors.push('Las acciones de copiar deben tener un campo origen');
      }
      if (action.type === ActionTypeEnum.SET_VALUE && action.value === null) {
        errors.push('Las acciones de establecer valor deben tener un valor');
      }
    }

    return [...new Set(errors)];
  };

  const handleSave = async () => {
    const errors = validateAutomation();
    if (errors.length > 0) {
      setSnackbar({ open: true, message: errors[0], severity: 'error' });
      return;
    }

    // Limpiamos los IDs internos de la UI
    const cleanConditions = (group: any): any => ({
      operator: group.operator,
      rules: group.rules.map((rule: any) => {
        if (rule.type === 'condition') {
          return {
            field_id: rule.field_id,
            operator: rule.operator,
            ...(rule.value !== null && { value: rule.value }),
          };
        }
        return cleanConditions(rule);
      }),
    });

    const cleanActions = automation.actions.map((action: any) => ({
      type: action.type,
      target_field_id: action.target_field_id,
      ...(action.value !== null && { value: action.value }),
      ...(action.source_field_id && { source_field_id: action.source_field_id }),
    }));

    const payloadToBackend: FieldAutomationPost = {
      name: automation.name,
      description: automation.description || undefined,
      campaign_id: campaignId,
      trigger_events: automation.trigger_events,
      priority: automation.priority,
      conditions: cleanConditions(automation.conditions),
      actions: cleanActions,
    };

    try {
      setIsSaving(true);
      await onSave(payloadToBackend);
      setSnackbar({
        open: true,
        message: '¡Automatización guardada con éxito!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar la automatización.',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyJson = () => {
    // Preparar el JSON sin los IDs internos
    const cleanConditions = (group: RuleGroup): object => ({
      operator: group.operator,
      rules: group.rules.map((rule) => {
        if (rule.type === 'condition') {
          return {
            field_id: rule.field_id,
            operator: rule.operator,
            ...(rule.value !== null && { value: rule.value }),
          };
        }
        return cleanConditions(rule);
      }),
    });

    const cleanActions = automation.actions.map((action) => ({
      type: action.type,
      target_field_id: action.target_field_id,
      ...(action.value !== null && { value: action.value }),
      ...(action.source_field_id && { source_field_id: action.source_field_id }),
    }));

    const jsonData = {
      name: automation.name,
      description: automation.description,
      campaign_id: automation.campaign_id,
      trigger_events: automation.trigger_events,
      priority: automation.priority,
      conditions: cleanConditions(automation.conditions),
      actions: cleanActions,
    };

    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setSnackbar({
      open: true,
      message: 'JSON copiado al portapapeles',
      severity: 'info',
    });
  };

  const generateDescription = (): string => {
    const triggers = automation.trigger_events
      .map((e) => TRIGGER_EVENT_LABELS[e].toLowerCase())
      .join(' o ');

    const describeCondition = (group: RuleGroup): string => {
      if (!group || !group.rules) return '';
      const conditions = group.rules.map((rule) => {
        if (rule.type === 'condition') {
          const field = fields.find((f) => f.id === rule.field_id);
          return field ? `${field.name}` : 'campo';
        }
        return `(${describeCondition(rule)})`;
      });
      return conditions.join(group.operator === LogicalOperatorEnum.AND ? ' y ' : ' o ');
    };

    const actionsDesc = automation.actions
      .map((action) => {
        const targetField = fields.find((f) => f.id === action.target_field_id);
        return targetField ? targetField.name : 'campo';
      })
      .join(', ');

    return `Cuando se ejecute "${triggers}", si ${describeCondition(automation.conditions)}, entonces modificar: ${actionsDesc}`;
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      {isDuplicating && (
        <Alert
          severity="info"
          icon={<ContentCopyIcon />}
          sx={{ mb: 3, border: '1px solid', borderColor: 'info.light' }}
        >
          <Typography variant="subtitle2">Estás creando un duplicado</Typography>
          <Typography variant="body2">
            Los datos fueron copiados de otra automatización. Revisa las condiciones y haz clic en <b>Guardar</b> para confirmar la creación de esta nueva regla.
          </Typography>
        </Alert>
      )}
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: 3,
          mb: 3,
          background: readOnly
            ? alpha(theme.palette.text.disabled, 0.1) // Más tenue si es solo lectura
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: readOnly ? 'text.primary' : 'white',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: readOnly ? '1px dashed' : 'none',
          borderColor: 'divider'
        })}
      >
        <AutoFixHighIcon sx={{ fontSize: 40, opacity: readOnly ? 0.5 : 1 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Configuración de Reglas
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {readOnly
              ? 'Los cambios están deshabilitados. Pulsa el botón "Editar" en la parte superior para modificar.'
              : 'Define disparadores y acciones para automatizar tu flujo de leads.'
            }
          </Typography>
        </Box>
      </Paper>

      {/* General Info Section */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => toggleSection('general')}
        >
          <Typography variant="h6">Información General</Typography>
          <IconButton size="small">
            {expandedSections.general ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expandedSections.general}>
          <Divider />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              disabled={readOnly}
              label="Nombre de la automatización"
              value={automation.name}
              onChange={(e) => setAutomation((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              placeholder="Ej: Autocompletar provincia según nomenclador"
            />

            <TextField
              disabled={readOnly}
              label="Descripción (opcional)"
              value={automation.description ?? ''}
              onChange={(e) => setAutomation((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Describe qué hace esta automatización..."
            />

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>Eventos disparadores</InputLabel>
                <Select
                  disabled={readOnly}
                  multiple
                  value={automation.trigger_events}
                  onChange={(e) => handleTriggerChange(e.target.value as TriggerEventEnum[])}
                  input={<OutlinedInput label="Eventos disparadores" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={TRIGGER_EVENT_LABELS[value]}
                          size="small"
                          color="primary"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(TriggerEventEnum).map((event) => (
                    <MenuItem key={event} value={event}>
                      <Checkbox checked={automation.trigger_events.includes(event)} />
                      <ListItemText primary={TRIGGER_EVENT_LABELS[event]} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Orden"
                title="Orden de ejecución"
                disabled={readOnly}
                type="number"
                value={automation.priority}
                onChange={(e) =>
                  setAutomation((prev) => ({ ...prev, priority: Number(e.target.value) }))
                }
                sx={{ width: 120 }}
                inputProps={{ min: 1, max: 100 }}
                helperText="(1 = primero en ejecutarse)"
              />
            </Box>
          </CardContent>
        </Collapse>
      </Card>

      {/* Conditions Section */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => toggleSection('conditions')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Condiciones</Typography>
            <Chip
              label={`${automation.conditions.rules.length} regla(s)`}
              size="small"
              variant="outlined"
            />
          </Box>
          <IconButton size="small">
            {expandedSections.conditions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expandedSections.conditions}>
          <Divider />
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
              Define las condiciones que deben cumplirse para ejecutar las acciones. Puedes crear
              grupos anidados con operadores Y/O.
            </Alert>
            <ConditionBuilder
              group={automation.conditions}
              onChange={handleConditionsChange}
              isRoot
              fields={fields}
              readOnly={readOnly}
            />
          </CardContent>
        </Collapse>
      </Card>

      {/* Actions Section */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => toggleSection('actions')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Acciones</Typography>
            <Chip
              label={`${automation.actions.length} acción(es)`}
              size="small"
              variant="outlined"
              color="success"
            />
          </Box>
          <IconButton size="small">
            {expandedSections.actions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expandedSections.actions}>
          <Divider />
          <CardContent>
            <Alert severity="success" sx={{ mb: 2 }} icon={<PlayArrowIcon />}>
              Las acciones se ejecutarán en orden cuando las condiciones se cumplan.
            </Alert>
            <ActionBuilder actions={automation.actions} onChange={handleActionsChange} fields={fields} readOnly={readOnly} />
          </CardContent>
        </Collapse>
      </Card>


      {/* Preview Section */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', m: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Resumen: {generateDescription()}
          </Typography>
        </Box>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
