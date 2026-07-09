import { useCallback } from 'react'
import { TeamList } from './TeamList'
import { RoutingPolicyList } from 'src/features/routingPolicies/RoutingPolicyList'
import { useSearchParams } from 'react-router-dom'
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material'

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`teams-tabpanel-${index}`} style={{ height: "100%" }}>
            {value === index && children}
        </div>
    )
}

export const TeamsPage = () => {

    const [params, setParams] = useSearchParams()

    const openTab = params.get("tab") === "policies" ? 1 : 0

    const handleChange = useCallback((_: React.SyntheticEvent, value: number) => {
        setParams(prev => {
            const next = new URLSearchParams(prev)
            if (value === 1) next.set("tab", "policies")
            else next.delete("tab")
            return next
        })
    }, [setParams])

    return (
        <Stack spacing={2} sx={{ height: "100%" }}>
            <Stack spacing={1} sx={{ px: 3, pt: 2 }}>
                <Typography variant="h1">Equipos y Enrutamiento</Typography>
                <Tabs value={openTab} onChange={handleChange} aria-label="teams tabs">
                    <Tab label="Equipos" id="tab-teams" />
                    <Tab label="Políticas de Enrutamiento" id="tab-policies" />
                </Tabs>
            </Stack>
            <Box sx={{ height: "100%" }}>
                <CustomTabPanel value={openTab} index={0}>
                    <TeamList />
                </CustomTabPanel>
                <CustomTabPanel value={openTab} index={1}>
                    <RoutingPolicyList />
                </CustomTabPanel>
            </Box>
        </Stack>
    )
}
