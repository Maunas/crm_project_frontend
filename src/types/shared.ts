import type { Path } from "react-hook-form";
import type { Lead } from "./leads";
import type { Campaign, Workspace } from "./campaigns";
import type { Nomenclator, NomenclatorItem } from "./nomenclators";

export interface DisableableEntity {
  active?: boolean,
}

/**
 * Define la estructura de una lista con paginación. Se llama como: Paginable<Lead>.
 */
export interface Paginable<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: T[];
}

/**
 * Contiene los metadatos de los elementos comunes obtenidos como "detailed".
 */
export interface Metadata {
  created_at: string;
  updated_at?: string;
  active: boolean;
  // created_by/updated_by ya no los manda el backend (Fase 3 de "ID público por
  // UUID" -- ver backend/AGENTS.md §18): eran redundantes con creator/updater,
  // que ya traen toda la data del usuario. Usar creator?.id / updater?.id en su lugar.
  creator?: Creator | null;
  updater?: Updater | null;
}

export interface Creator {
  id: number;
  name: string | null;
  last_name?: string | null;
  email: string | null;
}

export interface Updater {
  id: number;
  name: string | null;
  last_name?: string | null;
  email: string | null;
}

/**
 * Contienen los parámetros permitidos de cada request.
 */


export interface OrderParams {
  order_by?: number | string | null,
  ascending?: boolean
}
export interface SearchParams {
  search?: string,
  search_fields?: string
}

export interface OrderSearchParams extends OrderParams, SearchParams {
  only_active?: boolean,
}

export interface ListParams extends OrderParams, SearchParams {
  detailed?: boolean,
  page?: number,
  page_size?: number,
  only_active?: boolean,
}
export interface WorkspaceParams extends ListParams {
  // FK a Organization: public_uuid desde Fase 3 (el backend ya resuelve este filtro).
  organization_id?: string
}
export interface CampaignParams extends ListParams {
  // FK a Workspace: public_uuid desde Fase 3 (el backend ya resuelve este filtro).
  workspace_id?: string
}
export interface LeadListParams extends ListParams {
  // FK a Campaign: public_uuid desde Fase 3 (el backend ya resuelve este filtro).
  campaign_id?: string
  query?: string
}
export interface LeadFlowParams extends ListParams {
  organization_id?: number
}
export interface FlowStateParams extends LeadFlowParams {
  // FK a LeadFlow: puede llegar como public_uuid (Fase 3, ej. FlowEditorPage con el id propio
  // del flujo) o como el int interno viejo (ej. Campaign.lead_flow_id, todavía sin migrar --
  // deuda catalogada en campaign_service.py, ver backend/AGENTS.md §18). El backend resuelve
  // ambas formas igual como filtro.
  lead_flow_id: string | number
}

export interface FieldAutomationParams extends ListParams {
  // FK a Campaign: public_uuid desde Fase 3 (el backend ya resuelve este filtro).
  campaign_id?: string
}

export interface SystemAuditParams extends ListParams {
  start_date?: string,
  end_date?: string,
  date_field?: string,
}

/**
 * Contiene los formatos de mensaje de error.
 */
export interface SimpleErrorBody {
  message?: string //Error en el cuerpo
  detail?: string //Error en el cuerpo
  response?: {
    data: {
      detail: string | //Si el error no tiene identificador
      SimpleErrorMessage | [SimpleErrorMessage]
      message?: string
    }
  }
}
export interface SimpleErrorMessage {
  field: string,
  message: string
}

export interface ErrorBody<T> extends Omit<SimpleErrorBody, "response"> {
  response?: {
    data: {
      detail: string | //Si el error no tiene identificador
      ErrorMessage<T> | //Un solo error de formulario
      [ErrorMessage<T>] //Lista de errores de formulario
      message?: string
    }
  }
}
export interface ErrorMessage<T> {
  field: Path<T>,
  message: string
}

export interface DeleteResponse {
  action: "deleted" | "disabled"
}

export interface BulkDeleteResponse {
  deleted: number[],
  disabled: number[],
  failed: number[],
}
export interface BulkEnableResponse {
  activated: number[],
  already_active: number[],
  failed: number[],
}

export interface EnableResponse {
  actived: boolean
}

export interface SearchResults {
  leads: Lead[],
  campaigns: Campaign[],
  workspaces: Workspace[],
  nomenclators: Nomenclator[],
  nomenclator_items: NomenclatorItem[],
}

export interface LeadFilter {
  "field_id"?: number | string,
  "operator"?: string,
  "value"?: string | number | boolean | number[]
}

export interface Dictionary {
  "lead_search_operators"?: DictionaryItem[]
  "routing_condition_types"?: DictionaryItem[]
  "team_roles"?: DictionaryItem[]
  "lead_states_categories"?: DictionaryItem[],
  "lead_view_visibilities"?: DictionaryItem[],
  "automation_compatibility_matrix"?: AutomationCompatibility[],
  "entities"?: DictionaryItem[],
  "system_audit_log_actions"?: DictionaryItem[],
}

export interface DictionaryItem {
  "code": string,
  "label": string,
}

export type DateFormat = "dateTime" | "dateTimeLong" | "date" | "dateLong" | "time" | "custom"

export type OptionWithAction<T> = (T & { isAction?: undefined }) | { id: string, name: string, isAction: boolean }

export interface AutomationCompatibility {
  "field_type": {
    "operators": string[],
    "actions": string[],
  }
}

export interface ColorShades {
  LIGHTER: string,
  LIGHT: string,
  MAIN: string,
  DARK: string,
  DARKER: string,
}