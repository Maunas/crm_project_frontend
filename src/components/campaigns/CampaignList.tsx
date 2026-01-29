import { useEffect, useState } from 'react'
import { getOrganizations, getWorkspaces } from './campaignServices'
import { Button, Container, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Campaign, Workspace } from '../../types/leads'
import type { Organization } from '../../types/campaigns'

export const WorkspaceList = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [organizations, setOrganizations] = useState<Organization[] | []>([])

    useEffect(() => {
        getWorkspaces(true).then(setWorkspaces)
        getOrganizations(true).then(setOrganizations)

    }, [])

    return (
        <Container>
            <Paper sx={{ padding: 2 }}>
                <Button component={Link} to="/campaigns/new" variant='contained'>Crear Campaña</Button>
                <Button component={Link} to="/workspaces/new" variant='contained'>Crear Espacio de Trabajo</Button>
                <Button component={Link} to="/organizations/new" variant='contained'>Crear Organización</Button>
                {organizations?.length > 0 &&
                    organizations.map((item) =>
                        <>
                            <Typography color="initial">{item.name}</Typography>
                            <Typography color="initial">{item.description}</Typography>
                        </>
                    )}
                {workspaces?.length > 0 &&
                    workspaces.map((item) =>
                        <>
                            <Typography color="initial">{item.name}</Typography>
                            <CampaignList campaigns={item.campaigns} />
                        </>
                    )}
            </Paper>
        </Container>
    )
}

interface CampaignListProps {
    campaigns?: Campaign[]
}

export const CampaignList = ({ campaigns = [] }: CampaignListProps) => {
    if (campaigns?.length > 0) return (
        <>
            {campaigns.map((item) =>
                <Button variant="text" component={Link} to={`/campaigns/${item.id}`}>
                    <Typography component="p">{item.name}</Typography>
                </Button>
            )}
        </>
    )
}
