import React, { useMemo, type ReactNode } from 'react'
import type { OrganizationDetailed } from '../../types/campaigns';
import { getOrganizations } from '../workspaces/workspaceServices';
import { UserContext } from '../common/contexts';

export interface UserContextItems {
    organizations: OrganizationDetailed[],
    activeOrganizations: OrganizationDetailed[],
    selectedOrgId: number | null,
    setSelectedOrgId: React.Dispatch<React.SetStateAction<number | null>>,
    updateOrganizations: (newOrganizationList: OrganizationDetailed[]) => void,
    fetchOrganizations: () => void
}

export const UserProvider = ({ children }: { children: ReactNode }) => {

    const getSelectedId = () => {
        const id = window.localStorage.getItem("organization_id")
        if (id) return Number(id)
        return null
    }

    const [organizations, setOrganizations] = React.useState<OrganizationDetailed[]>([]);
    const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(getSelectedId());

    const fetchOrganizations = () => {
        getOrganizations({ only_active: true, detailed: true, page_size: 0 }).then(orgs => {
            setOrganizations(orgs.items)
            if (orgs.items.length > 0) setSelectedOrgId(prev => prev ? prev : orgs.items[0].id)
        })
    }

    React.useEffect(() => {
        fetchOrganizations()
    }, [])

    const activeOrganizations = useMemo(() => organizations.filter(org => org.active), [organizations])

    React.useEffect(() => {
        if (selectedOrgId) window.localStorage.setItem("organization_id", `${selectedOrgId}`)
        else window.localStorage.removeItem("organization_id")
    }, [selectedOrgId])

    const updateOrganizations = (newOrganizationList: OrganizationDetailed[]) => {
        setOrganizations(newOrganizationList)
    }

    return (
        <UserContext.Provider value={{
            organizations, activeOrganizations, selectedOrgId, setSelectedOrgId, updateOrganizations, fetchOrganizations
        }} >
            {children}
        </UserContext.Provider>
    )
}
