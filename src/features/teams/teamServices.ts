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

export const getTeam = async (id: number): Promise<TeamDetailed> => {
    const team = await axiosCRM.get(`/teams/${id}`)
    return team.data
}

export const createTeam = async (body: TeamPost): Promise<TeamDetailed> => {
    const team = await axiosCRM.post(`/teams`, body)
    return team.data
}

export const updateTeam = async (body: TeamPost, id: number): Promise<TeamDetailed> => {
    const team = await axiosCRM.put(`/teams/${id}`, body)
    return team.data
}

export const disableTeam = async (id: number): Promise<DeleteResponse> => {
    const team = await axiosCRM.delete(`/teams/${id}`)
    return team.data
}

export const enableTeam = async (id: number): Promise<EnableResponse> => {
    const team = await axiosCRM.put(`/teams/active/${id}`)
    return team.data
}

/******************************** Team Members ************************************/

interface TeamMemberParams extends ListParams {
    team_id?: number,
    user_id?: number,
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

export const updateTeamMember = async (body: TeamMemberUpdate, id: number): Promise<TeamMemberDetailed> => {
    const member = await axiosCRM.put(`/team_members/${id}`, body)
    return member.data
}

export const deleteTeamMember = async (id: number): Promise<{ detail: string }> => {
    const member = await axiosCRM.delete(`/team_members/${id}`)
    return member.data
}

/******************************** Team Workspace Access ************************************/

interface TeamWorkspaceAccessParams extends ListParams {
    team_id?: number,
    workspace_id?: number,
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

export const deleteTeamWorkspaceAccess = async (id: number) => {
    const access = await axiosCRM.delete(`/team_workspace_access/${id}`)
    return access.data
}

/******************************** Team Campaign Access ************************************/

interface TeamCampaignAccessParams extends ListParams {
    team_id?: number,
    campaign_id?: number,
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

export const deleteTeamCampaignAccess = async (id: number) => {
    const access = await axiosCRM.delete(`/team_campaign_access/${id}`)
    return access.data
}
