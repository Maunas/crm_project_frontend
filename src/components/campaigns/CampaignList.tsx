import { useEffect, useState } from 'react'
import { disableWorkspace, enableWorkspace, getWorkspaces } from './campaignServices'
import { Box, Button, ButtonGroup, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import type { CampaignDetailed, WorkspaceDetailed } from '../../types/campaigns'
import { CampaignSidebar } from './CampaignSidebar'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import type { Paginable } from '../../types/common'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { EnabledIcon } from '../common/lists/Badges';
import { Link } from 'react-router-dom'
import { useListPagination } from '../hooks/useListPagination'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { useSidebar } from '../hooks/useSidebar'

export const WorkspaceList = () => {
    const [workspaces, setWorkspaces] = useState<Paginable<WorkspaceDetailed> | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<WorkspaceDetailed | CampaignDetailed>()

    const { page, pageSize, pageComponentProps } = useListPagination(workspaces?.total_pages || 0, 2)

    useEffect(() => {
        getWorkspaces({ detailed: true, page_size: pageSize, only_active: false, organization_id: 1, page: page }).then(setWorkspaces)
    }, [page, pageSize])

    const updateEntityOnList = (
        entity: WorkspaceDetailed | CampaignDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_WSP": {
                if (!workspaces) break
                const newWsp = entity as WorkspaceDetailed
                setWorkspaces({ ...workspaces, items: [...workspaces.items, newWsp] })
                break;
            }
            case "CREATE_CMP": {
                if (!workspaces) break
                const newCmp = entity as CampaignDetailed
                const workspacesItems = [...workspaces.items]
                const workspaceIdx = workspacesItems.findIndex(wsp => wsp.id === newCmp.workspace_id)
                workspacesItems[workspaceIdx] = {
                    ...workspacesItems[workspaceIdx],
                    campaigns: [...workspacesItems[workspaceIdx].campaigns, newCmp]
                }
                setWorkspaces({ ...workspaces, items: [...workspacesItems] })
                break;
            }
            case "UPDATE_WSP": {
                if (!workspaces) break
                const newWsp = entity as WorkspaceDetailed
                const newWorkspaceItems = [...workspaces.items]
                const wspIdx = newWorkspaceItems.findIndex(wsp => wsp.id === newWsp.id)
                if (wspIdx === -1) break
                newWorkspaceItems[wspIdx] = newWsp
                setWorkspaces({ ...workspaces, items: [...newWorkspaceItems] })
                break;
            }
            case "UPDATE_CMP": {
                if (!workspaces) break
                const newCmp = entity as CampaignDetailed
                const newWorkspaceItems = [...workspaces.items]
                const wspIdx = newWorkspaceItems.findIndex(wsp => wsp.id === newCmp.workspace_id)
                if (wspIdx === -1) break
                const cmpIdx = newWorkspaceItems[wspIdx].campaigns.findIndex(cmp => cmp.id === newCmp.id)
                if (cmpIdx === -1) break
                newWorkspaceItems[wspIdx].campaigns[cmpIdx] = newCmp
                setWorkspaces({ ...workspaces, items: [...newWorkspaceItems] })
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
        if (wsp.active) {
            disableWorkspace(wsp.id).then(() => updateActive(wsp))
        } else {
            enableWorkspace(wsp.id).then(() => updateActive(wsp))
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarGridProps={{ size: "grow" }}
            sidebarComponent={
                <CampaignSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                    closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} />
            }>
            <Stack spacing={2}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="h1">Lista de Espacios de Trabajo</Typography>
                    <ButtonGroup variant="contained" color="primary">
                        <Button onClick={() => handleSidebar("CREATE_CMP", null)} >Crear Campaña</Button>
                        <Button onClick={() => handleSidebar("CREATE_WSP", null)} >Crear Espacio de Trabajo</Button>
                    </ButtonGroup>
                </Grid>
                <List>
                    {workspaces?.items && workspaces?.items?.length > 0 ?
                        workspaces?.items.map(wsp =>
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
                                <ListItemButton onClick={() => handleSidebar("DETAILS_WSP", wsp)} className="selectable">
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
                        )
                        : <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                            <Typography variant="h3" color="initial">No se han encontrado espacios de trabajo...</Typography>
                            <Button onClick={() => handleSidebar("CREATE_WSP", null)} variant="contained">Crear Espacio</Button>
                        </Grid>
                    }

                </List>
                <PaginationComponent {...pageComponentProps} />
            </Stack>
        </ContainerWithSidebar >
    )
}


interface CampaignListProps {
    campaigns?: CampaignDetailed[],
}
export const CampaignList = ({ campaigns = [] }: CampaignListProps) => {

    if (campaigns?.length > 0) return (
        <Box sx={{ marginLeft: 6 }}>
            {campaigns.map((campaign, idx) =>
                <Button key={`campaign${idx}`} variant="text" component={Link} to={`/campaigns/${campaign.id}`} >
                    <Typography component="p">{campaign.name}</Typography>
                </Button>
            )}
        </Box>
    )
}
