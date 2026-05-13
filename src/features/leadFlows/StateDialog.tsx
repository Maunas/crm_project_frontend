import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Box, FormControlLabel, Switch
} from '@mui/material'
import type { Category, FlowState } from '../../types/leadFlow'
import { DEFAULT_STATE_COLORS } from '../../types/leadFlow'

interface StateDialogProps {
  open: boolean
  onClose: () => void
  onSave: (state: Partial<FlowState>) => void
  state: FlowState | null // Si es null, estamos creando
  hasInitialState: boolean
}

export default function StateDialog({ open, onClose, onSave, state, hasInitialState }: StateDialogProps) {
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
      setColor(state.color || DEFAULT_STATE_COLORS[state.category])
    } else {
      setName('')
      setCategory('OPEN')
      setIsInitial(false)
      setColor(DEFAULT_STATE_COLORS.OPEN)
    }
  }, [state, open])

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    // Si estamos CREANDO, actualizamos el color automáticamente al cambiar de categoría
    if (!state) {
      setColor(DEFAULT_STATE_COLORS[newCategory]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name, category, is_initial: isInitial, color })
    onClose()
  }

  const canSelectInitial = !hasInitialState || (isEditing && state?.is_initial)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Estado' : 'Crear Nuevo Estado'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField 
            label="Nombre del Estado" 
            fullWidth 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          
          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select 
              value={category} 
              label="Categoría" 
              onChange={(e) => handleCategoryChange(e.target.value as Category)}
            >
              <MenuItem value="OPEN">Abierto</MenuItem>
              <MenuItem value="WON">Éxito</MenuItem>
              <MenuItem value="LOST">Fracaso</MenuItem>
            </Select>
          </FormControl>

          {canSelectInitial && (
            <FormControlLabel
              control={<Switch checked={isInitial} onChange={(e) => setIsInitial(e.target.checked)} />}
              label="Es estado inicial"
            />
          )}

          {/* El selector RGB que te gustó */}
          <TextField
            label="Color del Estado"
            type="color"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>{isEditing ? 'Actualizar' : 'Crear'}</Button>
      </DialogActions>
    </Dialog>
  )
}