import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { Box, Typography, Chip, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FlagIcon from '@mui/icons-material/Flag'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CancelIcon from '@mui/icons-material/Cancel'
import type { Category } from '../../types/leadFlow'

interface StateNodeData {
  name: string
  category: Category
  is_initial: boolean
  color: string
  onEdit: () => void
  onDelete: () => void
}

const categoryIcons: Record<Category, React.ReactNode> = {
  OPEN: <FlagIcon fontSize="small" />,
  WON: <EmojiEventsIcon fontSize="small" />,
  LOST: <CancelIcon fontSize="small" />,
}

const categoryLabels: Record<Category, string> = {
  OPEN: 'Abierto',
  WON: 'Éxito',
  LOST: 'Fracaso',
}

const categoryColors: Record<Category, string> = {
  OPEN: '#2196f3',
  WON: '#4caf50',
  LOST: '#f44336',
}

function StateNode({ data }: NodeProps<StateNodeData>) {
  const { name, category, is_initial, color, onEdit, onDelete } = data

  return (
    <Box
      sx={{
        width: 'max-content',
        minWidth: 'clamp(150px, 15vw, 180px)', 
        maxWidth: 'clamp(200px, 25vw, 250px)',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        border: `3px solid ${color || categoryColors[category]}`,
        overflow: 'hidden',
        position: 'relative',
        '&:hover .node-actions': {
          opacity: 1,
        },
      }}
    >
      {/* PUERTOS DE ENTRADA (Target) - Donde llegan las flechas */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target-top"
        style={{ background: '#555', width: 12, height: 12, border: '2px solid white' }} // 
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        style={{ background: '#555', width: 12, height: 12, border: '2px solid white' }} 
      />

      {/* Header con categoría */}
      <Box
        sx={{
          bgcolor: color || categoryColors[category],
          color: 'white',
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {categoryIcons[category]}
          <Typography variant="caption" fontWeight="medium">
            {categoryLabels[category]}
          </Typography>
        </Box>
        {is_initial && (
          <Chip
            label="Inicial"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.3)',
              color: 'white',
              height: 20,
              fontSize: '0.65rem',
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          {name}
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        className="node-actions"
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          display: 'flex',
          gap: 0.5,
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Box>

      {/* PUERTOS DE SALIDA (Source) - De donde nacen las flechas */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        style={{ background: '#1976d2', width: 12, height: 12, border: '2px solid white' }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={{ background: '#1976d2', width: 12, height: 12, border: '2px solid white' }} 
      />
    </Box>
  )
}

export default memo(StateNode)
