import axios from "axios"
import { API_BASE_URL } from "../../generalService"
import type { Paginable } from "../../types/common"
import type { Campaign, CampaignDetailed, CampaignPost } from "../../types/campaigns"

interface Params {
    detailed?: boolean,
    only_active?: boolean,
    page?: number,
    page_size?: number
}

/******************************** Campaigns ************************************/
export const getCampaigns = async<T extends Params>(params?: T):
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

