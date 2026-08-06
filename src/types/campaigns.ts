import type { Metadata } from "./shared";

//Campaigns
export interface CampaignPost {
  name: string;
  description?: string;
  // public_uuid de Workspace/LeadFlow (Fase 3, ya resuelto en el backend -- ver
  // backend/AGENTS.md §18). Campaign.workspace_id (el propio, en el Response) sigue
  // siendo el int interno viejo, deliberadamente sin migrar.
  workspace_id: string;
  lead_flow_id?: string;
  target_audience?: string | null;
  is_public?: boolean;
}
export interface Campaign extends Omit<CampaignPost, "workspace_id"> {
  id: string; // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  organization_id: number | null;
  workspace_id: number | null;
}

export interface CampaignDetailed extends Campaign, Metadata { }

//Workspaces
export interface WorkspacePost {
  name: string | null;
  description?: string | null;
  organization_id: number | null;
}
export interface Workspace extends WorkspacePost {
  id: string; // public_uuid desde Fase 3, ver backend/AGENTS.md §18
}
export interface WorkspaceDetailed extends Workspace, Metadata {
  campaigns: CampaignDetailed[];
}

//Organizations
export interface OrganizationPost {
  name: string | null;
  description?: string | null;
}
export interface Organization extends OrganizationPost {
  id: string; // public_uuid desde Fase 3
  is_system: boolean; // true solo para "Panel Global" (ADMIN_ORG_ID) -- lo setea el seed, solo lectura
}
export interface OrganizationDetailed extends Organization, Metadata {
  active: boolean;
}
