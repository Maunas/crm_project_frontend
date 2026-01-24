import axios from "axios"
import type { Campaign, Workspace } from "../../types/leads"
import { API_BASE_URL } from "../../generalService"

export const getWorkspaces = async (detailed = false) : Promise<Workspace[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/workspaces?${detailed && "detailed=true"}`)
    return wksp.data.items
}

export const createWorkspace = async (body: Workspace) : Promise<Workspace> => {
    const wksp = await axios.post(`${API_BASE_URL}/workspaces`, body)
    return wksp.data
}

export const getCampaigns = async () : Promise<Campaign[]> => {
    const campaigns = await axios.get(`${API_BASE_URL}/campaigns`)
    return campaigns.data.items
}

export const getCampaign = async (id: number) : Promise<Campaign> => {
    const campaign = await axios.get(`${API_BASE_URL}/campaigns/${id}`)
    return campaign.data
}

export const createCampaign = async (body: Campaign) : Promise<Campaign> => {
    const campaign = await axios.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}


