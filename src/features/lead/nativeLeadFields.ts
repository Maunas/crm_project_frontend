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
]
