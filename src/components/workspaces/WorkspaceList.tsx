import { useEffect, useState } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { EnabledIcon } from '../common/lists/Badges';
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { WorkspaceSidebar } from './WorkspaceSidebar'
import type { CampaignDetailed, WorkspaceDetailed } from '../../types/campaigns'
import { disableWorkspace, enableWorkspace, getWorkspaces } from './workspaceServices'
import { useListPagination } from '../hooks/useListPagination'
import { useSidebar } from '../hooks/useSidebar'
import type { Paginable } from '../../types/common'
import { Button, ButtonGroup, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { CommonButton } from '../common/details/DetailsCommonButton';

export const WorkspaceList = () => {

    const [workspaces, setWorkspaces] = useState<Paginable<WorkspaceDetailed> | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<WorkspaceDetailed | CampaignDetailed>()

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(workspaces)

    useEffect(() => {
        getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: fetchPage }).then(setWorkspaces)
    }, [fetchPage, pageSize])

    const updateEntityOnList = (
        entity: WorkspaceDetailed | CampaignDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_WSP": {
                getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: workspaces?.page ?? 1 }).then(setWorkspaces)
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
                getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, page: 1 }).then(setWorkspaces)
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
            disableWorkspace(wsp.id).then((res) => {
                console.log(res.action)
                if (res.action === "disabled") updateActive(wsp)
                if (res.action === "deleted") deleteWsp(wsp)
            })
        } else {
            enableWorkspace(wsp.id).then(() => updateActive(wsp))
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarGridProps={{ size: "grow" }}
            sidebarComponent={
                <WorkspaceSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                    handleActive={handleActive} />
            }>
            <Stack spacing={2}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid size="grow" minWidth="15rem">
                        <Typography variant="h1">Lista de Espacios de Trabajo</Typography>
                    </Grid>
                    <Grid size="grow" minWidth="25rem">
                        <ButtonGroup variant="contained" color="primary" fullWidth>
                            <CommonButton actionType='CREATE' handleClick={() => handleSidebar("CREATE_CMP", null)}>
                                Crear Campaña
                            </CommonButton>
                            <CommonButton actionType='CREATE' handleClick={() => handleSidebar("CREATE_WSP", null)}>
                                Crear Espacio de Trabajo
                            </CommonButton>
                        </ButtonGroup>
                    </Grid>
                </Grid>
                {workspaces?.items && workspaces?.items?.length > 0 ?
                    <List>
                        {workspaces?.items.map(wsp =>
                            <ListItem key={`wsp-${wsp.id}`} disablePadding secondaryAction={
                                <Grid container spacing={1} alignItems="center">
                                    <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_WSP", wsp)}>
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
                                <ListItemButton onClick={() => handleSidebar("DETAILS_WSP", wsp)} >
                                    <ListItemText primary={<>
                                        <Stack spacing={1} direction="row">
                                            <EnabledIcon active={wsp.active} />
                                            <Typography fontWeight="bold">{wsp.name}</Typography>
                                        </Stack>
                                        {wsp.description &&
                                            <Typography paddingInlineStart={2}>{wsp.description} </Typography>}
                                    </>} />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                    : <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                        <Typography variant="h4" color="initial">No se han encontrado espacios de trabajo...</Typography>
                        <Button onClick={() => handleSidebar("CREATE_WSP", null)} variant="contained">Crear Espacio</Button>
                    </Grid>
                }
                <PaginationComponent {...pageComponentProps} />
            </Stack>
        </ContainerWithSidebar >
    )
}