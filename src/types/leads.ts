export interface Lead {
    "id": number,
    "campaign_id": number,
    "field_values": LeadFieldValue[]
    //If detailed=true
    "created_at": string,
    "updated_at": string,
    "active"?: boolean,

}

export interface LeadFieldValue {
    "id": number,
    "field_id": number,
    "value": string,
    "nomenclator_item_id"?: number | null,
    "nomenclator_item"?: Nomenclator | null
    "lead_id": number,
    "field": LeadField,
    //If detailed=true
    "created_at"?: string,
    "updated_at"?: string,
    "active"?: boolean,
}

export interface LeadField {
    "id"?: number,
    "name": string,
    "field_type_code": string,
    "required": boolean,
    "default_value"?: string | null,
    "is_primary": boolean,
    "input_mask"?: string | null,

    "field_template_code"?: string | null,
    "is_visible": boolean,
    "order": number,
    "campaign_id"?: number,
    "nomenclator_id"?: Nomenclator | null,
    "nomenclator"?: Nomenclator | null,

    "lead_field_section"?: LeadFieldSection,
    "lead_field_section_id"?: number

    "created_at"?: string,
    "created_by"?: number,
    "updated_at"?: string,
    "active"?: boolean,
    "validation_rules"?: ValidationRule[],
}

export interface ValidationRule {
    "id": number
    "name": string
    "expression": string
    "error_message": string
    "template_code": string
    "template_params": object
    "field_id": number
}

export interface Nomenclator {
    "id": number,
    "name": string,
    "campaign_id"?: number | null
    "parent_nomenclator_id"?: number | null
    //Detailed
    "created_by"?: number,
    "created_at"?: string,
    "updated_at"?: string,
    "sub_nomenclators"?: Nomenclator[]
    "items"?: NomenclatorItem[]
}

export interface NomenclatorItem {
    "id": number,
    "code": string,
    "value": string
    "nomenclator_id": number
    "parent_item_id": number
}

export interface Campaign {
    "id": number,
    "name": string,
    "description": string
    "workspace_id": number
    //Detailed
    "active"?: boolean,
    "created_at"?: string,
    "created_by"?: number,
    "updated_at"?: string,
}

export interface LeadFieldSection {
    "id": number,
    "name": string
}

export interface Workspace {
    "id"?: number,
    "name": string,
    "description"?: string
    //Detailed
    "active"?: boolean,
    "created_at"?: string,
    "created_by"?: number,
    "updated_at"?: string,
    "campaigns"?: Campaign[]
}