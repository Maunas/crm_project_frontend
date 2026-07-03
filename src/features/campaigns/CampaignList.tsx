import { useEffect, useState } from "react"
import { DisableConfirmDialog } from "src/components/ui/feedback/ConfirmationDialog"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import PaginationComponent from "shared/ui/lists/PaginationComponent"
import LoadingScreenWrapper from "src/components/ui/feedback/LoadingScreen"
import { CustomListItem } from "shared/ui/lists/CustomListItem"
import CommonButton from "shared/ui/buttons/CommonButton"
import { EnabledIcon } from "shared/ui/lists/Icons"
import { useListPagination } from "src/hooks/useListPagination"
import { useLoading } from "src/hooks/useLoading"
import type { CampaignDetailed, WorkspaceDetailed } from "src/types/campaigns"
import type { Paginable } from "src/types/shared"
import { disableCampaign, enableCampaign, getCampaigns } from "./campaignServices"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { Link } from "react-router-dom"
import { Grid, ListItemButton, ListItemText, Stack, Typography } from "@mui/material"
import { useCallback } from "react"

interface CampaignListProps {
    workspace: WorkspaceDetailed,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    closeSidebar: () => void
}
export const CampaignList = ({ workspace, handleSidebar, closeSidebar }: CampaignListProps) => {

    const [campaigns, setCampaigns] = useState<Paginable<CampaignDetailed> | null>(null)

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(campaigns, 12)

    const fetchCampaigns = useCallback((workspaceId: number, page: number, pageSize: number) => {
        return getCampaigns({
            workspace_id: workspaceId, detailed: true, only_active: false,
            page: page || 1, page_size: pageSize
        }).then(setCampaigns)
    }, [])

    const { fnWithLoading: fetchLoading, loading } = useLoading(fetchCampaigns)

    useEffect(() => {
        if (!workspace.id) return
        fetchLoading(workspace.id, fetchPage, pageSize)
    }, [workspace.id, fetchPage, pageSize, fetchLoading])

    const handleActiveCampaign = useCallback((campaign: CampaignDetailed) => {
        if (campaign.active) {
            return disableCampaign(campaign.id!)
                .then(res => {
                    fetchLoading(workspace.id, fetchPage, pageSize)
                    if (res.action === "disabled") showToast(`"${campaign.name}" deshabilitado con éxito.`)
                    else {
                        closeSidebar()
                        showToast(`"${campaign.name}" eliminado definitivamente.`)
                    }
                })
                .catch(e => showCommonErrorToast(e))
        } else {
            return enableCampaign(campaign.id!)
                .then(() => {
                    fetchLoading(workspace.id, fetchPage, pageSize)
                    showToast(`"${campaign.name}" habilitado con éxito.`)
                })
                .catch(e => showCommonErrorToast(e))
        }
    }, [fetchLoading, fetchPage, closeSidebar, pageSize, workspace.id])

    return (<LoadingScreenWrapper loading={loading}>
        {(campaigns?.items && campaigns.items.length > 0) ? (
            <Stack spacing={2}>
                <Stack spacing={1} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h3">Lista de Campañas</Typography>
                    {campaigns && campaigns?.items.length > 0 &&
                        <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_CMP", workspace)} sx={{ marginLeft: "auto" }} size="small" onlyTooltip>
                            Agregar
                        </CommonButton>
                    }
                </Stack>
                <CampaignListData campaigns={campaigns.items} handleActiveCampaign={handleActiveCampaign} />
                <PaginationComponent {...pageComponentProps} />
            </Stack>
        ) : (
            <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                <Typography variant="h4">No se han encontrado campañas para este espacio de trabajo...</Typography>
                <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_CMP", workspace)} variant="contained">Agregar</CommonButton>
            </Stack>
        )
        }
    </LoadingScreenWrapper>)
}
interface CampaignListDataProps {
    campaigns: CampaignDetailed[],
    handleActiveCampaign: (campaign: CampaignDetailed) => Promise<void>
}
export const CampaignListData = ({ campaigns, handleActiveCampaign }: CampaignListDataProps) => {

    const [deletingCmp, setDeletingCmp] = useState<CampaignDetailed | null>(null)

    return (
        <Grid container sx={{ marginInline: 1, height: "100%" }}>
            {campaigns.map((cmp, idx) =>
                <Grid container key={`cmp-${idx}`} size="grow" sx={{ minWidth: "15rem", alignSelf: "stretch", alignItems: "start" }}>
                    <CustomListItem disablePadding sx={{ height: "100%" }} secondaryAction={
                        <Stack direction="row" sx={{ alignItems: "center" }}>
                            <CommonIconButton actionType='DETAILS' title="Detalles" tooltipSize="small" size="small"
                                component={Link} to={`/campaigns/${cmp.id}`} />
                            <CommonIconButton actionType='LIST' title="Ver Leads" tooltipSize="small" size="small"
                                component={Link} to={`/leads?workspace=${cmp.workspace_id}&campaign=${cmp.id}`} />
                            <CommonIconButton actionType={cmp.active ? "DISABLE" : "ENABLE"} title={cmp.active ? "Deshabilitar" : "Habilitar"}
                                tooltipSize="small" size="small" color={cmp.active ? "error" : "success"}
                                onClick={() => setDeletingCmp(cmp)} />
                        </Stack>}>
                        <ListItemButton component={Link} to={`/campaigns/${cmp.id}`} sx={{ height: "100%" }} >
                            <ListItemText sx={{ mr: 7 }} primary={
                                <Stack spacing={1} direction="row" color="inherit" sx={{ width: "100%", alignItems: "center" }}>
                                    <EnabledIcon active={cmp.active} />
                                    <Typography sx={{ fontWeight: "bold" }} color="inherit">{cmp.name}</Typography>
                                </Stack>
                            }
                                secondary={cmp.description} />
                        </ListItemButton>
                    </CustomListItem>
                </Grid>
            )}
            <DisableConfirmDialog idModal='conf-delete-cmp-list' entity={deletingCmp} clearEntity={() => setDeletingCmp(null)} entityTypeName="la campaña"
                onConfirm={() => handleActiveCampaign(deletingCmp!)} />
        </Grid >
    )
}
