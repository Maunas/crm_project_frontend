import { useCallback, useEffect, useState } from 'react'
import { useListPagination } from 'src/hooks/useListPagination'
import type { LeadFlowDetailed } from 'src/types/leadFlow'
import type { Paginable } from 'src/types/shared'
import { Grid, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { CustomListItem } from 'shared/ui/lists/CustomListItem'
import { Link, useNavigate } from 'react-router-dom'
import CommonButton from 'shared/ui/buttons/CommonButton'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton'
import { EnabledIcon } from 'shared/ui/lists/Icons'
import { deleteLeadFlow, enableLeadFlow, getLeadFlows } from './leadFlowServices/FlowService'
import { useLoading } from 'src/hooks/useLoading'
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen'
import { DisableConfirmDialog } from 'src/components/ui/feedback/ConfirmationDialog'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { useUserContext } from 'src/stores/UserContext'

export const LeadFlowList = () => {

    const { activeOrg } = useUserContext()

    const [flows, setFlows] = useState<Paginable<LeadFlowDetailed> | null>(null)
    const nav = useNavigate()

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(flows, 12)

    const fetchFlows = useCallback((fetchPage: number, pageSize: number) => getLeadFlows({
        page: fetchPage || 1, page_size: pageSize, detailed: true, only_active: false
    }).then(setFlows), [])

    const { fnWithLoading, loading } = useLoading(fetchFlows)

    useEffect(() => {
        fnWithLoading(fetchPage, pageSize)
    }, [fetchPage, pageSize, fnWithLoading, activeOrg])

    return (
        <Stack spacing={2}>
            <Stack spacing={1} direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                {(flows?.items && flows.items.length > 0) &&
                    <CommonButton actionType="CREATE" component={Link} to="/lead-flow-editor" >
                        Abrir Editor
                    </CommonButton>}
            </Stack>
            <LoadingScreenWrapper loading={loading}>
                {(flows?.items && flows.items.length > 0) ?
                    <Stack spacing={2}>
                        <LeadFlowListData flows={flows.items} updateList={() => fetchFlows(fetchPage, pageSize)} />
                        <PaginationComponent {...pageComponentProps} />
                    </Stack>
                    :
                    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center", height: "30rem" }}>
                        <Typography variant="h4">No se han encontrado flujos de estado...</Typography>
                        <CommonButton actionType="CREATE" onClick={() => nav("/lead-flow-editor")} variant="contained">Abrir Editor</CommonButton>
                    </Stack>
                }
            </LoadingScreenWrapper>
        </Stack>
    )
}

export const LeadFlowListData = ({ flows, updateList }: { flows: LeadFlowDetailed[], updateList: () => Promise<void> }) => {

    const [disableFlow, setDisableFlow] = useState<LeadFlowDetailed | null>(null)

    const handleEnableDisable = (id: number, isActive: boolean) => {
        if (!isActive) {
            return enableLeadFlow(id)
                .then(() => {
                    showToast("Flujo habilitado correctamente.", "success")
                    updateList()
                })
                .catch(e => { showCommonErrorToast(e) })
        }
        return deleteLeadFlow(id)
            .then(res => {
                if (res.action === "disabled") showToast("Flujo deshabilitado correctamente.", "success")
                else showToast("Flujo eliminado permanentemente.", "success")
                updateList()
            })
            .catch(e => { showCommonErrorToast(e) })
    }

    return (
        <>
            <Grid container sx={{ marginInline: 1, alignItems: "stretch" }}>
                {flows.map((flow, idx) =>
                    <Grid key={`flow-${idx}`} size="grow" sx={{ minWidth: "15rem", minHeight: "100%" }}>
                        <CustomListItem disablePadding sx={{ height: "100%" }} secondaryAction={
                            <Stack direction="row" sx={{ alignItems: "center" }}>
                                <CommonIconButton actionType='MODIFY' title="Editar" tooltipSize="small" size="small"
                                    component={Link} to={`/lead-flow-editor/${flow.id}`} />
                                <CommonIconButton actionType={flow.active ? "DISABLE" : "ENABLE"} title={flow.active ? "Deshabilitar" : "Habilitar"}
                                    tooltipSize="small" size="small" color={flow.active ? "error" : "success"}
                                    onClick={() => setDisableFlow(flow)} />
                            </Stack>}>
                            <ListItemButton component={Link} to={`/lead-flow-editor/${flow.id}`} sx={{ height: "100%" }} >
                                <ListItemText sx={{ mr: 4 }} primary={
                                    <Stack spacing={1} direction="row" color="inherit" sx={{ width: "100%", alignItems: "center" }}>
                                        <EnabledIcon active={flow.active} />
                                        <Typography sx={{ fontWeight: "bold" }} color="inherit">{flow.name}</Typography>
                                    </Stack>
                                }
                                    secondary={flow.description} />
                            </ListItemButton>
                        </CustomListItem>
                    </Grid>
                )}
            </Grid >
            {disableFlow &&
                <DisableConfirmDialog idModal='conf-delete-flow' entity={disableFlow} clearEntity={() => setDisableFlow(null)} entityTypeName="el flujo"
                    onConfirm={() => handleEnableDisable(disableFlow?.id, disableFlow?.active)} />
            }
        </>
    )
}
