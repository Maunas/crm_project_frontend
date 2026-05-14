import { memo, useCallback, useEffect, useState } from "react"
import { LeadViewMenu } from "./LeadViewMenu";
import { LeadFilters } from "./LeadFilters";
import GenericModal from "shared/layout/container/GenericModal";
import { ChipTooltip } from "shared/ui/details/ChipTooltip";
import CommonButton from 'shared/ui/buttons/CommonButton';
import type { Lead, LeadView, LeadViewParams } from "src/types/leads";
import type { LeadFilter, LeadListParams } from "src/types/shared";
import type { Campaign, Workspace } from "src/types/campaigns"
import { getWorkspaces } from "src/features/workspaces/workspaceServices";
import { getCampaigns } from "src/features/campaigns/campaignServices";
import { useUserContext } from 'src/stores/UserContext';
import { Autocomplete, Badge, Divider, Grid, Stack, TextField, ToggleButton, ToggleButtonGroup, type AutocompleteRenderInputParams, ButtonGroup } from "@mui/material"
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TableChartIcon from '@mui/icons-material/TableChart';
import WindowIcon from '@mui/icons-material/Window';

interface LeadCampaignSelectorsProps {
    workspaceId: string | number | null,
    handleWorkspaceChange: (id: string | number | null) => void,
    campaignId: string | number | null,
    handleCampaignChange: (id: string | number | null) => void,
}

export const LeadCampaignSelector = memo(({ workspaceId, handleWorkspaceChange, campaignId, handleCampaignChange }: LeadCampaignSelectorsProps) => {

    const { activeOrg } = useUserContext()

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
    }, [activeOrg])

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

interface LeadListOptionsProps {
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
        saveView: (name: string, visibility: string, existingView?: LeadView) => Promise<LeadView> | undefined
        loadView: (view: LeadView) => void;
        currentView: LeadViewParams | undefined;
    }
}

export const LeadListOptions = memo(({ areThereLeads, campaignId, filters, headers, setFiltersAndHeaders, modalProps, campaignSelectorProps, presentationProps, selectCheckboxProps, viewUpdateProps, bulkDelete }: LeadListOptionsProps) => {

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
                <ToggleButtonGroup
                    size="small"
                    value={presentationProps.presentationMode}
                    exclusive
                    onChange={(_, value) => presentationProps.handlePresentation(value)}
                    aria-label="text alignment"
                >
                    <ChipTooltip title='Tabla' color="contrast">
                        <ToggleButton value="TABLE">
                            <TableChartIcon />
                        </ToggleButton>
                    </ChipTooltip>
                    <ToggleButton value="LIST" disabled>
                        <FormatListBulletedIcon />
                    </ToggleButton>
                    <ToggleButton value="GRID" disabled>
                        <WindowIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
                <ButtonGroup >
                    {areThereLeads &&
                        <ChipTooltip title='Filtros' color="secondary">
                            <Badge badgeContent={filters.length} color="success">
                                <CommonButton variant="outlined" actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")} />
                            </Badge>
                        </ChipTooltip>}
                    {
                        areThereLeads && !!campaignId &&
                        <ChipTooltip title='Campos a Mostrar' color="secondary">
                            <CommonButton variant="outlined" actionType='OPTIONS' color='secondary' onClick={() => modalProps.handleOpen("columns_selector")} />
                        </ChipTooltip>
                    }
                    {campaignSelectorProps?.campaignId &&
                        <LeadViewMenu {...viewUpdateProps} campaignId={Number(campaignSelectorProps.campaignId)} />}
                    {selectCheckboxProps.checkedItems.size > 0 &&
                        <ChipTooltip title='Eliminar Seleccionados' color="error">
                            <CommonButton variant="outlined" actionType="CLOSE" color="error" onClick={bulkDelete} />
                        </ChipTooltip>
                    }
                </ButtonGroup>
                <GenericModal idModal="lead_filters" modalProps={modalProps} buttonText="Aplicar Filtros" maxWidth="md" fullWidth
                    btnProps={{ actionType: 'FILTER' }} color='secondary' showButton={false} >
                    <LeadFilters applyFilters={applyFilters} filters={{ filters, headers }} campaignId={Number(campaignId)}
                        onClose={() => modalProps.handleClose()} />
                </GenericModal>
            </Grid >
        </Grid>
    )
})

