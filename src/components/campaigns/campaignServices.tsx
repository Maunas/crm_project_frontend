import axios from "axios"
import type { Workspace } from "../../types/leads"
import { API_BASE_URL } from "../../generalService"

export const getWorkspaces = async () : Promise<Workspace[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/workspaces`)
    return wksp.data.items
}

export const createCampaign = async (body: Workspace) : Promise<Workspace> => {
    const campaign = await axios.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}