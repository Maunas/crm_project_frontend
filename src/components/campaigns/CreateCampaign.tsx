import { Autocomplete, Container, Paper, TextField, Typography, Button, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import type { Workspace } from "../../types/leads"
import { createCampaign, getWorkspaces } from "./campaignServices"

export const CreateCampaign = () => {

    return (
        <Container >
            <Paper sx={{ p: 2 }}>
                <Typography variant="h1">
                    Crear Campaña
                </Typography>
                <CampaignForm />
            </Paper>
        </Container>
    )
}


export const CampaignForm = () => {

    const { register, handleSubmit, control } = useForm()
    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])

    useEffect(() => {
        getWorkspaces().then(setWorkspaces)
    }, [])

    const submit = (data) => {
        createCampaign(data).then((res) => {
            console.log(res)
        }).catch((e) => console.error(e))
    }

    return (
        <form onSubmit={handleSubmit(submit)}>
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                margin:"1rem"
            }}>
                <Grid size="grow" minWidth={"20rem"}>
                    <TextField {...register("name")} label="Nombre" fullWidth  />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <TextField {...register("description")} label="Descripción" fullWidth  />
                </Grid>
                <Grid size="grow" minWidth={"20rem"}>
                    <Controller name="workspace_id" control={control}
                        render={({ field, ...props }) => (
                            <Autocomplete
                                {...props}
                                disablePortal
                                options={workspaces}
                                renderInput={(params) => <TextField {...params} label="Workspace" />}
                                getOptionLabel={(option) => option.name}
                                getOptionKey={(option) => option.id}
                                onChange={(_, value) => field.onChange(value?.id)}
                            />
                        )}
                    >
                    </Controller>
                </Grid>
            </Grid>

            <Button variant="contained" onClick={handleSubmit(submit)} sx={{marginBlock:"1rem"}}>
                Guardar Campaña
            </Button>
        </form>
    )
}
