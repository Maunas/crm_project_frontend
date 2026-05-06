import { Button, ButtonGroup, Grid, Paper, Stack, Typography } from "@mui/material"
import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { UserLogin } from "../../types/users"
import { useForm } from "react-hook-form"
import { setFormErrors } from "../../services/generalService"
import { PasswordField, RegisteredTextInput } from "../../components/ui/forms/CustomInputs"
import { FormErrorMessage } from "../../components/ui/forms/FormFeedback"
import { UserContext } from "src/stores/contexts"
import CommonButton from "src/components/ui/buttons/CommonButton"


export const LoginFormPage = () => {

  const { login } = useContext(UserContext)
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
