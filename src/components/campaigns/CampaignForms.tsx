import { use, useEffect, useMemo, useState } from "react"
import { RegisteredTextInput } from "../common/forms/CustomInputs"
import { ControlledAutocomplete } from "../common/forms/CustomMultipleInputs"
import { FormErrorMessage } from "../common/forms/StyledFormComponents"
import type { CampaignDetailed, CampaignPost, Workspace, WorkspaceDetailed } from "../../types/campaigns"
import type { LeadFieldPost } from "../../types/leadFields"
import { setFormErrors } from "../../generalService"
import { getWorkspace, getWorkspaces } from "../workspaces/workspaceServices"
import { createCampaign, updateCampaign } from "./campaignServices"
import { createLeadField } from "../leadFields/leadFieldServices"
import { get, useForm } from "react-hook-form"
import { ButtonGroup, Grid, Stack, Typography } from "@mui/material"
import { CommonButton } from "../common/details/DetailsCommonButton"
import type { LeadFlow } from "../../types/leadFlow"
import { getLeadFlows } from "../leadFlows/FlowService"
import { useNavigate } from "react-router-dom"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import { IconButton, Box } from "@mui/material"

interface UpdateCampaignSidebarProps {
    existingCmp: CampaignDetailed,
    updateEntityOnList: (entity: CampaignDetailed) => void,
    closeSidebar: () => void,
}
//Wrapper de CampaignForm para modificar desde un Sidebar
export const UpdateCampaignFormSidebar = ({ existingCmp, updateEntityOnList, closeSidebar }: UpdateCampaignSidebarProps) => {

    const submit = (data: CampaignPost) => {
        return updateCampaign(data, existingCmp.id)
            .then(res => {
                updateEntityOnList(res)
                closeSidebar()
            })
    }
    return <CampaignForm existingCmp={existingCmp} submit={submit} onCancel={closeSidebar} />
}

interface CreateCampaignSidebarProps {
    handleSidebar: (mode: string, entity: CampaignDetailed | WorkspaceDetailed | null) => void
    closeSidebar: () => void,
}
//Wrapper de CampaignForm para crear desde un Sidebar
export const CreateCampaignFormSidebar = ({ handleSidebar, closeSidebar }: CreateCampaignSidebarProps) => {

    const requiredFields: Omit<LeadFieldPost, "campaign_id">[] = [
        {
            "order": 1,
            "required": true,
            "is_primary": false,
            "is_visible": true,
            "field_template_code": "FIRST_NAME",
            "title_order": 1
        },
    ]

    const submit = (data: CampaignPost) => {
        return createCampaign(data)
            .then(res => {
                //Busca el workspace y muestra su detalle.
                getWorkspace(res.workspace_id)
                    .then(wsp => handleSidebar("DETAILS_WSP", wsp))
                //Crea los campo requeridos.
                Promise.all(requiredFields.map(field => createLeadField({ ...field, campaign_id: res.id })))
                    .catch(e => { console.error(e) })
            })
    }

    return <CampaignForm submit={submit} onCancel={closeSidebar} />
}

interface CampaignProps {
    existingCmp?: CampaignDetailed,
    submit: (data: CampaignPost) => Promise<void>,
    onCancel: () => void
}

