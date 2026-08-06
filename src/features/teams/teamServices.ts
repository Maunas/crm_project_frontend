import type {
    Team, TeamDetailed, TeamPost,
    TeamMember, TeamMemberDetailed, TeamMemberPost, TeamMemberUpdate,
    TeamWorkspaceAccess, TeamWorkspaceAccessDetailed, TeamWorkspaceAccessPost,
    TeamCampaignAccess, TeamCampaignAccessDetailed, TeamCampaignAccessPost,
} from "src/types/teams"
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared"
import axiosCRM from "src/lib/axios"

/******************************** Teams ************************************/

interface TeamParams extends ListParams {
    name?: string,
    is_visibility_shared?: boolean,
}

export const getTeams = async <T extends TeamParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? TeamDetailed : Team>> => {
    const teams = await axiosCRM.get(`/teams`, { params })
    return teams.data
}

// id es el public_uuid del equipo (rutas genéricas de BaseController, ver backend/AGENTS.md §17-18).
export const getTeam = async (id: string): Promise<TeamDetailed> => {
    const team = await axiosCRM.get(`/teams/${id}`)
    return team.data
}

export const createTeam = async (body: TeamPost): Promise<TeamDetailed> => {
    const team = await axiosCRM.post(`/teams`, body)
    return team.data
}

export const updateTeam = async (body: TeamPost, id: string): Promise<TeamDetailed> => {
    const team = await axiosCRM.put(`/teams/${id}`, body)
    return team.data
}

export const disableTeam = async (id: string): Promise<DeleteResponse> => {
    const team = await axiosCRM.delete(`/teams/${id}`)
    return team.data
}

export const enableTeam = async (id: string): Promise<EnableResponse> => {
    const team = await axiosCRM.put(`/teams/active/${id}`)
    return team.data
}

/******************************** Team Members ************************************/

interface TeamMemberParams extends ListParams {
    // FKs a Team/User: public_uuid desde Fase 3 (el backend ya resuelve estos filtros).
    team_id?: string,
    user_id?: string,
    role?: string,
}

export const getTeamMembers = async <T extends TeamMemberParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? TeamMemberDetailed : TeamMember>> => {
    const members = await axiosCRM.get(`/team_members`, { params })
    return members.data
}

export const createTeamMember = async (body: TeamMemberPost): Promise<TeamMemberDetailed> => {
    const member = await axiosCRM.post(`/team_members`, body)
    return member.data
}

// id es el public_uuid del TeamMember.
export const updateTeamMember = async (body: TeamMemberUpdate, id: string): Promise<TeamMemberDetailed> => {
    const member = await axiosCRM.put(`/team_members/${id}`, body)
    return member.data
}

export const deleteTeamMember = async (id: string): Promise<{ detail: string }> => {
    const member = await axiosCRM.delete(`/team_members/${id}`)
    return member.data
}

/******************************** Team Workspace Access ************************************/

interface TeamWorkspaceAccessParams extends ListParams {
    // FKs a Team/Workspace: public_uuid desde Fase 3.
    team_id?: string,
    workspace_id?: string,
}

export const getTeamWorkspaceAccess = async <T extends TeamWorkspaceAccessParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? TeamWorkspaceAccessDetailed : TeamWorkspaceAccess>> => {
    const access = await axiosCRM.get(`/team_workspace_access`, { params })
    return access.data
}

export const createTeamWorkspaceAccess = async (body: TeamWorkspaceAccessPost): Promise<TeamWorkspaceAccessDetailed> => {
    const access = await axiosCRM.post(`/team_workspace_access`, body)
    return access.data
}

// id es el public_uuid del TeamWorkspaceAccess.
export const deleteTeamWorkspaceAccess = async (id: string) => {
    const access = await axiosCRM.delete(`/team_workspace_access/${id}`)
    return access.data
}

/******************************** Team Campaign Access ************************************/

interface TeamCampaignAccessParams extends ListParams {
    // FKs a Team/Campaign: public_uuid desde Fase 3.
    team_id?: string,
    campaign_id?: string,
}

export const getTeamCampaignAccess = async <T extends TeamCampaignAccessParams>(params?: T):
    Promise<Paginable<T["detailed"] extends true ? TeamCampaignAccessDetailed : TeamCampaignAccess>> => {
    const access = await axiosCRM.get(`/team_campaign_access`, { params })
    return access.data
}

export const createTeamCampaignAccess = async (body: TeamCampaignAccessPost): Promise<TeamCampaignAccessDetailed> => {
    const access = await axiosCRM.post(`/team_campaign_access`, body)
    return access.data
}

// id es el public_uuid del TeamCampaignAccess.
export const deleteTeamCampaignAccess = async (id: string) => {
    const access = await axiosCRM.delete(`/team_campaign_access/${id}`)
    return access.data
}
