const REFRESH_KEY = "refresh_token"
const REMEMBER_KEY = "auth_remember"

let _accessToken: string | null = null

export const tokenStore = {
    getAccessToken(): string | null {
        return _accessToken
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY)
    },

    isRemembered(): boolean {
        return localStorage.getItem(REMEMBER_KEY) === "true"
    },

    hasSession(): boolean {
        return this.getRefreshToken() !== null
    },

    setTokens(accessToken: string, refreshToken: string, remember = true) {
        _accessToken = accessToken
        const storage = remember ? localStorage : sessionStorage
        const other = remember ? sessionStorage : localStorage
        other.removeItem(REFRESH_KEY)
        storage.setItem(REFRESH_KEY, refreshToken)
        localStorage.setItem(REMEMBER_KEY, String(remember))
    },

    clear() {
        _accessToken = null
        localStorage.removeItem(REFRESH_KEY)
        sessionStorage.removeItem(REFRESH_KEY)
        localStorage.removeItem(REMEMBER_KEY)
    },
}
