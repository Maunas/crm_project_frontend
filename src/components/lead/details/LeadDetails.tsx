import React, { useEffect, useMemo, useState } from "react"
import { LeadActivities } from "./LeadActivities.tsx"
import { GenericPaper } from "../../common/layout/GenericContainer.tsx"
import { CommonButton } from "../../common/details/DetailsCommonButton.tsx"
import { CustomChip } from "../../common/details/StyledDisplayComponents.tsx"
import type { LeadDetailed } from "../../../types/leads"
import type { LeadFieldValue } from "../../../types/leadFields"
import { formatMoney } from "../../../generalService.ts"
import { disableLead, enableLead, getLead, getLeadTitleArray } from "../leadService.ts"
import { useModal } from "../../hooks/useModal.ts"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Divider, Grid, Paper, Typography, ButtonGroup, Stack, Breadcrumbs, Link, IconButton, List, ListItemText, ListItem, TextField } from "@mui/material"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AddressValue, BoolValue, CardValue, DateValue, ListValues, ModalValue, NewTabLink, PasswordValue, RatingValue } from "../LeadCommonComponents.tsx"
import { getCampaign } from "../../campaigns/campaignServices.ts"
import type { Campaign } from "../../../types/campaigns.ts"
import EditIcon from "@mui/icons-material/Edit"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from "@mui/icons-material/Save"
import { CustomListItem } from "../../common/lists/CustomListItem.tsx"
import { LeadFieldTypeIcon } from "../../leadFields/LeadFieldTypeIcon.tsx"

export const LeadDetails = () => {

    const { id } = useParams()
    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const nav = useNavigate()

    useEffect(() => {
        if (id) getLead(parseInt(id)).then((lead) => {
            setLead(lead)
            if (!lead.campaign_id) return
            getCampaign(lead.campaign_id).then(setCampaign)
        })
    }, [id])

    const handleActive = (lead: LeadDetailed) => {
        if (!lead.active) enableLead(lead.id).then(() => setLead({ ...lead, active: true }))
        else disableLead(lead.id).then(res => {
            if (res.action === "deleted") return nav("/leads")
            else return setLead({ ...lead, active: false })
        })
    }

    const leadTitle = useMemo(() => {
        if (!lead) return ""
        return getLeadTitleArray(lead).join(" ")
    }, [lead])


    return (
        <Container maxWidth={false}>
            <Stack gap={3}>
                {campaign &&
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link component={RouterLink} to={`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`} underline="hover" color="inherit">
                            {campaign?.name}
                        </Link>
                        <Typography sx={{ color: 'text.primary' }}>{leadTitle}</Typography>
                    </Breadcrumbs>}
                <Grid container gap={3}>
                    <Grid size={{ xs: 12, md: 4, lg: 4 }} minWidth="20rem" >
                        <LeadInfo lead={lead} handleActive={handleActive} leadTitle={leadTitle} />
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
            </Stack >
        </Container >
    )
}


interface LeadInfo {
    lead: LeadDetailed | null,
    handleActive: (lead: LeadDetailed) => void,
    leadTitle: string,
}

export const LeadInfo = ({ lead, leadTitle, handleActive }: LeadInfo) => {

    const [updatingFieldId, setUpdatingFieldId] = useState<number | null>(null)

    //Filtra leads para obtener los visibles, habilitados y con valor, ordenados por order
    const fieldValues = useMemo(() => {
        if (!lead?.field_values) return []
        return lead.field_values.filter(i => (i.field.is_visible && i.field.active && i.active &&
            (i.value || i.nomenclator_items?.length > 0 || i.related_leads?.length > 0)))
            .sort((a, b) => a.field.order - b.field.order)
    }, [lead])

    if (!lead || fieldValues?.length === 0) return null

    return (
        <Stack gap={2}>
            <GenericPaper>
                <Grid container gap={3} alignItems="center">
                    <Grid container size="grow" gap={2} alignItems="center" justifyContent="space-between">
                        <Typography variant="h1">
                            {leadTitle.length > 0 ? leadTitle : "Lead no encontrado"}
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
                <LeadFieldSections fieldValues={fieldValues} updatingFieldId={updatingFieldId} setUpdatingFieldId={setUpdatingFieldId} />
                <Accordion disableGutters sx={{ boxShadow: "none" }}>
                    <AccordionSummary sx={{ height: "4rem" }}
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel0-content" id="panel0-header"
                    >
                        <Typography variant="h2">Creación de Lead</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingTop: 0 }}>
                        <Divider sx={{ marginBottom: 2 }} />
                        <List>
                            <LeadFieldValueItem fieldName="Fecha de Creación" typeCode="DATE_TIME" >
                                <LeadFieldByType value={lead?.created_at} type="DATE_TIME" />
                            </LeadFieldValueItem>
                            <LeadFieldValueItem fieldName="Fecha de Última Modificación" typeCode="DATE_TIME" >
                                <LeadFieldByType value={lead?.updated_at} type="DATE_TIME" />
                            </LeadFieldValueItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
            </Paper>
        </Stack>
    )
}



