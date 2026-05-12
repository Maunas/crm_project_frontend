import type { Organization, OrganizationDetailed, OrganizationPost } from "src/types/campaigns"
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared"
import { API_BASE_URL } from "src/lib/axios"
import axios from "axios"

//Multitipo en Typescript. Se crea un tipo T a partir de Params, si T["detailed"] es verdadero, da el tipo Detailed.
export const getOrganizations = async<T extends ListParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? OrganizationDetailed : Organization>> => {
    const org = await axios.get(`${API_BASE_URL}/organizations`, { params })
    return org.data
}
export const getOrganization = async (id: number): Promise<OrganizationDetailed> => {
    const org = await axios.get(`${API_BASE_URL}/organizations/${id}`)
    return org.data
}
export const createOrganization = async (body: OrganizationPost): Promise<OrganizationDetailed> => {
    const org = await axios.post(`${API_BASE_URL}/organizations`, body)
    return org.data
}
export const updateOrganization = async (body: OrganizationPost, id: number): Promise<OrganizationDetailed> => {
    const org = await axios.put(`${API_BASE_URL}/organizations/${id}`, body)
    return org.data
}
export const disableOrganization = async (id: number): Promise<DeleteResponse> => {
    const org = await axios.delete(`${API_BASE_URL}/organizations/${id}`)
    return org.data
}
export const enableOrganization = async (id: number): Promise<EnableResponse> => {
    const org = await axios.put(`${API_BASE_URL}/organizations/active/${id}`)
    return org.data
}