import type { LeadFieldPost } from "src/types/leadFields";

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
        requiredData = { ...requiredData, mask_template_code: data.mask_template_code }
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
        field_subtype_code: data.field_subtype_code,
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
