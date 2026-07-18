import { useCallback, useEffect, useMemo, useState } from "react"
import { SidebarContentActionsWrapper, SidebarContentWrapper } from "shared/layout/container/GenericContainer"
import { ControlledAutocomplete, ControlledRadio } from "shared/ui/forms/CustomMultipleInputs"
import { ControlledNumber, ControlledTextInput } from "shared/ui/forms/CustomInputs"
import { FormErrorMessage } from "shared/ui/forms/FormFeedback"
import CommonButton from "shared/ui/buttons/CommonButton"
import { RoutingConditionRow } from "./RoutingConditionRow"
import { useLoading } from "src/hooks/useLoading"
import type { Team } from "src/types/teams"
import type { Campaign } from "src/types/campaigns"
import type { LeadField } from "src/types/leadFields"
import type {
    LeadRoutingConditionPost, LeadRoutingPolicyDetailed, LeadRoutingPolicyPost, LeadRoutingPolicyUpdate,
} from "src/types/routing"
import { NATIVE_FIELDS } from "src/types/routing"
import { createRoutingPolicy, updateRoutingPolicy } from "./routingPolicyServices"
import { getTeams } from "src/features/teams/teamServices"
import { getCampaigns } from "src/features/campaigns/campaignServices"
import { getLeadFields } from "src/features/leadFields/leadFieldServices"
import { setFormErrors } from "src/utils/forms"
import { showToast } from "src/utils/feedback"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { Box, Button, ButtonGroup, Divider, Stack, Typography } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ACTION_ICONS from "src/components/ui/buttons/ActionIcons"

const emptyCondition = (position: number): LeadRoutingConditionPost => ({
    position, native_field: NATIVE_FIELDS[0], lead_field_id: null,
    operator: "eq", value_str: "", value_list: null,
    operator_min: null, value_min: null, operator_max: null, value_max: null,
})

interface FormValues {
    name: string,
    description: string | null,
    priority: number,
    logical_operator: "AND" | "OR",
    target_team_id: number | null,
    campaign_id: number | null,
    conditions: LeadRoutingConditionPost[],
}

interface RoutingPolicyFormSidebarProps {
    existingPolicy?: LeadRoutingPolicyDetailed,
    initialCampaignId?: number | null,
    closeSidebar: () => void,
    updateEntityOnList: (entity: LeadRoutingPolicyDetailed) => void,
    handleSidebar: (mode: string, entity: LeadRoutingPolicyDetailed | null) => void,
}

export const RoutingPolicyFormSidebar = ({ existingPolicy, initialCampaignId, handleSidebar, closeSidebar, updateEntityOnList }: RoutingPolicyFormSidebarProps) => {

    const handleClose = useCallback(() => {
        if (existingPolicy) handleSidebar("DETAILS_POLICY", existingPolicy)
        else closeSidebar()
    }, [existingPolicy, closeSidebar, handleSidebar])

    const submit = useCallback((data: LeadRoutingPolicyPost) => {
        const updateList = (res: LeadRoutingPolicyDetailed) => {
            updateEntityOnList(res)
            handleSidebar("DETAILS_POLICY", res)
        }
        if (!existingPolicy) {
            return createRoutingPolicy(data).then(res => {
                updateList(res)
                showToast(`La política "${res.name}" se ha creado con éxito`)
            })
        } else {
            return updateRoutingPolicy(data as LeadRoutingPolicyUpdate, existingPolicy.id).then(res => {
                updateList(res)
                showToast(`La política "${res.name}" se ha modificado con éxito`)
            })
        }
    }, [existingPolicy, handleSidebar, updateEntityOnList])

    return <SidebarContentWrapper title={existingPolicy ? `Modificar "${existingPolicy.name}"` : "Agregar Política de Enrutamiento"}
        subtitle="Enrutamiento"
        icon={existingPolicy ? ACTION_ICONS.MODIFY : ACTION_ICONS.CREATE}>
        <RoutingPolicyForm existingPolicy={existingPolicy} initialCampaignId={initialCampaignId} submit={submit} onCancel={handleClose} />
    </SidebarContentWrapper>
}

interface RoutingPolicyFormProps {
    existingPolicy?: LeadRoutingPolicyDetailed,
    initialCampaignId?: number | null,
    submit: (data: LeadRoutingPolicyPost) => Promise<void>,
    onCancel: () => void,
}

