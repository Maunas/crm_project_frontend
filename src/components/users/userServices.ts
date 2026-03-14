import type { Paginable } from "../../types/common"
import { API_BASE_URL, axiosCRM } from "../../generalService"
import type { UserData, UserLogin } from "../../types/users"

export const getUsers = async ():
    Promise<Paginable<UserData>> => {
    const org = await axiosCRM.get(`${API_BASE_URL}/users`)
    return org.data
}
export const loginUser = async (data: UserLogin): Promise<UserData> => {
    const users = await getUsers()
    if (data.password !== "PASSWORD") throw new Error("Contraseña incorrecta.")
    const foundUser = users.items.find(user => user.email === data.email )
    if (foundUser) return foundUser
    throw new Error("Usuario o contraseña incorrecta.")
}