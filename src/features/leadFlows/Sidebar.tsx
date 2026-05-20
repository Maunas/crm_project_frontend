import GenericModal from 'src/components/layout/container/GenericModal';
import CommonButton from 'src/components/ui/buttons/CommonButton';
import { useModal } from 'src/hooks/useModal';
import { CATEGORY_CONFIG } from 'src/types/leadFlow'
import type { StateCategory, LeadStatePost } from 'src/types/leadFlow'
import { Box, Typography, Paper, Divider, Stack } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';
import StateForm from './StateDialogForm';

interface SidebarProps {
  onAddState: (state: Omit<LeadStatePost, 'lead_flow_id'>) => void;
  hasInitialState: boolean;
  isLocked?: boolean
}

const CATEGORY_ITEMS: { category: StateCategory; icon: React.ReactNode; description: string }[] = [
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

export function Sidebar({ onAddState, hasInitialState, isLocked = false }: SidebarProps) {

  const { handleOpen, handleClose, modalProps } = useModal()

  const handleDragStart = (event: React.DragEvent, category: StateCategory, isInitial: boolean = false) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ category, isInitial }));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Filter out initial option if one already exists
  const canCreateInitial = !hasInitialState;

  return (
    <>
      <Box sx={{
        width: isLocked ? 0 : "17rem",
        height: "100%",
        overflowX: "hidden",
        transition: " width ease-in-out .5s"
      }}>
        <Stack component={Paper} elevation={0}
          sx={{
            width: "17rem",
            height: "100%",
            backgroundColor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
            borderColor: 'divider',
            borderRadius: 0,
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h3" component="h2" sx={{ mb: 0.5 }}>
              Estados
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Arrastra para agregar al flujo
            </Typography>
          </Box>

          {/* State types */}
          <Box sx={{ flex: 1, p: 2 }}>
            {canCreateInitial && (
              <>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                  ESTADO INICIAL
                </Typography>
                <Paper elevation={0} draggable
                  onDragStart={(e) => handleDragStart(e, 'OPEN', true)}
                  sx={{
                    p: 1.5, mb: 2, cursor: 'grab',
                    border: 1, borderColor: 'divider',
                    backgroundColor: `${CATEGORY_CONFIG.INITIAL.color}10`,
                    '&:hover': {
                      borderColor: CATEGORY_CONFIG.INITIAL.color,
                      backgroundColor: `${CATEGORY_CONFIG.INITIAL.color}20`,
                    },
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <PlayArrowIcon sx={{ fontSize: 20, color: CATEGORY_CONFIG.INITIAL.color }} />
                    <Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Inicial
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Punto de entrada del lead
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
              CATEGORIAS
            </Typography>

            {CATEGORY_ITEMS.map(({ category, icon, description }) => (
              <Paper
                key={category}
                elevation={0}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                sx={{
                  p: 1.5, mb: 1.5, cursor: 'grab',
                  border: 1, borderColor: 'divider',
                  '&:hover': {
                    borderColor: CATEGORY_CONFIG[category].color,
                    backgroundColor: `${CATEGORY_CONFIG[category].color}10`,
                  },
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {icon}
                  <Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {CATEGORY_CONFIG[category].label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {description}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <CommonButton
              actionType='CREATE'
              fullWidth
              variant="contained"
              onClick={() => handleOpen("create-state")}
            >
              Crear Estado
            </CommonButton>
          </Box>
        </Stack>
      </Box>
      <GenericModal idModal="create-state" modalProps={modalProps} showButton={false}
        maxWidth="xs" fullWidth>
        <StateForm hasInitialState={hasInitialState} onSave={onAddState} onClose={handleClose} />
      </GenericModal>
    </>
  );
}