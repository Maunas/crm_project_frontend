import type { Organization } from "src/types/campaigns"
import axios from "axios"
import { tokenStore } from "./tokenStore"

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export const axiosCRM = axios.create({
    baseURL: API_BASE_URL,
})

export default axiosCRM

// ── Request interceptor ───────────────────────────────────────────────────
axiosCRM.interceptors.request.use(config => {
    const storageOrg = window.localStorage.getItem("selected_org")
    if (storageOrg) {
        try {
            const org: Organization = JSON.parse(storageOrg)
            if (org) config.headers["X-Organization-Id"] = org.id
        } catch {
            localStorage.removeItem("selected_org")
        }
    }
    const token = tokenStore.getAccessToken()
    if (token) config.headers["Authorization"] = `Bearer ${token}`
    return config
}, error => Promise.reject(error))

// ── Response interceptor — refresh token ─────────────────────────────────
let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processPendingQueue(error: unknown, newToken: string | null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(newToken!)
    })
    pendingQueue = []
}

const NO_RETRY_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]

axiosCRM.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config
        if (!originalRequest) return Promise.reject(error)

        const skipRefresh = NO_RETRY_PATHS.some(p => originalRequest.url === p)
        if (error.response?.status !== 401 || originalRequest._retry || skipRefresh) {
            return Promise.reject(error)
        }

        const refreshToken = tokenStore.getRefreshToken()
        if (!refreshToken) {
            if (window.location.pathname !== "/login") window.location.href = "/login"
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject })
            }).then(newToken => {
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`
                return axiosCRM(originalRequest)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const { refreshTokens } = await import("src/features/auth/userServices")
            const tokens = await refreshTokens(refreshToken)
            tokenStore.setTokens(tokens.access_token, tokens.refresh_token, tokenStore.isRemembered())
            processPendingQueue(null, tokens.access_token)
            originalRequest.headers["Authorization"] = `Bearer ${tokens.access_token}`
            return axiosCRM(originalRequest)
        } catch (refreshError) {
            processPendingQueue(refreshError, null)
            tokenStore.clear()
            if (window.location.pathname !== "/login") window.location.href = "/login"
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)
