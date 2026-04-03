import { useContext, useEffect, useState } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { WorkspaceFormSidebar } from './WorkspaceForms';
import { CreateCampaignFormSidebar } from '../campaigns/CampaignForms';
import { CommonButton } from '../common/details/DetailsCommonButton';
import { EnabledIcon } from '../common/lists/Badges';
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { WorkspaceDetails } from './WorkspaceDetails'
import type { Paginable } from '../../types/common'
import type { CampaignDetailed, WorkspaceDetailed } from '../../types/campaigns'
import { disableWorkspace, enableWorkspace, getWorkspace, getWorkspaces } from './workspaceServices'
import { useListPagination } from '../hooks/useListPagination'
import { useSidebar } from '../hooks/useSidebar'
import { UserContext } from '../common/contexts';
import type { UserContextItems } from '../users/UserProvider';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroup, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

export const WorkspaceList = () => {

    const [params, setParams] = useSearchParams()

    const [workspaces, setWorkspaces] = useState<Paginable<WorkspaceDetailed> | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<WorkspaceDetailed | CampaignDetailed>(params, setParams, getWorkspace, "DETAILS_WSP", "id")

    const { fetchPage, pageSize, refresh, pageComponentProps } = useListPagination(workspaces)

    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    useEffect(() => {
        getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: fetchPage }).then(setWorkspaces)
    }, [fetchPage, refresh, pageSize, selectedOrg])

    useEffect(() => {
        closeSidebar()
    }, [selectedOrg, closeSidebar])

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
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarGridProps={{ size: "grow" }}
            sidebarComponent={
                <WorkspaceSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                    handleActive={handleActive} />
            }>
            <Stack gap={3}>
                <Grid container gap={2} justifyContent="space-between" alignItems="center">
                    <Grid size="grow" minWidth="15rem">
                        <Typography variant="h1">Lista de Espacios de Trabajo</Typography>
                    </Grid>
                    <ButtonGroup variant="contained" color="primary" sx={{ marginLeft: "auto" }}>
                        <CommonButton actionType='CREATE' handleClick={() => handleSidebar("CREATE_WSP", null)}>
                            Crear Espacio de Trabajo
                        </CommonButton>
                        <CommonButton actionType='CREATE' handleClick={() => handleSidebar("CREATE_CMP", null)}>
                            Crear Campaña
                        </CommonButton>
                    </ButtonGroup>
                </Grid>
                <Stack gap={2}>
                    {workspaces?.items && workspaces?.items?.length > 0 ?
                        <List>
                            {workspaces?.items.map(wsp =>
                                <ListItem key={`wsp-${wsp.id}`} disablePadding secondaryAction={
                                    <Grid container gap={1} alignItems="center">
                                        <IconButton edge="end" aria-label="details" onClick={() => { handleSidebar("DETAILS_WSP", wsp) }}>
                                            <SearchIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="modify" onClick={() => handleSidebar("UPDATE_WSP", wsp)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label={wsp.active ? "delete" : "restore"}
                                            onClick={() => handleActive(wsp)}>
                                            {wsp.active ?
                                                <DeleteIcon color="error" /> :
                                                <RestoreFromTrashIcon color="success" />
                                            }
                                        </IconButton>
                                    </Grid>
                                }>
                                    <ListItemButton onClick={() => { handleSidebar("DETAILS_WSP", wsp) }} >
                                        <ListItemText primary={
                                            <Stack gap={1} direction="row">
                                                <EnabledIcon active={wsp.active} />
                                                <Typography fontWeight="bold">{wsp.name}</Typography>
                                            </Stack>
                                        }
                                            secondary={wsp.description} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>
                        : <Grid container gap={2} justifyContent="center" alignItems="center" direction="column">
                            <Typography variant="h4">No se han encontrado espacios de trabajo...</Typography>
                            <CommonButton actionType='CREATE' onClick={() => handleSidebar("CREATE_WSP", null)} variant="contained">
                                Crear Espacio
                            </CommonButton>
                        </Grid>
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
            return <CreateCampaignFormSidebar closeSidebar={closeSidebar}
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