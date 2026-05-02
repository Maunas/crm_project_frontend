import { Autocomplete, Badge, Button, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Popover, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, type AutocompleteRenderInputParams } from "@mui/material"
import { memo, useCallback, useContext, useEffect, useState } from "react"
import type { Campaign, Workspace } from "../../../types/campaigns"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getWorkspaces } from "../../workspaces/workspaceServices";
import { getCampaigns } from "../../campaigns/campaignServices";
import type { UserContextItems } from "../../users/UserProvider";
import { UserContext } from "../../common/contexts";
import { CommonButton } from "../../common/details/DetailsCommonButton";
import { GenericModal } from "../../common/layout/GenericContainer";
import { LeadFilters } from "./LeadFilters";
import type { LeadFilter, LeadListParams, Paginable } from "../../../types/common";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import WindowIcon from '@mui/icons-material/Window';
import TableChartIcon from '@mui/icons-material/TableChart';
import type { Lead, LeadView } from "../../../types/leads";
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'

interface LeadCampaignSelectorsProps {
    workspaceId: string | number | null,
    handleWorkspaceChange: (id: string | number | null) => void,
    campaignId: string | number | null,
    handleCampaignChange: (id: string | number | null) => void,
}

export const LeadCampaignSelector = memo(({ workspaceId, handleWorkspaceChange, campaignId, handleCampaignChange }: LeadCampaignSelectorsProps) => {

    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])

    //Inicialización al cambiar de organización
    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(wsps => {
            setWorkspaces(wsps.items)
            if (wsps.items.length === 0) {
                handleWorkspaceChange(null)
                return
            }
            //Si hay un workspaceId en params, y es parte de la lista obtenida, lo setea, si no toma el primer elemento
            const newWorkspaceId = (workspaceId && wsps.items.map(i => i.id).includes(Number(workspaceId))) ? workspaceId : wsps.items[0].id
            handleWorkspaceChange(newWorkspaceId)

            getCampaigns({ only_active: true, workspace_id: newWorkspaceId as number, page_size: 0 }).then(cmps => {
                setCampaigns(cmps.items)
                if (cmps.items.length === 0) {
                    handleCampaignChange(null)
                    return
                }
                const newCampaignId = (campaignId && cmps.items.map(i => i.id).includes(Number(campaignId))) ? campaignId : cmps.items[0].id
                handleCampaignChange(newCampaignId)
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOrg])

    const onWorkspaceChange = useCallback((newWorkspaceId: number | null) => {
        if (!newWorkspaceId) return
        handleWorkspaceChange(newWorkspaceId)
        getCampaigns({ only_active: true, workspace_id: newWorkspaceId, page_size: 0 }).then(res => {
            setCampaigns(res.items)
            handleCampaignChange(res.items[0].id)
        })
    }, [handleWorkspaceChange, handleCampaignChange])

    const autocompleteCommonProps = useCallback((list: (Campaign | Workspace)[], label: string) => ({
        size: "small" as "small" | "medium",
        disablePortal: true,
        options: list.map(i => i.id),
        getOptionLabel: (option: number | null) => list.find(i => i.id === option)?.name ?? "",
        sx: { width: 200 },
        renderInput: (params: AutocompleteRenderInputParams) => <TextField {...params} label={label} />
    }), [])

    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
            <Autocomplete {...autocompleteCommonProps(workspaces, "Espacio de Trabajo")}
                value={Number(workspaceId)} onChange={(_, val) => onWorkspaceChange(val)}
            />
            <ArrowForwardIcon />
            <Autocomplete {...autocompleteCommonProps(campaigns, "Campaña")}
                value={Number(campaignId)} onChange={(_, val) => handleCampaignChange(val)}
                disabled={!workspaceId}
            />
        </Stack>
    )
})

interface LeadTableOptionsProps {
    areThereLeads: boolean,
    campaignId: number | string | null,
    filters: LeadFilter[],
    headers: LeadListParams,
    setFiltersAndHeaders: (filters: LeadFilter[], headers: LeadListParams) => Promise<void> | null,
    campaignSelectorProps: {
        workspaceId: string | number | null;
        campaignId: string | number | null;
        handleWorkspaceChange: (id: string | number | null) => void;
        handleCampaignChange: (id: string | number | null) => void;
    },
    presentationProps: {
        presentationMode: string;
        handlePresentation: (mode: "string") => void;
    },
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    },
    selectCheckboxProps: {
        checkedItems: Map<number, Lead>;
        addItem: (item: Lead | Lead[]) => void;
        removeItem: (item: Lead) => void;
        removeAllItems: () => void;
        areThereActiveItems: boolean;
        areThereInactiveItems: boolean;
    },
    bulkDelete: () => Promise<void> | undefined;
    viewUpdateProps: {
        saveView: (name: string, visibility: string, existingId?: number | undefined) => Promise<LeadView> | undefined;
        loadView: (view: LeadView) => void;
    }
}

