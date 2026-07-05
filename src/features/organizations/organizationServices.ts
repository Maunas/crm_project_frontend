import type { Organization, OrganizationDetailed, OrganizationPost } from "src/types/campaigns"
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared"
import axiosCRM from "src/lib/axios"

export const getOrganizations = async<T extends ListParams>(params?: T):
    Promise<Paginable<
        T["detailed"] extends true ? OrganizationDetailed : Organization>> => {
    const org = await axiosCRM.get(`/organizations`, { params })
    return org.data
}

export const getOrganization = async (id: number): Promise<OrganizationDetailed> => {
    const org = await axiosCRM.get(`/organizations/${id}`)
    return org.data
}

export const createOrganization = async (body: OrganizationPost): Promise<OrganizationDetailed> => {
    const org = await axiosCRM.post(`/organizations`, body)
    return org.data
}

export const updateOrganization = async (body: OrganizationPost, id: number): Promise<OrganizationDetailed> => {
    const org = await axiosCRM.put(`/organizations/${id}`, body)
    return org.data
}

export const disableOrganization = async (id: number): Promise<DeleteResponse> => {
    const org = await axiosCRM.delete(`/organizations/${id}`)
    return org.data
}

export const enableOrganization = async (id: number): Promise<EnableResponse> => {
    const org = await axiosCRM.put(`/organizations/activate/${id}`)
    return org.data
}
