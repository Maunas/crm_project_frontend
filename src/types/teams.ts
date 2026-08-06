import type { Metadata } from "./shared";
import type { UserData } from "./users";
import type { Workspace, Campaign } from "./campaigns";

// Team
export interface TeamPost {
  name: string;
  is_visibility_shared: boolean;
}
export interface Team extends TeamPost {
  id: string; // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  organization_id: number | null;
}
export interface TeamDetailed extends Team, Metadata {
  members: TeamMember[];
}

// Team Member
export interface TeamMemberPost {
  // public_uuid de Team/User (Fase 3, ya resuelto en el backend).
  team_id: string;
  user_id: string;
  role: "MANAGER" | "AGENT";
}
export interface TeamMemberUpdate {
  role?: "MANAGER" | "AGENT";
}
export interface TeamMember extends Omit<TeamMemberPost, "team_id" | "user_id"> {
  id: string; // public_uuid desde Fase 3
  team_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  user_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
}
export interface TeamMemberDetailed extends TeamMember, Metadata {
  user: UserData;
}

// Reasignación masiva de leads (ya soportada por el backend en /leads/bulk-assign).
// lead_ids/target_team_id/target_user_id son public_uuid (Lead/Team/User) desde Fase 3 --
// LeadService.bulk_assign ya los resuelve a id interno, ver backend/AGENTS.md §18.
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
  // public_uuid de Team/Workspace (Fase 3, ya resuelto en el backend).
  team_id: string;
  workspace_id: string;
}
export interface TeamWorkspaceAccess extends Omit<TeamWorkspaceAccessPost, "team_id" | "workspace_id"> {
  id: string; // public_uuid desde Fase 3
  team_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  workspace_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  // Fase 4: objeto anidado con el uuid real (ver backend/AGENTS.md §18).
  team?: Team | null;
  workspace?: Workspace | null;
}
export interface TeamWorkspaceAccessDetailed extends TeamWorkspaceAccess, Metadata { }

// Acceso del equipo a Campañas
export interface TeamCampaignAccessPost {
  // public_uuid de Team/Campaign (Fase 3, ya resuelto en el backend).
  team_id: string;
  campaign_id: string;
}
export interface TeamCampaignAccess extends Omit<TeamCampaignAccessPost, "team_id" | "campaign_id"> {
  id: string; // public_uuid desde Fase 3
  team_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  campaign_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  // Fase 4: objeto anidado con el uuid real (ver backend/AGENTS.md §18).
  team?: Team | null;
  campaign?: Campaign | null;
}
export interface TeamCampaignAccessDetailed extends TeamCampaignAccess, Metadata { }
