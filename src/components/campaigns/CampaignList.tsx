import { useEffect, useState } from 'react'
import { getWorkspaces } from './campaignServices'
import { Button, Container, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Campaign, Workspace } from '../../types/leads'

export const WorkspaceList = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])

    useEffect(() => {
        getWorkspaces(true).then(setWorkspaces)

    }, [])

    return (
        <Container>
            <Paper sx={{ padding: 2 }}>
                <Button component={Link} to="/campaigns/new" variant='contained'>Crear Campaña</Button>
                <Button component={Link} to="/workspaces/new" variant='contained'>Crear Espacio de Trabajo</Button>

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
