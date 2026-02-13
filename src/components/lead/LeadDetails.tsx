import { useEffect, useMemo, useState } from "react"
import { Link as RouterLink, useParams } from "react-router-dom"
import { getLead } from "./leadService.ts"
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Divider, Grid, Paper, Typography, Button, Link, Rating, Slider } from "@mui/material"
import type { Lead } from "../../types/leads"
import type { LeadFieldValue } from "../../types/leadFields"
import { getFieldType } from "../../generalService.ts"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DOMPurify from 'dompurify';
import Markdown from 'react-markdown'
import { GenericModal } from "../common/layout/GenericContainer.tsx"

export const LeadDetails = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<Lead | null>(null)

    useEffect(() => {
        if (id) getLead(parseInt(id)).then(setLead)
    }, [id])

    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.is_visible &&
            (i.value || i.nomenclator_items?.length > 0 || i.related_leads?.length > 0)))
            .sort((a: LeadFieldValue, b: LeadFieldValue) => a.field.order - b.field.order)
    }
        , [lead])
    console.log(lead)
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
                                <Button variant="contained" color="primary" component={RouterLink} to={`/leads/modify/${lead?.id}`}
                                    sx={{ marginBlock: 1 }}>
                                    Modificar Lead
                                </Button>
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
                                <Box key={idx}>
                                    <Typography sx={{ fontWeight: "bold" }} component="h3">{fieldValue?.field?.name}:</Typography>

                                    <LeadField fieldValue={fieldValue} type={fieldValue.field.field_type_code}
                                        value={fieldValue.value} template={fieldValue.field.field_template_code} />
                                    <LeadFieldByType fieldValue={fieldValue} type={fieldValue.field.field_type_code}
                                        value={fieldValue.value} template={fieldValue.field.field_template_code} />
                                </Box>
                            )}

                        </AccordionDetails>
                    </Accordion>
                )
            }
        </>
    )
}

interface LeadFieldProps {
    fieldValue: LeadFieldValue,
    value: string | number | boolean,
    type: string,
    template?: string | null
}

export const LeadField = ({ fieldValue, value, type, template = null }: LeadFieldProps) => {

    const castedField = useMemo(() => getFieldType(type, value), [type, value])

    return (
        <>
            {
            }

            <Typography sx={{ paddingLeft: ".5rem" }}>
                {type} * {template}
            </Typography>
        </>
    )
}

