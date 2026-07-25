import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { LeadFieldSections } from "./LeadDetailsSections"
import { LeadTags } from "src/features/orgProperties/tags/LeadTagsMenu.tsx"
import { LeadActivities } from "../activities/LeadActivities"
import { DisableConfirmDialog } from "src/components/ui/feedback/ConfirmationDialog.tsx"
import LoadingScreenWrapper from "src/components/ui/feedback/LoadingScreen.tsx"
import GenericPaper from "shared/layout/container/GenericPaper"
import { ListActionMenu, type ListItemAction } from "shared/ui/lists/CustomListItem"
import { useLoading } from "src/hooks/useLoading.ts"
import type { Lead, LeadDetailed, LeadTeam } from "src/types/leads.ts"
import type { Campaign } from "src/types/campaigns.ts"
import type { BulkAssignRequest } from "src/types/teams.ts"
import type { UserPublic } from "src/types/users.ts"
import { bulkAssignLeads, disableLead, enableLead, getLead } from "../leadService.ts"
import { getCampaign } from "src/features/campaigns/campaignServices.ts"
import { getLeadTitleArray, getLeadSubtitleArray } from "../leadUtils.ts"
import { LeadTitleConfigSidebar } from "src/features/lead/leadTitleConfig/LeadTitleConfigSidebar"
import { showCommonErrorToast, showToast } from "src/utils/feedback.ts"
import { useLeadNavigation } from "../stores/LeadNavigationContext.tsx"
import { useUserContext } from "src/stores/UserContext"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import {
    Grid, Typography, Stack, Breadcrumbs, Link, Box, CircularProgress, Fab, Slide, Tooltip, Button, IconButton,
    Autocomplete, TextField, Divider
} from "@mui/material"
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import CallIcon from '@mui/icons-material/Call';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { LeadDetailsState } from "./LeadDetailsState.tsx"
import type { LeadFieldDetailed } from "src/types/leadFields.ts"
import { UserAvatar } from "shared/ui/details/UserAvatar.tsx"
import { formatDate, formatUserFullName } from "src/utils/formatters.ts"
import { getTeams } from "../teamService.ts"
import { getUsersInOrg } from "src/features/auth/userServices.ts"

