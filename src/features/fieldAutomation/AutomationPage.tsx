import { useEffect, useState, useRef, useCallback } from 'react';
import { Can } from 'src/components/auth/Can';
import { useUserContext } from 'src/stores/UserContext';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Box, Typography, alpha, useTheme, Stack } from '@mui/material';
import { AutomationForm } from './AutomationForm';
import { getLeadFields } from '../leadFields/leadFieldServices';
import { getFieldAutomation, createFieldAutomation, updateFieldAutomation } from './AutomationFieldServices';
import type { FieldAutomationPost, FieldAutomationDetailed } from '../../types/automation';
import type { LeadField } from '../../types/leadFields';
import { showCommonErrorToast } from 'src/utils/feedback';
import { useLoading } from 'src/hooks/useLoading';
import GenericPaper from 'src/components/layout/container/GenericPaper';
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen';
import CustomChip from 'src/components/ui/details/CustomChip';
import { GenericContainer } from 'src/components/layout/container/GenericContainer';
import CommonButton from 'src/components/ui/buttons/CommonButton';
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton';
import { usePageTitle } from 'src/hooks/usePageTitle';

export const AutomationPage = () => {
  const { id } = useParams<{ id: string }>();

  const theme = useTheme();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const campaignQueryParam = searchParams.get('campaign');
  const campaignId = campaignQueryParam ? Number(campaignQueryParam) : undefined;
  const duplicateFromId = searchParams.get('duplicate_from');

  const isEditing = Boolean(id && !isNaN(Number(id)));
  const isDuplicating = Boolean(duplicateFromId);

  // Sin el permiso correspondiente (según se esté creando o editando), el formulario
  // se fuerza a solo-lectura sin importar el toggle local ni el parámetro "edit" de la URL.
  const { hasPermission } = useUserContext()
  const canEdit = isEditing ? hasPermission("field_automation:update") : hasPermission("field_automation:create")

  const [readOnly, setReadOnly] = useState(isEditing && searchParams.get('edit') !== 'true');
  const effectiveReadOnly = readOnly || !canEdit
  const [initialData, setInitialData] = useState<FieldAutomationDetailed | null>(null);

  const [fields, setFields] = useState<LeadField[]>([]);

  const formSubmitRef = useRef<() => void>(null);

  const initialLoad = useCallback(async () => {
    if (isEditing) {
      await getFieldAutomation(Number(id))
        .then(setInitialData)
        .catch(e => showCommonErrorToast(e))
    } else if (isDuplicating) {
      await getFieldAutomation(Number(duplicateFromId))
        .then(data => {
          setInitialData({ ...data, name: `Copia de ${data.name}` });
        })
        .catch(e => showCommonErrorToast(e))
    }
    await getLeadFields({ detailed: false, only_active: true, campaign_id: campaignId, page_size: 0 })
      .then(data => setFields(data.items))
      .catch(e => showCommonErrorToast(e))
  }, [campaignId, id, isDuplicating, duplicateFromId, isEditing])

  usePageTitle(
    !isEditing ? "Nueva Automatización"
      : isDuplicating ? initialData?.name && `${initialData?.name} | Duplicar Automatización`
        : initialData?.name && `${initialData?.name} | Editar Automatización`
  )

  const { fnWithLoading: initialFetchLoad, loading: initialFetchLoading } = useLoading(initialLoad)

  useEffect(() => {
    initialFetchLoad()
  }, [initialFetchLoad]);

  const handleSaveToApi = async (payload: FieldAutomationPost) => {
    if (!canEdit) return
    try {
      if (isEditing) await updateFieldAutomation(payload, Number(id));
      else await createFieldAutomation(payload);
      navigate(`/automations${campaignId ? `?campaign=${campaignId}` : ""}`);
    } catch (error) {
      showCommonErrorToast(error)
    }
  };

  const { fnWithLoading: handleSaveLoad, loading: saving } = useLoading(handleSaveToApi)

  return (
    <LoadingScreenWrapper loading={initialFetchLoading}>
      {(campaignId && !isNaN(campaignId)) ?
        <GenericContainer noPaper sx={{ bgcolor: 'transparent', minHeight: '100vh' }}>
          <GenericPaper
            elevation={0}
            sx={{
              position: 'sticky',
              top: { xs: 70, sm: 75 }, // Offset para no quedar debajo del navbar
              zIndex: theme.zIndex.appBar - 1,
              px: 3,
              py: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.85),
              backdropFilter: 'blur(6px)',
            }}
          >
            <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <Stack direction="row" sx={{ alignItems: 'center', rowGap: 1, columnGap: 2, flexWrap: "wrap" }}>
                <CommonIconButton actionType='RETURN' size="small" noTooltip border
                  component={Link} to={`/automations${campaignId ? `?campaign=${campaignId}` : ""}`} />
                <Typography variant="h2" component="h1" >
                  {isEditing ? initialData?.name : 'Nueva Automatización'}
                </Typography>
                {/* Badge de Estado: Se integra aquí el texto de "Modo visualización" */}
                <CustomChip
                  label={effectiveReadOnly ? "Solo Lectura" : isDuplicating ? "Duplicando" : "Editando"}
                  size="small"
                  color={effectiveReadOnly ? "default" : "primary"}
                />
              </Stack>

              {/* Derecha: Botones de Acción */}
              <Box sx={{ ml: "auto" }}>
                {effectiveReadOnly ? (
                  // El toggle "Editar" solo tiene sentido al editar una automatización existente
                  // (al crear una nueva, el formulario ya arranca editable si hay permiso de creación).
                  isEditing && (
                    <Can permission="field_automation:update">
                      <CommonButton actionType='MODIFY' onClick={() => setReadOnly(false)} >
                        Editar
                      </CommonButton>
                    </Can>
                  )
                ) : (
                  <Can permission={isEditing ? "field_automation:update" : "field_automation:create"}>
                    <CommonButton actionType='SAVE' onClick={() => formSubmitRef.current?.()} loading={saving}>
                      Guardar
                    </CommonButton>
                  </Can>
                )}
              </Box>
            </Stack>
          </GenericPaper>

          {/* Contenido del Formulario */}
          <AutomationForm
            initialData={initialData}
            campaignId={campaignId}
            onSave={handleSaveLoad}
            fields={fields}
            readOnly={effectiveReadOnly}
            isDuplicating={isDuplicating}
            submitRef={formSubmitRef}
          />
        </GenericContainer>
        :
        <GenericPaper sx={{ height: '80vh' }}>
          <Stack spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', height: "100%" }}>
            <Typography variant="h3" component="h1" color="error">
              Campaña no identificada
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              No se puede cargar el configurador porque falta el identificador de la campaña.<br />
              Por favor, selecciona una campaña desde la lista antes de continuar.
            </Typography>
            <CommonButton actionType='RETURN' component={Link} to='/automations'>
              Volver a la lista
            </CommonButton>
          </Stack>
        </GenericPaper>
      }
    </LoadingScreenWrapper>);
};