import type { DeleteResponse } from "src/types/shared";
import { type FieldValidationRule, type FieldValidationRuleTemplate, type FieldValidationRulePost } from "src/types/leadFields";
import axiosCRM from "src/lib/axios";

export const getValidationTemplates = async (): Promise<FieldValidationRuleTemplate[]> => {
    const val = await axiosCRM.get(`templates/validation_rules`);
    return val.data;
};

export const createValidation = async (body: FieldValidationRulePost): Promise<FieldValidationRule> => {
    const val = await axiosCRM.post(`validation_rules`, body);
    return val.data;
};

export const updateValidation = async (body: FieldValidationRulePost, id: number): Promise<FieldValidationRule> => {
    const val = await axiosCRM.put(`validation_rules/${id}`, body);
    return val.data;
};

export const deleteValidation = async (id: number): Promise<DeleteResponse> => {
    const val = await axiosCRM.delete(`validation_rules/${id}`);
    return val.data;
};
