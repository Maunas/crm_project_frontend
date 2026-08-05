import { useCallback, useEffect, useMemo, useState } from "react"
import { ControlledAutocomplete } from "shared/ui/forms/CustomMultipleInputs"
import { ControlledCheckbox, RegisteredTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import { ChipTooltip } from "shared/ui/details/ChipTooltip"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useLoading } from "src/hooks/useLoading"
import type { CampaignDetailed, CampaignPost, Workspace, WorkspaceDetailed } from "src/types/campaigns"
import type { OptionWithAction } from "src/types/shared"
import type { LeadFlow } from "src/types/leadFlow"
import { createCampaign, updateCampaign } from "./campaignServices"
import { getWorkspace, getWorkspaces } from "../workspaces/workspaceServices"
import { getLeadFlows } from "../leadFlows/leadFlowServices/FlowService"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useUserContext } from "src/stores/UserContext"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { ButtonGroup, Grid, Stack, Typography, IconButton, Box } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import CreateIcon from "@mui/icons-material/Create"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "src/components/layout/container/GenericSidebar"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

interface UpdateCampaignSidebarProps {
    existingCmp: CampaignDetailed,
    updateCampaignData: (entity: CampaignDetailed) => void,
    closeSidebar: () => void,
}
//Wrapper de CampaignForm para modificar desde un Sidebar
export const UpdateCampaignFormSidebar = ({ existingCmp, updateCampaignData, closeSidebar }: UpdateCampaignSidebarProps) => {

    const submit = (data: CampaignPost) => {
        return updateCampaign(data, existingCmp.id)
            .then(res => {
                updateCampaignData(res)
                closeSidebar()
                showToast(`Campaña "${res.name}" actualizada con éxito`)
            })
    }
    return <SidebarContentWrapper title="Modificar Campaña" subtitle={existingCmp.name}
        icon={<EditIcon />}>
        <CampaignForm existingCmp={existingCmp} submit={submit} onCancel={closeSidebar} />
    </SidebarContentWrapper>
}

interface CreateCampaignSidebarProps {
    handleSidebar: (mode: string, entity: CampaignDetailed | WorkspaceDetailed | null) => void
    workspace: WorkspaceDetailed,
}
//Wrapper de CampaignForm para crear desde un Sidebar
export const CreateCampaignFormSidebar = ({ handleSidebar, workspace }: CreateCampaignSidebarProps) => {


    const submit = useCallback((data: CampaignPost) => {
        return createCampaign(data)
            .then(res => {
                //Busca el workspace y muestra su detalle.
                showToast(`Campaña "${res.name}" creada con éxito`)
                if (!res.workspace_id) return
                getWorkspace(res.workspace_id)
                    .then(wsp => handleSidebar("DETAILS_WSP", wsp))
            })
    }, [handleSidebar])
    const handleClose = () => handleSidebar("DETAILS_WSP", workspace)

    return <SidebarContentWrapper title="Nueva Campaña" subtitle={workspace.name}
        icon={<CreateIcon />}>
        <CampaignForm submit={submit} onCancel={handleClose} workspaceId={workspace.id} />
    </SidebarContentWrapper>
}

const AUDIENCES = ["B2C", "B2B"]

interface CampaignProps {
    existingCmp?: CampaignDetailed,
    submit: (data: CampaignPost) => Promise<void>,
    onCancel: () => void
    workspaceId?: number | null,
}

