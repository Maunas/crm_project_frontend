import { CampaignList } from "../campaigns/CampaignList"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import type { CampaignDetailed, WorkspaceDetailed } from "src/types/campaigns"
import { Stack, Typography, ButtonGroup, Divider } from "@mui/material"
import { SidebarContentWrapper } from "src/components/layout/container/GenericSidebar"
import { EnabledIcon } from "src/components/ui/lists/Icons"
import { Can } from "src/components/auth/Can"

interface WorkspaceDetailsProps {
    entity: WorkspaceDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}

export const WorkspaceDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: WorkspaceDetailsProps) => {

    if (entity) return (
        <SidebarContentWrapper title={entity.name} subtitle="Espacio de Trabajo"
            icon={<EnabledIcon active={entity.active} isAvatar />} iconColor={entity.active ? "success" : "error"}
            actions={
                <ButtonGroup>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    <Can permission={entity.active ? "workspace:delete" : "workspace:update"}>
                        <HandleActiveButton active={entity.active} handleActive={() => handleActive(entity)} />
                    </Can>
                    <Can permission="workspace:update">
                        <CommonButton onClick={() => handleSidebar("UPDATE_WSP", entity)} actionType="MODIFY" >Modificar</CommonButton>
                    </Can>
                </ButtonGroup>
            }>
            <Stack spacing={2} >
                {entity.description ? <Typography variant="body1">{entity.description}</Typography>
                    : <Typography variant="body1" sx={{ fontStyle: "italic" }}>No tiene descripción.</Typography>
                }
                <DetailsMetadata entity={entity} />
                <Stack spacing={3} >
                    <Divider />
                    {entity.campaigns &&
                        <CampaignList workspace={entity} handleSidebar={handleSidebar} closeSidebar={closeSidebar} />
                    }
                </Stack>
            </Stack>
        </SidebarContentWrapper>

    )
}
