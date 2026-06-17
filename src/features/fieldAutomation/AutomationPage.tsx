import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, IconButton, Paper, Button, Chip, alpha, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { AutomationForm } from './AutomationForm';
import { getLeadFields } from '../leadFields/leadFieldServices';
import { getFieldAutomation, createFieldAutomation, updateFieldAutomation } from './AutomationFieldServices';
import type { FieldAutomationPost, FieldAutomationDetailed } from '../../types/automation';
import type { LeadField } from '../../types/leadFields';

export const AutomationPage = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignQueryParam = searchParams.get('campaign_id');
  const campaignId = campaignQueryParam ? Number(campaignQueryParam) : null;
  const duplicateFromId = searchParams.get('duplicate_from');

  const isEditing = Boolean(id && !isNaN(Number(id)));
  const isDuplicating = Boolean(duplicateFromId);
  const [readOnly, setReadOnly] = useState(isEditing && searchParams.get('edit') !== 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState<FieldAutomationDetailed | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<LeadField[]>([]);

  const formSubmitRef = useRef<() => void>(null);

  // Carga de datos inicial (igual que antes)
  useEffect(() => {
    getLeadFields({ detailed: false, only_active: true, campaign_id: campaignId, page_size: 0 })
      .then(data => setFields(data.items))
      .catch(console.error);

    if (isEditing) {
      getFieldAutomation(Number(id)).then(setInitialData).finally(() => setLoading(false));
    } else if (isDuplicating) {
      getFieldAutomation(Number(duplicateFromId)).then(data => {
        setInitialData({ ...data, name: `Copia de ${data.name}` } as FieldAutomationDetailed);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isEditing, isDuplicating, duplicateFromId, campaignId]);

  const handleSaveToApi = async (payload: FieldAutomationPost) => {
    setIsSaving(true);
    try {
      if (isEditing) await updateFieldAutomation(payload, Number(id));
      else await createFieldAutomation(payload);
      navigate(-1);
    } catch (error) {
      setIsSaving(false);
    }
  };

  if (!campaignId || isNaN(campaignId)) {
    return (
      <Box sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        p: 3
      }}>
        <Typography variant="h5" color="error" fontWeight={700}>
          Campaña no identificada
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No se puede cargar el configurador porque falta el identificador de la campaña.<br />
          Por favor, selecciona una campaña desde la lista antes de continuar.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/automations')}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: { xs: 56, sm: 64 }, // Offset para no quedar debajo del navbar
          zIndex: theme.zIndex.appBar - 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          // Glassmorphism effect: funciona en light y dark mode
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Izquierda: Volver y Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {isEditing ? initialData?.name : 'Nueva Automatización'}
            </Typography>
            {/* Badge de Estado: Se integra aquí el texto de "Modo visualización" */}
            <Chip
              label={readOnly ? "Solo Lectura" : isDuplicating ? "Duplicando" : "Editando"}
              size="small"
              color={readOnly ? "default" : "primary"}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mt: 0.5 }}
            />
          </Box>
        </Box>

        {/* Derecha: Botones de Acción */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {readOnly ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setReadOnly(false)}
            >
              Editar
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary" // Color de "Nuevo" de las listas
              size="small"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={() => formSubmitRef.current?.()}
              disabled={isSaving}
            >
              Guardar
            </Button>
          )}
        </Box>
      </Paper>

      {/* Contenido del Formulario */}
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        <AutomationForm
          initialData={initialData}
          campaignId={campaignId}
          onSave={handleSaveToApi}
          fields={fields}
          readOnly={readOnly}
          isDuplicating={isDuplicating}
          submitRef={formSubmitRef}
        />
      </Box>
    </Box>
  );
};