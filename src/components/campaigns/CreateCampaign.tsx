import { Autocomplete, Container, Paper, TextField, Typography, Button, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import type { LeadField, Workspace } from "../../types/leads"
import { createCampaign, createLeadField, createWorkspace, createWorkspacen, getWorkspaces } from "./campaignServices"
import { Link, useNavigate } from "react-router-dom"

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
    const nav = useNavigate()

    useEffect(() => {
        getWorkspaces().then(setWorkspaces)
    }, [])

    const requiredFields: LeadField[] = [
        {
            "order": 1,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "lead_field_section_id": 1,
            "field_template_code": "FIRST_NAME",
        },
        {
            "order": 2,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "lead_field_section_id": 1,
            "field_template_code": "LAST_NAME",
        }
    ]

    const submit = (data) => {
        createCampaign(data)
            .then((res) =>
                Promise.all(requiredFields.map((field) => createLeadField({...field, campaign_id: res.id})))
                    .then(() => nav(`/campaigns/${res.id}`))
                    .catch((e) => console.error(e))
            )
            .catch((e) => console.error(e))
    }

    return (
        <form onSubmit={handleSubmit(submit)}>
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
            <Button component={Link} to="/campaigns">
                Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(submit)} sx={{ marginBlock: "1rem" }}>
                Guardar Campaña
            </Button>
        </form>
    )
}

export const WorkspaceForm = () => {

    const { register, handleSubmit } = useForm()
    const nav = useNavigate()

    const submit = (data) => {
        createWorkspace(data).then((res) => {
            nav(`/campaigns`)
        }).catch((e) => console.error(e))
    }

    return (
        <form onSubmit={handleSubmit(submit)}>
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
                Guardar Espacio de Trabajo
            </Button>
        </form>
    )
}
