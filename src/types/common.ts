import type { Path } from "react-hook-form";
import type { Lead } from "./leads";
import type { Campaign, Workspace } from "./campaigns";
import type { Nomenclator, NomenclatorItem } from "./nomenclators";

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
  created_by: number;
  updated_by?: number;
}

/**
 * Contienen los parámetros permitidos de cada request.
 */
export interface ListParams {
  only_active?: boolean,
  detailed?: boolean,
  page?: number,
  page_size?: number,
  order_by?: number | string | null,
  ascending?: boolean
}
export interface WorkspaceParams extends ListParams {
  organization_id?: number
}
export interface CampaignParams extends ListParams {
  workspace_id?: number
}
export interface LeadListParams extends ListParams {
  campaign_id?: number
}

/**
 * Contiene los formatos de mensaje de error.
 */
export interface ErrorMessage<T> {
  field: Path<T>,
  message: string
}
export interface ErrorBody<T> {
  message?: string //Error en el cuerpo
  response?: {
    data: {
      detail: string | //Si el error no tiene identificador
      ErrorMessage<T> | //Un solo error de formulario
      [ErrorMessage<T>] //Lista de errores de formulario
    }
  }
}

export interface DeleteResponse {
  action: string
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
  "field_id"?: number,
  "operator"?: string,
  "value"?: string | number | boolean
}

export interface Dictionary {
  "lead_search_operators"?: DictionaryItem[]
  "routing_condition_types"?: DictionaryItem[]
  "team_roles"?: DictionaryItem[]
  "lead_states_categories"?: DictionaryItem[]
}

export interface DictionaryItem {
  "code": string,
  "label": string,
}