import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
import { ActionTypeEnum} from '../../types/automation';
import type { AutomationAction } from '../../types/automation';
import { ActionRow } from './ActionRow';
import type { LeadField } from '../../types/leadFields';

interface ActionBuilderProps {
  actions: AutomationAction[];
  onChange: (actions: AutomationAction[]) => void;
  fields: LeadField[];
  readOnly?: boolean;
}

const createEmptyAction = (): AutomationAction => ({
  id: uuidv4(),
  type: ActionTypeEnum.SET_VALUE,
  target_field_id: null,
  value: null,
});

export const ActionBuilder: React.FC<ActionBuilderProps> = ({
  actions,
  onChange,
  fields,
  readOnly = false,
}) => {
  const handleAddAction = () => {
    onChange([...actions, createEmptyAction()]);
  };

  const handleUpdateAction = (index: number, updatedAction: AutomationAction) => {
    const newActions = [...actions];
    newActions[index] = updatedAction;
    onChange(newActions);
  };

  const handleDeleteAction = (index: number) => {
    if (actions.length > 1) {
      const newActions = actions.filter((_, i) => i !== index);
      onChange(newActions);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: 'success.main',
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Acciones a ejecutar
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {actions.map((action, index) => (
          <Box key={action.id}>
            {index > 0 && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  py: 1,
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                — LUEGO —
              </Typography>
            )}
            <ActionRow
              action={action}
              onUpdate={(updated) => handleUpdateAction(index, updated)}
              onDelete={() => handleDeleteAction(index)}
              isOnly={actions.length === 1}
              index={index}
              fields={fields}
              readOnly={readOnly}
            />
          </Box>
        ))}
      </Box>

      {!readOnly && (<Button
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddAction}
        variant="outlined"
        color="success"
        sx={{ mt: 2 }}
      >
        Agregar acción
      </Button>)}
    </Paper>
  );
};
