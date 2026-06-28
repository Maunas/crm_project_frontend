import { PasswordField, RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { UserLogin } from "src/types/users"
import { setFormErrors } from "src/utils/forms"
import { useUserContext } from "src/stores/UserContext"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Box, Button, Checkbox, Divider, FormControlLabel, Paper, Stack, Typography } from "@mui/material"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { useState } from "react"

export const LoginFormPage = () => {
    const { login } = useUserContext()
    const nav = useNavigate()

    const submit = async (data: UserLogin, rememberMe: boolean) => {
        await login(data, rememberMe)
        nav("/dashboard")
    }

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
            <Paper elevation={3} sx={{ width: "100%", maxWidth: 400, borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: 4, px: 3, textAlign: "center" }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: "primary.contrastText", color: "primary.main", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                        <LockOutlinedIcon />
                    </Box>
                    <Typography variant="h2" fontWeight={700} mb={0.5}>Iniciar sesión</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Ingresá tus credenciales para continuar</Typography>
                </Box>
                <Box sx={{ p: 4 }}>
                    <LoginForm submit={submit} />
                </Box>
            </Paper>
        </Box>
    )
}

interface LoginFormProps {
    submit: (data: UserLogin, rememberMe: boolean) => Promise<void>
}

const LoginForm = ({ submit }: LoginFormProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<UserLogin>()
    const [rememberMe, setRememberMe] = useState(true)

    const onSubmit = (data: UserLogin) => {
        if (!/\S+@\S+\.\S+/.test(data.email)) {
            setError("email", { message: "Ingresá un correo electrónico válido." })
            return
        }
        return submit(data, rememberMe).catch(e => setFormErrors(e, setError))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
                <RegisteredTextInput
                    name="email"
                    register={register}
                    label="Correo electrónico"
                    required
                    errorMessage={errors.email?.message}
                    autoComplete="email"
                    type="email"
                />
                <PasswordField
                    name="password"
                    register={register}
                    label="Contraseña"
                    required
                    errorMessage={errors.password?.message}
                    autoComplete="current-password"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            size="small"
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Mantener sesión iniciada
                        </Typography>
                    }
                />
                {errors?.root && <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                <CommonButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                </CommonButton>
                <Divider />
                <Button component={Link} to="/signup" variant="text" size="small">
                    ¿No tenés cuenta? Registrate
                </Button>
            </Stack>
        </form>
    )
}
