import { useEffect, useState } from "react"
import { EnabledIcon, ListAction } from "../../components/ui/lists/Icons"
import { PaginationComponent } from "../../components/ui/lists/PaginationComponent"
import type { Paginable } from "../../types/shared"
import type { CampaignDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { getCampaigns } from "./campaignServices"
import { Link } from "react-router-dom"
import { Grid, ListItemButton, ListItemText, Stack, Typography } from "@mui/material"
import { CustomListItem } from "../../components/ui/lists/CustomListItem"
import { useListPagination } from "src/hooks/useListPagination"
import CommonButton from "src/components/ui/buttons/CommonButton"

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
        <Stack spacing={2}>
            <Typography variant="h3">Lista de Campañas</Typography>
            <CampaignListData campaigns={campaigns.items} />
            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
    else return (
        <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h4">No se han encontrado campañas para este espacio de trabajo...</Typography>
            <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_CMP", null)} variant="contained">Agregar Campaña</CommonButton>
        </Stack>
    )
}

export const CampaignListData = ({ campaigns }: { campaigns: CampaignDetailed[] }) => {

    return (
        <Grid container spacing={1} sx={{ marginInline: 1 }}>
            {campaigns.map((cmp, idx) =>
                <Grid container key={`cmp-${idx}`} size="grow" sx={{ minWidth: "15rem" }}>
                    <CustomListItem disablePadding secondaryAction={
                        <Stack direction="row" spacing={.5} sx={{ alignItems: "center" }}>
                            <ListAction actionType='DETAILS' title="Detalles" tooltipSize="small" size="small"
                                component={Link} to={`/campaigns/${cmp.id}`} />
                            <ListAction actionType='LIST' title="Ver Leads" tooltipSize="small" size="small"
                                component={Link} to={`/leads?workspace=${cmp.workspace_id}&campaign=${cmp.id}`} />
                        </Stack>}>
                        <ListItemButton component={Link} to={`/campaigns/${cmp.id}`} >
                            <ListItemText primary={
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
