import { useCallback, useEffect, useState } from 'react';
import { GenericContainer } from 'shared/layout/container/GenericContainer';
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton';
import PaginationComponent from 'shared/ui/lists/PaginationComponent';
import { CustomListItem } from 'shared/ui/lists/CustomListItem';
import CommonButton from 'shared/ui/buttons/CommonButton';
import { EnabledIcon } from 'shared/ui/lists/Icons';
import { useListPagination } from 'src/hooks/useListPagination';
import type { FieldAutomationDetailed } from 'src/types/automation';
import type { Campaign } from 'src/types/campaigns';
import type { Paginable } from 'src/types/shared';
import { getFieldAutomations, deleteFieldAutomation } from './AutomationFieldServices';
import { getCampaigns } from '../campaigns/campaignServices';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Autocomplete, Box, List, ListItemButton, ListItemText, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { showCommonErrorToast } from 'src/utils/feedback';
import { useLoading } from 'src/hooks/useLoading';
import LoadingScreenWrapper from 'src/components/feedback/LoadingScreen';

const NONE_OPTION: Campaign = {
  id: -1,
  name: "-- Ninguna --",
  organization_id: null,
  workspace_id: null
}

export const AutomationList = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlCampaignId = searchParams.get('campaign');

  const [campaigns, setCampaigns] = useState<Campaign[]>([NONE_OPTION]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(urlCampaignId ? Number(urlCampaignId) : -1);
  const [automations, setAutomations] = useState<Paginable<FieldAutomationDetailed> | null>(null);

  const isCampaignSelected = selectedCampaignId !== -1

  const { fetchPage, pageSize, refresh, pageComponentProps } = useListPagination(automations);

  const fetchCampaigns = useCallback(() => {
    return getCampaigns({ only_active: true, page_size: 0 })
      .then(res => {
        setCampaigns([NONE_OPTION, ...res.items])
      })
      .catch(e => showCommonErrorToast(e))
  }, [])

  const { fnWithLoading: fetchCmpLoad, loading: cmpLoading } = useLoading(fetchCampaigns)

  // 1. Cargar las campañas para el selector
  useEffect(() => { fetchCmpLoad() }, [fetchCmpLoad]);


  const fetchAutomations = useCallback((fetchPage: number, pageSize: number, selectedCampaignId: number) => {
    return getFieldAutomations({
      detailed: true, page_size: pageSize, page: fetchPage,
      campaign: selectedCampaignId as number, order_by: 'priority', ascending: true
    })
      .then(setAutomations)
      .catch(e => showCommonErrorToast(e));
  }, [])

  const { fnWithLoading: fetchAutoLoad, loading: autoLoading } = useLoading(fetchAutomations)

  // 2. Cargar las automatizaciones SOLO si hay una campaña seleccionada
  useEffect(() => {
    if (!isCampaignSelected) return
    fetchAutoLoad(fetchPage, pageSize, selectedCampaignId)
  }, [fetchPage, refresh, pageSize, selectedCampaignId, fetchAutoLoad, isCampaignSelected]);

  const handleCampaignChange = (id: number) => {
    setSelectedCampaignId(id);
    if (id !== -1) {
      setSearchParams({ campaign: id.toString() });
    } else {
      searchParams.delete('campaign');
      setSearchParams(searchParams);
    }
  };

  const handleDelete = (auto: FieldAutomationDetailed) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${auto.name}"?`)) {
      deleteFieldAutomation(auto.id).then(() => {
        // Refrescar la lista
        getFieldAutomations({ detailed: true, page_size: pageSize, page: fetchPage, campaign: selectedCampaignId as number, order_by: 'priority', ascending: true }).then(setAutomations);
      }).catch(console.error);
    }
  };

  return (
    <GenericContainer children={
      <Stack spacing={3}>
        <Stack spacing={2} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 3, flexWrap: "wrap" }}>
            <Typography variant="h1">Automatizaciones</Typography>

            {/* SELECTOR DE CAMPAÑA */}
            <Autocomplete disablePortal
              value={campaigns.find(i => i.id === selectedCampaignId) ?? campaigns[0]}
              loading={cmpLoading}
              onChange={(_, value) => handleCampaignChange(value.id)}
              disableClearable
              options={cmpLoading ? [] : campaigns}
              sx={{ width: 300 }}
              getOptionLabel={op => op.name}
              getOptionKey={op => op.id}
              renderInput={(params) =>
                <TextField {...params} label="Seleccionar Campaña"
                  size="small" sx={{ minWidth: 200, maxWidth: 250 }} />
              } />
          </Stack>
          <CommonButton
            actionType='CREATE'
            onlyTooltip
            disabled={!isCampaignSelected}
            component={Link}
            to={`/automations/create?campaign=${selectedCampaignId}`}
            sx={{ ml: "auto" }}
          >
            Nueva Automatización
          </CommonButton>
        </Stack>

        <Stack spacing={2}>
          {!isCampaignSelected ?
            <Typography variant="h4" color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
              Selecciona una campaña para ver sus automatizaciones.
            </Typography>
            :
            <LoadingScreenWrapper loading={autoLoading}>
              {automations?.items && automations.items.length > 0 ? (
                <>
                  <List>
                    {automations.items.map(auto => (
                      <CustomListItem key={auto.id} disablePadding secondaryAction={
                        <Stack direction="row" spacing={1}>
                          {/* Navega a la vista de detalles */}
                          <CommonIconButton actionType='DETAILS' title="Detalles" size="small"
                            onClick={() => navigate(`/automations/${auto.id}?campaign=${selectedCampaignId}`)} />

                          <CommonIconButton actionType='MODIFY' title="Modificar" tooltipSize="small" size="small"
                            onClick={() => navigate(`/automations/${auto.id}?campaign=${selectedCampaignId}&edit=true`)} />

                          <CommonIconButton actionType="DUPLICATE" title="Duplicar" size="small"
                            onClick={() => navigate(`/automations/create?campaign=${selectedCampaignId}&duplicate_from=${auto.id}`)} />

                          <CommonIconButton actionType="DISABLE" title="Eliminar" color="error" size="small"
                            onClick={() => handleDelete(auto)} />
                        </Stack>
                      }>
                        <ListItemButton onClick={() => navigate(`/automations/${auto.id}?campaign=${selectedCampaignId}`)}>
                          <ListItemText
                            primary={
                              <Stack spacing={1} sx={{ direction: "row", alignItems: "center" }}>
                                <EnabledIcon active={auto.active} />
                                <Typography sx={{ fontWeight: "bold" }}>{auto.name}</Typography>

                                {/* CHIP DE PRIORIDAD */}
                                <Tooltip title="Prioridad de ejecución (menor número = se ejecuta primero)">
                                  <Box
                                    sx={{
                                      border: '1px solid',             // Agregamos el borde
                                      borderColor: 'primary.main',     // Color del borde
                                      color: 'primary.main',           // Color del texto
                                      bgcolor: 'transparent',          // Fondo transparente
                                      px: 1,
                                      py: 0.2,
                                      borderRadius: 2,
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      ml: 1
                                    }}
                                  >
                                    {auto.priority}
                                  </Box>
                                </Tooltip>
                              </Stack>
                            }
                            secondary={auto.description || "Sin descripción"}
                          />
                        </ListItemButton>
                      </CustomListItem>
                    ))}
                  </List>
                  <PaginationComponent {...pageComponentProps} />
                </>)
                : (
                  <Typography variant="h4" color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
                    No hay automatizaciones en esta campaña.
                  </Typography>
                )}
            </LoadingScreenWrapper>
          }
        </Stack>
      </Stack>
    } />
  );
};