export const LeadFieldByType = ({ fieldValue, value, type, template = null }: LeadFieldProps) => {
    if (template) {
        switch (template) {
            case "INSTAGRAM_USER":
                return <Link sx={{ paddingLeft: ".5rem" }} href={`https://instagram.com/${value?.substring(1)}`} target="_blank" rel="noopener">
                    {value}
                </Link>
                case "POSTAL_CODE":
                    return <Link sx={{ paddingLeft: ".5rem" }} href={`https://www.google.com/maps/search/${value.replaceAll(" ","+")}`} target="_blank" rel="noopener">
                {value}
            </Link>
            case "CREDIT_CARD_SIMPLE":
                    return <CardField value={value}/>
        }
    }
    switch (type) {
        case "ADDRESS":
            if (fieldValue?.field?.field_subtype_code === "MAPS_URL") {
                return <><Link sx={{ paddingLeft: ".5rem" }} href={`${value}`} target="_blank" rel="noopener">
                {value}
            </Link>
            <GenericModal buttonText='Ver en el mapa' buttonProps={{ variant: "outlined" }} containerSx={{ minWidth: "80vw" }} >
                    <iframe src={value} width="600" height="450" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </GenericModal>
            </>
            } else {
                return <Link sx={{ paddingLeft: ".5rem" }} href={`https://www.google.com/maps/search/${value.replaceAll(" ","+")}`} target="_blank" rel="noopener">
                {value}
            </Link>
            }
        case "RATING":
            return <RatingField value={value} subtype={fieldValue?.field?.field_subtype_code} />
        case "PASSWORD":
            return <PasswordField value={value} />
        case "EMAIL":
            return <Link sx={{ paddingLeft: ".5rem" }} href={`mailto:${value}`} target="_blank" rel="noopener">
                {value}
            </Link>
        case "URL":
            return <Link sx={{ paddingLeft: ".5rem" }} href={`${value}`} target="_blank" rel="noopener">
                {value}
            </Link>
        case "RICH_TEXT":
            if (fieldValue?.field?.field_subtype_code === "HTML") {
                const purifiedHTML = DOMPurify.sanitize(value)
                return <GenericModal buttonText='Ver HTML' buttonProps={{ variant: "outlined" }} containerSx={{ minWidth: "80vw" }} >
                    {purifiedHTML
                        ? <div sx={{ paddingLeft: ".5rem" }} dangerouslySetInnerHTML={{ __html: purifiedHTML }} />
                        : <Typography variant="body1" color="error">Contenido HTML no seguro, no se puede mostrar.</Typography>}
                </GenericModal>
            } else {
                return <>
                    <GenericModal buttonText='Ver Markdown' buttonProps={{ variant: "outlined" }} containerSx={{ minWidth: "80vw" }} >
                        <Markdown >{value as string}</Markdown>
                    </GenericModal>
                </>
            }
        case "LEAD":
            return <Link sx={{ paddingLeft: ".5rem" }} component={RouterLink}
                to={`/leads/${fieldValue?.related_leads?.[0]?.id}`} >
                {fieldValue?.related_leads?.[0]?.field_values?.[0]?.value} {fieldValue?.related_leads?.[0]?.field_values?.[1]?.value}
            </Link>
        case "SELECTOR": case "CHECKBOX":
            return <ul style={{ margin: 0 }}>
                {fieldValue?.nomenclator_items?.length > 0 &&
                    fieldValue.nomenclator_items.map(i =>
                        <Typography sx={{ paddingLeft: ".5rem" }} key={i.code}>
                            <li> {i.value}</li>
                        </Typography>
                    )}
            </ul>
        case "TAGS":
            return <Chip color="primary"
                label={value} sx={{ ml: ".5rem", marginBottom: ".5rem", fontWeight: "bold" }} />
        case "BOOL":
            return <Chip color={value ? "success" : "error"}
                label={<Grid alignItems="center" container justifyContent="space-between">
                    {value ? <><CheckIcon /> Si</>
                        : <><CloseIcon /> No</>}
                </Grid>
                } sx={{ ml: ".5rem", marginBottom: ".5rem", fontWeight: "bold" }} />
        default:
            return <Typography sx={{ paddingLeft: ".5rem" }}>
                {type === "MONEY" && "$"} {value}
            </Typography>
    }
}


const PasswordField = ({ value }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Grid container spacing={2} alignItems="center">
            <Typography sx={{ paddingLeft: ".5rem" }}>
                {showPassword ? value : "********"}
            </Typography>
            <Button variant="text" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ?
                    <VisibilityOffIcon /> : <VisibilityIcon />
                }
            </Button>
        </Grid>
    )
}
const CardField = ({ value }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Grid container spacing={2} alignItems="center">
            <Typography sx={{ paddingLeft: ".5rem" }}>
                {showPassword 
                ? `${value.substring(0,4)}-${value.substring(4,8)}-${value.substring(8,12)}-${value.slice(-4)}` 
                : `****-****-****-${value?.slice(-4)}`}
            </Typography>
            <Button variant="text" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ?
                    <VisibilityOffIcon /> : <VisibilityIcon />
                }
            </Button>
        </Grid>
    )
}
const RatingField = ({ value, subtype }) => {

    return (
        <Grid container alignItems="center" spacing={2}>
            {subtype === "STAR_RATING" &&
                <Rating name="read-only" value={value} readOnly />
            }
            {subtype === "NPS" &&
                <Grid size={8}>
                    <Slider
                        disableSwap min={1} max={10} step={1}
                        value={value}
                    />
                </Grid>
            }
            {subtype === "SCORE" &&
                <Grid size={8}>
                    <Slider
                        disabled min={0} max={100} step={1}
                        defaultValue={value}
                    />
                </Grid>
            }
            <Chip color="secondary" label={value} />
        </Grid>
    )
}