export const LeadDetailsLayout = () => {

    const { id } = useParams()

    const numId = useMemo(() => {
        if (id === undefined) return id
        const numId = parseInt(id)
        if (isNaN(numId)) return undefined
        return numId
    }, [id])

    const [lead, setLead] = useState<LeadDetailed | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const nav = useNavigate()
    const [lastMove, setLastMove] = useState<"next" | "prev" | false>(false)

    const { getNextLeadId, getPrevLeadId, isLoadingNavigation, isFirstItem, isLastItem, isNavigationValid } = useLeadNavigation();

    const handleNext = async () => {
        if (numId === undefined) return
        setLoading(true)
        setLastMove("next")
        const nextId = await getNextLeadId(numId);
        if (nextId) nav(`/leads/${nextId}`);
        else setLoading(false)
    };

    const handlePrev = async () => {
        if (numId === undefined) return
        setLoading(true)
        setLastMove("prev")
        const prevId = await getPrevLeadId(numId);
        if (prevId) nav(`/leads/${prevId}`);
        else setLoading(false)
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Evitamos navegar si el usuario está enfocado en un campo de texto
            const activeTag = document.activeElement?.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
                return;
            }
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numId]);

    const fetchLeads = useCallback(async (numId: number) => {
        try {
            if (numId === undefined) return
            await getLead(numId).then(async (lead) => {
                setLead(prev => prev?.id !== lead.id ? lead : prev)
                if (!lead.campaign_id) return
                if (lead.campaign_id === campaign?.id) return
                await getCampaign(lead.campaign_id).then(setCampaign)
            })
        } catch (e) {
            showCommonErrorToast(e)
        }
    }, [campaign?.id])

    const { loading, setLoading, fnWithLoading } = useLoading(fetchLeads)

    useEffect(() => {
        if (!numId) return
        fnWithLoading(numId)
    }, [numId, fnWithLoading])

    const handleActive = (lead: LeadDetailed) => {
        if (!lead.active) return enableLead(lead.id).then(() => {
            showToast(`"${leadTitle}" habilitado con éxito`)
            setLead({ ...lead, active: true })
        })
        else return disableLead(lead.id).then(res => {
            if (res.action === "deleted") {
                showToast(`"${leadTitle}" eliminado definitivamente`)
                return nav(`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`)
            }
            else {
                showToast(`"${leadTitle}" deshabilitado con éxito`)
                return setLead({ ...lead, active: false })
            }
        })
    }

    const updateLeadInfo = (newLead: LeadDetailed, reloadAudits: boolean = false) => {
        setLead(newLead)
        if (reloadAudits) setReloadAudit(prev => prev + 1)
    }

    const leadTitle = useMemo(() => {
        if (!lead) return null
        return getLeadTitleArray(lead)
    }, [lead])

    const leadSubtitle = useMemo(() => {
        if (!lead) return null
        return getLeadSubtitleArray(lead)
    }, [lead])

    //reconoce cambios para actualizar la lista de audit
    const [reloadAudit, setReloadAudit] = useState<number>(0)

    const setSlideDirection = useMemo(() => {
        if (!lastMove) return undefined
        if (lastMove === "next") return (isLoadingNavigation || loading) ? "right" : "left"
        else return (isLoadingNavigation || loading) ? "left" : "right"
    }, [lastMove, isLoadingNavigation, loading])

    const [isDeleting, setIsDeleting] = useState<LeadDetailed | null>(null)

    //Configuración de título
    const [titleConfigOpen, setTitleConfigOpen] = useState(false)

    const saveNewTitleValues = (newFields: Record<number, LeadFieldDetailed>) => {
        setLead(prevLead => {
            if (!prevLead) return prevLead
            const newFieldValues = prevLead.field_values.map(fv => {
                const updatedField = newFields[fv.field_id]
                if (!updatedField) return fv
                return { ...fv, field: updatedField }
            })
            return { ...prevLead, field_values: newFieldValues }
        })
    }

    //TO DO: Error de id no disponible
    if (numId === undefined) return <p>Id inválido</p>
    return (
        <LoadingScreenWrapper loading={loading && !lastMove}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', pb: 3 }}>
                {isNavigationValid(numId) &&
                    <Box sx={{ flexShrink: 0, width: "2.5rem", position: "relative" }}>
                        <Box sx={{ position: 'sticky', top: '50vh', transform: 'translateY(-50%)', zIndex: 10 }}>
                            <Fab
                                color="primary"
                                size="small"
                                onClick={handlePrev}
                                disabled={isLoadingNavigation || loading || isFirstItem(numId)}
                            >
                                {isLoadingNavigation || loading ? <CircularProgress size={24} color="inherit" /> : <ArrowBackIosNewIcon />}
                            </Fab>
                        </Box>
                    </Box>}

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Slide in={!loading && !isLoadingNavigation} appear={false} unmountOnExit
                        direction={setSlideDirection}>
                        <Stack spacing={2}>
                            {campaign &&
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Link component={RouterLink} to={`/leads?workspace=${campaign?.workspace_id}&campaign=${campaign?.id}`}
                                        sx={{ underline: "hover", fontWeight: 600 }} >
                                        {campaign?.name}
                                    </Link>
                                    <Typography sx={{ color: 'text.primary' }}>{leadTitle?.join(" ")}</Typography>
                                </Breadcrumbs>}
                            {lead &&
                                <Grid container spacing={2}>
                                    <Grid size="grow" sx={{ minWidth: "20rem", flexGrow: 2 }} >
                                        <LeadInfo lead={lead} handleActive={() => setIsDeleting(lead)} leadTitle={leadTitle} leadSubtitle={leadSubtitle}
                                            updateLeadInfo={updateLeadInfo} onOpenTitleConfig={() => setTitleConfigOpen(true)} />
                                    </Grid>
                                    <Grid size="grow" sx={{ minWidth: "22rem", flexGrow: 3 }} component={GenericPaper} >
                                        <LeadActivities lead={lead} reloadAudit={reloadAudit} />
                                    </Grid>
                                </Grid >
                            }
                        </Stack >
                    </Slide>
                </Box>

                {isNavigationValid(numId) &&
                    <Box sx={{ flexShrink: 0, width: '40px' }}>
                        <Box sx={{ position: 'sticky', top: '50vh', transform: 'translateY(-50%)', zIndex: 10 }}>
                            <Fab
                                color="primary"
                                size="small"
                                onClick={handleNext}
                                disabled={isLoadingNavigation || loading || isLastItem(numId)}
                            >
                                {isLoadingNavigation || loading ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardIosIcon />}
                            </Fab>
                        </Box>
                    </Box>}
            </Stack >
            <DisableConfirmDialog entity={isDeleting} clearEntity={() => setIsDeleting(null)}
                idModal="del-lead-det" onConfirm={() => handleActive(lead!)} entityTypeName="el lead" onlyDelete />
            <LeadTitleConfigSidebar open={titleConfigOpen} onClose={() => setTitleConfigOpen(false)} onSave={saveNewTitleValues}
                campaignId={campaign?.id} fieldValues={lead?.field_values} />
        </LoadingScreenWrapper>
    )
}

