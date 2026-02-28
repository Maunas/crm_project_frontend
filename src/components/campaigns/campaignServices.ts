import axios from "axios"
import type { CampaignParams, Paginable } from "../../types/common"
import type { Campaign, CampaignDetailed, CampaignPost } from "../../types/campaigns"
import { API_BASE_URL } from "../../generalService"


/******************************** Campaigns ************************************/
export const getCampaigns = async<T extends CampaignParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? CampaignDetailed : Campaign>> => {
    const campaigns = await axios.get(`${API_BASE_URL}/campaigns`, { params })
    return campaigns.data
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

export const disableCampaign = async (id: number): Promise<{ action: string }> => {
    const cmp = await axios.delete(`${API_BASE_URL}/campaigns/${id}`)
    return cmp.data
}
export const enableCampaign = async (id: number): Promise<{ actived: boolean }> => {
    const cmp = await axios.put(`${API_BASE_URL}/campaigns/active/${id}`)
    return cmp.data
}