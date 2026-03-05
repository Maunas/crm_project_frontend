import { createContext } from "react";
import type { OrganizationDetailed } from "../../types/campaigns";

export interface UserContextItems {
    organizations: OrganizationDetailed[],
     selectedOrgId: number | null,
     setSelectedOrgId: React.Dispatch<React.SetStateAction<number | null>>,
     updateOrganizations: (newOrganizationList: OrganizationDetailed[]) => void
}
export const UserContext = createContext<UserContextItems>({} as UserContextItems)