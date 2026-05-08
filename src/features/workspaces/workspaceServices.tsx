import type { DeleteResponse, EnableResponse, Paginable, WorkspaceParams } from "../../types/shared"
import type { Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import axiosCRM from "src/lib/axios"

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