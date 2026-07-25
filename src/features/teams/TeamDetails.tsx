import { TeamMemberList } from "./TeamMemberList"
import { TeamAccessPanel } from "./TeamAccessPanel"
import { SidebarContentWrapper } from "shared/layout/container/GenericContainer"
import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import { EnabledIcon } from "shared/ui/lists/Icons"
import type { TeamDetailed } from "src/types/teams"
import { Link as RouterLink } from "react-router-dom"
import { ButtonGroup, Chip, Divider, Stack, Typography } from "@mui/material"
import { Can } from "src/app/Can"

interface TeamDetailsProps {
    team: TeamDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, team: TeamDetailed | null) => void,
    handleActive: (team: TeamDetailed) => void
}

export const TeamDetails = ({ team, closeSidebar, handleSidebar, handleActive }: TeamDetailsProps) => {

    if (team) return (
        <SidebarContentWrapper title={team.name} icon={<EnabledIcon active={team.active} isAvatar />}
            iconColor={team.active ? "success" : "error"}
            subtitle="Equipos de Usuario"
            actions={
                <ButtonGroup>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    <Can permission={team.active ? "team:delete" : "team:update"}>
                        <HandleActiveButton active={team.active} handleActive={() => handleActive(team)} />
                    </Can>
                    <Can permission="team:update">
                        <CommonButton onClick={() => handleSidebar("UPDATE_TEAM", team)} actionType="MODIFY" >Modificar</CommonButton>
                    </Can>
                </ButtonGroup>
            }>
            <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="body2" color="textSecondary">Visibilidad de leads:</Typography>
                    <Chip size="small" color={team.is_visibility_shared ? "info" : "default"}
                        label={team.is_visibility_shared ? "Compartida entre miembros" : "Solo lo asignado a cada agente"} />
                </Stack>
                <DetailsMetadata entity={team} />
                <Divider />
                <Stack direction="row" useFlexGap spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h3">Políticas de Enrutamiento</Typography>
                    <CommonButton actionType="LIST" component={RouterLink} to={`/teams?tab=policies&team=${team.id}`}
                        size="small" variant="outlined">
                        Ver políticas de este equipo
                    </CommonButton>
                </Stack>
                <Divider />
                <TeamMemberList team={team} />
                <Divider />
                <TeamAccessPanel team={team} />
            </Stack>
        </SidebarContentWrapper>
    )
}