export const LeadListOptions = memo(({ areThereLeads, campaignId, filters, headers, setFiltersAndHeaders, modalProps, campaignSelectorProps, presentationProps, selectCheckboxProps, viewUpdateProps, bulkDelete }: LeadTableOptionsProps) => {

    //Al aplicar filtros vuelve a la primera página
    const applyFilters = useCallback((data: { headers: LeadListParams, filters: LeadFilter[] }) => {
        const newHeaders = { ...headers, ...data.headers }
        return setFiltersAndHeaders(data.filters, newHeaders)?.then(() => modalProps.handleClose()
        )
    }, [setFiltersAndHeaders, headers, modalProps])

    return (
        <Grid container spacing={3} sx={{ justifyContent: "space-between", width: "100%" }}>
            <Grid size="auto">
                <LeadCampaignSelector {...campaignSelectorProps} />
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid container size="grow" spacing={1} sx={{ justifyContent: "end", alignItems: "center", minWidth: "20rem" }}>
                {
                    areThereLeads && !!campaignId &&
                    <CommonButton actionType='OPTIONS' color='secondary' onClick={() => modalProps.handleOpen("columns_selector")} >
                    </CommonButton>
                }
                {areThereLeads &&
                    <Badge badgeContent={filters.length} color="success">
                        <CommonButton actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")}>
                        </CommonButton>
                    </Badge>}
                <GenericModal idModal="lead_filters" modalProps={modalProps} buttonText="Aplicar Filtros" maxWidth="lg"
                    actionType='FILTER' color='secondary' showButton={false} >
                    <LeadFilters applyFilters={applyFilters} filters={{ filters, headers }} campaignId={Number(campaignId)}
                        onClose={() => modalProps.handleClose()} />
                </GenericModal>
                <ToggleButtonGroup
                    value={presentationProps.presentationMode}
                    exclusive
                    onChange={(_, value) => presentationProps.handlePresentation(value)}
                    aria-label="text alignment"
                >
                    <ToggleButton value="TABLE">
                        <TableChartIcon />
                    </ToggleButton>
                    <ToggleButton value="LIST" disabled>
                        <FormatListBulletedIcon />
                    </ToggleButton>
                    <ToggleButton value="GRID" disabled>
                        <WindowIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
                {selectCheckboxProps.checkedItems.size > 0 &&
                    <Button variant="outlined" color="error" onClick={bulkDelete}>Eliminar Seleccionados</Button>
                }
                {campaignSelectorProps?.campaignId &&
                    <LeadViewMenu {...viewUpdateProps} campaignId={Number(campaignSelectorProps.campaignId)} />}
            </Grid >
        </Grid>
    )
})

import React from 'react'
import { deleteView, getLeadViews } from "../leadService";
import { useListPagination } from "../../hooks/useListPagination";
import { PaginationComponent } from "../../common/lists/PaginationComponent";

interface LeadViewMenuProps {
    saveView: (name: string, visibility: string, existingId?: number | undefined) => Promise<LeadView> | undefined;
    loadView: (view: LeadView) => void;
    campaignId: number
}

export const LeadViewMenu = ({ saveView, loadView, campaignId }: LeadViewMenuProps) => {
    const [viewAnchor, setViewAnchor] = React.useState<null | HTMLElement>(null);
    const open = Boolean(viewAnchor);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setViewAnchor(event.currentTarget);
    };
    const handleClose = () => {
        setViewAnchor(null);
    };

    const [currentViews, setCurrentViews] = useState<Paginable<LeadView> | null>(null)

    const { fetchPage, pageComponentProps, pageSize } = useListPagination(currentViews, 12)

    const fetchLeadViews = useCallback((page: number) => {
        return getLeadViews({ only_active: true, page_size: pageSize, page: page, campaign_id: campaignId })
            .then(setCurrentViews)
    }, [campaignId, pageSize])

    useEffect(() => {
        fetchLeadViews(fetchPage)
    }, [fetchPage, fetchLeadViews])

    const handleDelete = (viewId: number) => {
        if (!currentViews || currentViews.items.length === 0) return
        deleteView(viewId)
            .then(() => fetchLeadViews(fetchPage))
    }

    return (
        <>
            <Button onClick={handleClick}>Cargar Vista</Button>
            <Popover anchorEl={viewAnchor} open={open} onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}           >
                <Stack spacing={1}>
                    <Typography variant="h4" component="h3" sx={{ px: 2, pt: 2 }}>Vistas Creadas</Typography>
                    <List sx={{ maxHeight: "30rem", minWidth: "15rem", maxWidth: "25rem", overflowY: "auto" }} dense >
                        {currentViews?.items && currentViews?.items?.length > 0 &&
                            currentViews.items.map(view => (
                                <ListItem key={`list-${view.id}`} disablePadding
                                    secondaryAction={
                                        <Stack direction="row" sx={{ mr: -1 }}>
                                            <IconButton title="Cambiar Nombre" edge="end" size='small' onClick={() => { }}><EditIcon fontSize='small' /></IconButton>
                                            <IconButton title="Eliminar" edge="end" size='small' onClick={() => { handleDelete(view.id) }}><CloseIcon color='error' fontSize='small' /></IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemButton onClick={() => loadView(view)} sx={{ py: .5 }}>
                                        <ListItemText sx={{ my: 0, mr: 3 }} primary={view.name} secondary={view.visibility} />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        }
                    </List >
                    {
                        pageComponentProps.totalPages > 1 &&
                        <PaginationComponent {...pageComponentProps} />
                    }
                    <Button onClick={() => { saveView("Vista Test", "PUBLIC") }} fullWidth>Crear Vista</Button>
                </Stack >
            </Popover>
        </>
    )
}