export const RoutingPolicyForm = ({ existingPolicy, initialCampaignId, submit, onCancel }: RoutingPolicyFormProps) => {

    const [teams, setTeams] = useState<Team[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        getTeams({ only_active: true, page_size: 0 }).then(res => setTeams(res.items))
        getCampaigns({ only_active: true, page_size: 0 }).then(res => setCampaigns(res.items))
    }, [])

    const defaultValues = useMemo<FormValues>(() => ({
        name: existingPolicy?.name ?? "",
        description: existingPolicy?.description ?? null,
        priority: existingPolicy?.priority ?? 1,
        logical_operator: existingPolicy?.logical_operator ?? "AND",
        target_team_id: existingPolicy?.target_team_id ?? null,
        campaign_id: existingPolicy?.campaign_id ?? initialCampaignId ?? null,
        conditions: existingPolicy?.conditions?.length
            ? existingPolicy.conditions.map((c, idx) => ({ ...c, position: idx }))
            : [emptyCondition(0)],
    }), [existingPolicy, initialCampaignId])

    const { control, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ defaultValues })

    const { fields: conditionFields, append, remove, update } = useFieldArray({ control, name: "conditions" })

    const campaignId = useWatch({ control, name: "campaign_id" })

    useEffect(() => {
        if (!campaignId) {
            setLeadFields([])
            return
        }
        getLeadFields({ campaign_id: campaignId, only_active: true, page_size: 0 }).then(res => setLeadFields(res.items))
    }, [campaignId])

    // Si se saca la campaña (política global), las condiciones con campo dinámico dejan de tener sentido.
    useEffect(() => {
        if (campaignId) return
        conditionFields.forEach((cond, idx) => {
            if (cond.lead_field_id) {
                update(idx, { ...cond, lead_field_id: null, native_field: NATIVE_FIELDS[0], operator: "eq", value_str: "", value_list: null, operator_min: null, value_min: null, operator_max: null, value_max: null })
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId])

    const onSubmit = (data: FormValues) => {
        const payload: LeadRoutingPolicyPost = {
            ...data,
            conditions: data.conditions.map((c, idx) => ({ ...c, position: idx })),
        }
        return submit(payload).catch(e => setFormErrors(e, setError))
    }

    const { loading, fnWithLoading: submitLoad } = useLoading(onSubmit)

    return (
        <form onSubmit={handleSubmit(submitLoad)} style={{ height: "100%" }}>
            <SidebarContentActionsWrapper
                actions={
                    <ButtonGroup sx={{ alignSelf: "end" }}>
                        <CommonButton actionType="CLOSE" color="error" variant="outlined" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </CommonButton>
                        <CommonButton actionType={existingPolicy ? "MODIFY" : "CREATE"} variant="contained"
                            type="submit" loading={loading}>
                            Guardar
                        </CommonButton>
                    </ButtonGroup>
                }>
                <Stack spacing={2}>
                    <ControlledTextInput name="name" control={control} label="Nombre"
                        required errorMessage={errors.name?.message} />
                    <ControlledTextInput name="description" control={control} label="Descripción"
                        multiline minRows={2} errorMessage={errors.description?.message} />
                    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                        <Box sx={{ minWidth: "10rem" }}>
                            <ControlledNumber name="priority" control={control} label="Prioridad" min={1}
                                errorMessage={errors.priority?.message} />
                        </Box>
                        <Box sx={{ minWidth: "16rem", flexGrow: 1 }}>
                            <ControlledAutocomplete control={control} name="target_team_id" label="Equipo destino"
                                options={teams} required getOptionLabel={option => option.name}
                                getOptionKey={option => `${option.id}`} returnField="id"
                                errorMessage={errors.target_team_id?.message} />
                        </Box>
                    </Stack>
                    <Typography variant="caption" color="textSecondary">
                        Menor número de prioridad = se evalúa primero. Si la primera política que aplica sobre un lead
                        no tiene condiciones definidas, nunca va a matchear.
                    </Typography>
                    <ControlledAutocomplete control={control} name="campaign_id" label="Campaña (vacío = política global de la organización)"
                        options={campaigns} getOptionLabel={option => option.name}
                        getOptionKey={option => `${option.id}`} returnField="id"
                        errorMessage={errors.campaign_id?.message} />

                    <Divider />

                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Typography variant="subtitle1">Se cumplen</Typography>
                        <ControlledRadio control={control} name="logical_operator"
                            options={[{ code: "AND", label: "Todas las condiciones (Y)" }, { code: "OR", label: "Alguna condición (O)" }]}
                            keyField="code" returnField="code" row getRadioLabel={option => option.label} />
                    </Stack>

                    <Stack spacing={1.5}>
                        {conditionFields.map((cond, idx) => (
                            <RoutingConditionRow key={cond.id} condition={cond} campaignId={campaignId ?? null}
                                fields={leadFields} isOnly={conditionFields.length === 1}
                                onUpdate={updated => update(idx, updated)} onDelete={() => remove(idx)} />
                        ))}
                    </Stack>
                    <Button size="small" startIcon={<AddIcon />} variant="outlined" sx={{ alignSelf: "start" }}
                        onClick={() => append(emptyCondition(conditionFields.length))}>
                        Agregar condición
                    </Button>

                    {errors?.root &&
                        <FormErrorMessage >{errors?.root?.message}</FormErrorMessage>
                    }
                </Stack>
            </SidebarContentActionsWrapper>
        </form>
    )
}
