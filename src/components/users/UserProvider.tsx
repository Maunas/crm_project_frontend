import React, { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { OrganizationDetailed } from '../../types/campaigns';
import { getOrganizations } from '../workspaces/workspaceServices';
import { UserContext } from '../common/contexts';
import type { UserData, UserLogin } from '../../types/users';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './userServices';

export interface UserContextItems {
    organizations: OrganizationDetailed[],
    activeOrganizations: OrganizationDetailed[],
    selectedOrgId: number | null,
    setSelectedOrgId: React.Dispatch<React.SetStateAction<number | null>>,
    updateOrganizations: (newOrganizationList: OrganizationDetailed[]) => void,
    fetchOrganizations: () => void,
    user: UserData | null,
    login: (data: UserLogin) => void,
    logout: () => void
}

export const UserProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(JSON.parse(window.localStorage.getItem("user") ?? "null"))
    const nav = useNavigate()

    useEffect(()=>{
        if (user) window.localStorage.setItem("user", JSON.stringify(user))
        else window.localStorage.removeItem("user")
    },[user])

    const login = (data: UserLogin) => {
        alert("Login")
        loginUser(data).then(setUser)
    }

    const logout = () => {
        alert("Logout")
        setUser(null)
        nav("/login")
    }

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
            user, login, logout,
            organizations, activeOrganizations, selectedOrgId, setSelectedOrgId, updateOrganizations, fetchOrganizations
        }} >
            {children}
        </UserContext.Provider>
    )
}
