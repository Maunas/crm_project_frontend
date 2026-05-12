import { useEffect, useState } from "react"
import { EnabledIcon } from "shared/ui/lists/Icons"
import { CustomListItem } from "shared/ui/lists/CustomListItem"
import CommonButton from "shared/ui/buttons/CommonButton"
import PaginationComponent from "shared/ui/lists/PaginationComponent"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { useListPagination } from "src/hooks/useListPagination"
import type { Paginable } from "src/types/shared"
import type { CampaignDetailed, WorkspaceDetailed } from "src/types/campaigns"
import { getCampaigns } from "./campaignServices"
import { Link } from "react-router-dom"
import { Grid, ListItemButton, ListItemText, Stack, Typography } from "@mui/material"

interface CampaignListProps {
    workspace: WorkspaceDetailed,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void
}
export const CampaignList = ({ workspace, handleSidebar }: CampaignListProps) => {

    const [campaigns, setCampaigns] = useState<Paginable<CampaignDetailed> | null>(null)

    const { fetchPage, refresh, pageSize, pageComponentProps } = useListPagination(campaigns, 12)

    useEffect(() => {
        getCampaigns({
            workspace_id: workspace.id, detailed: true, only_active: false,
            page: fetchPage || 1, page_size: pageSize
        }).then(setCampaigns)
    }, [workspace.id, refresh, fetchPage, pageSize])

    if (campaigns?.items && campaigns.items.length > 0) return (
        <Stack spacing={2}>
            <Stack spacing={1} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h3">Lista de Campañas</Typography>
                {campaigns && campaigns?.items.length > 0 &&
                    <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_CMP", workspace)} sx={{ marginLeft: "auto" }} size="small" />
                }
            </Stack>
            <CampaignListData campaigns={campaigns.items} />
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
    else return (
        <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h4">No se han encontrado campañas para este espacio de trabajo...</Typography>
            <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_CMP", workspace)} variant="contained">Agregar</CommonButton>
        </Stack>
    )
}

export const CampaignListData = ({ campaigns }: { campaigns: CampaignDetailed[] }) => {

    return (
        <Grid container sx={{ marginInline: 1 }}>
            {campaigns.map((cmp, idx) =>
                <Grid container key={`cmp-${idx}`} size="grow" sx={{ minWidth: "15rem" }}>
                    <CustomListItem disablePadding secondaryAction={
                        <Stack direction="row" sx={{ alignItems: "center" }}>
                            <CommonIconButton actionType='DETAILS' title="Detalles" tooltipSize="small" size="small"
                                component={Link} to={`/campaigns/${cmp.id}`} />
                            <CommonIconButton actionType='LIST' title="Ver Leads" tooltipSize="small" size="small"
                                component={Link} to={`/leads?workspace=${cmp.workspace_id}&campaign=${cmp.id}`} />
                        </Stack>}>
                        <ListItemButton component={Link} to={`/campaigns/${cmp.id}`} >
                            <ListItemText sx={{ mr: 4 }} primary={
                                <Stack spacing={1} direction="row" color="inherit" sx={{ width: "100%", alignItems: "center" }}>
                                    <EnabledIcon active={cmp.active} />
                                    <Typography sx={{ fontWeight: "bold" }} color="inherit">{cmp.name}</Typography>
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
