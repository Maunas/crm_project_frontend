import type { Campaign } from "./campaigns";
import type { Metadata } from "./common";

export interface Lead {
  id: number;
  campaign_id: number;
  field_values: LeadFieldValue[];
  //If detailed=true
  created_at: string;
  updated_at: string;
  active?: boolean;
}

export interface LeadFieldValue {
  id: number;
  field_id: number;
  value: string;
  nomenclator_item_id?: number | null;
  nomenclator_item?: Nomenclator | null;
  lead_id: number;
  field: LeadField;
  //If detailed=true
  created_at?: string;
  updated_at?: string;
  active?: boolean;
}
export interface LeadFieldPost {
  name?: string;
  campaign_id: number;
  order?: number;
  required: boolean;
  is_primary: boolean;
  is_visible: boolean;
  lead_field_section_id: number;

  field_template_code?: string;

  field_type_code?: string;
  field_subtype_code?: string;
  default_value?: string;
  input_mask?: string;

  nomenclator_id?: number;

  related_campaign_id?: number;

  calculation_expression?: string;
}

export interface LeadField extends LeadFieldPost {
  id: number;
  configuration?: string;
  lead_field_section: LeadFieldSection;
  organization_id: number;
  order:number
}

export interface LeadFieldDetailed extends LeadField, Metadata {
  validation_rules: ValidationRule[];
  nomenclator: Nomenclator;
  lead_field_section: LeadFieldSectionDetailed;
  related_campaign: Campaign;
}

export interface LeadFieldType {
  id: number;
  code: string;
  description: string;
}

export interface LeadFieldTypeDetailed extends LeadField, Metadata {
  subtypes: (LeadFieldType & { lead_field_type_code: string })[];
}

export interface LeadFieldTypeTemplate {
  code: string;
  name: string;
  field_type_code: string;
  rules: {
    template_code?: string | null;
    template_params?: object | null;
    error_message: string;
  };
}

export interface ValidationRule {
  id: number;
  name: string;
  expression?: string;
  error_message: string;
  template_code?: string | null;
  template_params?: object | null;
  field_id: number;
}

export interface Nomenclator {
  id: number;
  name: string;
  campaign_id?: number | null;
  parent_nomenclator_id?: number | null;
  //Detailed
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  sub_nomenclators?: Nomenclator[];
  items?: NomenclatorItem[];
}

export interface NomenclatorItem {
  id: number;
  code: string;
  value: string;
  nomenclator_id: number;
  parent_item_id: number;
}

export interface LeadFieldSectionPost {
  name: string;
  organization_id: number;
}
export interface LeadFieldSection extends LeadFieldSectionPost {
  id: number;
}
export interface LeadFieldSectionDetailed extends LeadFieldSection, Metadata {}
