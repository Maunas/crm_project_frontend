import type { Metadata } from "./shared"

// Mismos 6 campos que ThemeConfig en el backend (web_form_schema.py) -- schema cerrado, no
// admite CSS libre todavía (el usuario pidió dejarlo para más adelante).
export interface ThemeConfig {
  primary_color: string
  background_color: string
  text_color: string
  button_text_color: string
  border_radius: string
  font_family: string
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primary_color: "#3B82F6",
  background_color: "#FFFFFF",
  text_color: "#1F2937",
  button_text_color: "#FFFFFF",
  border_radius: "6px",
  font_family: "Inter, sans-serif",
}

// Versión mínima de LeadField que trae WebFormFieldResponse.lead_field (LeadFieldLiteResponse
// en el backend) -- no confundir con el LeadField completo de types/leadFields.ts.
export interface WebFormLeadFieldLite {
  id: string
  active: boolean
  name: string
  order: number
  field_type_code?: string | null
  field_subtype_code?: string | null
  title_order?: number | null
  subtitle_order?: number | null
}

// Opción de un campo tipo Lista (SELECTOR/CHECKBOX), resuelta server-side solo para el
// endpoint público -- ver WebFormFieldResponse.nomenclator_items (backend, gap resuelto
// 2026-08-17).
export interface WebFormFieldOption {
  id: string
  active: boolean
  value: string
}

export interface WebFormFieldBase {
  // public_uuid del LeadField real de la campaña. Los campos nativos (Estado, Etapa, Usuario
  // Creador, etc.) NO se pueden agregar a un formulario web -- _validate_form_fields (backend)
  // los rechaza porque no son filas reales de LeadField.
  lead_field_id: string
  order: number
  custom_label?: string | null
  custom_placeholder?: string | null
  // Obligatorio a nivel FORMULARIO -- independiente de LeadField.required (obligatorio a nivel
  // sistema/campaña). Puede ser distinto: acá el lead se autocompleta, ahí lo carga un vendedor.
  is_required: boolean
  // Si tiene valor, el campo NO se muestra al visitante -- se envía este valor fijo al crear el lead.
  hidden_value?: string | null
}

export interface WebFormFieldPost extends WebFormFieldBase { }

export interface WebFormField extends WebFormFieldBase {
  id: string
  active: boolean
  web_form_id: number
  lead_field?: WebFormLeadFieldLite | null
  nomenclator_items?: WebFormFieldOption[] | null
}

export interface WebFormBase {
  name: string
  title?: string | null
  description?: string | null
  theme_config?: ThemeConfig | null
  success_message?: string | null
  redirect_url?: string | null
  allowed_domains?: string[] | null
  require_captcha: boolean
  active: boolean
}

export interface WebFormPost extends WebFormBase {
  campaign_id: string
  fields?: WebFormFieldPost[]
}

// Igual que WebFormPost pero sin campaign_id (nunca se puede cambiar de campaña) y todo opcional
// -- si se manda `fields`, reemplaza la lista completa (no hace merge).
export type WebFormUpdateBody = Partial<WebFormBase> & { fields?: WebFormFieldPost[] }

export interface WebForm extends WebFormBase {
  id: string
  organization_id: number
  // FK embebida sin migrar (igual que CampaignResponse.campaign_id en otros módulos): sigue
  // siendo el id interno, no el public_uuid.
  campaign_id: number
}

export interface WebFormDetailed extends WebForm, Metadata {
  fields: WebFormField[]
}

// Respuesta del endpoint público (GET /public/forms/{uuid}, sin auth) -- recortada
// deliberadamente en el backend para no filtrar organization_id/campaign_id/name/allowed_domains.
// OJO: acá la clave es `public_uuid`, no `id` (a diferencia del resto de las respuestas de la
// API) -- WebFormPublicResponse no hereda de BaseResponse.
export interface WebFormPublic {
  public_uuid: string
  title?: string | null
  description?: string | null
  theme_config?: ThemeConfig | null
  success_message?: string | null
  redirect_url?: string | null
  require_captcha: boolean
  fields: WebFormField[]
}

export interface WebFormSubmitResponse {
  success: boolean
  message?: string
}
