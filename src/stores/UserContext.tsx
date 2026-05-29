import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getOrganizations } from 'src/features/organizations/organizationServices';
import { loginUser, signupUser } from 'src/features/auth/userServices';
import type { Organization, OrganizationDetailed } from 'src/types/campaigns';
import type { UserData, UserLogin, UserSignup } from 'src/types/users';
import { SUPERUSER } from 'src/utils/constants';
import { showCommonErrorToast, showToast } from 'src/utils/feedback';
import { useLoading } from 'src/hooks/useLoading';

export interface UserContextItems {
    userOrganizations: OrganizationDetailed[],
    activeOrganizations: Organization[],
    activeOrg: Organization | null,
    setActiveOrg: (org: Organization) => void,
    setOrganizations: React.Dispatch<React.SetStateAction<OrganizationDetailed[]>>,
    fetchOrganizations: () => Promise<unknown>,
    user: UserData | null,
    login: (data: UserLogin) => Promise<void>,
    signup: (data: UserSignup) => Promise<void>,
    logout: () => void,
    loadingOrgs: boolean
}

const UserContext = createContext<UserContextItems | undefined>({} as UserContextItems)

export const UserProvider = ({ children }: { children?: ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(() => {
        const localUser = window.localStorage.getItem("user")
        return localUser ? JSON.parse(localUser) : null
    })

    const [organizations, setOrganizations] = React.useState<OrganizationDetailed[]>([]);

    const fetchOrganizations = useCallback(() => {
        return getOrganizations({ only_active: false, detailed: true, page_size: 0 })
            .then(orgs => setOrganizations(orgs.items))
            .catch(e => showCommonErrorToast(e))
    }, [])

    const { loading: loadingOrgs, fnWithLoading: fetchOrgLoad } = useLoading(fetchOrganizations)

    React.useEffect(() => {
        fetchOrgLoad()
    }, [fetchOrgLoad])

    /*
    const userOrganizations = useMemo(() => {
        if (!organizations || !user) return []
        const userOrganizationAccessIds = user.organizations_access.map(org => org.organization_id)
        return organizations.filter(org => userOrganizationAccessIds.includes(org.id))
    }, [user, organizations])
    */

    const activeOrganizations = useMemo(() => {
        const active = organizations.filter(org => org.active) as Organization[]
        active.push(SUPERUSER)
        return active
    }, [organizations])

    useEffect(() => {
        if (user) window.localStorage.setItem("user", JSON.stringify(user))
        else window.localStorage.removeItem("user")
    }, [user])

    const [activeOrg, setActiveOrg] = React.useState<Organization | null>(() => {
        const localUser = window.localStorage.getItem("selected_org")
        return localUser ? JSON.parse(localUser) : null
    });

    const changeActiveOrg = (org: Organization) => {
        setActiveOrg(org)
        showToast(`Se ha cambiado de organización activa a "${org.name}"`, "info")
    }

    React.useEffect(() => {
        if (activeOrg) window.localStorage.setItem("selected_org", JSON.stringify(activeOrg))
        else window.localStorage.removeItem("selected_org")
    }, [activeOrg])

    const login = (data: UserLogin) => {
        return loginUser(data).then(user => {
            setUser(user)
            setActiveOrg(activeOrganizations[0])
            showToast("Sesión iniciada con éxito", "success")
        })
    }

    const signup = (data: UserSignup) => {
        return signupUser(data).then(user => {
            setUser(user)
            setActiveOrg(activeOrganizations[0])
            showToast("Cuenta creada con éxito", "success")
        })
    }

    const logout = () => {
        showToast("Sesión cerrada con éxito", "success")
        setUser(null)
        setActiveOrg(null)
    }

    return (
        <UserContext.Provider value={{
            user, login, logout, signup,
            //To Do: Cuando se realice la seguridad en backend, quitar organizations.
            userOrganizations: organizations, activeOrganizations,
            activeOrg, setActiveOrg: changeActiveOrg,
            setOrganizations, fetchOrganizations: fetchOrgLoad, loadingOrgs
        }} >
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useContext debe usarse dentro de un UserContextProvider');
    }
    return context;
};