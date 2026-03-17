import { useContext } from "react"
import { UserContext } from "../common/contexts"
import { Link, useNavigate } from "react-router-dom"
import type { UserSignup } from "../../types/users"
import { Button, ButtonGroup, Grid, Paper, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { setFormErrors } from "../../generalService"
import { PasswordField, RegisteredTextInput } from "../common/forms/CustomInputs"
import { FormErrorMessage } from "../../styles/styledMUIFormComponents"


export const SignupFormPage = () => {

  const { signup } = useContext(UserContext)
  const nav = useNavigate()

  const submit = (data: UserSignup) => {
    return signup(data).then(() => {
      alert("Cuenta Creada")
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
    submit(data)
      .catch(e => setFormErrors(e, setError))
  }

  return (
    <form>
      <Typography variant="h1" color="initial" textAlign="center">
        CRM
      </Typography>
      <Typography variant="h2" color="initial" textAlign="center">
        Crear cuenta
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
        <Grid size="grow" minWidth={"20rem"}>
          <PasswordField name="repeat_password" register={register} label="Repetir Contraseña" errorMessage={errors.repeat_password?.message} required />
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
          Crear Cuenta
        </Button>
      </ButtonGroup>
      <Stack justifyContent="center" alignItems="center">
        <Button variant="text" component={Link} to="/login">Iniciar Sesión</Button>
      </Stack>
    </form>
  )
}