interface LeadInfoProps {
    lead: LeadDetailed,
    handleActive: (lead: LeadDetailed) => void,
    leadTitle: (string | undefined)[] | null,
    //Línea secundaria debajo del título (ej. Cargo + Empresa), configurable desde el mismo panel
    //de "Configurar título". A diferencia del título, si no hay ningún campo configurado queda
    //en un arreglo vacío (no "Sin título") y directamente no se muestra nada.
    leadSubtitle?: (string | undefined)[] | null,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
    onOpenTitleConfig?: () => void
}

export const LeadInfo = ({ lead, leadTitle, leadSubtitle, handleActive, updateLeadInfo, onOpenTitleConfig }: LeadInfoProps) => {

    const titleText = (leadTitle && leadTitle?.length > 0) ? leadTitle?.join(" ") : "Título no encontrado"
    const subtitleText = (leadSubtitle && leadSubtitle.length > 0) ? leadSubtitle.join(" ") : null

    //Con variant="h1" fijo, un nombre largo pasaba a varias líneas y quedaba muy pesado visualmente
    //(y el textOverflow: "ellipsis" que tenía antes no hacía nada sin whiteSpace: nowrap +
    //overflow: hidden). En vez de truncar el nombre, se achica el variant a medida que crece el
    //texto, así siempre se ve completo pero proporcional al espacio disponible.
    const titleVariant = titleText.length > 40 ? "h3" : titleText.length > 20 ? "h2" : "h1"

    //Antes había dos íconos sueltos (lápiz para "Configurar título" + basura/restaurar) junto al
    //título. Se unificaron en un único botón de "tres puntos" con un menú desplegable, para dejar
    //lugar a futuras acciones sin volver a amontonar íconos ahí (reutiliza ListActionMenu, el mismo
    //desplegable que ya usa ResponsiveListItem en su modo táctil).
    const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null)
    const titleActions: ListItemAction[] = [
        ...(onOpenTitleConfig ? [{
            actionType: "RENAME", label: "Configurar título", onClick: onOpenTitleConfig,
            permission: "lead_field:update",
        } as ListItemAction] : []),
        {
            actionType: lead.active ? "DISABLE" : "ENABLE",
            label: lead.active ? "Eliminar" : "Restaurar",
            onClick: () => handleActive(lead),
            color: lead.active ? "error" : "success",
            //Mismo criterio que el backend: deshabilitar (soft/hard delete) exige "lead:delete";
            //restaurar (reactivar) exige "lead:update" (ver base_controller.py, acción "active" -> "update").
            permission: lead.active ? "lead:delete" : "lead:update",
        },
    ]

    return (
        <Stack spacing={2}>
            <GenericPaper elevation={0}>
                <Stack spacing={3} sx={{ alignItems: "start" }}>
                    <Stack direction="row" spacing={2} sx={{ width: "100%", alignItems: "center" }}>
                        <UserAvatar name={titleText} src={lead.picture_avatar_url || undefined} size={56} />
                        <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Typography sx={{ wordBreak: "break-word" }} variant={titleVariant}>
                                    {titleText}
                                </Typography>
                                <IconButton size="small" onClick={e => setActionsAnchor(e.currentTarget)}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                                <ListActionMenu actions={titleActions} anchorEl={actionsAnchor}
                                    closeMenu={() => setActionsAnchor(null)} />
                            </Stack>
                            {subtitleText &&
                                <Typography variant="body2" color="text.secondary" sx={{ textOverflow: "ellipsis" }}>
                                    {subtitleText}
                                </Typography>
                            }
                        </Stack>
                    </Stack>
                    <LeadQuickActions />
                    <LeadDetailsState lead={lead} updateLeadInfo={updateLeadInfo} contactState={lead.contact_state} flowState={lead.current_state} />
                    <LeadTags lead={lead} updateLeadInfo={updateLeadInfo} />
                    <LeadMetaInfo lead={lead} updateLeadInfo={updateLeadInfo} />
                </Stack>
            </GenericPaper>
            <LeadFieldSections lead={lead} updateLeadInfo={updateLeadInfo} />
        </Stack>
    )
}

/**
 * Botones de acciones rápidas (Correo, Llamar, Reunión). Por ahora son solo visuales,
 * sin funcionalidad ni datos asociados (a definir más adelante de dónde sale el email/teléfono).
 */
