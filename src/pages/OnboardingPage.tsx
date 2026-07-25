import { useEffect } from "react"
import { useUserContext } from "src/stores/UserContext"
import type { SimpleErrorBody } from "src/types/shared"
import { createOrganization } from "features/organizations/organizationServices"
import { acceptInvite } from "features/auth/userServices"
import { getErrorMessage } from "src/lib/axios"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Box, Button, Card, CardContent, CircularProgress, Divider, Stack, TextField, Typography, Alert, } from "@mui/material"
import { AddBusinessOutlined, GroupAddOutlined } from "@mui/icons-material"

// ── Crear organizacion ────────────────────────────────────────────────────

interface CreateOrgForm { name: string; description?: string }

function CreateOrgCard({ onSuccess }: { onSuccess: () => void }) {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CreateOrgForm>()

    const submit = async (data: CreateOrgForm) => {
        try {
            await createOrganization({ name: data.name, description: data.description || undefined })
            onSuccess()
        } catch (e) {
            setError("root", { message: getErrorMessage(e as SimpleErrorBody, "Error al crear la organizacion.") })
        }
    }

    return (
        <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <AddBusinessOutlined color="primary" />
                        <Typography variant="h6">Crear organizacion</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Crea tu propia organizacion y empeza a invitar a tu equipo.
                    </Typography>
                    <form onSubmit={handleSubmit(submit)}>
                        <Stack spacing={2}>
                            <TextField
                                {...register("name", { required: "El nombre es obligatorio.", minLength: { value: 3, message: "Minimo 3 caracteres." } })}
                                label="Nombre de la organizacion"
                                size="small"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                            <TextField
                                {...register("description")}
                                label="Descripcion (opcional)"
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                            />
                            {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
                            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
                                {isSubmitting ? <CircularProgress size={20} /> : "Crear organizacion"}
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </CardContent>
        </Card>
    )
}

// ── Unirse con token ──────────────────────────────────────────────────────

interface JoinForm { token: string }

function JoinOrgCard({ onSuccess }: { onSuccess: () => void }) {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<JoinForm>()

    const submit = async (data: JoinForm) => {
        try {
            // El usuario ya está autenticado: el backend solo lo une a la org del token.
            // No emite tokens nuevos, así que no hay que tocar el tokenStore.
            await acceptInvite(data.token.trim())
            onSuccess()
        } catch (e) {
            setError("root", { message: getErrorMessage(e as SimpleErrorBody, "Token invalido o expirado.") })
        }
    }

    return (
        <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <GroupAddOutlined color="primary" />
                        <Typography variant="h6">Unirse con token</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Ingresa el token de invitacion que te compartio el propietario de la organizacion.
                        El token debe haber sido generado para tu email.
                    </Typography>
                    <form onSubmit={handleSubmit(submit)}>
                        <Stack spacing={2}>
                            <TextField
                                {...register("token", { required: "El token es obligatorio." })}
                                label="Token de invitacion"
                                size="small"
                                fullWidth
                                placeholder="Pega el token aqui..."
                                error={!!errors.token}
                                helperText={errors.token?.message}
                            />
                            {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
                            <Button type="submit" variant="outlined" disabled={isSubmitting} fullWidth>
                                {isSubmitting ? <CircularProgress size={20} /> : "Unirse a la organizacion"}
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </CardContent>
        </Card>
    )
}

// ── Pagina principal ──────────────────────────────────────────────────────

export function OnboardingPage() {
    const nav = useNavigate()
    const { user, isRestoring, fetchOrgHeaderList, refreshUser, orgHeaderList } = useUserContext()

    useEffect(() => {
        if (!isRestoring && !user) nav("/login", { replace: true })
    }, [user, isRestoring, nav])

    //Si ya tiene una organización propia, o es superusuario (tiene el Panel Global como "hogar" y no
    //necesita una organización propia), no tiene sentido quedarse acá pidiendo crear/unirse a una.
    useEffect(() => {
        if (!isRestoring && user && (user.is_superuser || orgHeaderList.length > 0)) nav("/", { replace: true })
    }, [user, orgHeaderList.length, isRestoring, nav])

    const handleSuccess = async () => {
        await refreshUser()
        fetchOrgHeaderList()
    }

    if (isRestoring || !user) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            p: 3, bgcolor: "background.default",
        }}>
            <Stack spacing={3} sx={{ width: "100%", maxWidth: 700 }}>
                <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Bienvenido, {user.name}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
                        Para continuar, crea tu organizacion o unite a una existente con un token de invitacion.
                    </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "stretch" }}>
                    <CreateOrgCard onSuccess={handleSuccess} />
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
                    <JoinOrgCard onSuccess={handleSuccess} />
                </Stack>
            </Stack>
        </Box>
    )
}
