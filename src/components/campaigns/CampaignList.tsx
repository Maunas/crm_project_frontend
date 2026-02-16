import { useEffect, useMemo, useState } from 'react'
import { disableOrganization, disableWorkspace, enableOrganization, enableWorkspace, getOrganizations, getWorkspaces } from './campaignServices'
import { Box, Button, ButtonGroup, Chip, Collapse, Container, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Pagination, Stack, Typography } from '@mui/material'
import type { CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from '../../types/campaigns'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { CampaignSidebar } from './CampaignSidebar'
import { GenericPaper } from '../common/layout/GenericContainer'
import type { Paginable } from '../../types/common'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

export const OrganizationList = () => {
    const [organizations, setOrganizations] = useState<Paginable<OrganizationDetailed> | null>(null)
    const [workspaces, setWorkspaces] = useState<Paginable<WorkspaceDetailed> | null>(null)
    const [sidebarMode, setSidebarMode] = useState<string | null>(null)
    const [selectedEntity, setSelectedEntity] =
        useState<OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null>(null)

    const PAGESIZE = 8

    const handleSidebar = (mode: string,
        entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => {
        if (!entity) setSelectedEntity(null)
        else setSelectedEntity(entity)
        if (mode === "KEEP") return
        setSidebarMode(mode)
    }
    const closeSidebar = () => {
        setSelectedEntity(null)
        setSidebarMode(null)
    }
    const createEntityOnList = (
        entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_ORG":
                getOrganizations({ detailed: true, page_size: PAGESIZE, page: organizations?.page ?? 1 })
                    .then(setOrganizations)
                break;
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
            case "UPDATE_ORG": {
                if (!organizations) break
                const newOrg = entity as OrganizationDetailed
                const newOrganizationsItems = [...organizations.items]
                const orgIdx = newOrganizationsItems.findIndex(org => org.id === newOrg.id)
                if (orgIdx === -1) break
                newOrganizationsItems[orgIdx] = newOrg
                setOrganizations({ ...organizations, items: [...newOrganizationsItems] })
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
    useEffect(() => {
        getWorkspaces({ detailed: true, only_active: false, organization_id: 1 }).then(setWorkspaces)
        getOrganizations({ detailed: true, page_size: PAGESIZE, only_active: false }).then(setOrganizations)
    }, [])

    interface OrganizationFull extends OrganizationDetailed {
        workspaces: WorkspaceDetailed[]
    }

    const detailedOrgs: OrganizationFull[] = useMemo(() => {
        if (!(workspaces && organizations)) return []
        if (!(workspaces?.items?.length > 0 && organizations?.items?.length > 0)) return []

        const detailedOrgs = new Map()

        organizations?.items.forEach(org => {
            detailedOrgs.set(org.id, { ...org, workspaces: [] })
        })
        workspaces.items.forEach((workspace) => {
            const org = detailedOrgs.get(workspace.organization_id)
            if (org) org.workspaces.push(workspace)
        })
        return Array.from(detailedOrgs.values())
    }, [workspaces, organizations])

    const [page, setPage] = useState<number>(1)
    const handlePage = (_: React.ChangeEvent<unknown>, value: number) => {
        if (value === page) return
        getOrganizations({ detailed: true, page_size: PAGESIZE, page: value }).then((res) => {
            setPage(value)
            setOrganizations(res)
        })
    }
    const handleActive = (org: OrganizationDetailed) => {
        if (!org) return
        if (org.active) {
            disableOrganization(org.id).then(() => {
                createEntityOnList({ ...org, active: false }, "UPDATE_ORG")
                if (selectedEntity?.id === org.id) {
                    handleSidebar("KEEP", { ...selectedEntity, active: false })
                }
            })
        } else {
            enableOrganization(org.id).then(() => {
                createEntityOnList({ ...org, active: true }, "UPDATE_ORG")
                if (selectedEntity?.id === org.id) {
                    handleSidebar("KEEP", { ...selectedEntity, active: true })
                }
            })
        }
    }
    return (
        <Container maxWidth={false}>
            <Grid container spacing={2}>
                <Grid size="grow" minWidth="30rem">
                    <GenericPaper>
                        <Stack spacing={2}>
                            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                                <Typography variant="h1">Lista de Campañas</Typography>
                                <ButtonGroup variant="contained" color="primary">
                                    <Button onClick={() => handleSidebar("CREATE_CMP")} >Crear Campaña</Button>
                                    <Button onClick={() => handleSidebar("CREATE_WSP")} >Crear Espacio de Trabajo</Button>
                                    <Button onClick={() => handleSidebar("CREATE_ORG")} >Crear Organización</Button>
                                </ButtonGroup>
                            </Grid>
                            <List>
                                {detailedOrgs?.length > 0 &&
                                    detailedOrgs.map(org =>
                                        <>
                                            <ListItem key={`org${org.id}`} disablePadding secondaryAction={
                                                <Grid container spacing={1} alignItems="center">
                                                    {org.active ? <Chip color='success' label="Habilitado" /> : <Chip color='error' label="Deshabilitado" />}
                                                    <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                                        <SearchIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="modify" onClick={() => handleSidebar("UPDATE_ORG", org)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label={org.active ? "delete" : "restore"}
                                                        onClick={() => handleActive(org)}>
                                                        {org.active ?
                                                            <DeleteIcon color="error" /> :
                                                            <RestoreFromTrashIcon color="success" />
                                                        }
                                                    </IconButton>
                                                </Grid>
                                            }>
                                                <ListItemButton onClick={() => handleSidebar("DETAILS_ORG", org)} className="selectable">
                                                    <ListItemText primary={<>
                                                        <Typography fontWeight="bold">{org.name}</Typography>
                                                        {org.description && <Typography paddingInlineStart={2}>{org.description} </Typography>}
                                                    </>} />
                                                </ListItemButton>

                                            </ListItem>
                                            <Collapse in={true} timeout="auto" unmountOnExit>
                                                <WorkspaceList workspaces={org.workspaces} handleSidebar={handleSidebar}
                                                    createEntityOnList={createEntityOnList} selectedEntity={selectedEntity} />
                                            </Collapse>
                                        </>
                                    )}

                            </List>
                            <Pagination count={organizations?.total_pages} page={page}
                                shape="rounded" color="secondary" onChange={handlePage} />
                        </Stack>
                    </GenericPaper>
                </Grid>
                {sidebarMode &&
                    <Grid size={5} minWidth="22rem">
                        <GenericPaper>
                            <CampaignSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                                closeSidebar={closeSidebar} createEntityOnList={createEntityOnList} />
                        </GenericPaper>
                    </Grid>}
            </Grid>
        </Container>
    )
}

interface WorkspaceListProps {
    workspaces?: WorkspaceDetailed[],
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void,
    selectedEntity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    createEntityOnList: (entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null, mode: string) => void
}

export const WorkspaceList = ({ workspaces = [], handleSidebar, selectedEntity, createEntityOnList }: WorkspaceListProps) => {

    const handleActive = (wsp: OrganizationDetailed) => {
        if (!wsp) return
        if (wsp.active) {
            disableWorkspace(wsp.id).then(() => {
                createEntityOnList({ ...wsp, active: false }, "UPDATE_WSP")
                if (selectedEntity?.id === wsp.id) {
                    handleSidebar("KEEP", { ...selectedEntity, active: false })
                }
            })
        } else {
            enableWorkspace(wsp.id).then(() => {
                createEntityOnList({ ...wsp, active: true }, "UPDATE_WSP")
                if (selectedEntity?.id === wsp.id) {
                    handleSidebar("KEEP", { ...selectedEntity, active: true })
                }
            })
        }
    }

    return (
        <>
            <List>
                {workspaces?.length > 0 &&
                    workspaces.map(wsp =>
                        <>
                            <ListItem key={`wsp${wsp.id}`} disablePadding secondaryAction={
                                <Grid container spacing={1} alignItems="center">
                                    {wsp.active ? <Chip color='success' label="Habilitado" /> : <Chip color='error' label="Deshabilitado" />}
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
                                <ListItemButton onClick={() => handleSidebar("DETAILS_WSP", wsp)}>
                                    <ListItemIcon>
                                        <SubdirectoryArrowRightIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={<>
                                        <Typography fontWeight="bold">{wsp.name}</Typography>
                                        {wsp.description && <Typography paddingInlineStart={2}>{wsp.description} </Typography>}
                                    </>} />
                                </ListItemButton>

                            </ListItem>
                            <Collapse in={true} timeout="auto" unmountOnExit>
                                <CampaignList campaigns={wsp.campaigns} handleSidebar={handleSidebar} />
                            </Collapse>
                        </>
                    )}

            </List>
        </>
    )
}

interface CampaignListProps {
    campaigns?: CampaignDetailed[],
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void
}
export const CampaignList = ({ campaigns = [], handleSidebar }: CampaignListProps) => {
    if (campaigns?.length > 0) return (
        <Box sx={{ marginLeft: 6 }}>
            {campaigns.map((campaign, idx) =>
                <Button key={`campaign${idx}`} variant="text" onClick={() => handleSidebar("DETAILS_CMP", campaign)}>
                    <Typography component="p">{campaign.name}</Typography>
                </Button>
            )}
        </Box>
    )
}
