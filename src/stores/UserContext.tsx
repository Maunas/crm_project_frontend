import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getOrganizations } from 'src/features/organizations/organizationServices'
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logout as logoutAPI,
    updateCurrentUser,
    type UserProfileUpdate,
} from 'src/features/auth/userServices'
import { tokenStore } from 'src/lib/tokenStore'
import axios from 'axios'
import { API_BASE_URL } from 'src/lib/axios'
import type { Organization } from 'src/types/campaigns'
import type { UserData, UserLogin, UserSignup } from 'src/types/users'
import { SUPERUSER } from 'src/utils/constants'
import { showCommonErrorToast } from 'src/utils/feedback'

export interface UserContextItems {
    orgHeaderList: Organization[],
    activeOrg: Organization | null,
    setActiveOrg: (org: Organization) => void,
    fetchOrgHeaderList: () => void,
    user: UserData | null,
    isRestoring: boolean,
    login: (data: UserLogin, rememberMe?: boolean) => Promise<void>,
    updateUser: (data: UserProfileUpdate) => Promise<void>,
    refreshUser: () => Promise<void>,
    signup: (data: UserSignup) => Promise<void>,
    logout: () => Promise<void>,
    loadingOrgs: boolean,
    hasOneActiveOrg: boolean
}

const UserContext = createContext<UserContextItems | undefined>(undefined)

export const UserProvider = ({ children }: { children?: ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(() => {
        if (!tokenStore.hasSession()) return null
        try {
            const stored = window.localStorage.getItem("user")
            return stored ? JSON.parse(stored) : null
        } catch {
            localStorage.removeItem("user")
            return null
        }
    })

    const [orgHeaderList, setOrgHeaderList] = React.useState<Organization[]>([])
    const [loadingOrgs, setLoadingOrgs] = useState(false)

    const [isRestoring, setIsRestoring] = useState(
        tokenStore.hasSession() && !tokenStore.getAccessToken()
    )

    const fetchOrgHeaderList = useCallback(() => {
        setLoadingOrgs(true)
        getOrganizations({ only_active: true, detailed: false, page_size: 0 })
            .then(orgs => {
                setOrgHeaderList(orgs.items)
                setActiveOrgState(prev => {
                    if (prev?.id === 1) return prev // Panel Global, mantener
                    if (!prev) return orgs.items[0] ?? null
                    const stillValid = orgs.items.some(o => o.id === prev.id)
                    return stillValid ? prev : (orgs.items[0] ?? null)
                })
            })
            .catch((e) => { showCommonErrorToast(e, "Error obteniendo organizaciones") })
            .finally(() => setLoadingOrgs(false))
    }, [])

    // Restaurar sesión al recargar la página
    useEffect(() => {
        if (!tokenStore.hasSession() || tokenStore.getAccessToken()) {
            if (!tokenStore.hasSession() && user) {
                localStorage.removeItem("user")
                setUser(null)
            }
            return
        }
        axios
            .post(`${API_BASE_URL}/auth/refresh`, { refresh_token: tokenStore.getRefreshToken()! })
            .then(({ data }) => {
                tokenStore.setTokens(data.access_token, data.refresh_token, tokenStore.isRemembered())
                return getCurrentUser()
            })
            .then(userData => {
                setUser(userData)
                if (userData.is_superuser) setActiveOrgState(prev => prev ?? SUPERUSER)
                fetchOrgHeaderList()
            })
            .catch(() => {
                tokenStore.clear()
                localStorage.removeItem("user")
                setUser(null)
            })
            .finally(() => setIsRestoring(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (user) window.localStorage.setItem("user", JSON.stringify(user))
        else window.localStorage.removeItem("user")
    }, [user])


    const [activeOrg, setActiveOrgState] = useState<Organization | null>(() => {
        try {
            const stored = window.localStorage.getItem("selected_org")
            return stored ? JSON.parse(stored) : null
        } catch {
            localStorage.removeItem("selected_org")
            return null
        }
    })

    const setActiveOrg = (org: Organization) => setActiveOrgState(org)

    useEffect(() => {
        if (activeOrg) window.localStorage.setItem("selected_org", JSON.stringify(activeOrg))
        else window.localStorage.removeItem("selected_org")
    }, [activeOrg])

    const login = async (data: UserLogin, rememberMe = true) => {
        const tokens = await loginUser(data)
        tokenStore.setTokens(tokens.access_token, tokens.refresh_token, rememberMe)
        const userData = await getCurrentUser()
        setUser(userData)
        if (userData.is_superuser) setActiveOrgState(prev => prev ?? SUPERUSER)
        fetchOrgHeaderList()
    }

    const updateUser = async (data: UserProfileUpdate) => {
        await updateCurrentUser(data)
        const updated = await getCurrentUser()
        setUser(updated)
    }

    const refreshUser = async () => {
        const updated = await getCurrentUser()
        setUser(updated)
    }

    const signup = async (data: UserSignup) => {
        if (data.password !== data.repeat_password) throw new Error("Las contraseñas no coinciden.")
        const tokens = await registerUser(data)
        tokenStore.setTokens(tokens.access_token, tokens.refresh_token, false)
        const userData = await getCurrentUser()
        setUser(userData)
        if (userData.is_superuser) setActiveOrgState(prev => prev ?? SUPERUSER)
        fetchOrgHeaderList()
    }

    const logout = async () => {
        const refreshToken = tokenStore.getRefreshToken()
        if (refreshToken) {
            try { await logoutAPI(refreshToken) } catch { /* ignorar */ }
        }
        tokenStore.clear()
        localStorage.removeItem("user")
        localStorage.removeItem("selected_org")
        setUser(null)
        fetchOrgHeaderList()
        setActiveOrgState(null)
    }

    const hasOneActiveOrg = orgHeaderList && orgHeaderList?.length <= 1

    return (
        <UserContext.Provider value={{
            orgHeaderList,
            activeOrg,
            setActiveOrg,
            fetchOrgHeaderList,
            user,
            isRestoring,
            login,
            updateUser,
            signup,
            logout,
            refreshUser,
            loadingOrgs,
            hasOneActiveOrg
        }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUserContext() {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error("useUserContext must be used within UserProvider")
    return ctx
}
