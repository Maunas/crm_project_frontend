import type { LeadField, LeadFieldType } from 'src/types/leadFields'

const NATIVE_TYPE: LeadFieldType = { id: -1, code: 'NATIVE_ID', description: 'Campo nativo del sistema' }
const DATE_TYPE: LeadFieldType   = { id: -2, code: 'DATE',      description: 'Fecha' }

const base = {
    field_subtype: null,
    field_template_name: null,
    order: -1,
    title_order: -1,
    organization_id: 0,
    lead_field_section: null as unknown as LeadField['lead_field_section'],
    campaign_id: 0,
    required: false,
    is_primary: false,
    is_visible: true,
}

/**
 * Campos nativos del modelo Lead que se tratan como campos virtuales.
 * Usan IDs negativos para no colisionar con los IDs de campos custom (positivos).
 * Se inyectan en la lista de leadFields para filtros y columnas de tabla.
 */
export const NATIVE_LEAD_FIELDS: LeadField[] = [
    { ...base, id: -1, name: 'Estado',                 field_type_code: 'NATIVE_ID', field_subtype_code: null, field_type: NATIVE_TYPE, nativeKey: 'contact_state_id'     },
    { ...base, id: -2, name: 'Etapa',                  field_type_code: 'NATIVE_ID', field_subtype_code: null, field_type: NATIVE_TYPE, nativeKey: 'current_state_id'      },
    { ...base, id: -3, name: 'Equipo',                 field_type_code: 'NATIVE_ID', field_subtype_code: null, field_type: NATIVE_TYPE, nativeKey: 'team_id'               },
    { ...base, id: -4, name: 'Asignado a',             field_type_code: 'NATIVE_ID', field_subtype_code: null, field_type: NATIVE_TYPE, nativeKey: 'assigned_to_user_id'   },
    { ...base, id: -5, name: 'Fecha de creación',      field_type_code: 'DATE',      field_subtype_code: 'DATE_ONLY', field_type: DATE_TYPE,  nativeKey: 'created_at'           },
    { ...base, id: -6, name: 'Fecha de actualización', field_type_code: 'DATE',      field_subtype_code: 'DATE_ONLY', field_type: DATE_TYPE,  nativeKey: 'updated_at'           },
    { ...base, id: -7, name: 'Usuario Creador',        field_type_code: 'NATIVE_ID', field_subtype_code: null, field_type: NATIVE_TYPE, nativeKey: 'created_by'            },
    { ...base, id: -8, name: 'Usuario Modificación',   field_type_code: 'NATIVE_ID', field_subtype_code: null, field_type: NATIVE_TYPE, nativeKey: 'updated_by'            },
]

/**
 * nativeKey de los campos nativos que se pueden sobreescribir (Automatizaciones de Campos: acción
 * "Establecer valor"/"Copiar de otro campo" como destino). Los otros 4 (fechas, creador/modificador)
 * son hechos de auditoría -- se pueden leer en condiciones y usar como origen de copia, pero no
 * tiene sentido "setearlos" a mano. Debe reflejar exactamente `WRITABLE_NATIVE_FIELD_IDS` de
 * `backend/app/core/native_lead_fields.py`.
 */
export const WRITABLE_NATIVE_KEYS: string[] = ['contact_state_id', 'current_state_id', 'team_id', 'assigned_to_user_id']

/** Listas de opciones reales para los selectores de valor de los campos nativos tipo NATIVE_ID. */
export interface NativeFieldOptions {
    contactStates: { id: number, name: string, color?: string | null }[]
    leadStates: { id: number, name: string, color?: string | null }[]
    teams: { id: number, name: string }[]
    users: { id: number, name: string, last_name?: string | null, email: string }[]
}

/**
 * Sección sintética de cada campo nativo, usada para agrupar visualmente los selectores de campo
 * (filtros, columnas, automatizaciones, enrutamiento) igual que ya se agrupan los campos custom por
 * su `lead_field_section` real. No existe una sección de base de datos para esto -- son 3 grupos
 * fijos definidos acá, con el mismo criterio "Creación"/"Modificación" del detalle del lead (pedido
 * del usuario 2026-07-25).
 */
const NATIVE_SECTION_BY_ID: Record<number, string> = {
    [-1]: 'Datos del Lead',   // Estado
    [-2]: 'Datos del Lead',   // Etapa
    [-3]: 'Datos del Lead',   // Equipo
    [-4]: 'Datos del Lead',   // Asignado a
    [-5]: 'Creación',         // Fecha de creación
    [-7]: 'Creación',         // Usuario Creador
    [-6]: 'Modificación',     // Fecha de actualización
    [-8]: 'Modificación',     // Usuario Modificación
}

/** Nombre de la sección sintética de un campo nativo (por su id negativo), o `undefined` si no es nativo. */
export const getNativeFieldSectionName = (fieldId: number): string | undefined => NATIVE_SECTION_BY_ID[fieldId]
