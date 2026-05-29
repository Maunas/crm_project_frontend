import { PasswordField, RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { UserSignup } from "src/types/users"
import { useLoading } from "src/hooks/useLoading"
import { setFormErrors } from "src/utils/forms"
import { useUserContext } from "src/stores/UserContext"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button, ButtonGroup, Grid, Paper, Stack, Typography } from "@mui/material"

export const SignupFormPage = () => {

  const { signup } = useUserContext()
  const nav = useNavigate()

  const submit = (data: UserSignup) => {
    return signup(data).then(() => {
      nav("/")
    })
  }

  return (
    <Paper sx={{ padding: "4rem" }}>
      <SignupForm submit={submit} onCancel={() => nav("/")} />
    </Paper>
  )
}

interface SignupFormProps {
  submit: (data: UserSignup) => Promise<void>,
  onCancel: () => void
}

const SignupForm = ({ submit, onCancel }: SignupFormProps) => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<UserSignup>()

  const onSubmit = (data: UserSignup) => {
    return submit(data)
      .catch(e => setFormErrors(e, setError))
  }

  const { fnWithLoading, loading } = useLoading(onSubmit)

  return (
    <form onSubmit={handleSubmit(fnWithLoading)}>
      <Stack spacing={3}>
        <Typography variant="h1" sx={{ textAlign: "center" }}>
          CRM
        </Typography>
        <Typography variant="h2" sx={{ textAlign: "center" }}>
          Crear cuenta
        </Typography>
        <Stack spacing={2}>
          <Grid container spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
            <Grid size="grow" sx={{ minWidth: "20rem" }}>
              <RegisteredTextInput name="email" register={register} label="Nombre"
                required errorMessage={errors.email?.message} />
            </Grid>
            <Grid size="grow" sx={{ minWidth: "20rem" }}>
              <PasswordField name="password" register={register} label="Contraseña" errorMessage={errors.password?.message} required />
            </Grid>
            <Grid size="grow" sx={{ minWidth: "20rem" }}>
              <PasswordField name="repeat_password" register={register} label="Repetir Contraseña" errorMessage={errors.repeat_password?.message} required />
            </Grid>
          </Grid>
          {errors?.root &&
            <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
          }
          <Stack spacing={1}>
            <ButtonGroup fullWidth>
              <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel} disabled={loading} fullWidth>
                Cancelar
              </CommonButton>
              <CommonButton actionType="SIGNUP" variant="contained" type="submit" loading={loading} fullWidth>
                Crear Cuenta
              </CommonButton>
            </ButtonGroup>
            <Button fullWidth variant="text" component={Link} to="/login" disabled={loading} >Iniciar Sesión</Button>
          </Stack>
        </Stack>
      </Stack>
    </form>
  )
}
