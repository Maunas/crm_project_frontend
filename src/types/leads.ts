import type { LeadFieldValue, LeadFieldValueDetailed } from "./leadFields";
import type { LeadFilter, ListParams, Metadata } from "./shared";
import type { LeadState, LeadStateDetailed } from "./leadFlow";
import type { ColorTypes } from "./mui-theme.d";
import type { LeadContactState, LeadContactStateDetailed, LeadTag } from "./orgProperties";

export interface LeadPostValue {
  field_id: number;
  value: string | number[] | number | FileList;
}
export interface LeadPost {
  campaign_id?: number;
  values: LeadPostValue[];
}

export interface LeadTeam {
  id: number;
  name: string;
}

export interface LeadUser {
  id: number;
  name: string;
  email: string;
}

export interface Lead {
  id: number;
  campaign_id?: number;
  field_values: LeadFieldValue[];
  organization_id?: number,
  tags: LeadTag[],
  current_state_id: number,
  current_state: LeadState,
  contact_state_id: number,
  contact_state: LeadContactState,
  picture_url?: string,
  assigned_to_user_id: number | null,
  team_id: number | null,
  picture_avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  team?: LeadTeam | null;
  assigned_to_user?: LeadUser | null;
}
export interface LeadDetailed extends Lead, Metadata {
  field_values: LeadFieldValueDetailed[];
  current_state: LeadStateDetailed,
  contact_state: LeadContactStateDetailed,
}

export interface LeadCommentPost {
  lead_id: number,
  content: string
  color?: ColorTypes
}

export interface LeadComment extends LeadCommentPost, Metadata {
  id: number,
}

export interface LeadAudit extends Metadata {
  id: number,
  lead_id: number,
  activity_type: "LEAD_CREATED" | "FIELDS_UPDATED" | "STATE_CHANGED",
  details: {
    message?: string,
    notes?: string,
    changes?: LeadAuditChange
    to_state_id?: number
    from_state_id?: number
  }
}

export interface LeadAuditChange {
  [field_id: string]: {
    field_name: string,
    new_value: string | number | number[] | null,
    old_value: string | number | number[] | null,
  }
}

export interface LeadViewPost {
  campaign_id: number,
  name: string,
  visibility: string,
  team_id?: number | null,
  view_type?: string | null,
  filters?: {
    filters?: LeadFilter[],
    [item: string]: unknown
  },
  ui_config?: {
    selected_ids?: number[],
    fetch_params?: ListParams,
    [item: string]: unknown
  },
  sort_config?: {
    order_by?: string | number | null,
    ascending?: boolean,
    [item: string]: unknown
  }
}

export interface LeadViewParams {
  view_type?: string | null,
  filters?: {
    filters?: LeadFilter[],
    [item: string]: unknown
  },
  ui_config?: {
    selected_ids?: number[],
    fetch_params?: ListParams,
    [item: string]: unknown
  },
  sort_config?: {
    order_by?: string | number | null,
    ascending?: boolean,
    [item: string]: unknown
  }
}

export interface LeadView extends LeadViewPost {
  id: number,
  organization_id: number
}

export interface LeadViewDetailed extends LeadView, Metadata { }

