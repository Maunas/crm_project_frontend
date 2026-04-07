import type { LeadFieldValue } from "../../../types/leadFields"

interface CellValueProps {
    fieldValue?: LeadFieldValue,
    type?: string | null,
    subtype?: string | null
}
export const LeadListCellValue = ({ fieldValue, type, subtype }: CellValueProps) => {

    const getValue = (field_value: LeadFieldValue | undefined) => {
        if (!field_value) return "---"
        if (field_value.value && field_value.value !== "") return `${field_value.value}`
        else if (field_value?.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items
        }
        else if (field_value?.related_leads?.length > 0) {
            return field_value.related_leads
        }
        else return "---"
    }

    switch (type) {
        case "MONEY": return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(getValue(fieldValue)))
        default: return `${getValue(fieldValue)} ${type} ${subtype}`
    }

}