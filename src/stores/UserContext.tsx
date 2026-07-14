import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getOrganizations } from 'src/features/organizations/organizationServices'
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logout as logoutAPI,
    refreshTokens,
    updateCurrentUser,
    type UserProfileUpdate,
} from 'src/features/auth/userServices'
import { tokenStore } from 'src/lib/tokenStore'
import { accountStore, type SavedAccount } from 'src/lib/accountStore'
import type { Organization, OrganizationDetailed } from 'src/types/campaigns'
import type { TokenResponse, UserData, UserLogin, UserSignup } from 'src/types/users'
import { SUPERUSER } from 'src/utils/constants'

export interface UserContextItems {
    userOrganizations: OrganizationDetailed[],
    activeOrganizations: Organization[],
    activeOrg: Organization | null,
    setActiveOrg: (org: Organization) => void,
    setOrganizations: React.Dispatch<React.SetStateAction<OrganizationDetailed[]>>,
    fetchOrganizations: () => void,
    user: UserData | null,
    isRestoring: boolean,
    login: (data: UserLogin, rememberMe?: boolean) => Promise<void>,
    updateUser: (data: UserProfileUpdate) => Promise<void>,
    refreshUser: () => Promise<void>,
    signup: (data: UserSignup) => Promise<void>,
    logout: () => Promise<void>,
    loadingOrgs: boolean,
    //Si el usuario tiene el permiso (codename, ej "lead:view") en la organización activa. Superusuario -> siempre true,
    //mismo criterio que el backend (User.get_permissions, ver PermissionChecker en app/core/security.py).
    hasPermission: (codename: string) => boolean,
    //Cuentas con las que se inició sesión alguna vez en este navegador (ver src/lib/accountStore.ts), para
    //poder cambiar entre ellas sin volver a loguearse.
    savedAccounts: SavedAccount[],
    switchAccount: (userId: number) => Promise<void>,
    removeSavedAccount: (userId: number) => Promise<void>,
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

    const [organizations, setOrganizations] = React.useState<OrganizationDetailed[]>([])
    const [loadingOrgs, setLoadingOrgs] = useState(false)

