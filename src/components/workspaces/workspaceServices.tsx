import axios from "axios"
import { API_BASE_URL } from "../../generalService"
import type { DeleteResponse, EnableResponse, ListParams, Paginable, WorkspaceParams } from "../../types/common"
import type { Organization, OrganizationDetailed, OrganizationPost, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"

/**************************** Organizations ****************************/
//Multitipo en Typescript. Se crea un tipo T a partir de Params, si T["detailed"] es verdadero, da el tipo Detailed.
export const getOrganizations = async<T extends ListParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? OrganizationDetailed : Organization>> => {
    const org = await axios.get(`${API_BASE_URL}/organizations`, { params })
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
/******************************** Workspaces ************************************/
export const getWorkspaces = async<T extends WorkspaceParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? WorkspaceDetailed : Workspace>> => {
    const wsp = await axios.get(`${API_BASE_URL}/workspaces`, { params })
    return wsp.data
}
export const getWorkspace = async (id: number): Promise<WorkspaceDetailed> => {
    const wsp = await axios.get(`${API_BASE_URL}/workspaces/${id}`)
    return wsp.data
}
export const createWorkspace = async (body: WorkspacePost): Promise<WorkspaceDetailed> => {
    const wsp = await axios.post(`${API_BASE_URL}/workspaces`, body)
    return wsp.data
}
export const updateWorkspace = async (body: WorkspacePost, id: number): Promise<WorkspaceDetailed> => {
    const wsp = await axios.put(`${API_BASE_URL}/workspaces/${id}`, body)
    return wsp.data
}

export const disableWorkspace = async (id: number): Promise<DeleteResponse> => {
    const org = await axios.delete(`${API_BASE_URL}/workspaces/${id}`)
    return org.data
}
export const enableWorkspace = async (id: number): Promise<EnableResponse> => {
    const org = await axios.put(`${API_BASE_URL}/workspaces/active/${id}`)
    return org.data
}