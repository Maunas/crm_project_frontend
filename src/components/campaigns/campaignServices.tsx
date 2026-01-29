import axios from "axios"
import { API_BASE_URL } from "../../generalService"
import type { Campaign, CampaignDetailed, CampaignPost, Organization, OrganizationDetailed, OrganizationPost, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"

interface Params {
    detailed?: boolean,
    only_active?: boolean,
    page?: number
}

//Multitipo en Typescript. Se crea un tipo T a partir de Params, si T["detailed"] es verdadero, da el tipo Detailed.
export const getWorkspaces = async<T extends Params>(params: T): Promise<T["detailed"] extends true ? WorkspaceDetailed[] : Workspace[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/workspaces`, { params })
    return wksp.data.items
}

export const createWorkspace = async (body: WorkspacePost): Promise<Workspace> => {
    const wksp = await axios.post(`${API_BASE_URL}/workspaces`, body)
    return wksp.data
}

export const getOrganizations = async<T extends Params>(params: T): Promise<T["detailed"] extends true ? Organization[] : OrganizationDetailed[]> => {
    const org = await axios.get(`${API_BASE_URL}/organizations`, { params })
    return org.data.items
}

export const createOrganization = async (body: OrganizationPost): Promise<Organization> => {
    const org = await axios.post(`${API_BASE_URL}/organizations`, body)
    return org.data
}
export const getCampaigns = async<T extends Params> (params: T): Promise<T["detailed"] extends true ? Campaign[] : CampaignDetailed[]> => {
    const campaigns = await axios.get(`${API_BASE_URL}/campaigns`, {params})
    return campaigns.data.items
}

export const getCampaign = async (id: number): Promise<CampaignDetailed> => {
    const campaign = await axios.get(`${API_BASE_URL}/campaigns/${id}`)
    return campaign.data
}

export const createCampaign = async (body: CampaignPost): Promise<Campaign> => {
    const campaign = await axios.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}


