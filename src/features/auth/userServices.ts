import type { Paginable } from "src/types/shared"
import type { TokenResponse, UserData, UserLogin, UserSignup } from "src/types/users"
import axiosCRM from "src/lib/axios"

export const getUsers = async (): Promise<Paginable<UserData>> => {
    const res = await axiosCRM.get("users")
    return res.data
}

export const loginUser = async (data: UserLogin): Promise<TokenResponse> => {
    const res = await axiosCRM.post("/auth/login", {
        email: data.email,
        password: data.password,
    })
    return res.data
}

export const registerUser = async (data: UserSignup): Promise<TokenResponse> => {
    const res = await axiosCRM.post("/auth/register", {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
    })
    return res.data
}

export const getCurrentUser = async (): Promise<UserData> => {
    const res = await axiosCRM.get("/auth/me")
    return res.data
}

export const refreshTokens = async (refreshToken: string): Promise<TokenResponse> => {
    const res = await axiosCRM.post("/auth/refresh", { refresh_token: refreshToken })
    return res.data
}

export const logout = async (refreshToken: string): Promise<void> => {
    await axiosCRM.post("/auth/logout", { refresh_token: refreshToken })
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await axiosCRM.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
    })
}

export interface UserProfileUpdate {
    name?: string
    last_name?: string
    email?: string
    phone?: string
    date_of_birth?: string
}

export const updateCurrentUser = async (data: UserProfileUpdate): Promise<void> => {
    await axiosCRM.put("/auth/me", data)
}

// aliases
export const signupUser = registerUser
export const logoutUser = logout
