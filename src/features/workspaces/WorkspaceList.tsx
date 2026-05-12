import { useContext, useEffect, useState } from 'react'
import { WorkspaceFormSidebar } from './WorkspaceForms';
import { WorkspaceDetails } from './WorkspaceDetails'
import { CreateCampaignFormSidebar } from '../campaigns/CampaignForms';
import { EnabledIcon } from 'shared/ui/lists/Icons';
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { CustomListItem } from 'shared/ui/lists/CustomListItem';
import ContainerWithSidebar from 'shared/layout/container/GenericContainer';
import CommonButton from 'shared/ui/buttons/CommonButton';
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton';
import { useSidebar } from 'src/hooks/useSidebar';
import { useListPagination } from 'src/hooks/useListPagination';
import { disableWorkspace, enableWorkspace, getWorkspace, getWorkspaces } from './workspaceServices'
import type { Paginable } from 'src/types/shared'
import type { CampaignDetailed, WorkspaceDetailed } from 'src/types/campaigns'
import { UserContext } from 'src/stores/contexts';
import type { UserContextItems } from 'src/stores/UserProvider';
import { useSearchParams } from 'react-router-dom';
import { List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'

export const WorkspaceList = () => {

    const [params, setParams] = useSearchParams()

    const [workspaces, setWorkspaces] = useState<Paginable<WorkspaceDetailed> | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<WorkspaceDetailed | CampaignDetailed>("id", params, setParams, getWorkspace, "DETAILS_WSP")

    const { fetchPage, pageSize, refresh, pageComponentProps } = useListPagination(workspaces)

    const { activeOrg } = useContext<UserContextItems>(UserContext)

    useEffect(() => {
        getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: fetchPage }).then(setWorkspaces)
    }, [fetchPage, refresh, pageSize, activeOrg])

    useEffect(() => {
        closeSidebar()
    }, [activeOrg, closeSidebar])

    const updateEntityOnList = (
        entity: WorkspaceDetailed | CampaignDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_WSP": {
                getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: workspaces?.page }).then(setWorkspaces)
                break;
            }
            case "UPDATE_WSP": {
                if (!workspaces) break
                const newWsp = entity as WorkspaceDetailed
                const workspaceItems = [...workspaces.items]
                const wspIdx = workspaceItems.findIndex(wsp => wsp.id === newWsp.id)
                if (wspIdx === -1) break
                workspaceItems[wspIdx] = newWsp
                setWorkspaces({ ...workspaces, items: [...workspaceItems] })
                break;
            }
            case "DELETE_WSP": {
                if (selectedEntity && entity?.id === selectedEntity.id) closeSidebar()
                getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: workspaces?.page }).then(setWorkspaces)
                break;
            }
        }
    }

    const handleActive = (wsp: WorkspaceDetailed) => {
        if (!wsp) return
        const updateActive = (wsp: WorkspaceDetailed) => {
            updateEntityOnList({ ...wsp, active: !wsp.active }, "UPDATE_WSP")
            if (selectedEntity?.id === wsp.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !wsp.active })
            }
        }
        const deleteWsp = (org: WorkspaceDetailed) => {
            updateEntityOnList(org, "DELETE_WSP")
            if (selectedEntity?.id === org.id) {
                closeSidebar()
            }
        }
        if (wsp.active) {
            disableWorkspace(wsp.id!).then((res) => {
                if (res.action === "disabled") updateActive(wsp)
                if (res.action === "deleted") deleteWsp(wsp)
            })
        } else {
            enableWorkspace(wsp.id!).then(() => updateActive(wsp))
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} sidebarGridProps={{ size: "grow" }}
            sidebarComponent={
                <WorkspaceSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                    handleActive={handleActive} />
            }>
            <Stack spacing={3}>
                <Stack spacing={2} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h1">Lista de Espacios de Trabajo</Typography>
                    {workspaces && workspaces?.items.length > 0 &&
                        <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_WSP", null)} sx={{ marginLeft: "auto" }} />
                    }
                </Stack>
                <Stack spacing={2}>
                    {workspaces?.items && workspaces?.items?.length > 0 ?
                        <List>
                            {workspaces?.items.map(wsp =>
                                <CustomListItem key={`wsp-${wsp.id}`} selected={wsp.id === selectedEntity?.id} disablePadding secondaryAction={
                                    <Stack direction="row" sx={{ alignItems: "center" }}>
                                        <CommonIconButton actionType='DETAILS' title="Detalles" tooltipSize="small" size="small"
                                            onClick={() => { handleSidebar("DETAILS_WSP", wsp) }} />
                                        <CommonIconButton actionType='MODIFY' title="Modificar" tooltipSize="small" size="small"
                                            onClick={() => { handleSidebar("UPDATE_WSP", wsp) }} />
                                        <CommonIconButton actionType={wsp.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                            title={wsp.active ? "Deshabilitar" : "Habilitar"}
                                            onClick={() => handleActive(wsp)} color={wsp.active ? "error" : "success"} />
                                    </Stack>
                                }>
                                    <ListItemButton onClick={() => { handleSidebar("DETAILS_WSP", wsp) }} >
                                        <ListItemText sx={{ mr: 7 }} primary={
                                            <Stack spacing={1} direction="row">
                                                <EnabledIcon active={wsp.active} />
                                                <Typography sx={{ fontWeight: "bold" }}>{wsp.name}</Typography>
                                            </Stack>
                                        }
                                            secondary={wsp.description} />
                                    </ListItemButton>
                                </CustomListItem>
                            )}
                        </List>
                        : <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <Typography variant="h4">No se han encontrado espacios de trabajo...</Typography>
                            <CommonButton actionType='CREATE' onClick={() => handleSidebar("CREATE_WSP", null)} variant="contained">
                                Agregar
                            </CommonButton>
                        </Stack>
                    }
                    <PaginationComponent {...pageComponentProps} />
                </Stack>
            </Stack>
        </ContainerWithSidebar >
    )
}


interface SidebarProps {
    mode: string | null,
    entity: WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: WorkspaceDetailed | CampaignDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}
const WorkspaceSidebar = ({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    switch (mode) {
        case "CREATE_WSP":
            return <WorkspaceFormSidebar closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "CREATE_CMP":
            return <CreateCampaignFormSidebar workspace={entity as WorkspaceDetailed}
                handleSidebar={handleSidebar} />
        case "UPDATE_WSP":
            return <WorkspaceFormSidebar existingWsp={entity as WorkspaceDetailed} closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "DETAILS_WSP":
            return <WorkspaceDetails entity={entity as WorkspaceDetailed} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }

}