import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, CircularProgress, IconButton, Stack, Tooltip } from "@mui/material"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { GenericSidebar } from "shared/layout/container/GenericSidebar"
import { DisableConfirmDialog } from "shared/ui/feedback/ConfirmationDialog"
import { showToast, showCommonErrorToast } from "src/utils/feedback"
import type { LeadDetailed } from "src/types/leads"
import { LeadInfo } from "../details/LeadDetails"
import { getLeadTitleArray, getLeadSubtitleArray } from "../leadUtils"
import { enableLead, disableLead } from "../leadService"

interface LeadDetailsSidebarProps {
    isOpen: boolean
    lead: LeadDetailed | null
    loading?: boolean
    onClose: () => void
    onUpdate: (lead: LeadDetailed) => void
}

/**
 * Sidebar de detalle "rápido" de un lead, abierto con un solo clic desde el listado (Tabla o
 * Tablero) -- pedido del usuario para poder editar datos del lead sin perder de vista el
 * listado (hoy un clic navegaba directo a /leads/{id}, sacando de la lista).
 *
 * Reutiliza LeadInfo tal cual (el mismo "lado izquierdo" del detalle completo: título,
 * Estado/Etapa, Etiquetas, Usuario/Equipo asignado + metadata, y las secciones de campos
 * editables) -- deliberadamente NO incluye LeadActivities (columna derecha del detalle completo,
 * timeline de auditoría/comentarios), que sigue siendo exclusiva del detalle de página completa.
 *
 * Mismo mecanismo de Drawer que ya usan Workspace/Team (GenericSidebar) -- "clic afuera cierra"
 * viene gratis del comportamiento estándar de MUI Drawer (onClose).
 *
 * Ir al detalle completo desde el listado es siempre explícito, con un ícono en la fila/card (ver
 * LeadTablePresentation/LeadBoardCard) -- el clic simple sobre la fila/card solo abre este sidebar,
 * sin doble clic de por medio. Acá dentro se repite el mismo ícono, junto al botón de cerrar,
 * dentro de la franja superior con fondo que agrega GenericSidebar vía headerActions (si no,
 * ambos botones quedaban flotando sueltos sobre el contenido).
 *
 * Las secciones de campos (LeadFieldSections, vía forceExpandSections) quedan siempre desplegadas
 * y no se pueden plegar -- a diferencia del detalle de página completa, donde sí es un acordeón.
 */
export const LeadDetailsSidebar = ({ isOpen, lead, loading = false, onClose, onUpdate }: LeadDetailsSidebarProps) => {
    const navigate = useNavigate()
    //Estado propio (no comparte idModal con LeadDetails.tsx a propósito, para no acoplar ambos
    //lugares -- nunca están montados sobre el mismo lead a la vez de todos modos).
    const [isDeleting, setIsDeleting] = useState<LeadDetailed | null>(null)

    const leadTitle = lead ? getLeadTitleArray(lead) : null
    const leadSubtitle = lead ? getLeadSubtitleArray(lead) : null

    const handleActive = (l: LeadDetailed) => {
        if (!l.active) return enableLead(l.id).then(() => {
            showToast(`Lead habilitado con éxito.`)
            onUpdate({ ...l, active: true })
        }).catch(e => showCommonErrorToast(e))
        return disableLead(l.id).then(res => {
            if (res.action === "deleted") {
                showToast(`Lead eliminado definitivamente.`)
                onClose()
            } else {
                showToast(`Lead deshabilitado con éxito.`)
                onUpdate({ ...l, active: false })
            }
        }).catch(e => showCommonErrorToast(e))
    }

    return (
        <>
            {/* headerActions siempre truthy (fragment), aunque el ícono interno se oculte mientras
                loading -- así el botón de cerrar no "salta" de posición al pasar de loading a
                cargado (ver GenericSidebar: sin headerActions, el cierre flota solo, sin franja). */}
            <GenericSidebar isSidebarOpen={isOpen} closeSidebar={onClose} sidebarWidth="45rem"
                headerActions={<>
                    {lead &&
                        <Tooltip title="Ver detalle completo">
                            <IconButton size="small" onClick={() => navigate(`/leads/${lead.id}`)}>
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    }
                </>}>
                <Box sx={{ height: "100%", overflowY: "auto", p: 3, pt: "4.5rem" }}>
                    {loading &&
                        <Stack sx={{ alignItems: "center", py: 8 }}>
                            <CircularProgress />
                        </Stack>
                    }
                    {!loading && lead &&
                        <LeadInfo lead={lead} leadTitle={leadTitle} leadSubtitle={leadSubtitle}
                            handleActive={() => setIsDeleting(lead)} updateLeadInfo={(l) => onUpdate(l)}
                            forceExpandSections />
                    }
                </Box>
            </GenericSidebar>
            <DisableConfirmDialog entity={isDeleting} clearEntity={() => setIsDeleting(null)}
                idModal="del-lead-sidebar" onConfirm={() => handleActive(isDeleting!)} entityTypeName="el lead" onlyDelete />
        </>
    )
}
