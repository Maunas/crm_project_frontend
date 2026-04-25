import { useMemo, useState } from "react"
import type { LeadDetailed } from "../../../types/leads.ts"
import type { LeadFieldValueDetailed } from "../../../types/leadFields.ts"
import { formatMoney } from "../../../generalService.ts"
import { useModal } from "../../hooks/useModal.ts"
import { Accordion, AccordionDetails, AccordionSummary, Divider, Paper, Typography, Stack, IconButton, List, ListItemText } from "@mui/material"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AddressValue, BoolValue, CardValue, DateValue, ListValues, ModalValue, NewTabLink, PasswordValue, RatingValue } from "../LeadCommonComponents.tsx"
import EditIcon from "@mui/icons-material/Edit"
import { CustomListItem } from "../../common/lists/CustomListItem.tsx"
import { LeadFieldTypeIcon } from "../../leadFields/LeadFieldTypeIcon.tsx"
import { LeadPartialUpdate } from "./LeadPartialUpdate.tsx"

interface LeadDetailsSection {
    name: string,
    fields: LeadFieldValueDetailed[]
}

export const LeadFieldSections = ({ lead, updateLeadInfo }: { lead: LeadDetailed, updateLeadInfo: (lead: LeadDetailed) => void }) => {

    const { modalProps } = useModal()

    //Para seleccionar el campo para actualización parcial
    const [updatingFieldId, setUpdatingFieldId] = useState<number | null>(null)

    //Filtra leads para obtener los visibles, habilitados y con valor, ordenados por order
    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.is_visible && i.field.active && i.active &&
            (i.value || i.nomenclator_items?.length > 0 || i.related_leads?.length > 0)))
            .sort((a, b) => a.field.order - b.field.order)
    }, [lead])

    //Separa los fieldValues por sección
    const leadSections: LeadDetailsSection[] = useMemo(() => {
        const sections = new Map()
        fieldValues.forEach(fieldValue => {
            const section = fieldValue?.field?.lead_field_section
            if (!section) return
            if (sections.has(section.id)) {
                const currentSection = sections.get(section.id)
                sections.set(section.id, { ...currentSection, fields: [...currentSection.fields, fieldValue] })
            } else {
                sections.set(section.id, { name: section.name, fields: [fieldValue] })
            }
        })
        return Array.from(sections.values())
    }, [fieldValues])

    return (
        <Paper sx={{ borderRadius: 1 }}>
            {leadSections.map((section, idx) =>
                <Accordion key={`sect-${idx}`} defaultExpanded={idx === 0} disableGutters>
                    <AccordionSummary sx={{ height: "4rem" }} expandIcon={<ArrowDropDownIcon />}
                        aria-controls={`panel${idx + 1}-content`} id={`panel${idx + 1}-header`}>
                        <Typography variant="h2">{section.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingTop: 0 }}>
                        <Divider sx={{ marginBottom: 1 }} />
                        <List>
                            {section?.fields.map((fieldValue, idx) =>
                                updatingFieldId !== fieldValue.field.id ?
                                    <LeadFieldByType key={`field-${idx}`} fieldValue={fieldValue} modalProps={modalProps}
                                        onToggleEdit={() => setUpdatingFieldId(fieldValue.field.id)} />
                                    : <LeadPartialUpdate key={`field-${idx}`} fieldValue={fieldValue} updateLeadInfo={updateLeadInfo}
                                        onClose={() => setUpdatingFieldId(null)} lead={lead} />
                            )}
                        </List >
                    </AccordionDetails>
                </Accordion >
            )}
            <Accordion disableGutters>
                <AccordionSummary sx={{ height: "4rem" }} expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel0-content" id="panel0-header"
                >
                    <Typography variant="h2">Creación de Lead</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ paddingTop: 0 }}>
                    <Divider sx={{ marginBottom: 2 }} />
                    <List>
                        <LeadFieldByType value={lead?.created_at} fieldName="Fecha de Creación" type="DATE_TIME" />
                        {lead?.updated_at &&
                            <LeadFieldByType value={lead?.updated_at} fieldName="Fecha de Última Modificación" type="DATE_TIME" />
                        }
                    </List>
                </AccordionDetails>
            </Accordion>
        </Paper>
    )
}

