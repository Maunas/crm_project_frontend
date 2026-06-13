import type { FieldArrayWithId } from "react-hook-form";
import type { LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldsBySection, LeadFieldValue } from "src/types/leadFields";
import type { LeadPostForm } from "../lead/leadForm/LeadForm";

/**
 * Organiza los datos de LeadField, para evitar enviar campos incompatibles con el método de creación (template/manual)
 */
export const getFieldDataByType = (data: LeadFieldPost, isTemplate = false, isMaskTemplate = false): LeadFieldPost => {
    let requiredData: LeadFieldPost = {
        name: data.name,
        order: data.order,
        campaign_id: data.campaign_id,
        required: data.required,
        is_primary: data.is_primary,
        is_visible: data.is_visible,
        lead_field_section_id: data.lead_field_section_id,
        default_value: data.default_value,
    };

    //Si la máscara es por template, devuelve el código unicamente
    if (isMaskTemplate) {
        requiredData = {
            ...requiredData,
            mask_template_code: data.mask_template_code !== "NULL" ? data.mask_template_code : undefined
        }
    } else {
        requiredData = { ...requiredData, input_mask: data.input_mask }
    }

    //Si es por template, devuelve el código unicamente
    if (isTemplate)
        return { ...requiredData, field_template_code: data.field_template_code };

    //Si no se ha enviado el tipo, se recibe error de validación del backend
    if (!data.field_type_code) return requiredData;

    //Casos especiales por tipo de dato
    const manualData: LeadFieldPost = {
        ...requiredData,
        field_type_code: data.field_type_code,
        field_subtype_code: data.field_subtype_code !== "NULL" ? data.field_subtype_code : undefined,
    };

    switch (data.field_type_code) {
        case "SELECTOR":
        case "CHECKBOX":
            return { ...manualData, nomenclator_id: data.nomenclator_id };
        case "LEAD":
            return { ...manualData, related_campaign_id: data.related_campaign_id };
        case "CALCULATED":
            return {
                ...manualData,
                calculation_expression: data.calculation_expression,
            };
        default:
            return manualData;
    }
};


const SPECIAL_TEMPLATES = ["INSTAGRAM_USER", "POSTAL_CODE", "CREDIT_CARD_SIMPLE"]
/**
 * Obtiene el código de un template para buscar su ícono, únicamente si tiene código. Si no, devuelve el código de tipo.
 */
export const getTypeOrSpecialTemplates = (typeCode: string, templateCode?: string | null) => {
    return (templateCode && SPECIAL_TEMPLATES.includes(templateCode)) ? templateCode : typeCode
}

//Separa los fieldValues por sección
export const getFieldsBySections = <T extends LeadFieldValue | LeadField>(fields: T[]) => {
    const sections = new Map<number, LeadFieldsBySection<T>>()
    fields.forEach(field => {
        const section = "field" in field ? field.field?.lead_field_section : field?.lead_field_section
        if (!section) return []
        if (sections.has(section.id)) {
            sections.get(section.id)!.fields.push(field)
        } else {
            sections.set(section.id, { id: section.id, name: section.name, fields: [field] })
        }
    })
    return Array.from(sections.values())
}

//Ordena los fieldValues por sección
export const orderFieldsBySections = <T extends LeadFieldValue | LeadField>(fields: T[]) => {
    return getFieldsBySections(fields).flatMap(section => section.fields)
}

//Separa los fields de LeadForm por sección, agregando un globalIdx para el formulario (UseFieldArray)
export const getLeadFormFieldsBySections = (fields: FieldArrayWithId<LeadPostForm, "values", "id">[]) => {
    const sections = new Map<number, LeadFieldsBySection<FieldArrayWithId<LeadPostForm, "values", "id">>>()
    fields.forEach(field => {
        const section = field.fieldData.lead_field_section
        if (!section) return []
        if (sections.has(section.id)) {
            sections.get(section.id)!.fields.push(field)
        } else {
            sections.set(section.id, { id: section.id, name: section.name, fields: [field] })
        }
    })
    const sectionsList = Array.from(sections.values())
    let globalIdx = 0
    const finalList = sectionsList.map(section => {
        return {
            ...section, fields: section.fields.map(field => {
                return { field, globalIdx: globalIdx++ }
            })
        }
    })
    return finalList
}

//Separa los fieldValues por sección, devolviendo únicamente sus ids.
export const getLeadFieldsBySectionsIds = (leadFields: LeadFieldDetailed[] | null) => {
    if (!leadFields || leadFields.length === 0) return []
    const fieldsBySections = getFieldsBySections(leadFields)
    return fieldsBySections.map(section => {
        return { sectId: section.id, sectName: section.name, fields: section.fields.map(field => field.id) }
    })
}
