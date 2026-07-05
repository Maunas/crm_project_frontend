import { Box, Stack, Typography } from "@mui/material"
import GenericPaper from "src/components/layout/container/GenericPaper"
import { CodeBox } from "src/components/ui/details/CodeBox"
import type { LeadFieldDetailed } from "src/types/leadFields"

interface LeadTitleConfigPreviewProps {
    selectedFields: LeadFieldDetailed[]
    fieldValues?: Record<number, unknown>
}

const formatValue = (value: unknown): string | undefined => {
    if (value == null || value === "") return undefined
    if (typeof value === "number") return String(value)
    if (Array.isArray(value)) {
        if (value.length === 0) return undefined
        return value[0].value
    }
    if (typeof value === "string") {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
    }
    return String(value)
}

export const LeadTitleConfigPreview = ({ selectedFields, fieldValues }: LeadTitleConfigPreviewProps) => {

    const isLead = Boolean(fieldValues)

    const filteredFields = selectedFields.filter(f => f.active)

    const titleParts = filteredFields.map(f => `[${f.name}]`).filter(Boolean)

    const leadTitleParts = filteredFields.map(f => {
        if (!fieldValues) return []
        const rawValue = fieldValues[f.id]
        const formatted = formatValue(rawValue)
        //Si tiene un lead, oculta los que no tienen valor
        return formatted
    }).filter(Boolean)

    const hasGenericName = titleParts.some(p => p.startsWith("["))
    const displayTitle = titleParts.length > 0 ? titleParts.join(" ") : "Sin título"
    const leadDisplayTitle = leadTitleParts.length > 0 ? leadTitleParts.join(" ") : "Sin título"

    return (
        <Stack spacing={2}>
            <GenericPaper elevation={3} sx={{ width: "100%", overflow: "hidden", p: 0 }}>
                <Box sx={{ p: 1 }}>
                    <Typography variant="body2" sx={{ display: "block", mt: 0.5 }}>
                        {filteredFields.length > 0 && (
                            `Se usará el valor de${filteredFields.length > 1 ? " los campos" : "l campo"}:${" "}`
                        )}
                    </Typography>
                </Box>
                <CodeBox>
                    <Typography sx={{ fontWeight: 600, fontStyle: titleParts.length === 0 ? "italic" : "normal" }}>
                        {displayTitle}
                    </Typography>
                </CodeBox>
                {hasGenericName && filteredFields.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", p: 1 }}>
                        Los valores entre corchetes se reemplazarán con los valores reales al guardar el lead.
                    </Typography>
                )}
            </GenericPaper>
            {isLead &&
                <GenericPaper elevation={53} sx={{ width: "100%", overflow: "hidden", p: 0 }}>
                    <Box sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5, display: "block" }}>
                            En este lead:
                        </Typography>
                    </Box>
                    <CodeBox>
                        <Typography sx={{ fontWeight: 600, fontStyle: titleParts.length === 0 ? "italic" : "normal" }}>
                            {leadDisplayTitle}
                        </Typography>
                    </CodeBox>
                </GenericPaper>
            }
        </Stack>
    )
}
