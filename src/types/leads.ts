import type { LeadFieldValue } from "./leadFields";

export interface LeadPostValue {
  field_id: number;
  value: string;
}
export interface LeadPost {
  campaign_id: number;
  values: LeadPostValue[];
}

export interface Lead {
  id: number;
  campaign_id: number;
  field_values: LeadFieldValue[];
  //If detailed=true
  created_at: string;
  updated_at: string;
  active?: boolean;
}
