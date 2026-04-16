import { useEffect, useMemo, useState } from "react"
import { LeadActivities } from "./LeadActivities.tsx"
import { GenericPaper } from "../../common/layout/GenericContainer.tsx"
import { CommonButton } from "../../common/details/DetailsCommonButton.tsx"
import { CustomChip } from "../../common/details/StyledDisplayComponents.tsx"
import type { LeadDetailed } from "../../../types/leads"
import type { LeadFieldValue } from "../../../types/leadFields"
import { formatMoney } from "../../../generalService.ts"
import { disableLead, enableLead, getLead } from "../leadService.ts"
import { useModal } from "../../hooks/useModal.ts"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Divider, Grid, Paper, Typography, ButtonGroup, Stack } from "@mui/material"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AddressValue, BoolValue, CardValue, DateValue, ListValues, ModalValue, NewTabLink, PasswordValue, RatingValue } from "../LeadCommonComponents.tsx"

export const LeadDetails = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        if (id) getLead(parseInt(id)).then(setLead)
    }, [id])

    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.is_visible && i.field.active && i.active &&
            (i.value || i.nomenclator_items?.length > 0 || i.related_leads?.length > 0)))
            .sort((a, b) => a.field.order - b.field.order)
    }
        , [lead])

    const handleActive = (lead: LeadDetailed) => {
        if (!lead.active) enableLead(lead.id).then(() => setLead({ ...lead, active: true }))
        else disableLead(lead.id).then(res => {
            if (res.action === "deleted") return nav("/leads")
            else return setLead({ ...lead, active: false })
        })
    }

    return (
        <Container maxWidth={false}>
            <Grid container gap={3}>
                <Grid size={{ xs: 12, md: 4, lg: 4 }} minWidth="20rem" >
                    {lead && fieldValues &&
                        <Stack gap={2}>
                            <GenericPaper>
                                <Grid container gap={3} alignItems="center">
                                    <Grid container size="grow" gap={2} alignItems="center" justifyContent="space-between">
                                        <Typography variant="h1">
                                            {fieldValues[0]?.value ?? "Lead no encontrado"}
                                        </Typography>
                                        <CustomChip label={lead?.active ? "Habilitado" : "Deshabilitado"}
                                            color={lead?.active ? "success" : "error"} sx={{ marginLeft: "auto" }} />
                                    </Grid>
                                    <ButtonGroup fullWidth>
                                        <CommonButton actionType={lead.active ? "DISABLE" : "ENABLE"} variant="outlined"
                                            color={lead.active ? "error" : "success"} onClick={() => handleActive(lead)}>
                                            {lead.active ? "Eliminar" : "Habilitar"}
                                        </CommonButton>
                                        <CommonButton actionType="MODIFY" variant="contained" color="primary"
                                            component={RouterLink} to={`/leads/modify/${lead?.id}`}>
                                            Modificar
                                        </CommonButton>
                                    </ButtonGroup>
                                </Grid>
                            </GenericPaper>
                            <Paper sx={{ borderRadius: 1 }}>
                                <LeadFieldSections fieldValues={fieldValues} />
                                <Accordion disableGutters sx={{ boxShadow: "none" }}>
                                    <AccordionSummary sx={{ height: "4rem" }}
                                        expandIcon={<ArrowDropDownIcon />}
                                        aria-controls="panel0-content" id="panel0-header"
                                    >
                                        <Typography variant="h2">Creación de Lead</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ paddingTop: 0 }}>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <Box px={2}>
                                            <Typography sx={{ fontWeight: 600 }} variant="body1">Fecha de Creación:</Typography>
                                            <LeadFieldByType value={lead?.created_at} type="DATE" />
                                            <Typography sx={{ fontWeight: 600 }} variant="body1">Fecha de Última Modificación:</Typography>
                                            <LeadFieldByType value={lead?.updated_at} type="DATE" />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Paper>
                        </Stack>
                    }
                </Grid>
                <Grid size="grow" minWidth="20rem" component={GenericPaper} >
                    <Stack height="100%" gap={3}>
                        <Typography variant="h2">Actividades</Typography>
                        <Stack height="100%" gap={2}>
                            <LeadActivities leadId={Number(id)} />
                        </Stack>
                    </Stack>
                </Grid>
            </Grid >
        </Container >
    )
}

