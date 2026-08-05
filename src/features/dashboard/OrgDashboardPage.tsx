import { useEffect, useState } from "react"
import {
    Box, Chip, CircularProgress, Divider,
    Paper, Stack, Typography, useTheme,
} from "@mui/material"
import {
    LeaderboardOutlined, PeopleOutlined, TrendingUpOutlined,
} from "@mui/icons-material"
import { getOrgDashboard, type OrgDashboard, type LeadsByState } from "src/features/dashboard/dashboardServices"
import { useUserContext } from "src/stores/UserContext"
import { showCommonErrorToast } from "src/utils/feedback"
import { UserAvatar } from "src/components/ui/details/UserAvatar"

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
    return (
        <Paper variant="outlined" sx={{ flex: 1, p: 2.5, borderRadius: 2, borderLeft: `4px solid ${color}` }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box sx={{ color, bgcolor: `${color}18`, borderRadius: 1.5, p: 1, display: "flex" }}>{icon}</Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    )
}

// ── Shared donut ──────────────────────────────────────────────────────────────
const PALETTE_A = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"]
const PALETTE_B = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"]

interface DonutProps { data: LeadsByState[]; colors?: string[] }

function DonutChart({ data, colors = PALETTE_B }: DonutProps) {
    const { palette } = useTheme()
    const [hovered, setHovered] = useState<number | null>(null)

    const total = data.reduce((s, d) => s + d.total, 0)
    const size = 150
    const cx = size / 2, cy = size / 2, r = 56, gap = 0.025

    if (total === 0) return (
        <Stack sx={{ height: size, alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">Sin datos</Typography>
        </Stack>
    )

    let angle = -Math.PI / 2
    const slices = data.map((item, i) => {
        const pct = item.total / total
        const sweep = pct * 2 * Math.PI - gap
        const start = angle + gap / 2, end = start + sweep
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end)
        const large = sweep > Math.PI ? 1 : 0
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
        const color = item.color ?? colors[i % colors.length]
        angle += pct * 2 * Math.PI
        return { path, color, item, pct }
    })

    const active = hovered !== null ? slices[hovered] : null

    return (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={size} height={size} style={{ display: "block" }}>
                    {slices.map((s, i) => (
                        <path key={i} d={s.path} fill={s.color}
                            opacity={hovered === null || hovered === i ? 0.92 : 0.3}
                            style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}>
                            <title>{s.item.state_name}: {s.item.total}</title>
                        </path>
                    ))}
                    <circle cx={cx} cy={cy} r={r * 0.55} fill={palette.background.paper} />
                </svg>
                <Box sx={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
                    {active ? (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: active.color }}>{active.item.total}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 62, lineHeight: 1.2, fontSize: 9 }}>
                                {active.item.state_name}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{total}</Typography>
                            <Typography variant="caption" color="text.secondary">leads</Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* Leyenda */}
            <Stack spacing={0.8} sx={{ flex: 1, minWidth: 0 }}>
                {slices.map((s, i) => (
                    <Box key={s.item.state_id}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        sx={{ cursor: "default", opacity: hovered === null || hovered === i ? 1 : 0.4, transition: "opacity 0.15s" }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.2 }}>
                            <Stack direction="row" spacing={0.7} sx={{ alignItems: "center" }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }} />
                                <Typography variant="caption" noWrap sx={{ lineHeight: 1 }}>{s.item.state_name}</Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: s.color, ml: 1, flexShrink: 0 }}>
                                {s.item.total}
                            </Typography>
                        </Stack>
                        <Box sx={{ height: 4, bgcolor: "action.hover", borderRadius: 3, overflow: "hidden" }}>
                            <Box sx={{ height: "100%", width: `${(s.pct * 100).toFixed(1)}%`, bgcolor: s.color, borderRadius: 3, transition: "width 0.5s ease" }} />
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Stack>
    )
}

