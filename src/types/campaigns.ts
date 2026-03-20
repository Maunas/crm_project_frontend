import type { Metadata } from "./common";

//Campaigns
export interface CampaignPost {
  name: string | null;
  description?: string | null;
  workspace_id: number | null;
}
export interface Campaign extends CampaignPost {
  id: number | null;
  organization_id: number | null;
}
export interface CampaignDetailed extends Campaign, Metadata {}

//Workspaces
export interface WorkspacePost {
  name: string | null;
  description?: string | null;
  organization_id: number | null;
}
export interface Workspace extends WorkspacePost {
  id: number | null;
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
  id: number;
}
export interface OrganizationDetailed extends Organization, Metadata {}
