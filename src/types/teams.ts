import type { Metadata } from "./shared";
import type { UserData } from "./users";

// Team
export interface TeamPost {
  name: string;
  is_visibility_shared: boolean;
}
export interface Team extends TeamPost {
  id: number;
  organization_id: number | null;
}
export interface TeamDetailed extends Team, Metadata {
  members: TeamMember[];
}

// Team Member
export interface TeamMemberPost {
  team_id: number;
  user_id: number;
  role: "MANAGER" | "AGENT";
}
export interface TeamMemberUpdate {
  role?: "MANAGER" | "AGENT";
}
export interface TeamMember extends TeamMemberPost {
  id: number;
}
export interface TeamMemberDetailed extends TeamMember, Metadata {
  user: UserData;
}

// Reasignación masiva de leads (ya soportada por el backend en /leads/bulk-assign)
export interface BulkAssignRequest {
  lead_ids: number[];
  target_team_id?: number | null;
  target_user_id?: number | null;
}

// Acceso del equipo a Workspaces
export interface TeamWorkspaceAccessPost {
  team_id: number;
  workspace_id: number;
}
export interface TeamWorkspaceAccess extends TeamWorkspaceAccessPost {
  id: number;
}
export interface TeamWorkspaceAccessDetailed extends TeamWorkspaceAccess, Metadata { }

// Acceso del equipo a Campañas
export interface TeamCampaignAccessPost {
  team_id: number;
  campaign_id: number;
}
export interface TeamCampaignAccess extends TeamCampaignAccessPost {
  id: number;
}
export interface TeamCampaignAccessDetailed extends TeamCampaignAccess, Metadata { }
