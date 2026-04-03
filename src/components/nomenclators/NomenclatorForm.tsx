import { useEffect, useMemo, useState } from "react"
import { ControlledTextInput } from "../common/forms/CustomInputs"
import { setFormErrors } from "../../generalService"
import { useForm, useWatch } from "react-hook-form"
import { Typography, Button, Grid, ButtonGroup, Stack } from "@mui/material"
import { FormErrorMessage } from "../../theme/styledMUIFormComponents"
import { createNomenclator, getNomenclators, updateNomenclator } from "./nomenclatorService"
import type { Nomenclator, NomenclatorDetailed, NomenclatorPost } from "../../types/nomenclators"
import { type Campaign, type Workspace } from "../../types/campaigns"
import { getWorkspaces } from "../workspaces/workspaceServices"
import { getCampaigns } from "../campaigns/campaignServices"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"

interface NomenclatorSidebarProps {
    existingNom?: NomenclatorDetailed,
    closeSidebar: () => void,
    updateEntityOnList: (entity: NomenclatorDetailed) => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void
}

//Wrapper de NomenclatorForm para funcionar en un Sidebar
export const NomenclatorFormSidebar = ({ existingNom, closeSidebar, handleSidebar, updateEntityOnList }: NomenclatorSidebarProps) => {

    const submit = (data: NomenclatorPost) => {
        const updateList = (res: NomenclatorDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_NOM", res)
        }
        if (!existingNom) {
            return createNomenclator(data)
                .then(updateList)
        } else {
            return updateNomenclator(data, existingNom.id)
                .then(updateList)
        }
    }

    return (
        <NomenclatorForm existingNom={existingNom} submit={submit} onCancel={closeSidebar} />
    )
}

interface NomenclatorProps {
    existingNom?: NomenclatorDetailed,
    submit: (data: NomenclatorPost) => Promise<void>,
    onCancel: () => void
}

export const NomenclatorForm = ({ existingNom, submit, onCancel }: NomenclatorProps) => {

    const defaultValues = useMemo(() => ({
        name: existingNom?.name ?? null,
        campaign_id: existingNom?.campaign_id ?? null,
        parent_nomenclator_id: existingNom?.parent_nomenclator_id ?? null,
    }), [existingNom])

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm<NomenclatorPost & { workspace_id: number }>({ defaultValues })

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [nomenclators, setNomenclators] = useState<Nomenclator[]>([])

    useEffect(() => {
        getWorkspaces({ detailed: false, only_active: true, page_size: 0 }).then(res => setWorkspaces(res.items))
        getNomenclators({ detailed: false, only_active: true, page_size: 0 }).then(res => setNomenclators(res.items))
    }, [])

    const selectedWorkspace = useWatch({ name: "workspace_id", control })

    useEffect(() => {
        if (!selectedWorkspace) return
        getCampaigns({ detailed: false, only_active: true, page_size: 0, workspace_id: selectedWorkspace }).then(res => setCampaigns(res.items))
    }, [selectedWorkspace])


    useEffect(() => { reset(defaultValues) }, [reset, defaultValues])

    const onSubmit = (data: NomenclatorPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form>
            <Stack gap={2}>
                <Typography variant="h2">
                    {!existingNom ? "Crear Nomenclador"
                        : `Modificar Nomenclador: ${existingNom.name}`}
                </Typography>
                <Grid container spacing={1} sx={{
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledTextInput name="name" control={control} label="Nombre"
                            required errorMessage={errors.name?.message} />
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id" options={workspaces}
                            getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                            errorMessage={errors?.workspace_id?.message} placeholder="Global" />
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Campaña" name="campaign_id" options={campaigns}
                            getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                            errorMessage={errors?.campaign_id?.message} disabled={!selectedWorkspace} placeholder="Global" />
                    </Grid>
                    <Grid size="grow" minWidth={"20rem"}>
                        <ControlledAutocomplete control={control} label="Nomenclador Padre" name="parent_nomenclator_id" options={nomenclators.filter(nom => nom.id !== existingNom?.id)}
                            getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                            errorMessage={errors?.parent_nomenclator_id?.message} />
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
                        Guardar Nomenclador
                    </Button>
                </ButtonGroup>
            </Stack>
        </form>
    )
}

