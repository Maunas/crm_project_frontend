import type { Metadata } from "./common";
import type { LeadFieldValue, LeadFieldValueDetailed } from "./leadFields";

export interface LeadPostValue {
  field_id: number;
  value: string | object[] | FileList ;
}
export interface LeadPost {
  campaign_id: number;
  values: LeadPostValue[];
}

export interface Lead {
  id: number;
  campaign_id?: number;
  field_values: LeadFieldValue[];
  organization_id?: number
}
export interface LeadDetailed extends Lead, Metadata {
  field_values: LeadFieldValueDetailed[];

}

export interface LeadCommentPost {
  lead_id: number,
  content: string
}

export interface LeadComment extends LeadCommentPost, Metadata {
  id: number
}