import { memo } from 'react'
import type { StateCategory } from 'src/types/leadFlow'
import { CATEGORY_CONFIG } from './leadFlowServices/leadFlowUtils'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { Box, Typography, Chip, IconButton, useTheme } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete'
import CircleIcon from '@mui/icons-material/Circle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getColorShades } from 'src/utils/formatters'

export interface StateNodeData {
  label: string;
  category: StateCategory;
  isInitial: boolean;
  color?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getCategoryIcon = (category: StateCategory) => {
  const sx = { fontSize: 14 }; // Tamaño pequeño para que entre bien en el Chip
  switch (category) {
    case 'WON':
      return <EmojiEventsIcon sx={sx} />;
    case 'LOST':
      return <CancelIcon sx={sx} />;
    case 'OPEN':
    default:
      return <CircleIcon sx={sx} />;
  }
};

function StateNodeComponent({ id, data, selected }: NodeProps<{ data: StateNodeData }>) {
  const { label, category, isInitial, color, onEdit, onDelete } = data.data ?? data;
  const categoryConfig = CATEGORY_CONFIG[category];
  const theme = useTheme()
  const nodeColorShades = getColorShades(color ?? categoryConfig?.color ?? 'secondary', theme);

  return (
    <Box
      onDoubleClick={() => onEdit?.(id)}
      sx={{
        position: 'relative',
        minWidth: 160,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: 2,
        borderColor: selected ? 'primary.main' : nodeColorShades.MAIN,
        boxShadow: selected ? `0 0 2px 2px ${theme.alpha(nodeColorShades.LIGHT, .25)}` : 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: `0 4px 20px ${theme.alpha(nodeColorShades.LIGHT, .2)}`,
          '& .node-actions': { opacity: 1 },
        },
      }}
    >
      {/* Target handle - top (Oculto en etapa inicial) */}
      {!isInitial && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ width: 12, height: 12, top: -6, backgroundColor: nodeColorShades.LIGHT, border: '2px solid #1e293b' }}
        />
      )}

      {/* Header con categoría */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', backgroundColor: `${theme.alpha(nodeColorShades.DARK, .1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isInitial && <PlayArrowIcon sx={{ fontSize: 16, color: nodeColorShades.LIGHT }} />}
          <Chip
            icon={getCategoryIcon(category)}
            label={categoryConfig?.label || category}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: `${theme.alpha(nodeColorShades.DARKER, .6)}`,
              color: nodeColorShades.LIGHT,
              '& .MuiChip-icon': {
                color: nodeColorShades.LIGHT,
                marginLeft: '4px'
              }
            }}
          />
        </Box>
      </Box>

      {/* Nombre de la Etapa */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}>
          {label}
        </Typography>
      </Box>

      {/* Botón de eliminar (Aparece en Hover, solo si hay permiso de edición) */}
      {onDelete &&
        <Box className="node-actions" sx={{ position: 'absolute', top: -12, right: -12, opacity: 0, transition: 'opacity 0.2s ease' }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            sx={{ backgroundColor: 'error.dark', color: 'white', width: 24, height: 24, '&:hover': { backgroundColor: 'error.dark' } }}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      }

      {/* Source handle - bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 12, height: 12, bottom: -6, backgroundColor: nodeColorShades.LIGHT, border: '2px solid #1e293b' }}
      />
    </Box>
  );
}

export const StateNode = memo(StateNodeComponent);