import { useEffect, useMemo, useState } from 'react'
import { getOrganizations, getWorkspaces } from './campaignServices'
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Campaign, Organization, OrganizationDetailed, WorkspaceDetailed } from '../../types/campaigns'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

export const OrganizationList = () => {
    const [workspaces, setWorkspaces] = useState<WorkspaceDetailed[] | []>([])
    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getWorkspaces({ detailed: true }).then(setWorkspaces)
        getOrganizations({ detailed: true }).then(setOrganizations)
    }, [])

    interface OrganizationFull extends OrganizationDetailed {
        workspaces: WorkspaceDetailed[]
    }

    const detailedOrgs: OrganizationFull[] = useMemo(() => {
        if (!(workspaces || organizations)) return []
        const detailedOrgs = new Map()
        organizations.forEach((org) => {
            detailedOrgs.set(org.id, org)
        })
        workspaces.forEach((workspace) => {
            const org = detailedOrgs.get(workspace.organization_id)
            detailedOrgs.set(org.id, { ...org, workspaces: [...org.workspaces ?? [], workspace] })
        })
        return Array.from(detailedOrgs.values())
    }, [workspaces, organizations])

    return (
        <Container>
            <Paper sx={{ padding: 2 }}>
                <Button component={Link} to="/campaigns/new" variant='contained'>Crear Campaña</Button>
                <Button component={Link} to="/workspaces/new" variant='contained'>Crear Espacio de Trabajo</Button>
                <Button component={Link} to="/organizations/new" variant='contained'>Crear Organización</Button>
                {detailedOrgs?.length > 0 &&
                    detailedOrgs.map((org, idx) =>
                        <Box key={`org${idx}`}>
                            <Typography color="initial">{org.name}{org.description && `: ${org.description}`}</Typography>
                            <WorkspaceList workspaces={org.workspaces} />
                        </Box>
                    )}

            </Paper>
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
