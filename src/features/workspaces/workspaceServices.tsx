import type { DeleteResponse, EnableResponse, Paginable, WorkspaceParams } from "src/types/shared"
import type { Workspace, WorkspaceDetailed, WorkspacePost } from "src/types/campaigns"
import axiosCRM from "src/lib/axios"

export const getWorkspaces = async<T extends WorkspaceParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? WorkspaceDetailed : Workspace>> => {
    const wsp = await axiosCRM.get(`workspaces`, { params })
    return wsp.data
}
// id es el public_uuid del workspace (rutas genéricas de BaseController, ver backend/AGENTS.md §17-18).
export const getWorkspace = async (id: string): Promise<WorkspaceDetailed> => {
    const wsp = await axiosCRM.get(`workspaces/${id}`)
    return wsp.data
}
export const createWorkspace = async (body: WorkspacePost): Promise<WorkspaceDetailed> => {
    const wsp = await axiosCRM.post(`workspaces`, body)
    return wsp.data
}
export const updateWorkspace = async (body: WorkspacePost, id: string): Promise<WorkspaceDetailed> => {
    const wsp = await axiosCRM.put(`workspaces/${id}`, body)
    return wsp.data
}

export const disableWorkspace = async (id: string): Promise<DeleteResponse> => {
    const org = await axiosCRM.delete(`workspaces/${id}`)
    return org.data
}
export const enableWorkspace = async (id: string): Promise<EnableResponse> => {
    const org = await axiosCRM.put(`workspaces/active/${id}`)
    return org.data
}