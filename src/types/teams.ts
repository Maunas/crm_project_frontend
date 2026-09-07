import type { Metadata } from "./shared";
import type { UserData } from "./users";
import type { Workspace, Campaign } from "./campaigns";

// Team
export interface TeamPost {
  name: string;
  is_visibility_shared: boolean;
}
export interface Team extends TeamPost {
  id: string;
  organization_id: number | null;
}
export interface TeamDetailed extends Team, Metadata {
  members: TeamMember[];
}

// Team Member
export interface TeamMemberPost {
  team_id: string;
  user_id: string;
  role: "MANAGER" | "AGENT";
}
export interface TeamMemberUpdate {
  role?: "MANAGER" | "AGENT";
}
export interface TeamMember extends Omit<TeamMemberPost, "team_id" | "user_id"> {
  id: string;
  team_id: number;
  user_id: number;
}
export interface TeamMemberDetailed extends TeamMember, Metadata {
  user: UserData;
}

// Reasignación masiva de leads.
export interface BulkAssignRequest {
  lead_ids: string[];
  target_team_id?: string | null;
  target_user_id?: string | null;
  //target_team_id/target_user_id en null/undefined significa "no tocar este campo", no "vaciarlo".
  //Para desasignar hay que mandar clear_team/clear_user en true.
  clear_team?: boolean;
  clear_user?: boolean;
}

// Acceso del equipo a Workspaces
export interface TeamWorkspaceAccessPost {
  team_id: string;
  workspace_id: string;
}
export interface TeamWorkspaceAccess extends Omit<TeamWorkspaceAccessPost, "team_id" | "workspace_id"> {
  id: string;
  team_id: number; // FK embebida: la respuesta trae el id interno, no el public_uuid
  workspace_id: number; // FK embebida: la respuesta trae el id interno, no el public_uuid
  // Objeto anidado con el uuid real (preferir a la FK embebida).
  team?: Team | null;
  workspace?: Workspace | null;
}
export interface TeamWorkspaceAccessDetailed extends TeamWorkspaceAccess, Metadata { }

// Acceso del equipo a Campañas
export interface TeamCampaignAccessPost {
  team_id: string;
  campaign_id: string;
}
export interface TeamCampaignAccess extends Omit<TeamCampaignAccessPost, "team_id" | "campaign_id"> {
  id: string;
  team_id: number; // FK embebida: la respuesta trae el id interno, no el public_uuid
  campaign_id: number; // FK embebida: la respuesta trae el id interno, no el public_uuid
  // Objeto anidado con el uuid real (preferir a la FK embebida).
  team?: Team | null;
  campaign?: Campaign | null;
}
export interface TeamCampaignAccessDetailed extends TeamCampaignAccess, Metadata { }
