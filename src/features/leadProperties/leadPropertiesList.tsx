import { useMemo, type ReactNode } from 'react';
import { LeadFlowList } from '../leadFlows/LeadFlowList';
import { CustomListItem, CustomListItemAvatar } from 'shared/ui/lists/CustomListItem';
import ContainerWithSidebar, { SidebarContentWrapper } from 'shared/layout/container/GenericContainer';
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton';
import { useSidebar } from 'src/hooks/useSidebar';
import type { ColorTypes } from 'src/types/mui-theme.d';
import { useSearchParams } from 'react-router-dom';
import { Avatar, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { ContactStateList } from '../contactState/ContactStateList';
import CommonButton from 'src/components/ui/buttons/CommonButton';

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
},
{
    label: "Estados de Contacto",
    id: "CONTACT",
    icon: <ViewColumnIcon />,
    color: "secondary"
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

    const content = useMemo(() => {
        switch (mode) {
            case "FLOW":
                return <LeadFlowList />
            case "CONTACT":
                return <ContactStateList />
        }
    }, [mode])

    return (
        <SidebarContentWrapper title={entity?.label} subtitle="Propiedades de Organización"
            icon={entity?.icon} iconColor={entity?.color}
            actions={<CommonButton actionType="CLOSE" variant="outlined" onClick={closeSidebar}>Cerrar</CommonButton>} >
            {content}
        </SidebarContentWrapper>
    )
}