const LeadQuickActions = () => {
    const actions: { label: string, icon: ReactNode }[] = [
        { label: "Correo", icon: <MailOutlineIcon fontSize="small" /> },
        { label: "Llamar", icon: <CallIcon fontSize="small" /> },
        { label: "Reunión", icon: <EventIcon fontSize="small" /> },
    ]
    return (
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            {actions.map(action =>
                <Button key={action.label} variant="outlined" color="primary"
                    fullWidth disabled startIcon={action.icon}>
                    {action.label}
                </Button>
            )}
        </Stack>
    )
}

// Opción genérica para los selectores de Usuario/Equipo asignado. id: null representa
// "Sin asignar" (para poder desasignar, ver bulk_assign/clear_team/clear_user en el backend).
interface AssignOption {
    id: number | null
    label: string
}
const UNASSIGNED_OPTION: AssignOption = { id: null, label: "Sin asignar" }

/**
 * Meta-datos del lead: propietario (usuario/equipo asignado, editables vía selector), quién lo
 * creó/modificó, y fechas de creación/última modificación. Layout en 2 columnas: izquierda
 * (Usuario asignado -> Creado por -> Fecha Creación) y derecha (Equipo asignado -> Modificado por
 * -> Fecha Modificación), pedido explícitamente por el usuario.
 * `valueTooltip` (email de creador/modificador) reutiliza el mismo patrón de
 * `SystemAuditLogs.tsx`/`DetailsMetadata.tsx` (nombre completo visible, email en hover).
 */
const LeadMetaInfo = ({ lead, updateLeadInfo }: { lead: LeadDetailed, updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void }) => {
    //Mismo permiso que exige el backend en PATCH /leads/bulk-assign ("lead:update", ver
    //lead_controller.py) para reasignar equipo/usuario — igual criterio que el resto del detalle
    //(se muestra siempre el valor actual, solo se gatea la posibilidad de cambiarlo).
    const { hasPermission } = useUserContext()
    const canUpdateLead = hasPermission("lead:update")

    const [users, setUsers] = useState<UserPublic[]>([])
    const [teams, setTeams] = useState<LeadTeam[]>([])

    useEffect(() => {
        if (!canUpdateLead) return
        getUsersInOrg().then(setUsers).catch(e => showCommonErrorToast(e, "No se pudieron cargar los usuarios de la organización."))
        getTeams({ page_size: 0 }).then(res => setTeams(res.items)).catch(e => showCommonErrorToast(e, "No se pudieron cargar los equipos."))
    }, [canUpdateLead])

    const userOptions = useMemo<AssignOption[]>(() => [
        UNASSIGNED_OPTION,
        ...users.map(u => ({ id: u.id, label: formatUserFullName(u) ?? u.email })),
    ], [users])
    const teamOptions = useMemo<AssignOption[]>(() => [
        UNASSIGNED_OPTION,
        ...teams.map(t => ({ id: t.id, label: t.name })),
    ], [teams])

    const currentUserOption: AssignOption = lead.assigned_to_user
        ? { id: lead.assigned_to_user.id, label: formatUserFullName(lead.assigned_to_user) ?? lead.assigned_to_user.email }
        : UNASSIGNED_OPTION
    const currentTeamOption: AssignOption = lead.team
        ? { id: lead.team.id, label: lead.team.name }
        : UNASSIGNED_OPTION

    const [assigning, setAssigning] = useState(false)

    const handleAssign = useCallback((body: Omit<BulkAssignRequest, "lead_ids">, merge: (updated: Lead) => Partial<LeadDetailed>) => {
        setAssigning(true)
        bulkAssignLeads({ lead_ids: [lead.id], ...body })
            .then(res => {
                const updated = res[0]
                //El timeline del lead registra un evento LEAD_REASSIGNED (ver lead_service.bulk_assign),
                //así que recargamos la pestaña de Auditoría igual que al cambiar etapa/estado.
                if (updated) updateLeadInfo({ ...lead, ...merge(updated) }, true)
            })
            .catch(e => showCommonErrorToast(e))
            .finally(() => setAssigning(false))
    }, [lead, updateLeadInfo])

    const handleAssignUser = (option: AssignOption | null) => {
        if (!option || option.id === currentUserOption.id) return
        handleAssign(
            option.id === null ? { clear_user: true } : { target_user_id: option.id },
            updated => ({ assigned_to_user_id: updated.assigned_to_user_id, assigned_to_user: updated.assigned_to_user }),
        )
    }

    const handleAssignTeam = (option: AssignOption | null) => {
        if (!option || option.id === currentTeamOption.id) return
        handleAssign(
            option.id === null ? { clear_team: true } : { target_team_id: option.id },
            updated => ({ team_id: updated.team_id, team: updated.team }),
        )
    }

    return (
        <Stack spacing={1.25} sx={{ width: "100%" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 3, width: "100%" }}>
                <OwnerSelectRow icon={<PersonIcon fontSize="small" />} title="Usuario asignado"
                    canEdit={canUpdateLead} options={userOptions} value={currentUserOption}
                    onChange={handleAssignUser} disabled={assigning} />
                <OwnerSelectRow icon={<GroupsIcon fontSize="small" />} title="Equipo asignado"
                    canEdit={canUpdateLead} options={teamOptions} value={currentTeamOption}
                    onChange={handleAssignTeam} disabled={assigning} />
            </Box>

            <Divider sx={{ opacity: .6 }} />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 3, rowGap: .5, width: "100%" }}>
                <Stack spacing={.5}>
                    <MetaSectionTitle icon={<AddCircleOutlineIcon fontSize="small" />} title="Creación" />
                    <MetaPlainRow label="Usuario" value={formatUserFullName(lead.creator) ?? "Sistema"}
                        valueTooltip={lead.creator?.email ?? undefined} />
                    <MetaPlainRow label="Fecha" value={formatDate(lead.created_at, "custom", "DD/MM/YYYY HH:mm")} />
                </Stack>
                <Stack spacing={.5}>
                    <MetaSectionTitle icon={<EditIcon fontSize="small" />} title="Modificación" />
                    {lead.updated_at && <>
                        <MetaPlainRow label="Usuario" value={formatUserFullName(lead.updater) ?? "Sistema"}
                            valueTooltip={lead.updater?.email ?? undefined} />
                        <MetaPlainRow label="Fecha" value={formatDate(lead.updated_at, "custom", "DD/MM/YYYY HH:mm")} />
                    </>}
                </Stack>
            </Box>
        </Stack>
    )
}

