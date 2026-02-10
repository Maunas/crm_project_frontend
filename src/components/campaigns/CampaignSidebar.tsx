import type { CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { CampaignForm, OrganizationForm, WorkspaceForm } from "./CampaignForms"

interface SidebarProps {
    mode: string | null,
    entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    createEntityOnList: (
        mode: string | null,
        entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    ) => void
}
export const CampaignSidebar = ({ mode, entity, closeSidebar, createEntityOnList }: SidebarProps) => {

    switch (mode) {
        case "CREATE_ORG":
            return <OrganizationForm closeSidebar={closeSidebar} createEntityOnList={createEntityOnList} />
        case "CREATE_WSP":
            return <WorkspaceForm closeSidebar={closeSidebar} />
        case "CREATE_CMP":
            return <CampaignForm closeSidebar={closeSidebar} />
        case "UPDATE_ORG":
            return <OrganizationForm existingOrg={entity} closeSidebar={closeSidebar} />
        case "UPDATE_WSP":
            return <WorkspaceForm existingOrg={entity} closeSidebar={closeSidebar} />
        case "UPDATE_CMP":
            return <CampaignForm existingOrg={entity} closeSidebar={closeSidebar} />
    }

}