    const [isRestoring, setIsRestoring] = useState(
        tokenStore.hasSession() && !tokenStore.getAccessToken()
    )

    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => accountStore.getAll())

    const fetchOrganizations = () => {
        setLoadingOrgs(true)
        getOrganizations({ only_active: true, detailed: true, page_size: 0 })
            .then(orgs => {
                const filtered = orgs.items.filter(o => o.id !== 1)
                setOrganizations(filtered)
                setActiveOrgState(prev => {
                    if (prev?.id === 1) return prev // Panel Global, mantener
                    if (!prev) return filtered[0] ?? null
                    const stillValid = filtered.some(o => o.id === prev.id)
                    return stillValid ? prev : (filtered[0] ?? null)
                })
            })
            .catch(() => {})
            .finally(() => setLoadingOrgs(false))
    }

    // Restaurar sesión al recargar la página
    useEffect(() => {
        if (!tokenStore.hasSession() || tokenStore.getAccessToken()) {
            if (!tokenStore.hasSession() && user) {
                localStorage.removeItem("user")
                setUser(null)
            }
            return
        }
        let refreshedTokens: TokenResponse
        refreshTokens(tokenStore.getRefreshToken()!)
            .then(tokens => {
                refreshedTokens = tokens
                tokenStore.setTokens(tokens.access_token, tokens.refresh_token, tokenStore.isRemembered())
                return getCurrentUser()
            })
            .then(userData => {
                accountStore.upsert({
                    userId: userData.id, name: userData.name, last_name: userData.last_name,
                    email: userData.email, refreshToken: refreshedTokens.refresh_token,
                })
                setSavedAccounts(accountStore.getAll())
                setUser(userData)
                if (userData.is_superuser) setActiveOrgState(prev => prev ?? SUPERUSER)
                fetchOrganizations()
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

    const activeOrganizations = useMemo(() => {
        const active = organizations.filter(org => org.active) as Organization[]
        if (user?.is_superuser) active.push(SUPERUSER)
        return active
    }, [organizations, user])

    const [activeOrg, setActiveOrgState] = React.useState<Organization | null>(() => {
        try {
            const stored = window.localStorage.getItem("selected_org")
            return stored ? JSON.parse(stored) : null
        } catch {
            localStorage.removeItem("selected_org")
            return null
        }
    })

    const setActiveOrg = (org: Organization) => setActiveOrgState(org)

    React.useEffect(() => {
        if (activeOrg) window.localStorage.setItem("selected_org", JSON.stringify(activeOrg))
        else window.localStorage.removeItem("selected_org")
    }, [activeOrg])

    const login = async (data: UserLogin, rememberMe = true) => {
        const tokens = await loginUser(data)
        tokenStore.setTokens(tokens.access_token, tokens.refresh_token, rememberMe)
        const userData = await getCurrentUser()
        accountStore.upsert({
            userId: userData.id, name: userData.name, last_name: userData.last_name,
            email: userData.email, refreshToken: tokens.refresh_token,
        })
        setSavedAccounts(accountStore.getAll())
        setUser(userData)
        //Se resetea (en vez de mantener lo que hubiera de una cuenta anterior, ej al usar "Agregar cuenta")
        //para no arrastrar una organización que no le pertenece a esta cuenta.
        setActiveOrgState(userData.is_superuser ? SUPERUSER : null)
        fetchOrganizations()
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
        accountStore.upsert({
            userId: userData.id, name: userData.name, last_name: userData.last_name,
            email: userData.email, refreshToken: tokens.refresh_token,
        })
        setSavedAccounts(accountStore.getAll())
        setUser(userData)
        setActiveOrgState(userData.is_superuser ? SUPERUSER : null)
        fetchOrganizations()
    }

    const hasPermission = (codename: string): boolean => {
        if (!user) return false
        if (user.is_superuser) return true
        const orgAccess = user.organizations_access.find(oa => oa.organization_id === activeOrg?.id)
        return orgAccess?.permission_objects?.some(perm => perm.codename === codename) ?? false
    }

    //Pasa a otra cuenta ya guardada (ver src/lib/accountStore.ts) sin pedir contraseña: refresca su token,
    //lo activa en tokenStore, y carga los datos/organizaciones de esa cuenta. Si su refresh token guardado
    //ya no sirve (revocado o expirado), se descarta de la lista de cuentas guardadas y se reporta el error.
    const switchAccount = async (userId: number) => {
        const account = accountStore.getAll().find(a => a.userId === userId)
        if (!account) return
        try {
            const tokens = await refreshTokens(account.refreshToken)
            tokenStore.setTokens(tokens.access_token, tokens.refresh_token, tokenStore.isRemembered())
            accountStore.upsert({ ...account, refreshToken: tokens.refresh_token })
            setSavedAccounts(accountStore.getAll())
            const userData = await getCurrentUser()
            setUser(userData)
            setActiveOrgState(userData.is_superuser ? SUPERUSER : null)
            fetchOrganizations()
        } catch (e) {
            accountStore.remove(userId)
            setSavedAccounts(accountStore.getAll())
            throw e
        }
    }

    //Saca una cuenta de la lista de "recordadas" sin cambiarse a ella (ej un botón "quitar" en el selector
    //de cuentas). Si se intenta quitar la cuenta ACTIVA, se comporta como logout (no puede quedar a medias).
    const removeSavedAccount = async (userId: number) => {
        if (userId === user?.id) return logout()
        const account = accountStore.getAll().find(a => a.userId === userId)
        accountStore.remove(userId)
        setSavedAccounts(accountStore.getAll())
        if (account) {
            try { await logoutAPI(account.refreshToken) } catch { /* ignorar */ }
        }
    }

    //Cierra SOLO la cuenta activa: la saca de las cuentas guardadas y revoca su refresh token. Si queda
    //alguna otra cuenta guardada, pasa a ella automáticamente (no hace falta volver a loguearse); si no
    //queda ninguna, recién ahí se limpia todo y el usuario termina en /login.
    const logout = async () => {
        const currentUserId = user?.id
        const refreshToken = tokenStore.getRefreshToken()
        if (refreshToken) {
            try { await logoutAPI(refreshToken) } catch { /* ignorar */ }
        }
        if (currentUserId !== undefined) {
            accountStore.remove(currentUserId)
            setSavedAccounts(accountStore.getAll())
        }

        const clearEverything = () => {
            tokenStore.clear()
            localStorage.removeItem("user")
            localStorage.removeItem("selected_org")
            setUser(null)
            setOrganizations([])
            setActiveOrgState(null)
        }

        const [nextAccount] = accountStore.getAll()
        if (nextAccount) {
            return switchAccount(nextAccount.userId).catch(clearEverything)
        }
        clearEverything()
    }

    return (
        <UserContext.Provider value={{
            userOrganizations: organizations,
            activeOrganizations,
            activeOrg,
            setActiveOrg,
            setOrganizations,
            fetchOrganizations,
            user,
            isRestoring,
            login,
            updateUser,
            signup,
            logout,
            refreshUser,
            loadingOrgs,
            hasPermission,
            savedAccounts,
            switchAccount,
            removeSavedAccount,
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
