import { useCallback, useEffect, useState } from 'react';
import { GenericContainer } from 'shared/layout/container/GenericContainer';
import PaginationComponent from 'shared/ui/lists/PaginationComponent';
import { ResponsiveListItem } from 'shared/ui/lists/CustomListItem';
import CommonButton from 'shared/ui/buttons/CommonButton';
import { EnabledIcon } from 'shared/ui/lists/Icons';
import { useListPagination } from 'src/hooks/useListPagination';
import type { FieldAutomationDetailed } from 'src/types/automation';
import type { Campaign } from 'src/types/campaigns';
import type { OrderSearchParams, Paginable } from 'src/types/shared';
import { getFieldAutomations, deleteFieldAutomation } from './AutomationFieldServices';
import { getCampaigns } from '../campaigns/campaignServices';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Autocomplete, List, ListItemText, Stack, TextField, Typography } from '@mui/material';
import { showCommonErrorToast } from 'src/utils/feedback';
import { useLoading } from 'src/hooks/useLoading';
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen';
import CustomChip from 'src/components/ui/details/CustomChip';
import { ChipTooltip } from 'src/components/ui/details/ChipTooltip';
import { DisableConfirmDialog } from 'src/components/ui/feedback/ConfirmationDialog';
import { useOrderSeachList } from 'src/hooks/useOrderSearchLists';
import { OrderSearchMenu } from 'src/components/ui/lists/OrderMenu';
import { Can } from 'src/app/Can';

const ORDER_AUTO_FIELDS = [
  { name: "name", label: "Orden Alfabético" },
  { name: "priority", label: "Prioridad" },
]

const SEARCH_AUTO_FIELDS = [
  { name: "name", label: "Nombre" },
  { name: "description", label: "Descripción" },
]

const DEFAULT_FIELDS: OrderSearchParams = { order_by: "priority", ascending: true }

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

  const { fetchParams, handleSearchChange, handleOrderChange } = useOrderSeachList(DEFAULT_FIELDS)

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
      campaign_id: selectedCampaignId as number, ...fetchParams
    })
      .then(setAutomations)
      .catch(e => showCommonErrorToast(e, "Error recuperando la lista de automatizaciones."));
  }, [fetchParams])

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

  const handleDelete = useCallback((auto: FieldAutomationDetailed) => {
    return deleteFieldAutomation(auto.id).then(() => {
      // Refrescar la lista
      fetchAutomations(fetchPage, pageSize, selectedCampaignId as number)
    })
      .catch(e => showCommonErrorToast(e, "Error eliminando la automatización."));
  }, [fetchPage, pageSize, selectedCampaignId, fetchAutomations])

  const [deletingAuto, setDeletingAuto] = useState<FieldAutomationDetailed | null>(null)

  return (
    <GenericContainer>
      <Stack spacing={2}>
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
          <Can permission="field_automation:create">
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
          </Can>
        </Stack>

        <Stack spacing={2}>
          {!isCampaignSelected ?
            <Typography variant="h4" color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
              Selecciona una campaña para ver sus automatizaciones.
            </Typography>
            :
            <>
              <OrderSearchMenu searchOptions={SEARCH_AUTO_FIELDS} handleSearchChange={handleSearchChange} orderOptions={ORDER_AUTO_FIELDS} handleOrderChange={handleOrderChange} defaultValues={DEFAULT_FIELDS} />
              <LoadingScreenWrapper loading={autoLoading}>
                {automations?.items && automations.items.length > 0 ? (
                  <>
                    <List>
                      {automations.items.map(auto => (
                        <ResponsiveListItem key={auto.id} disablePadding
                          onClick={() => navigate(`/automations/${auto.id}?campaign=${selectedCampaignId}`)}
                          actions={[
                            { template: "DETAILS", component: Link, to: `/automations/${auto.id}?campaign=${selectedCampaignId}` },
                            {
                              template: "MODIFY", component: Link, to: `/automations/${auto.id}?campaign=${selectedCampaignId}&edit=true`,
                              permission: "field_automation:update"
                            },
                            {
                              actionType: "DUPLICATE", label: "Duplicar", component: Link,
                              to: `/automations/create?campaign=${selectedCampaignId}&duplicate_from=${auto.id}`,
                              permission: "field_automation:create"
                            },
                            {
                              template: "DELETE", onClick: () => setDeletingAuto(auto),
                              permission: "field_automation:delete"
                            },
                          ]}>
                          <ListItemText
                            primary={
                              <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
                                <EnabledIcon active={auto.active} />
                                <Typography>{auto.name}</Typography>

                                {/* CHIP DE PRIORIDAD */}
                                <ChipTooltip title="Prioridad de ejecución (menor número = se ejecuta primero)">
                                  <CustomChip label={auto.priority} size="small" />
                                </ChipTooltip>
                              </Stack>
                            }
                            secondary={auto.description || "Sin descripción"}
                          />
                        </ResponsiveListItem>
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
            </>
          }
        </Stack>
      </Stack>
      <DisableConfirmDialog idModal='conf-delete-cmp-list' entity={deletingAuto} clearEntity={() => setDeletingAuto(null)}
        entityTypeName="la automatización" onlyDelete onConfirm={() => handleDelete(deletingAuto!)} />
    </GenericContainer>
  );
};