export const CampaignForm = ({ existingCmp, workspaceId, submit, onCancel }: CampaignProps) => {

    const [workspaces, setWorkspaces] = useState<Workspace[] | []>([])
    const [leadFlows, setLeadFlows] = useState<LeadFlow[] | []>([])
    const navigate = useNavigate();
    const { hasPermission } = useUserContext()
    const canEditFlow = hasPermission("lead_flow:update")

    useEffect(() => {
        getWorkspaces({ only_active: true, page_size: 0 })
            .then(res => setWorkspaces(res.items))
    }, [])

    useEffect(() => {
        getLeadFlows({ only_active: true, page_size: 0 })
            .then(res => setLeadFlows(res.items))
            .catch(() => setLeadFlows([]))
    }, [])
    const flowsWithOptions = useMemo<OptionWithAction<LeadFlow>[]>(() => {
        if (!canEditFlow) return leadFlows as OptionWithAction<LeadFlow>[]

        return [
            ...(leadFlows as OptionWithAction<LeadFlow>[]),
            { id: 'CREATE_ACTION', name: ' + Agregar nuevo flujo...', isAction: true }
        ];
    }, [leadFlows, canEditFlow]);


    const defaultValues = useMemo(() => ({
        name: existingCmp?.name,
        description: existingCmp?.description,
        workspace_id: existingCmp?.workspace_id ?? workspaceId ?? undefined,
        lead_flow_id: existingCmp?.lead_flow_id,
        target_audience: existingCmp?.target_audience ?? undefined,
        is_public: existingCmp?.is_public ?? true,
    }), [existingCmp, workspaceId])

    const { register, handleSubmit, reset, control, formState: { errors }, setError, getValues }
        = useForm<CampaignPost>({ defaultValues })


    /**Guarda lo escrito y la URL para continuar la creación de la campaña. */
    const handleNavigateToFlow = (flowId?: number) => {
        sessionStorage.setItem('campaign_draft', JSON.stringify(getValues()));
        sessionStorage.setItem('flow_return_url', window.location.pathname);
        onCancel();
        navigate(flowId ? `/lead-flow-editor/${flowId}` : '/lead-flow-editor');
    }

    //Reinicia los defaultValues si se cambia la campaña que se está creando/modificando.
    useEffect(() => {
        const draft = sessionStorage.getItem('campaign_draft');
        if (draft) {
            reset(JSON.parse(draft));
            sessionStorage.removeItem('campaign_draft');
        } else {
            reset(defaultValues);
        }
    }, [reset, defaultValues])

    const onSubmit = (data: CampaignPost) => {
        return submit(data)
            .catch(e => setFormErrors(e, setError))
    }

    const { fnWithLoading, loading } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(fnWithLoading)} style={{ height: "100%" }}>
            <SidebarContentActionsWrapper actions={
                <ButtonGroup>
                    <CommonButton actionType="CLOSE" variant="outlined" color="error" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </CommonButton>
                    <CommonButton actionType={existingCmp ? "MODIFY" : "CREATE"} variant="contained" type="submit" loading={loading}>
                        Guardar
                    </CommonButton>
                </ButtonGroup>
            }>
                <Stack spacing={1}>
                    {!existingCmp &&
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <ControlledAutocomplete control={control} label="Espacio de Trabajo" name="workspace_id" options={workspaces}
                                getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`} returnField="id"
                                errorMessage={errors?.workspace_id?.message} required />
                        </Grid>
                    }
                    <Grid size="grow" sx={{ minWidth: "20rem" }}>
                        <RegisteredTextInput name="name" register={register} label="Nombre"
                            required errorMessage={errors.name?.message} />
                    </Grid>
                    <Grid size="grow" sx={{ minWidth: "20rem" }}>
                        <RegisteredTextInput name="description" register={register} label="Descripción"
                            errorMessage={errors.description?.message} multiline minRows={3} />
                    </Grid>
                    {!existingCmp &&
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <ControlledAutocomplete control={control} label="Audiencia Objetivo" name="target_audience" options={AUDIENCES}
                                        getOptionLabel={option => option} getOptionKey={option => `${option}`}
                                        errorMessage={errors?.target_audience?.message} />
                                </Box>
                                <ChipTooltip color="info"
                                    title="Cuando se indica un valor se crearán automáticamente campos esenciales según la audiencia seleccionada.">
                                    <InfoOutlinedIcon fontSize="small" color="disabled" />
                                </ChipTooltip>
                            </Stack>
                        </Grid>
                    }
                    <Grid size="grow" sx={{ minWidth: "20rem" }}>
                        <ControlledCheckbox control={control} label="Campaña pública" name="is_public"
                            tooltip="Si está tildada, cualquier usuario de la organización ve todos los leads de esta campaña, sin importar accesos de equipo. Destildá esta opción para que la visibilidad se limite por equipos."
                            errorMessage={errors?.is_public?.message} />
                    </Grid>
                    {!existingCmp &&
                        <Grid size="grow" sx={{ minWidth: "20rem" }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <ControlledAutocomplete
                                        control={control} label="Ciclo de Vida"
                                        name="lead_flow_id" options={flowsWithOptions}
                                        getOptionLabel={option => option.name!} getOptionKey={option => `${option.id}`}
                                        returnField="id" errorMessage={errors?.lead_flow_id?.message} required
                                        renderOption={(props, option) => {
                                            // Comprobamos si es nuestra opción inyectada
                                            const isAction = option.isAction;
                                            return (
                                                <Box
                                                    component="li" {...props}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        if (isAction) {
                                                            handleNavigateToFlow();
                                                        } else {
                                                            props.onClick?.(e); // Acción: Seleccionar Flujo normal
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
                                                    <Typography sx={{ flexGrow: 1 }}>
                                                        {option.name}
                                                    </Typography>

                                                    {!isAction && canEditFlow && (
                                                        <IconButton
                                                            size="small"
                                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                handleNavigateToFlow(option.id as number);
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
                                </Box>
                                <ChipTooltip color="info"
                                    title="Indica con qué ciclo de vida (flujo de estados) va a trabajar la campaña.">
                                    <InfoOutlinedIcon fontSize="small" color="disabled" />
                                </ChipTooltip>
                            </Stack>
                        </Grid>}
                    {errors?.root &&
                        <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>}
                </Stack >
            </SidebarContentActionsWrapper>
        </form >
    )
}