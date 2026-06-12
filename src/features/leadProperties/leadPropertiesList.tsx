import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Avatar, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import ContainerWithSidebar from 'src/components/layout/container/GenericContainer';
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton';
import { CustomListItem, CustomListItemAvatar } from 'src/components/ui/lists/CustomListItem';
import { useSidebar } from 'src/hooks/useSidebar';
import { LeadFlowList } from '../leadFlows/LeadFlowList';
import type { ColorTypes } from 'src/types/mui-theme.d';
import { useSearchParams } from 'react-router-dom';

export interface LeadPropertiesItem {
    label: string,
    id: "FLOW" | "CONTACT" | "TAGS",
    icon: ReactNode,
    color: ColorTypes
}
export const LEAD_PROPERTIES: LeadPropertiesItem[] = [{
    label: "Flujo de Estados",
    id: "FLOW",
    icon: <AccountTreeIcon />,
    color: "primary"
}]

export const LeadProperties = () => {

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadPropertiesItem>("id", params, setParams,)

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} sidebarWidth='45rem'
            sidebarComponent={
                <LeadPropertiesSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} />
            }>
            <Stack spacing={3}>
                <Typography variant="h1">Propiedades de Lead</Typography>
                <Stack spacing={2}>
                    <List>
                        {LEAD_PROPERTIES.map(prop =>
                            <CustomListItem key={`${prop.id}`} isSelected={prop.id === selectedEntity?.id} disablePadding secondaryAction={
                                <Stack direction="row" sx={{ alignItems: "center" }}>
                                    <CommonIconButton actionType='DETAILS' title="Detalles" tooltipSize="small" size="small"
                                        onClick={() => { handleSidebar(`${prop.id}`, prop) }} />
                                </Stack>
                            }>
                                <ListItemButton onClick={() => { handleSidebar(`${prop.id}`, prop) }} >
                                    <CustomListItemAvatar color={prop.color}><Avatar variant="rounded" >
                                        {prop.icon}
                                    </Avatar></CustomListItemAvatar>
                                    <ListItemText primary={
                                        <Stack spacing={1} direction="row">
                                            <Typography sx={{ fontWeight: "bold" }}>{prop.label}</Typography>
                                        </Stack>
                                    } />
                                </ListItemButton>
                            </CustomListItem>
                        )}
                    </List>
                </Stack>
            </Stack>
        </ContainerWithSidebar >
    )
}

export default LeadProperties

interface SidebarProps {
    mode: string | null,
    entity: LeadPropertiesItem | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: LeadPropertiesItem | null) => void,
}
const LeadPropertiesSidebar = ({ mode, entity, closeSidebar }: SidebarProps) => {

    switch (mode) {
        case "FLOW":
            return <LeadFlowList closeSidebar={closeSidebar} property={entity} />
    }

}