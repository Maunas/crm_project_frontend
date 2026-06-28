import { useState } from "react"
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, InputAdornment, Stack, TextField, Typography, Alert,
    Tooltip, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material"
import { ContentCopy, Close, LinkOutlined } from "@mui/icons-material"
import { inviteUser } from "src/features/auth/userServices"
import type { InviteResponse } from "src/types/users"
import { useUserContext } from "src/stores/UserContext"

interface Props {
    open: boolean
    onClose: () => void
}

export function InviteDialog({ open, onClose }: Props) {
    const { activeOrg } = useUserContext()

    const [email, setEmail] = useState("")
    const [roleCode, setRoleCode] = useState("agent")
    const [invitation, setInvitation] = useState<InviteResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!activeOrg || activeOrg.id === 0) return
        setLoading(true)
        setError(null)
        try {
            const inv = await inviteUser({
                email,
                organization_id: activeOrg.id,
                role_code: roleCode,
            })
            setInvitation(inv)
        } catch (e: any) {
            setError(e?.response?.data?.detail ?? "Error al generar la invitacion.")
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (!invitation) return
        navigator.clipboard.writeText(invitation.invite_token)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleClose = () => {
        setInvitation(null)
        setError(null)
        setCopied(false)
        setEmail("")
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}>
                <LinkOutlined />
                Invitar a {activeOrg?.name ?? "la organizacion"}
                <IconButton onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} pt={1}>
                    {!invitation && (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                Ingresa el email de la persona a invitar. Recibirá un token para unirse a tu organización.
                                El token es válido por 72 horas.
                            </Typography>
                            <TextField
                                label="Email del invitado"
                                type="email"
                                size="small"
                                fullWidth
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <FormControl size="small" fullWidth>
                                <InputLabel shrink>Rol</InputLabel>
                                <Select
                                    value={roleCode}
                                    label="Rol"
                                    onChange={e => setRoleCode(e.target.value)}
                                    notched
                                >
                                    <MenuItem value="agent">Agente</MenuItem>
                                    <MenuItem value="admin">Administrador</MenuItem>
                                    <MenuItem value="viewer">Solo lectura</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}

                    {invitation && (
                        <>
                            <Alert severity="success">{invitation.message}</Alert>
                            <Typography variant="body2" color="text.secondary">
                                Compartí este token con la persona invitada. Expira en <strong>{invitation.expires_in_hours} horas</strong>.
                            </Typography>
                            <TextField
                                value={invitation.invite_token}
                                fullWidth
                                size="small"
                                label="Token de invitacion"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                    <IconButton onClick={handleCopy} edge="end">
                                                        <ContentCopy fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            {copied && (
                                <Typography variant="caption" color="success.main">
                                    Token copiado al portapapeles
                                </Typography>
                            )}
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cerrar</Button>
                {!invitation && (
                    <Button
                        onClick={handleGenerate}
                        variant="contained"
                        disabled={loading || !email}
                    >
                        {loading ? "Generando..." : "Generar token"}
                    </Button>
                )}
                {invitation && (
                    <Button onClick={() => { setInvitation(null); setEmail("") }} variant="outlined">
                        Invitar a otra persona
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}
