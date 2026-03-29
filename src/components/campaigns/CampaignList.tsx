import { useEffect, useState } from "react"
import { EnabledIcon } from "../common/lists/Badges"
import { PaginationComponent } from "../common/lists/PaginationComponent"
import type { Paginable } from "../../types/common"
import type { CampaignDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { getCampaigns } from "./campaignServices"
import { useListPagination } from "../hooks/useListPagination"
import { Link } from "react-router-dom"
import { Button, Grid, Stack, Typography } from "@mui/material"

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
        <>
            <CampaignListData campaigns={campaigns.items} />
            <PaginationComponent {...pageComponentProps} />
        </>
    )
    return <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
        <Typography variant="h4">No se han encontrado campañas para este espacio de trabajo...</Typography>
        <Button onClick={() => handleSidebar("CREATE_CMP", null)} variant="contained">Agregar Campaña</Button>
    </Grid>
}

export const CampaignListData = ({ campaigns }: { campaigns: CampaignDetailed[] }) => {
    return (
        <Grid sx={{ marginLeft: 6 }} container>
            {campaigns.map((cmp, idx) =>
                <Grid key={`cmp-${idx}`} size="grow" minWidth="15rem">
                    <Button key={`cmp-${idx}`} variant="text" component={Link} to={`/campaigns/${cmp.id}`} fullWidth >
                        <Stack spacing={1} direction="row" width="100%">
                            <EnabledIcon active={cmp.active} />
                            <Typography fontWeight="bold">{cmp.name}</Typography>
                        </Stack>
                    </Button>
                </Grid>
            )}
        </Grid>
    )
}