interface LeadFieldSectionsProps {
    fieldValues?: LeadFieldValue[]
}

export const LeadFieldSections = ({ fieldValues }: LeadFieldSectionsProps) => {

    const { modalProps } = useModal()

    interface LeadDetailsSection {
        name: string,
        fields: LeadFieldValue[]
    }

    const leadSections: LeadDetailsSection[] = useMemo(() => {
        const sections = new Map()
        fieldValues?.forEach(fieldValue => {
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
        <>
            {
                leadSections?.length > 0 &&
                leadSections.map((section, idx) =>
                    <Box key={idx}>
                        <Accordion defaultExpanded={idx === 0} disableGutters sx={{ boxShadow: "none" }}>
                            <AccordionSummary sx={{ height: "4rem" }}
                                expandIcon={<ArrowDropDownIcon />}
                                aria-controls={`panel${idx + 1}-content`} id={`panel${idx + 1}-header`}
                            >
                                <Typography variant="h2">{section.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingTop: 0 }}>
                                <Divider sx={{ marginBottom: 2 }} />
                                <Box px={2}>
                                    {section?.fields.map((fieldValue, idx) =>
                                        <Box key={idx}>
                                            <Typography sx={{ fontWeight: 600 }} variant="body1">{fieldValue?.field?.name}:</Typography>
                                            <Box paddingLeft={1}>
                                                <LeadFieldByType fieldValue={fieldValue} type={fieldValue.field.field_type_code!}
                                                    value={fieldValue.value!} template={fieldValue.field.field_template_code} modalProps={modalProps} />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                )
            }
        </>
    )
}

interface LeadFieldProps {
    fieldValue?: LeadFieldValue,
    value: string,
    type: string,
    template?: string | null,
    modalProps?: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
}

export const LeadFieldByType = ({ fieldValue, value, type, modalProps, template = null }: LeadFieldProps) => {

    if (template) {
        switch (template) {
            case "INSTAGRAM_USER":
                return <NewTabLink url={`https://instagram.com/${value?.substring(1)}`} value={value} />
            case "POSTAL_CODE":
                return <NewTabLink url={`https://www.google.com/maps/search/${value.replaceAll(" ", "+")}`} value={value} />
            case "CREDIT_CARD_SIMPLE":
                return <CardValue value={value} allowShow />
        }
    }

    switch (type) {
        case "MONEY": return formatMoney(Number(value))
        case "RATING": return <RatingValue value={value} subtype={fieldValue!.field.field_subtype_code!} counter />
        case "URL": return <NewTabLink url={value} />
        case "EMAIL": return <NewTabLink url={`mailto:${value}`} value={`${value}`} />
        case "ADDRESS": return <AddressValue value={value} subtype={fieldValue!.field.field_subtype_code!} />
        case "DATE": return <DateValue date={value} />
        case "DATE_TIME": return <DateValue date={value} isDatetime />
        case "PASSWORD": return <PasswordValue value={value} allowShow />
        case "FILE": case "RICH_TEXT": return <ModalValue value={`${value}`}
            idModal={`file-${fieldValue?.id}`} modalProps={modalProps}
            type={fieldValue!.field.field_type_code!} subtype={fieldValue!.field.field_subtype_code!} />
        case "BOOL": return <BoolValue value={`${value}`} />
        case "SELECTOR": case "CHECKBOX": return <ListValues value={fieldValue!.nomenclator_items} idFieldValue={fieldValue!.id} type="Selector" />
        case "LEAD": return <ListValues value={fieldValue!.related_leads} idFieldValue={fieldValue!.id} type="Lead" isNav />
        default: return `${value}`
    }
}