export const CampaignForm = ({ existingCmp, submit, onCancel }: CampaignProps) => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [leadFlows, setLeadFlows] = useState<LeadFlow[] | []>([])
    const navigate = useNavigate();

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 })
            .then(res => setWorkspaces(res.items))
    }, [])

    useEffect(() => {
        getLeadFlows({ only_active: true, page_size: 0 })
            .then(res => setLeadFlows(res.items))
    }, [])

    const flowsWithOptions = useMemo(() => {
        return [
            ...leadFlows,
            { id: 'CREATE_ACTION', name: ' + Agregar nuevo flujo...', isAction: true } as any
        ];
    }, [leadFlows]);


    const defaultValues = useMemo(() => ({
        name: existingCmp?.name,
        description: existingCmp?.description,
        workspace_id: existingCmp?.workspace_id,
        lead_flow_id: existingCmp?.lead_flow_id
    }), [existingCmp])

    const { register, handleSubmit, reset, control, formState: { errors }, setError, getValues }
        = useForm<CampaignPost>({ defaultValues })

    

    const handleNavigateToFlow = (flowId?: number) => {
        // Guardamos todo lo escrito en el form
        sessionStorage.setItem('campaign_draft', JSON.stringify(getValues()));
        // Guardamos la URL actual para que el editor sepa dónde volver
        sessionStorage.setItem('flow_return_url', window.location.pathname);
        
        onCancel(); // Cerramos el sidebar
        navigate(flowId ? `/lead-flow-editor/${flowId}` : '/lead-flow-editor');
    }

    //Reinicia los defaultValues si se cambia la campaña que se está creando/modificando.
    useEffect(() => { 
        const draft = sessionStorage.getItem('campaign_draft');
        if (draft) {
            reset(JSON.parse(draft)); // Restauramos lo que había escrito el usuario
            sessionStorage.removeItem('campaign_draft'); // Lo limpiamos para que no quede para siempre
        } else {
            reset(defaultValues); // Comportamiento normal
        }
    }, [reset, defaultValues])

    const onSubmit = (data: CampaignPost) => {
        submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                <Typography variant="h2">
                    {!existingCmp ? "Crear Campaña" : `Modificar Campaña ${existingCmp.name}`}
                </Typography>
                <Stack spacing={2}>
                    <Grid container spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <RegisteredTextInput name="name" register={register} label="Nombre"
                                required errorMessage={errors.name?.message} />
                        </Grid>
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <RegisteredTextInput name="description" register={register} label="Descripción"
                                errorMessage={errors.description?.message} multiline />
                        </Grid>
                        {!existingCmp &&
                            <Grid size="grow" sx={{ minWidth: "20rem" }}>
                                <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id" options={workspaces}
                                    getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                                    errorMessage={errors?.workspace_id?.message} required />
                            </Grid>
                        }
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <ControlledAutocomplete 
                                control={control} 
                                label="Flujo" 
                                name="lead_flow_id" 
                                options={flowsWithOptions} // Usamos la lista combinada
                                getOptionLabel={option => option.name!} 
                                getOptionKey={option => `${option.id}`} 
                                returnField="id"
                                errorMessage={errors?.lead_flow_id?.message} 
                                required 
                                renderOption={(props, option) => {
                                    // Comprobamos si es nuestra opción inyectada
                                    const isAction = (option as any).isAction;
                                    
                                    return (
                                        <Box 
                                            component="li" 
                                            {...props} 
                                            onMouseDown={(e) => {
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if (isAction) {
                                                    handleNavigateToFlow(); // Acción: Crear Nuevo
                                                } else {
                                                    props.onClick?.(e as any); // Acción: Seleccionar Flujo normal
                                                }
                                            }}
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                width: '100%',
                                                ...(isAction && { 
                                                    color: 'primary.main', 
                                                    fontWeight: 'bold',
                                                    borderTop: '1px solid',
                                                    borderColor: 'divider',
                                                    mt: 0.5,
                                                    bgcolor: 'action.hover'
                                                })
                                            }}
                                        >
                                            {/* flexGrow: 1 empuja al lápiz hacia la derecha */}
                                            <Typography sx={{ flexGrow: 1 }}>
                                                {option.name}
                                            </Typography>

                                            {/* El lápiz SOLO aparece si NO es la acción de crear */}
                                            {!isAction && (
                                                <IconButton
                                                    size="small"
                                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleNavigateToFlow(option.id as number); // Acción: Editar
                                                    }}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <EditIcon fontSize="small" color="action" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    );
                                }}
                            />
                        </Grid>
                    </Grid>
                    {errors?.root &&
                        <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>}
                    <ButtonGroup sx={{ marginLeft: "auto" }}>
                        <CommonButton actionType="CLOSE" variant="outlined" onClick={onCancel}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingCmp ? "MODIFY" : "CREATE"} variant="contained" type="submit">
                            Guardar Campaña
                        </CommonButton>
                    </ButtonGroup>
                </Stack>
            </Stack>
        </form>
    )
}