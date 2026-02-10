import type { CampaignDetailed, OrganizationDetailed, WorkspaceDetailed } from "../../types/campaigns"
import { CampaignForm, OrganizationForm, WorkspaceForm } from "./CampaignForms"

interface SidebarProps {
    mode: string | null,
    entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
    closeSidebar: () => void,
    createEntityOnList: (
        entity: OrganizationDetailed | WorkspaceDetailed | CampaignDetailed | null,
        mode: string | null,
    ) => void
}
export const CampaignSidebar = ({ mode, entity, closeSidebar, createEntityOnList }: SidebarProps) => {

    switch (mode) {
        case "CREATE_ORG":
            return <OrganizationForm closeSidebar={closeSidebar} 
            createEntityOnList={(entity)=>createEntityOnList(entity, mode)}/>
        case "CREATE_WSP":
            return <WorkspaceForm closeSidebar={closeSidebar} 
            createEntityOnList={(entity)=>createEntityOnList(entity, mode)} />
        case "CREATE_CMP":
            return <CampaignForm closeSidebar={closeSidebar}
            createEntityOnList={(entity)=>createEntityOnList(entity, mode)} />
        case "UPDATE_ORG":
            return <OrganizationForm existingOrg={entity} closeSidebar={closeSidebar} />
        case "UPDATE_WSP":
            return <WorkspaceForm existingOrg={entity} closeSidebar={closeSidebar} />
        case "UPDATE_CMP":
            return <CampaignForm existingOrg={entity} closeSidebar={closeSidebar} />
    }

}
