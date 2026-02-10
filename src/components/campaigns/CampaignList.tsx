import { useEffect, useMemo, useState } from 'react'
import { getOrganizations, getWorkspaces } from './campaignServices'
import { Box, Button, ButtonGroup, Container, Grid, Pagination, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Campaign, CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from '../../types/campaigns'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { CampaignSidebar } from './CampaignSidebar'
import { GenericPaper } from '../common/layout/GenericContainer'
import type { Paginable } from '../../types/common'

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
                if (organizations.page !== organizations.total_pages) break
                setOrganizations({ ...organizations, items: [...organizations.items, entity] })
                break;
            case "CREATE_WSP":
                setWorkspaces({...workspaces, items:[...workspaces.items, entity]})
                break;
        }
    }
console.log(organizations)
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
                        <ButtonGroup variant="contained" >
                            <Button onClick={() => handleSidebar("CREATE_CMP")} >Crear Campaña</Button>
                            <Button onClick={() => handleSidebar("CREATE_WSP")} >Crear Espacio de Trabajo</Button>
                            <Button onClick={() => handleSidebar("CREATE_ORG")} >Crear Organización</Button>
                        </ButtonGroup>
                        {detailedOrgs?.length > 0 &&
                            detailedOrgs.map((org, idx) =>
                                <Box key={`org${idx}`}>
                                    <Typography color="initial">{org.name}{org.description && `: ${org.description}`}</Typography>
                                    <WorkspaceList workspaces={org.workspaces} />
                                </Box>
                            )}
                        <Pagination count={organizations?.total_pages} page={page}
                            shape="rounded" color="secondary" onChange={handlePage} />
                    </GenericPaper>
                </Grid>
                {sidebarMode &&
                    <Grid size={5} minWidth="22rem">
                        <GenericPaper>
                            <CampaignSidebar mode={sidebarMode} entity={selectedEntity}
                                closeSidebar={closeSidebar} createEntityOnList={createEntityOnList} />
                        </GenericPaper>
                    </Grid>}
            </Grid>
        </Container>
    )
}

interface WorkspaceListProps {
    workspaces?: WorkspaceDetailed[]
}

export const WorkspaceList = ({ workspaces = [] }: WorkspaceListProps) => {
    return (
        <>
            {workspaces?.length > 0 &&
                workspaces.map((workspace, idx) =>
                    <Box key={`workspace${idx}`} sx={{ padding: ".5rem 2rem" }}>
                        <Grid container >
                            <SubdirectoryArrowRightIcon />
                            <Typography color="initial">{workspace.name}{workspace.description && `: ${workspace.description}`}</Typography>
                        </Grid>
                        <CampaignList campaigns={workspace.campaigns} />
                    </Box>
                )}
        </>
    )
}

interface CampaignListProps {
    campaigns?: Campaign[]
}
export const CampaignList = ({ campaigns = [] }: CampaignListProps) => {
    if (campaigns?.length > 0) return (
        <>
            {campaigns.map((campaign, idx) =>
                <Button key={`campaign${idx}`} variant="text" component={Link} to={`/campaigns/${campaign.id}`}>
                    <Typography component="p">{campaign.name}</Typography>
                </Button>
            )}
        </>
    )
}
