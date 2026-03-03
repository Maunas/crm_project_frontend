import { useEffect, useId, useMemo, useState } from "react"
import { GenericModal } from "../common/layout/GenericContainer.tsx"
import type { LeadDetailed } from "../../types/leads"
import type { LeadFieldValue } from "../../types/leadFields"
import { getFieldType } from "../../generalService.ts"
import { disableLead, enableLead, getLead } from "./leadService.ts"
import DOMPurify from 'dompurify';
import Markdown from 'react-markdown'
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Divider, Grid, Paper, Typography, Button, Link, Rating, Slider, ButtonGroup } from "@mui/material"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useModal } from "../hooks/useModal.tsx"

export const LeadDetails = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        if (id) getLead(parseInt(id)).then(setLead)
    }, [id])

    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.is_visible &&
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
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4, lg: 4 }} minWidth="20rem" >
                    {lead && fieldValues &&
                        <Box>
                            <Paper sx={{ p: 2, borderRadius: "1em", marginBottom: "1rem" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <Typography variant="h1">{fieldValues[0]?.value ?? "Lead no encontrado"} {fieldValues[1]?.value ?? ""}</Typography>
                                    <Chip label={lead?.active ? "Habilitado" : "Deshabilitado"} color={lead?.active ? "success" : "error"} />
                                </Box>
                                <ButtonGroup fullWidth>
                                    <Button variant="outlined" color={lead.active ? "error" : "success"} onClick={() => handleActive(lead)}
                                        sx={{ marginBlock: 1 }}>
                                        {lead.active ? "Deshabilitar" : "Habilitar"}
                                    </Button>
                                    <Button variant="contained" color="primary" component={RouterLink} to={`/leads/modify/${lead?.id}`}
                                        sx={{ marginBlock: 1 }}>
                                        Modificar Lead
                                    </Button>
                                </ButtonGroup>

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
                                        <Typography sx={{ fontWeight: "bold" }} component="h3">Fecha de Creación:</Typography>

                                        <LeadFieldByType value={lead?.created_at} type="DATE" />
                                        <Typography sx={{ fontWeight: "bold" }} component="h3">Fecha de Última Modificación:</Typography>
                                        <LeadFieldByType value={lead?.updated_at} type="DATE" />
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
                                    <LeadFieldByType fieldValue={fieldValue} type={fieldValue.field.field_type_code!}
                                        value={fieldValue.value!} template={fieldValue.field.field_template_code} modalProps={modalProps} />
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

    const idModal = useId()

    if (template) {
        switch (template) {
            case "INSTAGRAM_USER":
                return <Link sx={{ paddingLeft: ".5rem" }} href={`https://instagram.com/${value?.substring(1)}`} target="_blank" rel="noopener">
                    {value}
                </Link>
            case "POSTAL_CODE":
                return <Link sx={{ paddingLeft: ".5rem" }} href={`https://www.google.com/maps/search/${value.replaceAll(" ", "+")}`} target="_blank" rel="noopener">
                    {value}
                </Link>
            case "CREDIT_CARD_SIMPLE":
                return <CardField value={value} />
        }
    }
    switch (type) {
        case "FILE":
            return <Link sx={{ paddingLeft: ".5rem" }} href={`${value}`} target="_blank" rel="noopener">
                {//Obtiene el nombre del archivo, formateado
                    value.split("/").at(-1)?.split(".")[0].replaceAll("%20", " ")
                }
            </Link>
        case "ADDRESS":
            if (fieldValue?.field?.field_subtype_code === "MAPS_URL") {
                return <><Link sx={{ paddingLeft: ".5rem" }} href={`${value}`} target="_blank" rel="noopener">
                    {value}
                </Link>
                </>
            } else {
                return <Link sx={{ paddingLeft: ".5rem" }} href={`https://www.google.com/maps/search/${value.replaceAll(" ", "+")}`} target="_blank" rel="noopener">
                    {value}
                </Link>
            }
        case "RATING":
            return <RatingField value={value} subtype={fieldValue!.field.field_subtype_code!} />
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
                return <GenericModal idModal={idModal} modalProps={modalProps!}
                    buttonText='Ver HTML' variant="outlined" containerSx={{ minWidth: "80vw" }} >
                    {purifiedHTML
                        ? <div style={{ paddingLeft: ".5rem" }} dangerouslySetInnerHTML={{ __html: purifiedHTML }} />
                        : <Typography variant="body1" color="error">Contenido HTML no seguro, no se puede mostrar.</Typography>}
                    <Grid container justifyContent="end">
                        <Button variant="outlined" onClick={modalProps!.handleClose}>Cerrar Modal</Button>
                    </Grid>
                </GenericModal>
            } else {
                return <>
                    <GenericModal idModal={idModal} modalProps={modalProps!}
                        buttonText='Ver Markdown' variant="outlined" containerSx={{ minWidth: "80vw" }} >
                        <Markdown >{value as string}</Markdown>
                        <Grid container justifyContent="end">
                            <Button variant="outlined" onClick={modalProps!.handleClose}>Cerrar Modal</Button>
                        </Grid>
                    </GenericModal>
                </>
            }
        case "LEAD":
            return <ul style={{ margin: 0 }}>
                {fieldValue?.related_leads && fieldValue?.related_leads?.length > 0 &&
                    fieldValue?.related_leads.map(lead =>
                        <li key={lead.id}>
                            <Link component={RouterLink} to={`/leads/${lead.id}`} sx={{ paddingLeft: ".5rem" }}>
                                {lead.field_values[0]?.value} {lead.field_values[1]?.value}
                            </Link>
                        </li>
                    )}
            </ul >
        case "SELECTOR": case "CHECKBOX":
            return <ul style={{ margin: 0 }}>
                {fieldValue?.nomenclator_items && fieldValue.nomenclator_items?.length > 0 &&
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
            return <Chip color={getFieldType("BOOL", value) ? "success" : "error"}
                label={<Grid alignItems="center" container justifyContent="space-between">
                    {getFieldType("BOOL", value) ? <><CheckIcon /> Si</>
                        : <><CloseIcon /> No</>}
                </Grid>
                } sx={{ ml: ".5rem", marginBottom: ".5rem", fontWeight: "bold" }} />
        default:
            return <Typography sx={{ paddingLeft: ".5rem" }}>
                {type === "MONEY" && "$"} {value}
            </Typography>
    }
}


const PasswordField = ({ value }: { value: string }) => {
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
const CardField = ({ value }: { value: string }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Grid container spacing={2} alignItems="center">
            <Typography sx={{ paddingLeft: ".5rem" }}>
                {showPassword
                    ? `${value.substring(0, 4)}-${value.substring(4, 8)}-${value.substring(8, 12)}-${value.slice(-4)}`
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
const RatingField = ({ value, subtype }: { value: string, subtype: string }) => {

    return (
        <Grid container alignItems="center" spacing={2}>
            {subtype === "STAR_RATING" &&
                <Rating name="read-only" value={Number(value)} readOnly />
            }
            {subtype === "NPS" &&
                <Grid size={8}>
                    <Slider
                        min={1} max={10} step={1}
                        value={Number(value)}
                    />
                </Grid>
            }
            {subtype === "SCORE" &&
                <Grid size={8}>
                    <Slider
                        min={0} max={100} step={1}
                        defaultValue={Number(value)}
                    />
                </Grid>
            }
            <Chip color="secondary" label={value} />
        </Grid>
    )
}