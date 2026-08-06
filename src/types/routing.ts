import type { Metadata } from "./shared";
import type { Team } from "./teams";
import type { Campaign } from "./campaigns";

// -----------------------------------------------------------------------
// Constantes (reflejan app/models/lead_routing_policy.py)
// -----------------------------------------------------------------------

export const NATIVE_FIELDS = [
  "assigned_to_user_id",
  "team_id",
  "created_at",
  "updated_at",
  "campaign_id",
  "current_state_id",
] as const;
export type NativeField = typeof NATIVE_FIELDS[number];

export const NATIVE_FIELD_LABELS: Record<NativeField, string> = {
  assigned_to_user_id: "Usuario Asignado",
  team_id: "Equipo Actual",
  created_at: "Fecha de Creación",
  updated_at: "Fecha de Última Modificación",
  campaign_id: "Campaña",
  current_state_id: "Etapa Actual",
};

// Campos nativos que solo soportan eq/neq (no rangos)
export const NATIVE_ID_FIELDS: NativeField[] = [
  "assigned_to_user_id", "team_id", "campaign_id", "current_state_id",
];
// Campos nativos de fecha (soportan rango)
export const NATIVE_DATE_FIELDS: NativeField[] = ["created_at", "updated_at"];

export const ROUTING_FORBIDDEN_FIELD_TYPES = ["FILE", "URL", "ADDRESS", "RICH_TEXT", "TAGS", "PASSWORD"];

// Operadores válidos según tipo de campo dinámico (o categoría nativa)
export const OPERATOR_RULES: Record<string, string[]> = {
  STRING: ["eq", "neq", "like", "ilike"],
  INT: ["eq", "neq", "gt", "lt", "gte", "lte"],
  NUMBER: ["eq", "neq", "gt", "lt", "gte", "lte"],
  MONEY: ["eq", "neq", "gt", "lt", "gte", "lte"],
  RATING: ["eq", "neq", "gt", "lt", "gte", "lte"],
  DATE: ["eq", "neq", "gt", "lt", "gte", "lte"],
  DATE_TIME: ["eq", "neq", "gt", "lt", "gte", "lte"],
  BOOL: ["eq", "neq"],
  SELECTOR: ["eq", "eq_strict", "neq", "in", "not_in"],
  CHECKBOX: ["eq", "eq_strict", "neq", "in", "not_in"],
  CALCULATED: ["eq", "neq", "gt", "lt", "gte", "lte", "like", "ilike"],
  _NATIVE_DATE: ["eq", "neq", "gt", "lt", "gte", "lte"],
  _NATIVE_ID: ["eq", "neq"],
};

export const OPERATOR_LABELS: Record<string, string> = {
  eq: "Igual a (=)",
  eq_strict: "Igual exacto (conjunto)",
  neq: "Distinto de (!=)",
  gt: "Mayor que (>)",
  lt: "Menor que (<)",
  gte: "Mayor o igual (>=)",
  lte: "Menor o igual (<=)",
  like: "Contiene texto",
  ilike: "Contiene texto (sin mayúsculas)",
  in: "Está en la lista",
  not_in: "No está en la lista",
};

export const VALID_RANGE_OPS_MIN = ["gt", "gte"];
export const VALID_RANGE_OPS_MAX = ["lt", "lte"];
export const LIST_OPERATORS = ["in", "not_in", "eq_strict"];

export type ConditionMode = "simple" | "list" | "range";

// -----------------------------------------------------------------------
// Condición
// -----------------------------------------------------------------------

export interface LeadRoutingConditionPost {
  position: number;
  // public_uuid de LeadField (Fase 3, ya resuelto en el backend).
  lead_field_id?: string | null;
  native_field?: NativeField | null;

  operator?: string | null;
  value_str?: string | null;

  value_list?: string[] | null;

  operator_min?: string | null;
  value_min?: string | null;
  operator_max?: string | null;
  value_max?: string | null;
}

export interface LeadRoutingCondition extends Omit<LeadRoutingConditionPost, "lead_field_id"> {
  id: number;
  policy_id: number;
  lead_field_id: number | null; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  // Fase 4: objeto anidado con el uuid real de LeadField (ver backend/AGENTS.md §18).
  // Preferir lead_field?.id sobre lead_field_id de arriba.
  lead_field?: {
    id: string;
    active: boolean;
    name: string;
    order: number;
    field_type_code?: string | null;
    field_subtype_code?: string | null;
    title_order?: number | null;
    subtitle_order?: number | null;
  } | null;
}

// -----------------------------------------------------------------------
// Política
// -----------------------------------------------------------------------

export interface LeadRoutingPolicyBase {
  name: string;
  description?: string | null;
  priority: number;
  logical_operator: "AND" | "OR";
  // public_uuid de Team/Campaign (Fase 3, ya resuelto en el backend).
  target_team_id: string;
  campaign_id?: string | null;
}

export interface LeadRoutingPolicyPost extends LeadRoutingPolicyBase {
  conditions: LeadRoutingConditionPost[];
}

export interface LeadRoutingPolicyUpdate extends Partial<LeadRoutingPolicyBase> {
  conditions?: LeadRoutingConditionPost[];
}

export interface LeadRoutingPolicy extends Omit<LeadRoutingPolicyBase, "target_team_id" | "campaign_id"> {
  id: string; // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  organization_id: number;
  target_team_id: number; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  campaign_id?: number | null; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  // Fase 4: objeto anidado con el uuid real (ver backend/AGENTS.md §18). Preferir
  // target_team.id/campaign.id sobre target_team_id/campaign_id de arriba.
  target_team: Team;
  campaign?: Campaign | null;
}

export interface LeadRoutingPolicyDetailed extends LeadRoutingPolicy, Metadata {
  conditions: LeadRoutingCondition[];
}

// -----------------------------------------------------------------------
// Validate (sin persistir)
// -----------------------------------------------------------------------

export interface LeadRoutingPolicyValidateRequest {
  // public_uuid de Team/Campaign (Fase 3, ya resuelto en el backend).
  campaign_id?: string | null;
  target_team_id: string;
  logical_operator: "AND" | "OR";
  conditions: LeadRoutingConditionPost[];
}

export interface LeadRoutingPolicyValidateResponse {
  valid: boolean;
  errors: string[];
}
