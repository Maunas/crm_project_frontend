import { useEffect, useState } from "react"
import { EnabledIcon, ListAction } from "../common/lists/Icons"
import { PaginationComponent } from "../common/lists/PaginationComponent"
import type { Paginable } from "../../types/common"
import type { CampaignDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { getCampaigns } from "./campaignServices"
import { useListPagination } from "../hooks/useListPagination"
import { Link } from "react-router-dom"
import { Grid, ListItemButton, ListItemText, Stack, Typography } from "@mui/material"
import { CommonButton } from "../common/details/DetailsCommonButton"
import { CustomListItem } from "../common/lists/CustomListItem"

interface CampaignListProps {
    selectedWorkspaceId: number,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void
}
export const CampaignList = ({ selectedWorkspaceId, handleSidebar }: CampaignListProps) => {

    const [campaigns, setCampaigns] = useState<Paginable<CampaignDetailed> | null>(null)

    const { fetchPage, refresh, pageSize, pageComponentProps } = useListPagination(campaigns, 12)

    useEffect(() => {
        getCampaigns({
            workspace_id: selectedWorkspaceId, detailed: true, only_active: false,
            page: fetchPage || 1, page_size: pageSize
        }).then(setCampaigns)
    }, [selectedWorkspaceId, refresh, fetchPage, pageSize])

    if (campaigns?.items && campaigns.items.length > 0) return (
        <Stack gap="1rem">
            <Typography variant="h3">Lista de Campañas</Typography>
            <CampaignListData campaigns={campaigns.items} />
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
    else return (
        <Grid container spacing="1rem" justifyContent="center" alignItems="center" direction="column">
            <Typography variant="h4">No se han encontrado campañas para este espacio de trabajo...</Typography>
            <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_CMP", null)} variant="contained">Agregar Campaña</CommonButton>
        </Grid>
    )
}

export const CampaignListData = ({ campaigns }: { campaigns: CampaignDetailed[] }) => {

    return (
        <Grid container gap={1} sx={{ marginInline: 1 }}>
            {campaigns.map((cmp, idx) =>
                <Grid container key={`cmp-${idx}`} size="grow" minWidth="15rem">
                    <CustomListItem disablePadding secondaryAction={
                        <Grid container gap={1} alignItems="center">
                            <ListAction actionType='DETAILS' title="Detalles" tooltipSize="small"
                                component={Link} to={`/campaigns/${cmp.id}`} />
                            <ListAction actionType='LIST' title="Ver Leads" tooltipSize="small"
                                component={Link} to={`/leads?workspace=${cmp.workspace_id}&campaign=${cmp.id}`} />
                        </Grid>}>
                        <ListItemButton component={Link} to={`/campaigns/${cmp.id}`} >
                            <ListItemText primary={
                                <Stack spacing={1} direction="row" width="100%" color="inherit" alignItems="center">
                                    <EnabledIcon active={cmp.active} />
                                    <Typography fontWeight="bold" color="inherit">{cmp.name}</Typography>
                                </Stack>
                            }
                                secondary={cmp.description} />
                        </ListItemButton>

                    </CustomListItem>
                </Grid>
            )
            }
        </Grid >
    )
}
