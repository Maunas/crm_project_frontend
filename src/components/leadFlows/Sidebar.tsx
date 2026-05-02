import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';
import { CATEGORY_CONFIG, DEFAULT_STATE_COLORS } from '../../types/leadFlow'
import type { Category, LeadStatePost } from '../../types/leadFlow'

interface SidebarProps {
  onAddState: (state: Omit<LeadStatePost, 'lead_flow_id'>) => void;
  hasInitialState: boolean;
}

const categoryItems: { category: Category; icon: React.ReactNode; description: string }[] = [
  {
    category: 'OPEN',
    icon: <CircleIcon sx={{ fontSize: 20, color: CATEGORY_CONFIG.OPEN.color }} />,
    description: 'Estado intermedio del flujo',
  },
  {
    category: 'WON',
    icon: <EmojiEventsIcon sx={{ fontSize: 20, color: CATEGORY_CONFIG.WON.color }} />,
    description: 'Lead convertido exitosamente',
  },
  {
    category: 'LOST',
    icon: <CancelIcon sx={{ fontSize: 20, color: CATEGORY_CONFIG.LOST.color }} />,
    description: 'Lead perdido o rechazado',
  },
];

export function Sidebar({ onAddState, hasInitialState }: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [newStateCategory, setNewStateCategory] = useState<Category>('OPEN');
  const [newStateIsInitial, setNewStateIsInitial] = useState(false);
  const [newStateColor, setNewStateColor] = useState('');

  const handleDragStart = (event: React.DragEvent, category: Category, isInitial: boolean = false) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ category, isInitial }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateState = () => {
    if (!newStateName.trim()) return;

    onAddState({
      name: newStateName,
      category: newStateCategory,
      is_initial: newStateIsInitial,
      color: newStateColor || undefined,
    });

    setNewStateName('');
    setNewStateCategory('OPEN');
    setNewStateIsInitial(false);
    setNewStateColor('');
    setIsDialogOpen(false);
  };

  // Filter out initial option if one already exists
  const canCreateInitial = !hasInitialState;

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ color: 'text.primary', mb: 0.5 }}>
          Estados
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Arrastra para agregar al flujo
        </Typography>
      </Box>

      {/* State types */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        {/* Initial state - only show if none exists */}
        {canCreateInitial && (
          <>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
              ESTADO INICIAL
            </Typography>
            <Paper
              elevation={0}
              draggable
              onDragStart={(e) => handleDragStart(e, 'OPEN', true)}
              sx={{
                p: 1.5,
                mb: 2,
                cursor: 'grab',
                border: 1,
                borderColor: 'divider',
                backgroundColor: `${CATEGORY_CONFIG.OPEN.color}10`,
                '&:hover': {
                  borderColor: CATEGORY_CONFIG.OPEN.color,
                  backgroundColor: `${CATEGORY_CONFIG.OPEN.color}20`,
                },
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon sx={{ fontSize: 20, color: CATEGORY_CONFIG.OPEN.color }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Inicial
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Punto de entrada del lead
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
          CATEGORIAS
        </Typography>

        {categoryItems.map(({ category, icon, description }) => (
          <Paper
            key={category}
            elevation={0}
            draggable
            onDragStart={(e) => handleDragStart(e, category)}
            sx={{
              p: 1.5,
              mb: 1.5,
              cursor: 'grab',
              border: 1,
              borderColor: 'divider',
              '&:hover': {
                borderColor: CATEGORY_CONFIG[category].color,
                backgroundColor: `${CATEGORY_CONFIG[category].color}10`,
              },
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {CATEGORY_CONFIG[category].label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {description}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          sx={{ mb: 1 }}
        >
          Crear Estado
        </Button>
      </Box>

      {/* Create State Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Estado</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre del estado"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              fullWidth
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={newStateCategory}
                label="Categoria"
                onChange={(e) => setNewStateCategory(e.target.value as Category)}
              >
                {categoryItems.map(({ category }) => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: CATEGORY_CONFIG[category].color,
                        }}
                      />
                      {CATEGORY_CONFIG[category].label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {canCreateInitial && (
              <FormControlLabel
                control={
                  <Switch
                    checked={newStateIsInitial}
                    onChange={(e) => setNewStateIsInitial(e.target.checked)}
                  />
                }
                label="Es estado inicial"
              />
            )}

            <TextField
              label="Color (opcional)"
              type="color"
              value={newStateColor || DEFAULT_STATE_COLORS[newStateCategory]}
              onChange={(e) => setNewStateColor(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateState}
            disabled={!newStateName.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
