import { Autocomplete, Container, Paper, TextField, Typography, Button } from "@mui/material"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import type { Workspace } from "../../types/leads"
import { createCampaign, getWorkspaces } from "./campaignServices"

export const CreateCampaign = () => {

    return (
        <Container>
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
        createCampaign(data).then((res)=>{
            console.log(res)
        }).catch((e)=>console.error(e))
    }

    return (
        <form onSubmit={handleSubmit(submit)}>

            <TextField {...register("name")} label="Nombre" />
            <TextField {...register("description")} label="Descripción" />
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
            <Button variant="contained" onClick={handleSubmit(submit)}>
                Guardar Campaña
            </Button>
        </form>
    )
}
