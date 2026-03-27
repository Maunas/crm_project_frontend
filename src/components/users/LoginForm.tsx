import { Button, ButtonGroup, Grid, Paper, Stack, Typography } from "@mui/material"
import { useContext } from "react"
import { UserContext } from "../common/contexts"
import { Link, useNavigate } from "react-router-dom"
import type { UserLogin } from "../../types/users"
import { useForm } from "react-hook-form"
import { setFormErrors } from "../../generalService"
import { PasswordField, RegisteredTextInput } from "../common/forms/CustomInputs"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents"


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
    <form>
      <Typography variant="h1" color="initial" textAlign="center">
        CRM
      </Typography>
      <Typography variant="h2" color="initial" textAlign="center">
        Iniciar Sesión
      </Typography>
      <Grid container spacing={2} sx={{
        justifyContent: "center",
        alignItems: "center",
        margin: "1rem"
      }}>
        <Grid size="grow" minWidth={"20rem"}>
          <RegisteredTextInput name="email" register={register} label="Nombre"
            required errorMessage={errors.email?.message} />
        </Grid>
        <Grid size="grow" minWidth={"20rem"}>
          <PasswordField name="password" register={register} label="Contraseña" errorMessage={errors.password?.message} required />
        </Grid>
      </Grid>
      {errors?.root &&
        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
      }
      <ButtonGroup fullWidth>
        <Button variant="outlined" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} fullWidth>
          Iniciar Sesión
        </Button>
      </ButtonGroup>
      <Stack justifyContent="center" alignItems="center">
        <Button variant="text" component={Link} to="/signup">Crear Cuenta</Button>
      </Stack>
    </form>
  )
}
