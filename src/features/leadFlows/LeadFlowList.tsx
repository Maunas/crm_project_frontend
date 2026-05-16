import { useEffect, useState } from 'react'
import { useListPagination } from 'src/hooks/useListPagination'
import type { LeadFlowDetailed } from 'src/types/leadFlow'
import type { Paginable } from 'src/types/shared'
import { getLeadFlows } from './FlowService'
import { Avatar, Grid, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { CustomListItem, CustomListItemAvatar } from 'src/components/ui/lists/CustomListItem'
import type { LeadPropertiesItem } from '../leadProperties/leadPropertiesList'
import { Link, useNavigate } from 'react-router-dom'
import CommonButton from 'src/components/ui/buttons/CommonButton'
import PaginationComponent from 'src/components/ui/lists/PaginationComponent'
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton'
import { EnabledIcon } from 'src/components/ui/lists/Icons'


interface FlowListProps {
    closeSidebar: () => void,
    property: LeadPropertiesItem | null
}
export const LeadFlowList = ({ closeSidebar, property }: FlowListProps) => {

    const [flows, setFlows] = useState<Paginable<LeadFlowDetailed> | null>(null)
    const nav = useNavigate()

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(flows, 12)

    useEffect(() => {
        getLeadFlows({
            page: fetchPage || 1, page_size: pageSize, detailed: true
        }).then(setFlows)
    }, [fetchPage, pageSize])

    if (flows?.items && flows.items.length > 0) return (
        <Stack spacing={2}>
            <Stack spacing={1} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                {property &&
                    <CustomListItemAvatar color={property.color}><Avatar variant="rounded" >
                        {property.icon}
                    </Avatar></CustomListItemAvatar>}
                <Typography variant="h3">Lista de Flujos de Estado</Typography>
                <CommonButton actionType="CREATE" onClick={() => nav("/lead-flow-editor")} sx={{ marginLeft: "auto" }} size="small" onlyTooltip>
                    Abrir Editor
                </CommonButton>
            </Stack>
            <LeadFlowListData flows={flows.items} />
            <PaginationComponent {...pageComponentProps} />
            <CommonButton actionType="CLOSE" onClick={closeSidebar} sx={{ alignSelf: "end" }}>Cerrar</CommonButton>
        </Stack>
    )
    else return (
        <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h4">No se han encontrado flujos de estado...</Typography>
            <CommonButton actionType="CREATE" onClick={() => nav("/lead-flow-editor")} variant="contained">Abrir Editor</CommonButton>
            <CommonButton actionType="CLOSE" onClick={closeSidebar} sx={{ alignSelf: "end" }}>Cerrar</CommonButton>
        </Stack>
    )
}

export const LeadFlowListData = ({ flows }: { flows: LeadFlowDetailed[] }) => {

    return (
        <Grid container sx={{ marginInline: 1, alignItems: "stretch" }}>
            {flows.map((flow, idx) =>
                <Grid key={`flow-${idx}`} size="grow" sx={{ minWidth: "15rem", minHeight: "100%" }}>
                    <CustomListItem disablePadding sx={{ height: "100%" }} secondaryAction={
                        <Stack direction="row" sx={{ alignItems: "center" }}>
                            <CommonIconButton actionType='MODIFY' title="Editar" tooltipSize="small" size="small"
                                component={Link} to={`/lead-flow-editor/${flow.id}`} />
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
    )
}
