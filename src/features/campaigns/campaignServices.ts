import type { CampaignParams, DeleteResponse, EnableResponse, Paginable } from "src/types/shared"
import type { Campaign, CampaignDetailed, CampaignPost } from "src/types/campaigns"
import axiosCRM, { API_BASE_URL } from "src/lib/axios"


/******************************** Campaigns ************************************/
export const getCampaigns = async<T extends CampaignParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? CampaignDetailed : Campaign>> => {
    const campaigns = await axiosCRM.get(`${API_BASE_URL}/campaigns`, { params })
    return campaigns.data
}

export const getCampaign = async (id: number): Promise<CampaignDetailed> => {
    const campaign = await axiosCRM.get(`${API_BASE_URL}/campaigns/${id}`)
    return campaign.data
}

export const createCampaign = async (body: CampaignPost): Promise<CampaignDetailed> => {
    const campaign = await axiosCRM.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}

export const updateCampaign = async (body: CampaignPost, id: number): Promise<CampaignDetailed> => {
    const campaign = await axiosCRM.put(`${API_BASE_URL}/campaigns/${id}`, body)
    return campaign.data
}

export const disableCampaign = async (id: number): Promise<DeleteResponse> => {
    const cmp = await axiosCRM.delete(`${API_BASE_URL}/campaigns/${id}`)
    return cmp.data
}
export const enableCampaign = async (id: number): Promise<EnableResponse> => {
    const cmp = await axiosCRM.put(`${API_BASE_URL}/campaigns/active/${id}`)
    return cmp.data
}