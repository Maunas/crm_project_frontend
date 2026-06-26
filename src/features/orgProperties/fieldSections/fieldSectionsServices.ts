import axiosCRM from "src/lib/axios";
import type { LeadFieldSection, LeadFieldSectionDetailed } from "src/types/orgProperties";
import type { ListParams, Paginable } from "src/types/shared";
import { orderListByField } from "src/utils/lists";

export const getFieldSections = async <T extends ListParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? LeadFieldSectionDetailed : LeadFieldSection
>> => {
    const sections = await axiosCRM.get(`lead_field_sections`, { params });
    return { ...sections.data, items: orderListByField(sections.data.items, "id") };
};
