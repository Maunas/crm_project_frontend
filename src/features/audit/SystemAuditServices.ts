import type { SystemAuditParams, Paginable } from "src/types/shared"
import axiosCRM, { API_BASE_URL } from "src/lib/axios"
import type { SystemAuditLog } from "src/types/systemAudit"


/******************************** System Audit ************************************/
export const getSystemAudit = async<T extends SystemAuditParams>(params?: T):
    Promise<Paginable<SystemAuditLog>> => {
    const logs = await axiosCRM.get(`${API_BASE_URL}/audit-logs`, { params })
    return logs.data
}

export const getSystemLog = async (id: number): Promise<SystemAuditLog> => {
    const log = await axiosCRM.get(`${API_BASE_URL}/audit-logs/${id}`)
    return log.data
}