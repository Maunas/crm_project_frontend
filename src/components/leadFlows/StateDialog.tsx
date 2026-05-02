import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import type { Category, FlowState } from '../../types/leadFlow'

interface StateDialogProps {
  open: boolean
  onClose: () => void
  onSave: (state: Partial<FlowState>) => void
  state: FlowState | null
  hasInitialState: boolean
}

const categoryOptions: { value: Category; label: string; description: string }[] = [
  { value: 'OPEN', label: 'Abierto', description: 'Estado intermedio del flujo' },
  { value: 'WON', label: 'Éxito', description: 'Estado final positivo' },
  { value: 'LOST', label: 'Fracaso', description: 'Estado final negativo' },
]

const colorPresets = [
  '#2196f3', // blue
  '#4caf50', // green
  '#f44336', // red
  '#ff9800', // orange
  '#9c27b0', // purple
  '#00bcd4', // cyan
  '#795548', // brown
  '#607d8b', // grey
  '#e91e63', // pink
  '#3f51b5', // indigo
]

export default function StateDialog({
  open,
  onClose,
  onSave,
  state,
  hasInitialState,
}: StateDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('OPEN')
  const [isInitial, setIsInitial] = useState(false)
  const [color, setColor] = useState('#2196f3')

  const isEditing = !!state

  useEffect(() => {
    if (state) {
      setName(state.name)
      setCategory(state.category)
      setIsInitial(state.is_initial)
      setColor(state.color)
    } else {
      setName('')
      setCategory('OPEN')
      setIsInitial(false)
      setColor('#2196f3')
    }
  }, [state, open])

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      category,
      is_initial: isInitial,
      color,
    })
    onClose()
  }

  // Determinar si se puede seleccionar "inicial"
  // Solo si no hay estado inicial O si estamos editando el estado que ya es inicial
  const canSelectInitial = !hasInitialState || (isEditing && state?.is_initial)

  // Filtrar opciones de categoría: si ya hay estado inicial y no estamos editando el inicial,
  // solo mostrar opciones que no requieran is_initial
  const availableCategoryOptions = categoryOptions.filter((opt) => {
    // Si queremos marcar como inicial pero no podemos, no hay restricción de categoría por eso
    return true
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Estado' : 'Crear Nuevo Estado'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Nombre del Estado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            placeholder="Ej: Lead, Aplicante, Aprobado..."
          />

          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={category}
              label="Categoría"
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {availableCategoryOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box>
                    <Typography variant="body1">{opt.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {opt.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {canSelectInitial && (
            <FormControlLabel
              control={
                <Switch
                  checked={isInitial}
                  onChange={(e) => setIsInitial(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography>Estado Inicial</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Este será el primer estado por el que pasan los leads
                  </Typography>
                </Box>
              }
            />
          )}

          {!canSelectInitial && !isEditing && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Ya existe un estado inicial en el flujo. Solo puede haber uno.
            </Typography>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colorPresets.map((presetColor) => (
                <Box
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: presetColor,
                    cursor: 'pointer',
                    border: color === presetColor ? '3px solid #000' : '3px solid transparent',
                    transition: 'transform 0.1s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim()}
        >
          {isEditing ? 'Guardar Cambios' : 'Crear Estado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
