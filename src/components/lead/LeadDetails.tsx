import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { getLead } from "./leadService.ts"
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Divider, Grid, Link, Paper, Typography } from "@mui/material"
import type { Lead } from "../../types/leads"
import type { LeadFieldValue } from "../../types/leadFields"
import { getFieldType } from "../../generalService.ts"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const LeadDetails = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<Lead | null>(null)

    useEffect(() => {
        if (id) getLead(parseInt(id)).then(setLead)
    }, [id])

    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.is_visible && i.value))
            .sort((a: LeadFieldValue, b: LeadFieldValue) => a.field.order - b.field.order)
    }
        , [lead])

    return (
        <Container maxWidth={false}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4, lg: 4 }} minWidth="20rem" >
                    {lead && fieldValues &&
                        <Box>
                            <Paper sx={{ p: 2, borderRadius: "1em", marginBottom: "1rem" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <Typography variant="h1">{fieldValues[0]?.value ?? "Lead no encontrado"} {fieldValues[1]?.value ?? ""}</Typography>
                                    <Chip label={lead?.active ? "Habilitado" : "Deshabilitado"} color={lead?.active ? "success" : "error"} />
                                </Box>
                            </Paper>
                            <Paper sx={{ p: 1, borderRadius: "1em" }}>
                                <LeadFieldSections fieldValues={fieldValues} />

                                <Accordion disableGutters sx={{ boxShadow: "none" }}>
                                    <AccordionSummary sx={{ height: "64px" }}
                                        expandIcon={<ArrowDropDownIcon />}
                                        aria-controls="panel0-content" id="panel0-header"
                                    >
                                        <Typography variant="h2">Creación de Lead</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ paddingTop: 0 }}>
                                        <Divider sx={{ marginBottom: "1rem" }} ></Divider>
                                        <LeadField fieldName="Fecha de Creación" value={lead?.created_at} type="DATE" />
                                        <LeadField fieldName="Fecha de Última Modificación" value={lead?.updated_at} type="DATE" />
                                    </AccordionDetails>
                                </Accordion>
                            </Paper>
                        </Box>
                    }
                </Grid>
                <Grid size="grow" minWidth="20rem">
                    <Paper sx={{ minHeight: "100%", p: 2, borderRadius: "1em" }}>
                        <Typography variant="h2">Actividades</Typography>
                    </Paper>
                </Grid>
            </Grid >
        </Container >
    )
}

interface LeadFieldSectionsProps {
    fieldValues: LeadFieldValue[]
}

export const LeadFieldSections = ({ fieldValues }: LeadFieldSectionsProps) => {

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
                    <Accordion key={idx} defaultExpanded={idx === 0} disableGutters sx={{ boxShadow: "none" }}>
                        <AccordionSummary sx={{ height: "64px" }}
                            expandIcon={<ArrowDropDownIcon />}
                            aria-controls={`panel${idx + 1}-content`} id={`panel${idx + 1}-header`}
                        >
                            <Typography variant="h2">{section.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ paddingTop: 0 }}>
                            <Divider sx={{ marginBottom: "1rem" }} ></Divider>

                            {section?.fields.map((fieldValue, idx) =>
                                <LeadField fieldName={fieldValue.field.name} type={fieldValue.field.field_type_code}
                                    value={fieldValue.value} template={fieldValue.field.field_template_code} key={idx} />
                            )}

                        </AccordionDetails>
                    </Accordion>
                )
            }
        </>
    )
}

interface LeadFieldProps {
    fieldName: string,
    value: string | number | boolean,
    type: string,
    template?: string | null
}

export const LeadField = ({ fieldName, value, type, template = null }: LeadFieldProps) => {

    const fieldValue = useMemo(() => getFieldType(type, value), [type, value])

    if (type === "BOOL" && fieldValue) {
        return <Chip color={value ? "success" : "error"} 
        label={`${fieldName}: ${value ? "Si" : "No"}`} sx={{ marginBottom: ".5rem", fontWeight: "bold" }} />
    }

    return (
        <>
            <Typography sx={{ fontWeight: "bold" }} component="h3">{fieldName}:</Typography>

            {template === "INSTAGRAM_USER" && typeof value === "string" &&
                <Link sx={{ paddingLeft: ".5rem" }} href={`https://instagram.com/${value?.substring(1)}`} target="_blank" rel="noopener">
                    {value}
                </Link>
            }

            {template === "WEBSITE_URL" &&
                <Link sx={{ paddingLeft: ".5rem" }} href={`${value}`} target="_blank" rel="noopener">
                    {value}
                </Link>
            }

            {template === "EMAIL" &&
                <Link sx={{ paddingLeft: ".5rem" }} href={`mailto:${value}`} target="_blank" rel="noopener">
                    {value}
                </Link>
            }

            {(!template || !["INSTAGRAM_USER", "WEBSITE_URL", "EMAIL"].includes(template)) &&
                <Typography sx={{ paddingLeft: ".5rem" }}>
                    {template && template === "SALARY_EXPECTATION" && "$"}
                    {value}
                </Typography>}

        </>
    )
}