/** Título de sección con ícono visible (no en tooltip, a diferencia de OwnerSelectRow): "Creación"/"Modificación". */
const MetaSectionTitle = ({ icon, title }: { icon: ReactNode, title: string }) => (
    <Stack direction="row" spacing={.5} sx={{ alignItems: "center", color: "text.secondary" }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
            {title}
        </Typography>
    </Stack>
)

interface MetaPlainRowProps {
    label: string
    value?: string
    valueTooltip?: string
}

//Filas simples debajo de MetaSectionTitle (Usuario/Fecha): sin ícono, solo texto — el ícono ya
//quedó puesto arriba, en el título de la sección.
const MetaPlainRow = ({ label, value, valueTooltip }: MetaPlainRowProps) => (
    <Stack direction="row" spacing={.75} sx={{ alignItems: "center", pl: .25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>{label}:</Typography>
        <Tooltip title={valueTooltip ?? ""} disableHoverListener={!valueTooltip}>
            <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{value ?? "—"}</Typography>
        </Tooltip>
    </Stack>
)

interface OwnerSelectRowProps {
    icon: ReactNode
    title: string
    canEdit: boolean
    options: AssignOption[]
    value: AssignOption
    onChange: (option: AssignOption | null) => void
    disabled?: boolean
}

/**
 * Fila de "Usuario asignado"/"Equipo asignado": ícono con tooltip (nombre de la fila) + valor.
 * Si tiene permiso (`lead:update`) el valor es un Autocomplete editable (incluye "Sin asignar"
 * para desasignar); si no, se muestra el nombre actual como texto simple, igual criterio que el
 * resto del detalle (siempre visible, solo se gatea la posibilidad de cambiarlo).
 */
const OwnerSelectRow = ({ icon, title, canEdit, options, value, onChange, disabled }: OwnerSelectRowProps) => (
    <Stack direction="row" spacing={.75} sx={{ alignItems: "center" }}>
        <Tooltip title={title}>
            <Box sx={{ display: "flex", color: "text.secondary" }}>{icon}</Box>
        </Tooltip>
        {canEdit ? (
            <Autocomplete<AssignOption>
                size="small"
                options={options}
                value={value}
                disableClearable
                disabled={disabled}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                getOptionLabel={o => o.label}
                onChange={(_, newValue) => onChange(newValue)}
                sx={{ minWidth: 160, flexGrow: 1, "& .MuiInputBase-root": { fontSize: "0.8rem" } }}
                renderInput={params => <TextField {...params} variant="standard" placeholder={title} />}
            />
        ) : (
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{value.label}</Typography>
        )}
    </Stack>
)