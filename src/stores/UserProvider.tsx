import React, { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from 'src/features/users/userServices';
import { getOrganizations } from 'src/features/workspaces/workspaceServices';
import { UserContext } from 'src/stores/contexts';
import type { OrganizationDetailed } from 'src/types/campaigns';
import type { UserData, UserLogin, UserSignup } from 'src/types/users';

export interface UserContextItems {
    userOrganizations: OrganizationDetailed[],
    activeOrganizations: OrganizationDetailed[],
    selectedOrg: OrganizationDetailed | null,
    setSelectedOrg: React.Dispatch<React.SetStateAction<OrganizationDetailed | null>>,
    setOrganizations: React.Dispatch<React.SetStateAction<OrganizationDetailed[]>>,
    fetchOrganizations: () => void,
    user: UserData | null,
    login: (data: UserLogin) => Promise<void>,
    signup: (data: UserSignup) => Promise<void>,
    logout: () => void
}

export const UserProvider = ({ children }: { children: ReactNode }) => {

    const nav = useNavigate()

    const [user, setUser] = useState<UserData | null>(() => {
        const localUser = window.localStorage.getItem("user")
        return localUser ? JSON.parse(localUser) : null
    })

    const [organizations, setOrganizations] = React.useState<OrganizationDetailed[]>([]);

    const fetchOrganizations = () => {
        getOrganizations({ only_active: true, detailed: true, page_size: 0 }).then(orgs => {
            setOrganizations(orgs.items)
        })
    }

    React.useEffect(() => {
        fetchOrganizations()
    }, [])

    /*
    const userOrganizations = useMemo(() => {
        if (!organizations || !user) return []
        const userOrganizationAccessIds = user.organizations_access.map(org => org.organization_id)
        return organizations.filter(org => userOrganizationAccessIds.includes(org.id))
    }, [user, organizations])

        const activeOrganizations = useMemo(() => userOrganizations.filter(org => org.active), [userOrganizations])
    */

    const login = (data: UserLogin) => {
        return loginUser(data).then(user => {
            setUser(user)
        })
    }

    const signup = (data: UserSignup) => {
        return signupUser(data).then(user => {
            setUser(user)
        })
    }

    const logout = () => {
        alert("Logout")
        setUser(null)
        nav("/login")
    }

    useEffect(() => {
        if (user) window.localStorage.setItem("user", JSON.stringify(user))
        else window.localStorage.removeItem("user")
    }, [user])

    const [selectedOrg, setSelectedOrg] = React.useState<OrganizationDetailed | null>(() => {
        const localUser = window.localStorage.getItem("selected_org")
        return localUser ? JSON.parse(localUser) : null
    });

    React.useEffect(() => {
        if (selectedOrg) window.localStorage.setItem("selected_org", JSON.stringify(selectedOrg))
        else window.localStorage.removeItem("selected_org")
    }, [selectedOrg])


    return (
        <UserContext.Provider value={{
            user, login, logout, signup,
            //To Do: Cuando se realice la seguridad en backend, quitar organizations.
            userOrganizations: organizations, activeOrganizations: organizations, selectedOrg, setSelectedOrg, setOrganizations, fetchOrganizations
        }} >
            {children}
        </UserContext.Provider>
    )
}
