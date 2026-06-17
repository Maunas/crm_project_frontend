import type { DeleteResponse, FieldAutomationParams, Paginable } from "src/types/shared"
import type { FieldAutomation, FieldAutomationDetailed, FieldAutomationPost } from "src/types/automation"
import axiosCRM, { API_BASE_URL } from "src/lib/axios"


export const getFieldAutomations = async<T extends FieldAutomationParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? FieldAutomationDetailed : FieldAutomation>> => {
    const field_automations = await axiosCRM.get(`${API_BASE_URL}/field_automations`, { params })
    return field_automations.data
}

export const getFieldAutomation = async (id: number): Promise<FieldAutomationDetailed> => {
    const field_automation = await axiosCRM.get(`${API_BASE_URL}/field_automations/${id}`)
    return field_automation.data
}

export const createFieldAutomation = async (body: FieldAutomationPost): Promise<FieldAutomationDetailed> => {
    const field_automation = await axiosCRM.post(`${API_BASE_URL}/field_automations`, body)
    return field_automation.data
}

export const updateFieldAutomation = async (body: FieldAutomationPost, id: number): Promise<FieldAutomationDetailed> => {
    const field_automation = await axiosCRM.put(`${API_BASE_URL}/field_automations/${id}`, body)
    return field_automation.data
}

export const deleteFieldAutomation = async (id: number): Promise<DeleteResponse> => {
    const cmp = await axiosCRM.delete(`${API_BASE_URL}/field_automations/${id}`)
    return cmp.data
}