// ── Activity feed ─────────────────────────────────────────────────────────────
const ACTION_COLOR: Record<string, string> = {
    CREATED: "#10b981", UPDATED: "#3b82f6", DELETED: "#ef4444", ACTIVATED: "#f59e0b",
}
const ACTION_LABEL: Record<string, string> = {
    CREATED: "Creado", UPDATED: "Actualizado", DELETED: "Eliminado", ACTIVATED: "Activado",
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function OrgDashboardPage() {
    const { activeOrg } = useUserContext()
    const [data, setData] = useState<OrgDashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const { palette } = useTheme()

    useEffect(() => {
        setLoading(true)
        getOrgDashboard()
            .then(setData)
            .catch(showCommonErrorToast)
            .finally(() => setLoading(false))
    }, [activeOrg?.id])

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
            <CircularProgress />
        </Box>
    )
    if (!data) return null

    return (
        <Stack spacing={3} sx={{ p: 3 }}>
            {/* Header card */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2, overflow: "hidden", p: 3,
                    background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 60%, ${palette.secondary.main} 100%)`,
                    color: "#fff",
                }}
            >
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2, p: 1.2, display: "flex" }}>
                        <LeaderboardOutlined sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>Dashboard</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.3 }}>{activeOrg?.name}</Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Stat cards */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <StatCard label="Leads totales" value={data.total_leads} icon={<LeaderboardOutlined fontSize="small" />} color={palette.primary.main} />
                <StatCard label="Miembros del equipo" value={data.org_users.length} icon={<PeopleOutlined fontSize="small" />} color="#10b981" />
                <StatCard label="Etapas" value={data.leads_by_flow_state.length} icon={<TrendingUpOutlined fontSize="small" />} color="#f59e0b" />
            </Stack>

            {/* Main content: actividad | gráficos + equipo */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "stretch" }}>

                {/* Columna izquierda — Actividad reciente (ocupa todo el alto) */}
                <Paper variant="outlined" sx={{ flex: 1.4, p: 2.5, borderRadius: 2, display: "flex", flexDirection: "column" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Actividad reciente</Typography>
                    {data.recent_activity.length === 0
                        ? <Typography variant="body2" color="text.secondary">Sin actividad</Typography>
                        : (
                            <Stack spacing={0} sx={{ flex: 1 }}>
                                {data.recent_activity.slice(0, 15).map((a, i, arr) => {
                                    const color = ACTION_COLOR[a.action] ?? palette.text.secondary
                                    return (
                                        <Stack key={a.id} direction="row" spacing={1.5}
                                            sx={{ alignItems: "flex-start", py: 1, borderBottom: i < arr.length - 1 ? `1px solid ${palette.divider}` : "none" }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, mt: 0.65, flexShrink: 0 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                                                    <Box component="span" sx={{ fontWeight: 600, color }}>{ACTION_LABEL[a.action] ?? a.action}</Box>
                                                    {" "}{a.entity_type}
                                                </Typography>
                                                {a.user_name && (
                                                    <Typography variant="caption" color="text.secondary" noWrap>{a.user_name}</Typography>
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                                {new Date(a.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                                            </Typography>
                                        </Stack>
                                    )
                                })}
                            </Stack>
                        )
                    }
                </Paper>

                {/* Columna derecha — Gráficos apilados + Equipo */}
                <Stack spacing={3} sx={{ flex: 1 }}>
                    {/* Flujo */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Etapas</Typography>
                        <DonutChart data={data.leads_by_flow_state} colors={PALETTE_B} />
                    </Paper>

                    {/* Contacto */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Estados</Typography>
                        <DonutChart data={data.leads_by_contact_state} colors={PALETTE_A} />
                    </Paper>

                    {/* Equipo */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Equipo</Typography>
                        <Stack divider={<Divider />}>
                            {data.org_users.map(u => (
                                <Stack key={u.id} direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1 }}>
                                    <UserAvatar name={`${u.name} ${u.last_name ?? ""}`} size={34} tooltip />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{u.name} {u.last_name ?? ""}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>{u.email}</Typography>
                                    </Box>
                                    {u.is_owner && <Chip label="Propietario" size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />}
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>
            </Stack>
        </Stack>
    )
}
