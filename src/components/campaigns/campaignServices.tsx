import axios from "axios"
import type { Campaign, LeadField, Workspace } from "../../types/leads"
import { API_BASE_URL } from "../../generalService"

export const getWorkspaces = async () : Promise<Workspace[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/workspaces`)
    return wksp.data.items
}

export const createCampaign = async (body: Campaign) : Promise<Campaign> => {
    const campaign = await axios.post(`${API_BASE_URL}/campaigns`, body)
    return campaign.data
}


export const getFieldTemplates = async () : Promise<any> => {
    const tmp = await axios.get(`${API_BASE_URL}/lead_fields/templates`)
    return tmp.data
}

export const getFieldTypes = async () : Promise<any> => {
    const tmp = await axios.get(`${API_BASE_URL}/lead_field_types`)
    return tmp.data.items
}

export const getNomenclators = async () : Promise<any[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/nomenclators`)
    return wksp.data.items
}

export const createLeadField = async(body: LeadField) : Promise<LeadField> => {
    const leadField = await axios.post(`${API_BASE_URL}/lead_fields`, body)
    return leadField.data
}