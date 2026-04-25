import { Autocomplete, Badge, Stack, TextField, type AutocompleteRenderInputParams } from "@mui/material"
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
import type { LeadFilter, LeadListParams } from "../../../types/common";

interface LeadCampaignSelectorsProps {
    workspaceId: string | number | null,
    setWorkspaceId: (id: string | number | null) => void,
    campaignId: string | number | null,
    setCampaignId: (id: string | number | null) => void,
}

export const LeadCampaignSelector = memo(({ workspaceId, setWorkspaceId, campaignId, setCampaignId }: LeadCampaignSelectorsProps) => {

    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])

    //Inicialización al cambiar de organización
    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 }).then(wsps => {
            setWorkspaces(wsps.items)
            if (wsps.items.length === 0) {
                setWorkspaceId(null)
                return
            }
            //Si hay un workspaceId en params, y es parte de la lista obtenida, lo setea, si no toma el primer elemento
            const newWorkspaceId = (workspaceId && wsps.items.map(i => i.id).includes(Number(workspaceId))) ? workspaceId : wsps.items[0].id
            setWorkspaceId(newWorkspaceId)

            getCampaigns({ only_active: true, workspace_id: newWorkspaceId as number, page_size: 0 }).then(cmps => {
                setCampaigns(cmps.items)
                if (cmps.items.length === 0) {
                    setCampaignId(null)
                    return
                }
                const newCampaignId = (campaignId && cmps.items.map(i => i.id).includes(Number(campaignId))) ? campaignId : cmps.items[0].id
                setCampaignId(newCampaignId)
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOrg])

    const handleWorkspaceChange = useCallback((newWorkspaceId: number | null) => {
        if (!newWorkspaceId) return
        setWorkspaceId(newWorkspaceId)
        getCampaigns({ only_active: true, workspace_id: newWorkspaceId, page_size: 0 }).then(res => {
            setCampaigns(res.items)
            setCampaignId(res.items[0].id)
        })
    }, [setWorkspaceId, setCampaignId])

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
                value={Number(workspaceId)} onChange={(_, val) => handleWorkspaceChange(val)}
            />
            <ArrowForwardIcon />
            <Autocomplete {...autocompleteCommonProps(campaigns, "Campaña")}
                value={Number(campaignId)} onChange={(_, val) => setCampaignId(val)}
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
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
}

export const LeadTableOptions = memo(({ areThereLeads, campaignId, filters, headers, setFiltersAndHeaders, modalProps }: LeadTableOptionsProps) => {

    //Al aplicar filtros vuelve a la primera página
    const applyFilters = useCallback((data: { headers: LeadListParams, filters: LeadFilter[] }) => {
        const newHeaders = { ...headers, ...data.headers }
        return setFiltersAndHeaders(data.filters, newHeaders)?.then(() => modalProps.handleClose()
        )
    }, [setFiltersAndHeaders, headers, modalProps])

    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", ml: "auto", justifyContent: "end", alignItems: "center" }}>
            {
                areThereLeads && !!campaignId &&
                <CommonButton actionType='OPTIONS' color='secondary' onClick={() => modalProps.handleOpen("columns_selector")} >
                    Modificar Columnas
                </CommonButton>
            }
            {areThereLeads &&
                <Badge badgeContent={filters.length} color="success">
                    <CommonButton actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")}>
                        Aplicar Filtros
                    </CommonButton>
                </Badge>}
            <GenericModal idModal="lead_filters" modalProps={modalProps} buttonText="Aplicar Filtros" maxWidth="lg"
                actionType='FILTER' color='secondary' showButton={false} >
                <LeadFilters applyFilters={applyFilters} filters={{ filters, headers }} campaignId={Number(campaignId)}
                    onClose={() => modalProps.handleClose()} />
            </GenericModal>
        </Stack >
    )
})