type LeadFieldProps = {
    value: string,
    type: string,
    fieldName: string | null
} | {
    fieldValue: LeadFieldValueDetailed,
    onToggleEdit: () => void,
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    },
}

const TEMPLATES_WITH_ICONS = ["INSTAGRAM_USER", "POSTAL_CODE", "CREDIT_CARD_SIMPLE"]

// props + type permite separar entre value/type/fieldname para metadatos, o el resto para las secciones. Se discrimina por value
// En secciones se recuperan los datos desde fieldValue
export const LeadFieldByType = (props: LeadFieldProps) => {

    const isSectionInfo = "fieldValue" in props

    const fieldValue = isSectionInfo ? props.fieldValue : undefined
    const onToggleEdit = isSectionInfo ? props.onToggleEdit : undefined
    const subtypeCode = isSectionInfo ? props.fieldValue.field.field_subtype_code : undefined
    const templateCode = isSectionInfo ? props.fieldValue.field.field_template_code : undefined

    const typeCode = isSectionInfo ? props.fieldValue.field.field_type_code : props.type
    const fieldName = isSectionInfo ? props.fieldValue.field.name : props.fieldName
    const value = isSectionInfo ? props.fieldValue.value : props.value

    const valueCode = (templateCode && TEMPLATES_WITH_ICONS.includes(templateCode)) ? templateCode : typeCode

    const component = (code?: string) => {
        switch (code) {
            case "INSTAGRAM_USER": return <NewTabLink url={`https://instagram.com/${value?.substring(1)}`} value={value} />
            case "POSTAL_CODE": return <NewTabLink url={`https://www.google.com/maps/search/${value?.replaceAll(" ", "+")}`} value={value} />
            case "CREDIT_CARD_SIMPLE": return <CardValue value={`${value}`} allowShow />
            case "MONEY": return formatMoney(Number(value))
            case "RATING": return <RatingValue value={`${value}`} subtype={subtypeCode} counter />
            case "URL": return <NewTabLink url={`${value}`} />
            case "EMAIL": return <NewTabLink url={`mailto:${value}`} value={`${value}`} />
            case "ADDRESS": return <AddressValue value={`${value}`} subtype={subtypeCode} />
            case "DATE": return <DateValue date={`${value}`} />
            case "DATE_TIME": return <DateValue date={`${value}`} isDatetime />
            case "PASSWORD": return <PasswordValue value={`${value}`} allowShow />
            case "FILE": case "RICH_TEXT":
                if (!isSectionInfo) return null
                return <ModalValue value={`${value}`} idModal={`file-${fieldValue?.id}`} modalProps={props.modalProps} type={typeCode} subtype={subtypeCode} />
            case "BOOL": return <BoolValue value={`${value}`} />
            case "SELECTOR": case "CHECKBOX": return <ListValues value={fieldValue!.nomenclator_items} idFieldValue={fieldValue!.id} type="Selector" />
            case "LEAD": return <ListValues value={fieldValue!.related_leads} idFieldValue={fieldValue!.id} type="Lead" isNav />
            default: return `${value}`
        }
    }

    return (
        <CustomListItem disablePadding secondaryAction={onToggleEdit && typeCode !== "CALCULATED" &&
            <IconButton size="small" edge="end" color="primary" title="Modificar" onClick={onToggleEdit}>
                <EditIcon fontSize="small" />
            </IconButton>} >
            <LeadFieldTypeIcon typeCode={valueCode} subtypeCode={subtypeCode} />
            <ListItemText>
                <Stack spacing={.5}>
                    <Typography variant="subtitle2" color="textSecondary">{fieldName}</Typography>
                    {component(typeCode)}
                </Stack>
            </ListItemText>
        </CustomListItem>
    )
}
