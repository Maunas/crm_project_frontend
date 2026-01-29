import axios from "axios"
import type { LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldType, LeadFieldTypeDetailed, LeadFieldTypeTemplate, Nomenclator } from "../../types/leads"
import { API_BASE_URL } from "../../generalService"
import type { ValidationRule } from "react-hook-form"

interface Params {
    detailed?: boolean,
    only_active?: boolean,
    page?: number,
    campaign_id?: number
}

export const getFieldTemplates = async (): Promise<LeadFieldTypeTemplate[]> => {
    const tmp = await axios.get(`${API_BASE_URL}/templates/lead_fields`)
    return tmp.data
}

export const getFieldTypes = async<T extends Params>(params: T):
    Promise<T["detailed"] extends true ? LeadFieldType[] : LeadFieldTypeDetailed[]> => {
    const tmp = await axios.get(`${API_BASE_URL}/lead_field_types`, {params})
    return tmp.data.items
}

export const getNomenclators = async (): Promise<Nomenclator[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/nomenclators`)
    return wksp.data.items
}

export const createLeadField = async (body: LeadFieldPost): Promise<LeadField> => {
    const leadField = await axios.post(`${API_BASE_URL}/lead_fields`, body)
    return leadField.data
}

export const getFieldsFromCampaign = async<T extends Params>(params: T):
    Promise<T["detailed"] extends true ? LeadFieldDetailed[] : LeadField[]> => {
    const leadField = await axios.get(`${API_BASE_URL}/lead_fields`, { params })
    return leadField.data.items
}

export const getValidationTemplates = async (): Promise<ValidationRule[]> => {
    const val = await axios.get(`${API_BASE_URL}/templates/validation_rules`)
    return val.data
}

export const createValidation = async (body: ValidationRule): Promise<ValidationRule[]> => {
    const val = await axios.post(`${API_BASE_URL}/validation_rules`, body)
    return val.data
}