interface LeadFieldSectionsProps {
    fieldValues?: LeadFieldValue[],
    updatingFieldId: number | null,
    setUpdatingFieldId: React.Dispatch<React.SetStateAction<number | null>>
}

export const LeadFieldSections = ({ fieldValues, updatingFieldId, setUpdatingFieldId }: LeadFieldSectionsProps) => {

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
                                <List>
                                    {section?.fields.map((fieldValue, idx) =>
                                        <>
                                            {updatingFieldId !== fieldValue.id ?
                                                <LeadFieldValueItem key={idx} fieldName={fieldValue.field.name!}
                                                    typeCode={fieldValue.field.field_type_code!} subtypeCode={fieldValue?.field?.field_subtype_code}
                                                    secondaryAction={<IconButton size="small" edge="end" onClick={() => setUpdatingFieldId(fieldValue.id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>}>
                                                    <LeadFieldByType value={fieldValue.value!} fieldValue={fieldValue} modalProps={modalProps}
                                                        type={fieldValue.field.field_type_code ?? "STRING"} subtype={fieldValue?.field?.field_subtype_code} />

                                                </ LeadFieldValueItem>
                                                : <ListItem key={idx} >
                                                    <Grid container gap={1} alignItems="center" width="100%">
                                                        <Grid size="grow">
                                                            <TextField fullWidth size="small" label={fieldValue.field.name!} variant="outlined"
                                                                value={fieldValue.value} />
                                                        </Grid>
                                                        <IconButton size="small" edge="end" color="primary" onClick={() => setUpdatingFieldId(null)}>
                                                            <SaveIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" edge="end" onClick={() => setUpdatingFieldId(null)}>
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Grid>
                                                </ListItem>
                                            }
                                        </>
                                    )}
                                </List >
                            </AccordionDetails>
                        </Accordion >
                    </Box >
                )
            }
        </>
    )
}


interface LeadFieldValueItemProps {
    id?: number,
    fieldName: string | null,
    typeCode: string | null,
    subtypeCode?: string | null,
    secondaryAction?: React.ReactNode,
    children?: React.ReactNode
}
// Organiza los datos en un item de lista con su ícono correspondiente
const LeadFieldValueItem = ({ fieldName, typeCode, subtypeCode, secondaryAction, children }: LeadFieldValueItemProps) => {
    return <CustomListItem disablePadding
        secondaryAction={secondaryAction}>
        <LeadFieldTypeIcon typeCode={typeCode} subtypeCode={subtypeCode} />
        <ListItemText>
            <Stack gap={.5}>
                <Typography variant="subtitle2" color="textSecondary">{fieldName}</Typography>
                {children}
            </Stack>
        </ListItemText>
    </CustomListItem>
}


interface LeadFieldProps {
    fieldValue?: LeadFieldValue,
    value: string,
    type: string,
    subtype?: string | null,
    template?: string | null,
    modalProps?: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
}

export const LeadFieldByType = ({ fieldValue, value, type, subtype, modalProps, template = null }: LeadFieldProps) => {

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
        case "RATING": return <RatingValue value={value} subtype={subtype} counter />
        case "URL": return <NewTabLink url={value} />
        case "EMAIL": return <NewTabLink url={`mailto:${value}`} value={`${value}`} />
        case "ADDRESS": return <AddressValue value={value} subtype={subtype} />
        case "DATE": return <DateValue date={value} />
        case "DATE_TIME": return <DateValue date={value} isDatetime />
        case "PASSWORD": return <PasswordValue value={value} allowShow />
        case "FILE": case "RICH_TEXT": return <ModalValue value={`${value}`}
            idModal={`file-${fieldValue?.id}`} modalProps={modalProps}
            type={type} subtype={subtype} />
        case "BOOL": return <BoolValue value={`${value}`} />
        case "SELECTOR": case "CHECKBOX": return <ListValues value={fieldValue!.nomenclator_items} idFieldValue={fieldValue!.id} type="Selector" />
        case "LEAD": return <ListValues value={fieldValue!.related_leads} idFieldValue={fieldValue!.id} type="Lead" isNav />
        default: return `${value}`
    }
}
