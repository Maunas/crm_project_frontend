import { CampaignList } from "../campaigns/CampaignList"
import TitleAndActive from "src/components/ui/details/TitleAndActive"
import DetailsMetadata from "src/components/ui/details/DetailsMetadata"
import CommonButton from "src/components/ui/buttons/CommonButton"
import HandleActiveButton from "src/components/ui/buttons/HandleActiveButton"
import type { CampaignDetailed, WorkspaceDetailed } from "src/types/campaigns"
import { Stack, Typography, ButtonGroup, Divider } from "@mui/material"

interface WorkspaceDetailsProps {
    entity: WorkspaceDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: WorkspaceDetailed | CampaignDetailed | null) => void,
    handleActive: (entity: WorkspaceDetailed) => void
}

export const WorkspaceDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: WorkspaceDetailsProps) => {

    if (entity) return (
        <Stack spacing={3} >
            <TitleAndActive active={entity.active}>
                <Typography variant="h2">{entity.name}</Typography>
            </TitleAndActive>
            <Stack spacing={2} >
                {entity.description ? <Typography variant="body1">{entity.description}</Typography>
                    : <Typography variant="body1" sx={{ fontStyle: "italic" }}>No tiene descripción.</Typography>
                }
                <Stack spacing={3} >
                    <Divider />
                    {entity.campaigns &&
                        <CampaignList workspace={entity} handleSidebar={handleSidebar} />
                    }
                    <Divider />
                </Stack>
                <DetailsMetadata entity={entity} />
                <Divider />
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    <HandleActiveButton active={entity.active} handleActive={() => handleActive(entity)} />
                    <CommonButton onClick={() => handleSidebar("UPDATE_WSP", entity)} actionType="MODIFY" >Modificar</CommonButton>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}
