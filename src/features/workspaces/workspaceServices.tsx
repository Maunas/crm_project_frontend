import axios from "axios"
import type { DeleteResponse, EnableResponse, ListParams, Paginable, WorkspaceParams } from "../../types/shared"
import type { Organization, OrganizationDetailed, OrganizationPost, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import axiosCRM from "src/lib/axios"

/**************************** Organizations ****************************/
//Multitipo en Typescript. Se crea un tipo T a partir de Params, si T["detailed"] es verdadero, da el tipo Detailed.
export const getOrganizations = async<T extends ListParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? OrganizationDetailed : Organization>> => {
    const org = await axios.get(`organizations`, { params })
    return org.data
}
export const getOrganization = async (id: number): Promise<OrganizationDetailed> => {
    const org = await axios.get(`organizations/${id}`)
    return org.data
}
export const createOrganization = async (body: OrganizationPost): Promise<OrganizationDetailed> => {
    const org = await axios.post(`organizations`, body)
    return org.data
}
export const updateOrganization = async (body: OrganizationPost, id: number): Promise<OrganizationDetailed> => {
    const org = await axios.put(`organizations/${id}`, body)
    return org.data
}
export const disableOrganization = async (id: number): Promise<DeleteResponse> => {
    const org = await axios.delete(`organizations/${id}`)
    return org.data
}
export const enableOrganization = async (id: number): Promise<EnableResponse> => {
    const org = await axios.put(`organizations/active/${id}`)
    return org.data
}
/******************************** Workspaces ************************************/
export const getWorkspaces = async<T extends WorkspaceParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? WorkspaceDetailed : Workspace>> => {
    const wsp = await axiosCRM.get(`workspaces`, { params })
    return wsp.data
}
export const getWorkspace = async (id: number): Promise<WorkspaceDetailed> => {
    const wsp = await axiosCRM.get(`workspaces/${id}`)
    return wsp.data
}
export const createWorkspace = async (body: WorkspacePost): Promise<WorkspaceDetailed> => {
    const wsp = await axiosCRM.post(`workspaces`, body)
    return wsp.data
}
export const updateWorkspace = async (body: WorkspacePost, id: number): Promise<WorkspaceDetailed> => {
    const wsp = await axiosCRM.put(`workspaces/${id}`, body)
    return wsp.data
}

export const disableWorkspace = async (id: number): Promise<DeleteResponse> => {
    const org = await axiosCRM.delete(`workspaces/${id}`)
    return org.data
}
export const enableWorkspace = async (id: number): Promise<EnableResponse> => {
    const org = await axiosCRM.put(`workspaces/active/${id}`)
    return org.data
}