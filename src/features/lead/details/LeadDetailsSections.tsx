import { useMemo, useState } from "react"
import { LeadPartialUpdate } from "./LeadPartialUpdate"
import { AddressValue, BoolValue, CardValue, DateValue, ListValues, ModalValue, NewTabLink, PasswordValue, RatingValue } from "../shared/LeadValueComponents"
import { LeadFieldTypeIcon } from "features/leadFields/LeadFieldTypeIcon"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { CustomListItem } from "shared/ui/lists/CustomListItem"
import type { LeadFieldValueDetailed } from "src/types/leadFields"
import type { LeadDetailed } from "src/types/leads"
import { useModal } from "src/hooks/useModal"
import { getFieldIconTypeCode } from "features/leadFields/leadFieldUtils"
import { formatMoney } from "src/utils/formatters"
import { Accordion, AccordionDetails, AccordionSummary, Divider, Typography, Stack, List, ListItemText, Box } from "@mui/material"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface LeadDetailsSection {
    name: string,
    fields: LeadFieldValueDetailed[]
}

interface LeadFieldSectionsProps {
    lead: LeadDetailed,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
}

export const LeadFieldSections = ({ lead, updateLeadInfo }: LeadFieldSectionsProps) => {

    //Para datos que necesitan un modal
    const { modalProps } = useModal()

    //Para seleccionar el campo para actualización parcial
    const [updatingFieldId, setUpdatingFieldId] = useState<number | null>(null)

    //Filtra leads para obtener los habilitados y con valor, ordenados por order
    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.active && i.active &&
            ((i.value && i.value !== "") || i.nomenclator_items?.length > 0 || i.related_leads?.length > 0)))
            .sort((a, b) => a.field.order - b.field.order)
    }, [lead])

    //Separa los fieldValues por sección
    const leadSections: LeadDetailsSection[] = useMemo(() => {
        const sections = new Map<number, LeadDetailsSection>()
        fieldValues.forEach(fieldValue => {
            const section = fieldValue?.field?.lead_field_section
            if (!section) return
            if (sections.has(section.id)) {
                sections.get(section.id)!.fields.push(fieldValue)
            } else {
                sections.set(section.id, { name: section.name, fields: [fieldValue] })
            }
        })
        return Array.from(sections.values())
    }, [fieldValues])

    const [expanded, setExpanded] = useState<number | null>(0)

    const onExpand = (idx: number) => (
        (_: unknown, exp: boolean) => {
            if (!exp) setExpanded(null)
            else setExpanded(idx)
        }
    )

    return (
        <Box>
            {leadSections.map((section, idx) =>
                <Accordion expanded={expanded === idx} onChange={onExpand(idx)} key={`section-${idx}`}>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />}
                        aria-controls={`panel${idx + 1}-content`} id={`panel${idx + 1}-header`}>
                        <Typography variant="h2">{section.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingTop: 0 }}>
                        <Divider sx={{ marginBottom: 1 }} />
                        <List>
                            {section?.fields.map((fieldValue, idx) =>
                                updatingFieldId !== fieldValue.field.id ?
                                    <LeadFieldContent key={`field-${idx}`} fieldValue={fieldValue} modalProps={modalProps}
                                        onToggleEdit={() => setUpdatingFieldId(fieldValue.field.id)} />
                                    : <LeadPartialUpdate key={`field-${idx}`} fieldValue={fieldValue} updateLeadInfo={updateLeadInfo}
                                        onClose={(id: number) => setUpdatingFieldId(prev => prev === id ? null : prev)} lead={lead} />
                            )}
                        </List >
                    </AccordionDetails>
                </Accordion >
            )}
            <Accordion expanded={expanded === -1} onChange={onExpand(-1)}>
                <AccordionSummary sx={{ height: "4rem" }} expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel0-content" id="panel0-header">
                    <Typography variant="h2">Creación de Lead</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ paddingTop: 0 }}>
                    <Divider sx={{ marginBottom: 2 }} />
                    <List>
                        <LeadFieldContent value={lead?.created_at} fieldName="Fecha de Creación" type="DATE_TIME" />
                        {lead?.updated_at &&
                            <LeadFieldContent value={lead?.updated_at} fieldName="Fecha de Última Modificación" type="DATE_TIME" />
                        }
                    </List>
                </AccordionDetails>
            </Accordion>
        </Box>
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
        openModalId?: string;
        handleOpen: (idModal: string) => void;
        handleClose: () => void;
    },
}
// props + type permite separar entre value/type/fieldname para metadatos, o el resto para las secciones. Se discrimina por value
// En secciones se recuperan los datos desde fieldValue
export const LeadFieldContent = (props: LeadFieldProps) => {

    const isSectionInfo = "fieldValue" in props

    const fieldValue = isSectionInfo ? props.fieldValue : undefined
    const onToggleEdit = isSectionInfo ? props.onToggleEdit : undefined
    const subtypeCode = isSectionInfo ? props.fieldValue.field.field_subtype_code : undefined
    const templateCode = isSectionInfo ? props.fieldValue.field.field_template_code : undefined

    const typeCode = isSectionInfo ? props.fieldValue.field.field_type_code : props.type
    const fieldName = isSectionInfo ? props.fieldValue.field.name : props.fieldName
    const value = isSectionInfo ? props.fieldValue.value : props.value

    const iconCode = getFieldIconTypeCode(typeCode, templateCode)


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
            default: return <span style={{ overflowWrap: "break-word" }}>{value}</span>
        }
    }

    return (
        <CustomListItem disablePadding
            secondaryAction={onToggleEdit &&
                <CommonIconButton title="Modificar" actionType="MODIFY" onClick={onToggleEdit}
                    size="small" tooltipSize="small" color="primary"
                    disabled={typeCode === "CALCULATED" || !fieldValue?.field.is_visible} />
            } >
            <LeadFieldTypeIcon typeCode={iconCode} subtypeCode={subtypeCode} />
            <ListItemText sx={{ mr: 6 }}>
                <Stack>
                    <Typography variant="subtitle2" color="textSecondary">{fieldName}</Typography>
                    {component(iconCode)}
                </Stack>
            </ListItemText>
        </CustomListItem>
    )
}
