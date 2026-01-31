import axios from "axios"
import type { LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldType, LeadFieldTypeDetailed, LeadFieldTemplate, Nomenclator, LeadFieldSection, LeadFieldSectionDetailed, NomenclatorDetailed, FieldValidationRule, FieldValidationRuleTemplate, FieldValidationRulePost } from "../../types/leadFields"
import { API_BASE_URL } from "../../generalService"
import type { FieldValidationRuleData } from "./CreateLeadFields"

interface Params {
    detailed?: boolean,
    only_active?: boolean,
    page?: number,
    campaign_id?: number,
    global_nomenclator?: boolean
}

export const getFieldDataByType = (data: LeadFieldPost, isTemplate = false): LeadFieldPost => {
    const requiredData: LeadFieldPost = {
        name: data.name,
        order: data.order,
        campaign_id: data.campaign_id,
        required: data.required,
        is_primary: data.is_primary,
        is_visible: data.is_visible,
        lead_field_section_id: data.lead_field_section_id,
        default_value: data.default_value,
        input_mask: data.input_mask,
    }
    //Si es por template, devuelve el código unicamente
    if (isTemplate)
        return { ...requiredData, field_template_code: data.field_template_code }
    //Si no se ha enviado el tipo, se recibe error de validación del backend
    if (!data.field_type_code) return requiredData

    //Casos especiales por tipo de dato
    const manualData: LeadFieldPost = {
        ...requiredData,
        field_type_code: data.field_type_code,
        field_subtype_code: data.field_subtype_code
    }

    switch (data.field_type_code) {
        case "SELECTOR": case "CHECKBOX":
            return { ...manualData, nomenclator_id: data.nomenclator_id }
        case "LEAD":
            return { ...manualData, related_campaign_id: data.related_campaign_id }
        case "CALCULATED":
            return { ...manualData, calculation_expression: data.calculation_expression }
        default: return manualData
    }
}

export const getValidationDataByType = (data: FieldValidationRuleData, isTemplate = false): FieldValidationRulePost => {
    const requiredData: FieldValidationRuleData = {
        name: data.name,
        error_message: data.error_message,
        field_id: data.field_id
    }
    //Si es por template, devuelve el código de template y sus parametros
    if (isTemplate) {
        //Asegura que, de no haber llenado template o sus params, no sean undefined, si no vacío.
        const params = data.template_params ?? {}
        const required = data.template?.required_params ?? []

        //Convierte los parametros recibidos a un arreglo, y filtra para dejar solo los requeridos.
        const filteredParams = Object.entries(params).filter(([key]) =>
            required.includes(key)
        )
        return {
            ...requiredData,
            template_code: data.template?.code,
            //Luego vuelve a convertir a objeto con Object.fromEntries
            template_params: Object.fromEntries(filteredParams)
        }
    } else {
        //Si es manual, solo devuelve la expresión.
        return { ...requiredData, expression: data.expression }
    }
}

export const getFieldTemplates = async (): Promise<LeadFieldTemplate[]> => {
    const tmp = await axios.get(`${API_BASE_URL}/templates/lead_fields`)
    return tmp.data
}

export const getFieldTypes = async<T extends Params>(params?: T):
    Promise<T["detailed"] extends true ? LeadFieldTypeDetailed[] : LeadFieldType[]> => {
    const tmp = await axios.get(`${API_BASE_URL}/lead_field_types`, { params })
    return tmp.data.items
}

export const getNomenclators = async<T extends Params>(params?: T):
    Promise<T["detailed"] extends true ? NomenclatorDetailed[] : Nomenclator[]> => {
    const wksp = await axios.get(`${API_BASE_URL}/nomenclators`, { params })
    return wksp.data.items
}

export const createLeadField = async (body: LeadFieldPost): Promise<LeadField> => {
    const leadField = await axios.post(`${API_BASE_URL}/lead_fields`, body)
    return leadField.data
}

export const getFieldsFromCampaign = async<T extends Params>(params?: T):
    Promise<T["detailed"] extends true ? LeadFieldDetailed[] : LeadField[]> => {
    const leadField = await axios.get(`${API_BASE_URL}/lead_fields`, { params })
    return leadField.data.items
}

export const getValidationTemplates = async (): Promise<FieldValidationRuleTemplate[]> => {
    const val = await axios.get(`${API_BASE_URL}/templates/validation_rules`)
    return val.data
}

export const createValidation = async (body: FieldValidationRulePost): Promise<FieldValidationRule[]> => {
    const val = await axios.post(`${API_BASE_URL}/validation_rules`, body)
    return val.data
}

export const getFieldSections = async<T extends Params>(params?: T):
    Promise<T["detailed"] extends true ? LeadFieldSectionDetailed[] : LeadFieldSection[]> => {
    const sections = await axios.get(`${API_BASE_URL}/lead_field_sections`, { params })
    return sections.data.items
}