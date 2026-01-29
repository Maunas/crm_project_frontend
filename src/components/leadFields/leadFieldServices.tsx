import axios from "axios"
import type { LeadField, LeadFieldPost } from "../../types/leads"
import { API_BASE_URL } from "../../generalService"

export const getFieldTemplates = async () : Promise<any> => {
    const tmp = await axios.get(`${API_BASE_URL}/templates/lead_fields`)
    return tmp.data
}

export const getFieldTypes = async () : Promise<any> => {
    const tmp = await axios.get(`${API_BASE_URL}/lead_field_types?detailed=true`)
    return tmp.data.items
}

export const getNomenclators = async () : Promise<any[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/nomenclators`)
    return wksp.data.items
}

export const createLeadField = async(body: LeadFieldPost) : Promise<LeadField> => {
    const leadField = await axios.post(`${API_BASE_URL}/lead_fields`, body)
    return leadField.data
}

export const getFieldsFromCampaign = async(campaign_id: number) : Promise<LeadField[]> => {
    const leadField = await axios.get(`${API_BASE_URL}/lead_fields?campaign_id=${campaign_id}&detailed=true`)
    return leadField.data.items
}

export const getValidationTemplates = async() : Promise<any[]> => {
    const val = await axios.get(`${API_BASE_URL}/templates/validation_rules`)
    return val.data
}

export const createValidation = async(body) : Promise<any[]> => {
    const val = await axios.post(`${API_BASE_URL}/validation_rules`, body)
    return val.data
}