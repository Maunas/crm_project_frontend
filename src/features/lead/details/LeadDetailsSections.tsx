import { useMemo, useState } from "react"
import { LeadPartialUpdate } from "./LeadPartialUpdate"
import { BoolValue, DateValue, ListValues, ModalValue, NumberValue, StringValue } from "../shared/LeadValueComponents"
import { LeadFieldTypeIcon } from "features/leadFields/LeadFieldTypeIcon"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { CustomListItem } from "shared/ui/lists/CustomListItem"
import type { LeadFieldValueDetailed } from "src/types/leadFields"
import type { LeadDetailed } from "src/types/leads"
import { useModal } from "src/hooks/useModal"
import { getTypeOrSpecialTemplates } from "features/leadFields/leadFieldUtils"
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
    const nomenclators = isSectionInfo ? props.fieldValue.nomenclator_items : undefined
    const leads = isSectionInfo ? props.fieldValue.related_leads : undefined
    const onToggleEdit = isSectionInfo ? props.onToggleEdit : undefined
    const subtypeCode = isSectionInfo ? props.fieldValue.field.field_subtype_code : undefined
    const templateCode = isSectionInfo ? props.fieldValue.field.field_template_code : undefined
    const modalProps = isSectionInfo ? props.modalProps : undefined

    const typeCode = isSectionInfo ? props.fieldValue.field.field_type_code : props.type
    const fieldName = isSectionInfo ? props.fieldValue.field.name : props.fieldName
    const value = isSectionInfo ? props.fieldValue.value : props.value

    const typeWithTemplates = getTypeOrSpecialTemplates(typeCode, templateCode)


    const component = (code?: string) => {
        switch (code) {
            //Templates especiales
            case "INSTAGRAM_USER":
            case "POSTAL_CODE":
            case "CREDIT_CARD_SIMPLE": return <StringValue value={`${value}`} subtype={code} />

            //Tipos de Field
            case "STRING": return <StringValue value={`${value}`} idModal={`${fieldValue?.field_id}-${fieldValue?.id}`}
                modalProps={modalProps} subtype={subtypeCode ?? undefined} />
            case "NUMBER": return <NumberValue value={typeof value === "string" ? parseInt(value) : undefined}
                subtype={subtypeCode!} ratingCounter />

            case "BOOL": return <BoolValue value={`${value}`} />

            case "DATE":
            case "DATE_TIME": return <DateValue date={`${value}`} subtype={subtypeCode ?? undefined} />

            case "SELECTOR": case "CHECKBOX":
                return <ListValues value={Array.isArray(nomenclators) ? nomenclators : []} idFieldValue={fieldValue?.id}
                    type="Selector" />
            case "LEAD":
                return <ListValues value={Array.isArray(leads) ? leads : []} idFieldValue={fieldValue?.id}
                    type="Lead" isNav />

            case "FILE": return <ModalValue value={`${value}`} idModal={`file-${fieldValue?.id}`}
                modalProps={modalProps} type={code} subtype={subtypeCode!} />

            default: return `${value}`
        }
    }

    return (
        <CustomListItem disablePadding
            secondaryAction={onToggleEdit &&
                <CommonIconButton title="Modificar" actionType="MODIFY" onClick={onToggleEdit}
                    size="small" tooltipSize="small" color="primary"
                    disabled={typeCode === "CALCULATED" || !fieldValue?.field.is_visible} />
            } >
            <LeadFieldTypeIcon typeCode={typeWithTemplates} subtypeCode={subtypeCode} />
            <ListItemText sx={{ mr: 6 }}>
                <Stack>
                    <Typography variant="subtitle2" color="textSecondary">{fieldName}</Typography>
                    {component(typeWithTemplates)}
                </Stack>
            </ListItemText>
        </CustomListItem>
    )
}
