import { useEffect, useMemo, useState } from 'react'
import { getOrganizations, getWorkspaces } from './campaignServices'
import { Box, Button, ButtonGroup, Chip, Collapse, Container, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Pagination, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Campaign, CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from '../../types/campaigns'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { CampaignSidebar } from './CampaignSidebar'
import { GenericPaper } from '../common/layout/GenericContainer'
import type { Paginable } from '../../types/common'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

export const OrganizationList = () => {
    const [organizations, setOrganizations] = useState<Paginable<OrganizationDetailed[]> | null>(null)
    const [workspaces, setWorkspaces] = useState<Paginable<WorkspaceDetailed[]> | []>([])
    const [sidebarMode, setSidebarMode] = useState<string | null>(null)
    const [selectedEntity, setSelectedEntity] =
        useState<OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null>(null)

    const handleSidebar = (mode: string,
        entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => {
        if (!entity) setSelectedEntity(null)
        else setSelectedEntity(entity)
        setSidebarMode(mode)
    }
    const closeSidebar = () => {
        setSelectedEntity(null)
        setSidebarMode(null)
    }
    const createEntityOnList = (entity, mode) => {
        switch (mode) {
            case "CREATE_ORG":
                getOrganizations({ detailed: true, page_size: 12, page: organizations.page })
                    .then(setOrganizations)
                break;
            case "CREATE_WSP":
                setWorkspaces({ ...workspaces, items: [...workspaces.items, entity] })
                break;
            case "CREATE_CMP": {
                const workspacesItems = [...workspaces.items]
                const workspaceIdx = workspacesItems.findIndex(wsp => wsp.id === entity.workspace_id)
                workspacesItems[workspaceIdx] = {
                    ...workspacesItems[workspaceIdx],
                    campaigns: [...workspacesItems[workspaceIdx].campaigns, entity]
                }
                setWorkspaces({ ...workspaces, items: [...workspacesItems] })
                break;
            }
            case "UPDATE_ORG": {
                if (!organizations) break
                const newOrganizationsItems = [...organizations.items]
                const orgIdx = newOrganizationsItems.findIndex(org => org.id === entity.id)
                if (orgIdx === -1) break
                newOrganizationsItems[orgIdx] = entity
                setOrganizations({ ...organizations, items: [...newOrganizationsItems] })
                break;
            }
        }
    }
    useEffect(() => {
        getWorkspaces({ detailed: true }).then(setWorkspaces)
        getOrganizations({ detailed: true, page_size: 12 }).then(setOrganizations)
    }, [])

    interface OrganizationFull extends OrganizationDetailed {
        workspaces: WorkspaceDetailed[]
    }

    const detailedOrgs: OrganizationFull[] = useMemo(() => {
        if (!(workspaces?.items?.length > 0 && organizations?.items?.length > 0)) return []
        const detailedOrgs = new Map()

        organizations.items.forEach(org => {
            detailedOrgs.set(org.id, { ...org, workspaces: [] })
        })
        workspaces.items.forEach((workspace) => {
            const org = detailedOrgs.get(workspace.organization_id)
            if (org) org.workspaces.push(workspace)
        })
        return Array.from(detailedOrgs.values())
    }, [workspaces, organizations])

    const [page, setPage] = useState<number>(1)
    const handlePage = (e: React.ChangeEvent<unknown>, value: number) => {
        if (value === page) return
        getOrganizations({ detailed: true, page_size: 12, page: value }).then((res) => {
            setPage(value)
            setOrganizations(res)
        })
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
                                                    <IconButton edge="end" aria-label={org.active ? "delete" : "restore"}>
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
                                                <WorkspaceList workspaces={org.workspaces} handleSidebar={handleSidebar} />
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
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void
}

export const WorkspaceList = ({ workspaces = [], handleSidebar }: WorkspaceListProps) => {
    return (
        <>
            <List>
                {workspaces?.length > 0 &&
                    workspaces.map(wsp =>
                        <>
                            <ListItem key={`wsp${wsp.id}`} disablePadding secondaryAction={
                                <>
                                    <IconButton edge="end" aria-label="details">
                                        <SearchIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="modify">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label={wsp.active ? "delete" : "restore"}>
                                        {wsp.active ?
                                            <DeleteIcon color="error" /> :
                                            <RestoreFromTrashIcon color="success" />
                                        }
                                    </IconButton>
                                </>
                            }>
                                <ListItemButton onClick={() => handleSidebar("DETAILS_WSP", wsp)}>
                                    <ListItemIcon>
                                        <SubdirectoryArrowRightIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={`${wsp.name}${wsp.description ? `: ${wsp.description}` : ""}`} />
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
    campaigns?: Campaign[],
    handleSidebar: (mode: string, entity?: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed) => void
}
export const CampaignList = ({ campaigns = [], handleSidebar }: CampaignListProps) => {
    if (campaigns?.length > 0) return (
        <Box sx={{ marginLeft: 4 }}>
            {campaigns.map((campaign, idx) =>
                <Button key={`campaign${idx}`} variant="text" onClick={() => handleSidebar("DETAILS_CMP", campaign)}>
                    <Typography component="p">{campaign.name}</Typography>
                </Button>
            )}
        </Box>
    )
}
