import axios from "axios"
import { API_BASE_URL } from "../../generalService"
import type { Campaign, CampaignDetailed, CampaignPost, Organization, OrganizationDetailed, OrganizationPost, Workspace, WorkspaceDetailed, WorkspacePost } from "../../types/campaigns"

export const getWorkspaces = async (detailed = false) : Promise<Workspace[] | WorkspaceDetailed[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/workspaces?${detailed && "detailed=true"}`)
    return wksp.data.items
}

export const createWorkspace = async (body: WorkspacePost) : Promise<Workspace> => {
    const wksp = await axios.post(`${API_BASE_URL}/workspaces`, body)
    return wksp.data
}

export const getOrganizations = async (detailed = false) : Promise<Organization[] | OrganizationDetailed[]> => {
    const org = await axios.get(`${API_BASE_URL}/organizations?${detailed && "detailed=true"}`)
    return org.data.items
}

export const createOrganization = async (body: OrganizationPost) : Promise<Organization> => {
    const org = await axios.post(`${API_BASE_URL}/organizations`, body)
    return org.data
}
export const getCampaigns = async (detailed = false) : Promise<Campaign[] | CampaignDetailed[]> => {
    const campaigns = await axios.get(`${API_BASE_URL}/campaigns?${detailed && "detailed=true"}`)
    return campaigns.data.items
}

export const getCampaign = async (id: number) : Promise<CampaignDetailed> => {
    const campaign = await axios.get(`${API_BASE_URL}/campaigns/${id}`)
    return campaign.data
}

export const createCampaign = async (body: CampaignPost) : Promise<Campaign> => {
    const campaign = await axios.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}


