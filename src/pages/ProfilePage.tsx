import { useState } from "react"
import { useForm } from "react-hook-form"
import { Box, Paper, Typography, Stack, Button, Divider, Alert, Collapse } from "@mui/material"
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { RegisteredTextInput, RegisteredDateInput, PasswordField } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import { setFormErrors } from "src/utils/forms"
import { changePassword } from "src/features/auth/userServices"
import { useUserContext } from "src/stores/UserContext"

interface ProfileForm {
    name: string
    last_name: string
    email: string
    phone: string
    date_of_birth: string
}

const ProfileDataSection = () => {
    const { user, updateUser } = useUserContext()
    const [success, setSuccess] = useState(false)
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<ProfileForm>({
        defaultValues: {
            name: user?.name ?? "",
            last_name: user?.last_name ?? "",
            email: user?.email ?? "",
            phone: user?.phone ?? "",
            date_of_birth: user?.date_of_birth ?? "",
        }
    })

    const onSubmit = async (data: ProfileForm) => {
        setSuccess(false)
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
                setError("date_of_birth", { message: "Debés tener al menos 18 años." })
                return
            }
        }
        try {
            await updateUser({
                name: data.name,
                last_name: data.last_name || undefined,
                email: data.email,
                phone: data.phone || undefined,
                date_of_birth: data.date_of_birth || undefined,
            })
            setSuccess(true)
        } catch (e) {
            setFormErrors(e, setError)
        }
    }

    return (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", gap: 1.5 }}>
                <PersonOutlineIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Datos personales</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Stack spacing={2.5}>
                        <Stack direction="row" spacing={1.5}>
                            <RegisteredTextInput name="name" register={register} label="Nombre" required errorMessage={errors.name?.message} autoComplete="given-name" />
                            <RegisteredTextInput name="last_name" register={register} label="Apellido" errorMessage={errors.last_name?.message} autoComplete="family-name" />
                        </Stack>
                        <RegisteredTextInput name="email" register={register} label="Email" required errorMessage={errors.email?.message} autoComplete="email" />
                        <RegisteredTextInput name="phone" register={register} label="Teléfono" errorMessage={errors.phone?.message} autoComplete="tel" />
                        <RegisteredDateInput name="date_of_birth" register={register} label="Fecha de nacimiento" errorMessage={errors.date_of_birth?.message} autoComplete="bday" />
                        {errors?.root && <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                        <Collapse in={success}>
                            <Alert severity="success" onClose={() => setSuccess(false)}>Datos actualizados correctamente.</Alert>
                        </Collapse>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button variant="contained" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar cambios"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
        </Paper>
    )
}

interface PasswordForm {
    current_password: string
    new_password: string
    confirm_new_password: string
}

const ChangePasswordSection = () => {
    const [success, setSuccess] = useState(false)
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<PasswordForm>()

    const onSubmit = async (data: PasswordForm) => {
        setSuccess(false)
        if (data.new_password.length < 8) {
            setError("new_password", { message: "La nueva contraseña debe tener al menos 8 caracteres." })
            return
        }
        if (data.new_password !== data.confirm_new_password) {
            setError("confirm_new_password", { message: "Las contraseñas no coinciden." })
            return
        }
        try {
            await changePassword(data.current_password, data.new_password)
            setSuccess(true)
            reset()
        } catch (e) {
            setFormErrors(e, setError)
        }
    }

    return (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", gap: 1.5 }}>
                <LockOutlinedIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Cambiar contraseña</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Stack spacing={2.5}>
                        <PasswordField name="current_password" register={register} label="Contraseña actual" required errorMessage={errors.current_password?.message} autoComplete="current-password" />
                        <Divider />
                        <PasswordField name="new_password" register={register} label="Nueva contraseña" required errorMessage={errors.new_password?.message} autoComplete="new-password" />
                        <PasswordField name="confirm_new_password" register={register} label="Confirmar nueva contraseña" required errorMessage={errors.confirm_new_password?.message} autoComplete="new-password" />
                        {errors?.root && <FormErrorMessage>{errors.root.message}</FormErrorMessage>}
                        <Collapse in={success}>
                            <Alert severity="success" onClose={() => setSuccess(false)}>Contraseña actualizada correctamente.</Alert>
                        </Collapse>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button variant="contained" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
        </Paper>
    )
}

export const ProfilePage = () => {
    return (
        <Box sx={{ maxWidth: 640, mx: "auto", py: 4, px: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Mi perfil</Typography>
            <Stack spacing={3}>
                <ProfileDataSection />
                <ChangePasswordSection />
            </Stack>
        </Box>
    )
}
