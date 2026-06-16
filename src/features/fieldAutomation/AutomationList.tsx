import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, ButtonGroup, FormControl, Grid, IconButton, InputLabel, List, ListItemButton, ListItemText, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material';
import { CommonButton } from '../common/details/DetailsCommonButton';
import { EnabledIcon, ListAction } from '../common/lists/Icons';
import { PaginationComponent } from '../common/lists/PaginationComponent';
import { CustomListItem } from '../common/lists/CustomListItem';
import { useListPagination } from '../hooks/useListPagination';
import { getFieldAutomations, deleteFieldAutomation } from './AutomationFieldServices';
import { getCampaigns } from '../campaigns/campaignServices'; // Ajusta la ruta a tu servicio de campañas
import type { Campaign } from '../../types/campaigns';
import type { Paginable } from '../../types/common';
import type { FieldAutomationDetailed } from '../../types/automation';
import { GenericContainer } from '../common/layout/GenericContainer';

export const AutomationList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCampaignId = searchParams.get('campaign_id');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | ''>(urlCampaignId ? Number(urlCampaignId) : '');
  const [automations, setAutomations] = useState<Paginable<FieldAutomationDetailed> | null>(null);

  const { fetchPage, pageSize, refresh, pageComponentProps } = useListPagination(automations);

  // 1. Cargar las campañas para el selector
  useEffect(() => {
    getCampaigns({ only_active: true, page_size: 0 })
      .then(res => setCampaigns(res.items))
      .catch(console.error);
  }, []);

  // 2. Cargar las automatizaciones SOLO si hay una campaña seleccionada
  useEffect(() => {
    if (!selectedCampaignId) {
      setAutomations(null);
      return;
    }
    getFieldAutomations({ detailed: true, page_size: pageSize, page: fetchPage, campaign_id: selectedCampaignId as number, order_by: 'priority', ascending: true })
      .then(setAutomations)
      .catch(console.error);
  }, [fetchPage, refresh, pageSize, selectedCampaignId]);

  const handleCampaignChange = (id: number | '') => {
    setSelectedCampaignId(id);
    if (id) {
      setSearchParams({ campaign_id: id.toString() });
    } else {
      searchParams.delete('campaign_id');
      setSearchParams(searchParams);
    }
  };

  const handleDelete = (auto: FieldAutomationDetailed) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${auto.name}"?`)) {
      deleteFieldAutomation(auto.id).then(() => {
        // Refrescar la lista
        getFieldAutomations({ detailed: true, page_size: pageSize, page: fetchPage, campaign_id: selectedCampaignId as number, order_by: 'priority', ascending: true }).then(setAutomations);
      }).catch(console.error);
    }
  };

  return (
    <GenericContainer children={
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Grid item xs sx={{ minWidth: "15rem", display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h4">Automatizaciones</Typography>
            
          {/* SELECTOR DE CAMPAÑA */}
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Seleccionar Campaña</InputLabel>
            <Select
              value={selectedCampaignId}
              label="Seleccionar Campaña"
              onChange={(e) => handleCampaignChange(e.target.value as number | '')}
            >
              <MenuItem value=""><em>-- Ninguna --</em></MenuItem>
              {campaigns.map(cmp => (
                <MenuItem key={cmp.id} value={cmp.id}>{cmp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <ButtonGroup variant="contained" color="primary" sx={{ marginLeft: "auto" }}>
          <CommonButton 
            actionType='CREATE' 
            disabled={!selectedCampaignId}
            handleClick={() => navigate(`/automations/create?campaign_id=${selectedCampaignId}`)}
          >
            Nueva Automatización
          </CommonButton>
        </ButtonGroup>
      </Grid>

      <Stack spacing={2}>
        {!selectedCampaignId ? (
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ py: 5 }}>
            Selecciona una campaña para ver sus automatizaciones.
          </Typography>
        ) : automations?.items && automations.items.length > 0 ? (
          <List>
            {automations.items.map(auto => (
              <CustomListItem key={auto.id} disablePadding secondaryAction={
                <Stack direction="row" spacing={1}>
                  {/* Navega a la vista de detalles */}
                  <ListAction actionType='DETAILS' title="Detalles" size="small"
                    onClick={() => navigate(`/automations/${auto.id}?campaign_id=${selectedCampaignId}`)} />

                  <ListAction actionType='MODIFY' title="Modificar" tooltipSize="small" size="small"
                                            onClick={() => navigate(`/automations/${auto.id}?campaign_id=${selectedCampaignId}&edit=true`)} />

                  <ListAction actionType="DUPLICATE" title="Duplicar" size="small"
                    onClick={() => navigate(`/automations/create?campaign_id=${selectedCampaignId}&duplicate_from=${auto.id}`)} />
                  
                  <ListAction actionType="DISABLE" title="Eliminar" color="error" size="small"
                    onClick={() => handleDelete(auto)} />
                </Stack>
              }>
                <ListItemButton onClick={() => navigate(`/automations/${auto.id}?campaign_id=${selectedCampaignId}`)}>
                  <ListItemText 
                    primary={
                      <Stack spacing={1} direction="row" alignItems="center">
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
        ) : (
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ py: 5 }}>
            No hay automatizaciones en esta campaña.
          </Typography>
        )}
        <PaginationComponent {...pageComponentProps} />
      </Stack>
    </Stack>
    } />

    
  );
};