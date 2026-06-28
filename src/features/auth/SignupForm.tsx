import { PasswordField, RegisteredTextInput, RegisteredDateInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { UserSignup } from "src/types/users"
import { setFormErrors } from "src/utils/forms"
import { useUserContext } from "src/stores/UserContext"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"

export const SignupFormPage = () => {
    const { signup } = useUserContext()
    const nav = useNavigate()

    const submit = async (data: UserSignup) => {
        await signup(data)
        nav("/onboarding")
    }

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
            <Paper elevation={3} sx={{ width: "100%", maxWidth: 440, borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: 4, px: 3, textAlign: "center" }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: "primary.contrastText", color: "primary.main", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                        <PersonAddOutlinedIcon />
                    </Box>
                    <Typography variant="h2" fontWeight={700} mb={0.5}>Crear cuenta</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Completá los datos para registrarte</Typography>
                </Box>
                <Box sx={{ p: 4 }}>
                    <SignupForm submit={submit} />
                </Box>
            </Paper>
        </Box>
    )
}

interface SignupFormProps {
    submit: (data: UserSignup) => Promise<void>
}

const SignupForm = ({ submit }: SignupFormProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<UserSignup>()

    const onSubmit = (data: UserSignup) => {
        if (!/\S+@\S+\.\S+/.test(data.email)) {
            setError("email", { message: "Ingresá un email válido." })
            return
        }
        if (data.date_of_birth) {
            const dob = new Date(data.date_of_birth)
            const today = new Date()
            const age = today.getFullYear() - dob.getFullYear() -
                (today.getMonth() < dob.getMonth() ||
                 (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0)
            if (age < 18) {
                setError("date_of_birth", { message: "Debés tener al menos 18 años para registrarte." })
                return
            }
        }
        return submit(data).catch(e => setFormErrors(e, setError))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                    <RegisteredTextInput name="name" register={register} label="Nombre" required
                        errorMessage={errors.name?.message} autoComplete="given-name" />
                    <RegisteredTextInput name="last_name" register={register} label="Apellido" required
                        errorMessage={errors.last_name?.message} autoComplete="family-name" />
                </Stack>
                <RegisteredTextInput name="email" register={register} label="Correo electrónico" required
                    errorMessage={errors.email?.message} autoComplete="email" type="email" />
                <PasswordField name="password" register={register} label="Contraseña" required
                    errorMessage={errors.password?.message} autoComplete="new-password" />
                <PasswordField name="repeat_password" register={register} label="Repetir contraseña" required
                    errorMessage={errors.repeat_password?.message} autoComplete="new-password" />
                <RegisteredDateInput name="date_of_birth" register={register} label="Fecha de nacimiento"
                    errorMessage={errors.date_of_birth?.message} autoComplete="bday" />
                <RegisteredTextInput name="phone" register={register} label="Teléfono (opcional)"
                    errorMessage={errors.phone?.message} autoComplete="tel" />
                {errors?.root && <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                <CommonButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registrando..." : "Crear cuenta"}
                </CommonButton>
                <Divider />
                <Button component={Link} to="/login" variant="text" size="small">
                    ¿Ya tenés cuenta? Iniciá sesión
                </Button>
            </Stack>
        </form>
    )
}
