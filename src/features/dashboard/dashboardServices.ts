import axiosCRM from "src/lib/axios"

export interface LeadsByState {
    state_id: number
    state_name: string
    color: string | null
    total: number
}

export interface LeadsByContactState {
    state_id: number
    state_name: string
    color: string | null
    total: number
}

export interface RecentActivity {
    id: number
    action: string
    entity_type: string
    entity_id: number
    user_name: string | null
    created_at: string
}

export interface OrgUser {
    id: number
    name: string
    last_name: string | null
    email: string
    is_owner: boolean
}

export interface OrgDashboard {
    total_leads: number
    leads_by_flow_state: LeadsByState[]
    leads_by_contact_state: LeadsByContactState[]
    recent_activity: RecentActivity[]
    org_users: OrgUser[]
}

export interface OrgStats {
    org_id: number
    org_name: string
    total_users: number
    total_leads: number
    last_activity: string | null
    owner_name: string | null
}

export interface AdminDashboard {
    total_active_orgs: number
    total_users: number
    total_leads: number
    orgs: OrgStats[]
}

export const getOrgDashboard = async (): Promise<OrgDashboard> => {
    const res = await axiosCRM.get("/dashboard/org")
    return res.data
}

export const getAdminDashboard = async (): Promise<AdminDashboard> => {
    const res = await axiosCRM.get("/dashboard/admin")
    return res.data
}
