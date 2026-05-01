import type { Metadata } from "./common";
import type { LeadFieldValue, LeadFieldValueDetailed } from "./leadFields";
import type { ColorTypes } from "./mui-theme.d";

export interface LeadPostValue {
  field_id: number;
  value: string | number[] | number | FileList;
}
export interface LeadPost {
  campaign_id?: number;
  values: LeadPostValue[];
}

export interface Lead {
  id: number;
  campaign_id?: number;
  field_values: LeadFieldValue[];
  organization_id?: number,
  tags: LeadTag[]
}
export interface LeadDetailed extends Lead, Metadata {
  field_values: LeadFieldValueDetailed[];

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
  activity_type: "LEAD_CREATED" | "FIELDS_UPDATED",
  details: {
    message?: string,
    changes?: LeadAuditChange
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
  filters?: { [item: string]: unknown },
  ui_config?: { [item: string]: unknown },
  sort_config?: { [item: string]: unknown }
}

export interface LeadView extends LeadViewPost {
  id: number,
  organization_id: number
}

export interface LeadViewDetailed extends LeadView, Metadata { }


export interface LeadTagPost {
  name: string,
  color?: string
}
export interface LeadTag extends LeadTagPost {
  id: number,
  organization_id: number
  color: ColorTypes
}

export interface LeadTagDetailed extends LeadTag, Metadata { }
