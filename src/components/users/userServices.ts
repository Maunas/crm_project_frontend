import type { UserData, UserLogin, UserSignup } from "../../types/users"
import type { Paginable } from "../../types/common"
import { API_BASE_URL, axiosCRM } from "../../generalService"

export const getUsers = async ():
    Promise<Paginable<UserData>> => {
    const org = await axiosCRM.get(`${API_BASE_URL}/users`)
    return org.data
}
export const loginUser = async (data: UserLogin): Promise<UserData> => {
    const users = await getUsers()
    return users.items[0]
    //if (data.password !== "PASSWORD") throw new Error("Contraseña incorrecta.")
    //const foundUser = users.items.find(user => user.email === data.email)
    //if (foundUser) return foundUser
    //throw new Error("Usuario o contraseña incorrecta.")
}
export const signupUser = async (data: UserSignup): Promise<UserData> => {
    if (data.password !== data.repeat_password) throw new Error("Las contraseñas no coinciden.")
    const users = await getUsers()
    return users.items[0]
}