import type { FieldArrayWithId } from "react-hook-form";
import type { LeadField, LeadFieldDetailed, LeadFieldPost, LeadFieldsBySection, LeadFieldValue } from "src/types/leadFields";
import type { LeadPostForm } from "../lead/leadForm/LeadForm";
import { getNativeFieldSectionName } from "../lead/nativeLeadFields";

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
        //A diferencia del resto de los campos de tipo/nomenclador, esta dependencia se puede
        //modificar también en la edición, no solo al crear (ver campos_personalizados.md §11)
        depends_on_field_id: data.depends_on_field_id ?? null,
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
    const sections = new Map<string, LeadFieldsBySection<T>>()
    fields.forEach(field => {
        const section = "field" in field ? field.field?.lead_field_section : field?.lead_field_section
        if (!section) return []
        if (sections.has(section.id)) {
            sections.get(section.id)!.fields.push(field)
        } else {
            sections.set(section.id, { id: section.id, name: section.name, sectionData: section, fields: [field] })
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
    const sections = new Map<string, LeadFieldsBySection<FieldArrayWithId<LeadPostForm, "values", "id">>>()
    fields.forEach(field => {
        const section = field.fieldData.lead_field_section
        if (!section) return []
        if (sections.has(section.id)) {
            sections.get(section.id)!.fields.push(field)
        } else {
            sections.set(section.id, { id: section.id, name: section.name, sectionData: section, fields: [field] })
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

export interface FieldSelectorGroup<T> {
    name: string
    fields: T[]
}

type SectionableField = {
    id: string | number,
    lead_field_section?: { name: string } | null
}

/**
 * Nombre de la sección con la que se agrupa un campo en un selector (filtros, columnas,
 * automatizaciones, enrutamiento): para un campo nativo (id negativo) es su sección sintética
 * (ver `getNativeFieldSectionName` en `nativeLeadFields.ts`); para un campo custom es el nombre de
 * su `lead_field_section` real. Se usa tanto para armar los grupos "a mano" (Select) como para el
 * `groupBy` de un Autocomplete (pedido del usuario 2026-07-25, para no repetir el criterio en cada
 * selector de campo de la app).
 */
export const getFieldSelectorGroupName = (field: SectionableField): string =>
    ((!isNaN(Number(field.id)) && Number(field.id) < 0) ? getNativeFieldSectionName(Number(field.id)) : undefined) ?? field.lead_field_section?.name ?? 'Otros'

/**
 * Agrupa una lista de campos (nativos + custom mezclados) en secciones contiguas, preservando el
 * orden relativo dentro de cada sección y el orden de aparición de las secciones (los nativos
 * quedan primero porque ya vienen primero en la lista de entrada, ver `NATIVE_LEAD_FIELDS`).
 * Pensado para selectores de "elegir un campo" -- no reemplaza a `getFieldsBySections` (que además
 * arrastra fieldValues/sectionData completos para la vista de detalle del lead).
 */
export const groupFieldsForSelector = <T extends SectionableField>(fields: T[]): FieldSelectorGroup<T>[] => {
    const groups: FieldSelectorGroup<T>[] = []
    const indexByName = new Map<string, number>()
    fields.forEach(field => {
        const name = getFieldSelectorGroupName(field)
        if (!indexByName.has(name)) {
            indexByName.set(name, groups.length)
            groups.push({ name, fields: [] })
        }
        groups[indexByName.get(name)!].fields.push(field)
    })
    return groups
}

/** Aplana los grupos de `groupFieldsForSelector` de vuelta a una lista, ya reordenada por sección (contigua). */
export const flattenGroupedFields = <T,>(groups: FieldSelectorGroup<T>[]): T[] => groups.flatMap(g => g.fields)

//Separa los fieldValues por sección, devolviendo únicamente sus ids.
export const getLeadFieldsBySectionsIds = (leadFields: LeadFieldDetailed[] | null) => {
    if (!leadFields || leadFields.length === 0) return []
    const fieldsBySections = getFieldsBySections(leadFields)
    return fieldsBySections.map(section => {
        return { sectId: section.id, sectName: section.name, fields: section.fields.map(field => field.id) }
    })
}
