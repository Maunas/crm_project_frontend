import { useEffect, useMemo, useState } from "react"
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

    const { page, pageSize, pageComponentProps } = useListPagination(campaigns?.total_pages || 0, 12)

    useEffect(() => {
        getCampaigns({
            workspace_id: selectedWorkspaceId, detailed: true, only_active: false,
            page: page || 1, page_size: pageSize
        }).then(setCampaigns)
    }, [selectedWorkspaceId, page, pageSize])

    const filteredCampaigns = useMemo(() => campaigns?.items ?
        campaigns.items.filter(cmp => cmp.workspace_id === selectedWorkspaceId) : []
        , [campaigns, selectedWorkspaceId])

    if (filteredCampaigns && filteredCampaigns.length > 0) return (
        <>
            <Grid sx={{ marginLeft: 6 }} container>
                {filteredCampaigns.map((cmp, idx) =>
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
            <PaginationComponent {...pageComponentProps} />
        </>
    )
    return <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
        <Typography variant="h4" color="initial">No se han encontrado campañas para este espacio de trabajo...</Typography>
        <Button onClick={() => handleSidebar("CREATE_CMP", null)} variant="contained">Agregar Campaña</Button>
    </Grid>

}