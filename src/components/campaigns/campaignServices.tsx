import axios from "axios"
import { API_BASE_URL, orderList } from "../../generalService"
import type { Campaign, CampaignDetailed, CampaignPost, Organization, OrganizationDetailed, OrganizationPost, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"
import type { Paginable } from "../../types/common"

interface Params {
    detailed?: boolean,
    only_active?: boolean,
    page?: number,
    page_size?: number
}

/**************************** Organizations ****************************/
//Multitipo en Typescript. Se crea un tipo T a partir de Params, si T["detailed"] es verdadero, da el tipo Detailed.
export const getOrganizations = async<T extends Params>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? OrganizationDetailed : Organization>> => {
    const org = await axios.get(`${API_BASE_URL}/organizations`, { params })
    return { ...org.data, items: orderList(org.data.items, "id") }
}
export const createOrganization = async (body: OrganizationPost): Promise<OrganizationDetailed> => {
    const org = await axios.post(`${API_BASE_URL}/organizations`, body)
    return org.data
}
export const updateOrganization = async (body: OrganizationPost, id: number): Promise<OrganizationDetailed> => {
    const org = await axios.put(`${API_BASE_URL}/organizations/${id}`, body)
    return org.data
}
export const disableOrganization = async (id: number): Promise<{action:string}> => {
    const org = await axios.delete(`${API_BASE_URL}/organizations/${id}`)
    return org.data
}
export const enableOrganization = async (id: number): Promise<{actived:boolean}> => {
    const org = await axios.put(`${API_BASE_URL}/organizations/active/${id}`)
    return org.data
}
export const getWorkspaces = async<T extends Params>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? WorkspaceDetailed : Workspace>> => {
    const wksp = await axios.get(`${API_BASE_URL}/workspaces`, { params })
    return {...wksp.data, items: orderList(wksp.data.items, "id")}
}

export const createWorkspace = async (body: WorkspacePost): Promise<WorkspaceDetailed> => {
    const wksp = await axios.post(`${API_BASE_URL}/workspaces`, body)
    return wksp.data
}

export const updateWorkspace = async (body: WorkspacePost, id: number): Promise<WorkspaceDetailed> => {
    const wksp = await axios.put(`${API_BASE_URL}/workspaces/${id}`, body)
    return wksp.data
}
export const getCampaigns = async<T extends Params>(params?: T): Promise<T["detailed"] extends true ? Campaign[] : CampaignDetailed[]> => {
    const campaigns = await axios.get(`${API_BASE_URL}/campaigns`, { params })
    return orderList(campaigns.data.items, "id") as (T["detailed"] extends true ? Campaign[] : CampaignDetailed[])
}

export const getCampaign = async (id: number): Promise<CampaignDetailed> => {
    const campaign = await axios.get(`${API_BASE_URL}/campaigns/${id}`)
    return campaign.data
}

export const createCampaign = async (body: CampaignPost): Promise<CampaignDetailed> => {
    const campaign = await axios.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}

export const updateCampaign = async (body: CampaignPost, id: number): Promise<CampaignDetailed> => {
    const campaign = await axios.put(`${API_BASE_URL}/campaigns/${id}`, body)
    return campaign.data
}


