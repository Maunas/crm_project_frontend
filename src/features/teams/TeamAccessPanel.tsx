import { useCallback, useEffect, useMemo, useState } from 'react'
import { ControlledAutocomplete } from 'shared/ui/forms/CustomMultipleInputs'
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen'
import { DisableConfirmDialog } from 'src/components/ui/feedback/ConfirmationDialog'
import CommonButton from 'shared/ui/buttons/CommonButton'
import type { TeamCampaignAccessDetailed, TeamDetailed, TeamWorkspaceAccessDetailed } from 'src/types/teams'
import type { Campaign, Workspace } from 'src/types/campaigns'
import {
    createTeamCampaignAccess, createTeamWorkspaceAccess,
    deleteTeamCampaignAccess, deleteTeamWorkspaceAccess,
    getTeamCampaignAccess, getTeamWorkspaceAccess,
} from './teamServices'
import { getWorkspaces } from 'src/features/workspaces/workspaceServices'
import { getCampaigns } from 'src/features/campaigns/campaignServices'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { useForm } from 'react-hook-form'
import { Chip, Stack, Typography } from '@mui/material'

interface TeamAccessPanelProps {
    team: TeamDetailed
}

export const TeamAccessPanel = ({ team }: TeamAccessPanelProps) => {
    return (
        <Stack spacing={3}>
            <WorkspaceAccessSection team={team} />
            <CampaignAccessSection team={team} />
        </Stack>
    )
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

const WorkspaceAccessSection = ({ team }: TeamAccessPanelProps) => {

    const [access, setAccess] = useState<TeamWorkspaceAccessDetailed[]>([])
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(false)
    const [removing, setRemoving] = useState<TeamWorkspaceAccessDetailed | null>(null)

    const fetchAccess = useCallback(() => {
        setLoading(true)
        return getTeamWorkspaceAccess({ team_id: team.id, only_active: false, detailed: true, page_size: 0 })
            .then(res => setAccess(res.items))
            .catch(e => showCommonErrorToast(e, "Ha ocurrido un error al traer los espacios de trabajo del equipo"))
            .finally(() => setLoading(false))
    }, [team.id])

    useEffect(() => {
        fetchAccess()
        getWorkspaces({ only_active: true, page_size: 0 }).then(res => setWorkspaces(res.items))
    }, [fetchAccess])

    const availableWorkspaces = useMemo(() =>
        workspaces.filter(w => !access.some(a => a.workspace_id === w.id))
        , [workspaces, access])

    const { control, handleSubmit, reset } = useForm<{ workspace_id: number | null }>({ defaultValues: { workspace_id: null } })

    const onSubmit = (data: { workspace_id: number | null }) => {
        if (!data.workspace_id) return
        return createTeamWorkspaceAccess({ team_id: team.id, workspace_id: data.workspace_id })
            .then(() => {
                reset({ workspace_id: null })
                showToast("Acceso al espacio de trabajo otorgado con éxito.")
                fetchAccess()
            })
            .catch(e => showCommonErrorToast(e))
    }

    const handleRemove = (item: TeamWorkspaceAccessDetailed) => {
        return deleteTeamWorkspaceAccess(item.id).then(() => {
            showToast("Se quitó el acceso al espacio de trabajo con éxito.")
            fetchAccess()
        }).catch(e => showCommonErrorToast(e))
    }

    const getName = (workspaceId: number) => workspaces.find(w => w.id === workspaceId)?.name ?? `Espacio #${workspaceId}`

    return (
        <Stack spacing={1}>
            <Typography variant="h3">Acceso a Espacios de Trabajo</Typography>
            <LoadingScreenWrapper loading={loading}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    {access.length > 0 ? access.map(item =>
                        <Chip key={item.id} label={getName(item.workspace_id)} onDelete={() => setRemoving(item)} />
                    ) : (
                        <Typography variant="body2" color="textSecondary">Este equipo no tiene acceso a ningún espacio de trabajo específico.</Typography>
                    )}
                </Stack>
                {availableWorkspaces.length > 0 &&
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                            <ControlledAutocomplete control={control} name="workspace_id" label="Agregar espacio de trabajo"
                                options={availableWorkspaces} size="small"
                                getOptionLabel={option => option.name ?? ""} getOptionKey={option => `${option.id}`} returnField="id" />
                            <CommonButton actionType="CREATE" type="submit" size="small" onlyTooltip>Agregar</CommonButton>
                        </Stack>
                    </form>
                }
            </LoadingScreenWrapper>
            <DisableConfirmDialog entity={removing} clearEntity={() => setRemoving(null)} idModal='remove-workspace-access'
                onlyDelete onConfirm={() => handleRemove(removing!)} entityTypeName='el acceso a este espacio de trabajo' />
        </Stack>
    )
}

// ---------------------------------------------------------------------------
// Campañas
// ---------------------------------------------------------------------------

const CampaignAccessSection = ({ team }: TeamAccessPanelProps) => {

    const [access, setAccess] = useState<TeamCampaignAccessDetailed[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(false)
    const [removing, setRemoving] = useState<TeamCampaignAccessDetailed | null>(null)

    const fetchAccess = useCallback(() => {
        setLoading(true)
        return getTeamCampaignAccess({ team_id: team.id, only_active: false, detailed: true, page_size: 0 })
            .then(res => setAccess(res.items))
            .catch(e => showCommonErrorToast(e, "Ha ocurrido un error al traer las campañas del equipo"))
            .finally(() => setLoading(false))
    }, [team.id])

    useEffect(() => {
        fetchAccess()
        getCampaigns({ only_active: true, page_size: 0 }).then(res => setCampaigns(res.items))
    }, [fetchAccess])

    const availableCampaigns = useMemo(() =>
        campaigns.filter(c => !access.some(a => a.campaign_id === c.id))
        , [campaigns, access])

    const { control, handleSubmit, reset } = useForm<{ campaign_id: number | null }>({ defaultValues: { campaign_id: null } })

    const onSubmit = (data: { campaign_id: number | null }) => {
        if (!data.campaign_id) return
        return createTeamCampaignAccess({ team_id: team.id, campaign_id: data.campaign_id })
            .then(() => {
                reset({ campaign_id: null })
                showToast("Acceso a la campaña otorgado con éxito.")
                fetchAccess()
            })
            .catch(e => showCommonErrorToast(e))
    }

    const handleRemove = (item: TeamCampaignAccessDetailed) => {
        return deleteTeamCampaignAccess(item.id).then(() => {
            showToast("Se quitó el acceso a la campaña con éxito.")
            fetchAccess()
        }).catch(e => showCommonErrorToast(e))
    }

    const getName = (campaignId: number) => campaigns.find(c => c.id === campaignId)?.name ?? `Campaña #${campaignId}`

    return (
        <Stack spacing={1}>
            <Typography variant="h3">Acceso a Campañas</Typography>
            <LoadingScreenWrapper loading={loading}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    {access.length > 0 ? access.map(item =>
                        <Chip key={item.id} label={getName(item.campaign_id)} onDelete={() => setRemoving(item)} />
                    ) : (
                        <Typography variant="body2" color="textSecondary">Este equipo no tiene acceso a ninguna campaña específica.</Typography>
                    )}
                </Stack>
                {availableCampaigns.length > 0 &&
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                            <ControlledAutocomplete control={control} name="campaign_id" label="Agregar campaña"
                                options={availableCampaigns} size="small"
                                getOptionLabel={option => option.name ?? ""} getOptionKey={option => `${option.id}`} returnField="id" />
                            <CommonButton actionType="CREATE" type="submit" size="small" onlyTooltip>Agregar</CommonButton>
                        </Stack>
                    </form>
                }
            </LoadingScreenWrapper>
            <DisableConfirmDialog entity={removing} clearEntity={() => setRemoving(null)} idModal='remove-campaign-access'
                onlyDelete onConfirm={() => handleRemove(removing!)} entityTypeName='el acceso a esta campaña' />
        </Stack>
    )
}
