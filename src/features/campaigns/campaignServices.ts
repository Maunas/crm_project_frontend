import type { CampaignParams, DeleteResponse, EnableResponse, Paginable } from "src/types/shared"
import type { Campaign, CampaignDetailed, CampaignPost } from "src/types/campaigns"
import axiosCRM from "src/lib/axios"


/******************************** Campaigns ************************************/
export const getCampaigns = async<T extends CampaignParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? CampaignDetailed : Campaign>> => {
    const campaigns = await axiosCRM.get(`/campaigns`, { params })
    return campaigns.data
}

// id es el public_uuid de la campaña (rutas genéricas de BaseController, ver backend/AGENTS.md §17).
export const getCampaign = async (id: string): Promise<CampaignDetailed> => {
    const campaign = await axiosCRM.get(`/campaigns/${id}`)
    return campaign.data
}

export const createCampaign = async (body: CampaignPost): Promise<CampaignDetailed> => {
    const campaign = await axiosCRM.post(`/campaigns`, body)
    return campaign.data
}

export const updateCampaign = async (body: CampaignPost, id: string): Promise<CampaignDetailed> => {
    const campaign = await axiosCRM.put(`/campaigns/${id}`, body)
    return campaign.data
}

export const disableCampaign = async (id: string): Promise<DeleteResponse> => {
    const cmp = await axiosCRM.delete(`/campaigns/${id}`)
    return cmp.data
}

export const enableCampaign = async (id: string): Promise<EnableResponse> => {
    const cmp = await axiosCRM.put(`/campaigns/activate/${id}`)
    return cmp.data
}
