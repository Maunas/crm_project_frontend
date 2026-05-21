import { PasswordField, RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { UserLogin } from "src/types/users"
import { setFormErrors } from "src/utils/forms"
import { useUserContext } from "src/stores/UserContext"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button, ButtonGroup, Grid, Paper, Stack, Typography } from "@mui/material"


export const LoginFormPage = () => {

  const { login } = useUserContext()
  const nav = useNavigate()

  const submit = (data: UserLogin) => {
    return login(data).then(() => {
      alert("Sesión Iniciada")
      nav("/")
    })
  }

  return (
    <Paper sx={{ padding: "4rem" }}>
      <LoginForm submit={submit} onCancel={() => nav("/")} />
    </Paper>
  )
}

interface LoginFormProps {
  submit: (data: UserLogin) => Promise<void>,
  onCancel: () => void
}

const LoginForm = ({ submit, onCancel }: LoginFormProps) => {

  const { register, handleSubmit, formState: { errors }, setError } = useForm<UserLogin>()

  const onSubmit = (data: UserLogin) => {
    submit(data)
      .catch(e => setFormErrors(e, setError))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography variant="h1" sx={{ textAlign: "center" }}>
          CRM
        </Typography>
        <Typography variant="h2" sx={{ textAlign: "center" }}>
          Iniciar Sesión
        </Typography>
        <Stack spacing={2}>
          <Grid container spacing={1} sx={{
            justifyContent: "center",
            alignItems: "center",
          }}>
            <Grid size="grow" sx={{ minWidth: "20rem" }}>
              <RegisteredTextInput name="email" register={register} label="Nombre"
                required errorMessage={errors.email?.message} />
            </Grid>
            <Grid size="grow" sx={{ minWidth: "20rem" }}>
              <PasswordField name="password" register={register} label="Contraseña" errorMessage={errors.password?.message} required />
            </Grid>
          </Grid>
          {errors?.root &&
            <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
          }
          <Stack spacing={1}>
            <ButtonGroup fullWidth>
              <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel} fullWidth>
                Cancelar
              </CommonButton>
              <CommonButton actionType="LOGIN" variant="contained" type="submit" fullWidth>
                Iniciar Sesión
              </CommonButton>
            </ButtonGroup>
            <Button fullWidth variant="text" component={Link} to="/signup">Crear Cuenta</Button>
          </Stack>
        </Stack>
      </Stack>
    </form>
  )
}
