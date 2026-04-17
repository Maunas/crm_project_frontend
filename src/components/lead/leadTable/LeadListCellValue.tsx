import { memo, useCallback, useMemo } from "react";
import { formatMoney } from "../../../generalService"
import type { LeadFieldValue } from "../../../types/leadFields"
import { AddressValue, BoolValue, DateValue, ListValues, ModalValue, NewTabLink, PasswordValue, RatingValue } from "../LeadCommonComponents"

interface CellValueProps {
    leadId: number,
    fieldValue?: LeadFieldValue,
    type?: string | null,
    subtype?: string | null,
    modalProps?: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
}
export const LeadListCellValue = memo(({ fieldValue, type, subtype, modalProps }: CellValueProps) => {

    const getValue = useCallback((field_value: LeadFieldValue | undefined) => {
        if (!field_value) return null
        if (field_value.value && field_value.value !== "") return `${field_value.value}`
        else if (field_value?.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items
        }
        else if (field_value?.related_leads?.length > 0) {
            return field_value.related_leads
        }
        else return null
    }, [])

    const value = useMemo(() => getValue(fieldValue), [getValue, fieldValue])

    if (!fieldValue || !value) {
        return "---"
    }

    switch (type) {
        case "MONEY": return formatMoney(Number(value))
        case "RATING": return <RatingValue value={`${value}`} subtype={subtype!} size="small" tooltip />
        case "URL": return <NewTabLink url={`${value}`} />
        case "EMAIL": return <NewTabLink url={`mailto:${value}`} value={`${value}`} />
        case "ADDRESS": return <AddressValue value={`${value}`} subtype={subtype!} />
        case "DATE": return <DateValue date={`${value}`} short />
        case "DATE_TIME": return <DateValue date={`${value}`} isDatetime short />
        case "PASSWORD": return <PasswordValue value={`${value}`} />
        case "FILE": case "RICH_TEXT": return <ModalValue value={`${value}`} size="small"
            idModal={`file-${fieldValue?.id}`} modalProps={modalProps}
            type={type} subtype={subtype!} />
        case "BOOL": return <BoolValue value={`${value}`} size="small" />
        // En tabla priorizamos performance: texto compacto en vez de Chips
        case "SELECTOR": case "CHECKBOX":
            return <ListValues value={value} idFieldValue={fieldValue.id} type="Selector" maxItems={2} />
        case "LEAD":
            return <ListValues value={value} idFieldValue={fieldValue.id} type="Lead" maxItems={2} />
        default: return `${value}`
    }
})