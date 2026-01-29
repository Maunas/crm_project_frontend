import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import type { Organization } from "../../types/campaigns"
import { createOrganization } from "./campaignServices"
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material"

export const OrganizationForm = () => {

    const { register, handleSubmit } = useForm()
    const nav = useNavigate()

    const submit = (data: Organization) => {
        createOrganization(data).then(() => {
            nav(`/campaigns`)
        }).catch((e) => console.error(e))
    }

    return (
        <Container >
            <Paper sx={{ p: 2 }}>
                <Typography variant="h1" color="initial">Crear Organización</Typography>
                <form>
                    <Grid container spacing={2} sx={{
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "1rem"
                    }}>
                        <Grid size="grow" minWidth={"20rem"}>
                            <TextField {...register("name")} label="Nombre" fullWidth />
                        </Grid>
                        <Grid size="grow" minWidth={"20rem"}>
                            <TextField {...register("description")} label="Descripción" fullWidth />
                        </Grid>

                    </Grid>
                    <Button component={Link} to="/campaigns">
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                        Guardar Organización
                    </Button>
                </form>
            </Paper>
        </Container>
    )
}