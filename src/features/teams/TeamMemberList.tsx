import { useCallback, useEffect, useMemo, useState } from 'react'
import { TeamMemberFormSidebar } from './TeamMemberForm'
import { GenericSidebar } from 'shared/layout/container/GenericContainer'
import { DisableConfirmDialog } from 'src/components/ui/feedback/ConfirmationDialog'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen'
import { ResponsiveListItem } from 'shared/ui/lists/CustomListItem'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { useListPagination } from 'src/hooks/useListPagination'
import { useLoading } from 'src/hooks/useLoading'
import type { TeamDetailed, TeamMemberDetailed } from 'src/types/teams'
import type { Paginable } from 'src/types/shared'
import { deleteTeamMember, getTeamMembers } from './teamServices'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Avatar, ButtonGroup, Chip, Grid, List, ListItemText, Stack, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import { OrderSearchMenu } from 'src/components/ui/lists/OrderMenu'
import { useOrderSeachList } from 'src/hooks/useOrderSearchLists'
import { NoItemsMessage } from 'src/components/ui/lists/NoItemsMessage'

interface TeamMemberListProps {
    team: TeamDetailed
}

const ORDER_NOM_FIELDS = [
    { name: "role", label: "Rol" },
]

const SEARCH_NOM_FIELDS = [
    {
        name: "role", label: "Rol", searchOptions: [
            { label: "Mánager", value: "MANAGER" },
            { label: "Agente", value: "AGENT" }
        ]
    },
]

export const TeamMemberList = ({ team }: TeamMemberListProps) => {

    const [members, setMembers] = useState<Paginable<TeamMemberDetailed> | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMemberDetailed | undefined>(undefined)
    const [removingMember, setRemovingMember] = useState<TeamMemberDetailed | null>(null)

    const { fetchParams, handleSearchChange, handleOrderChange } = useOrderSeachList()

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(members, 10)

    const fetchMembers = useCallback((fetchPage: number, pageSize: number, teamId: number) => {
        return getTeamMembers({ detailed: true, page: fetchPage, page_size: pageSize, team_id: teamId, ...fetchParams })
            .then(setMembers)
            .catch(e => showCommonErrorToast(e, "Ha ocurrido un error al traer los miembros del equipo"))
    }, [fetchParams])

    const { loading, fnWithLoading: fetchMembersLoad } = useLoading(fetchMembers)

    useEffect(() => {
        fetchMembersLoad(fetchPage, pageSize, team.id)
    }, [fetchMembersLoad, fetchPage, pageSize, team.id])

    const excludedUserIds = useMemo(() => members?.items.map(m => m.user_id) ?? [], [members])

    const refreshList = useCallback(() => {
        fetchMembers(members?.page ?? 1, pageSize, team.id)
    }, [fetchMembers, members?.page, pageSize, team.id])

    const handleAdd = () => {
        setEditingMember(undefined)
        setFormOpen(true)
    }
    const handleEdit = (member: TeamMemberDetailed) => {
        setEditingMember(member)
        setFormOpen(true)
    }
    const closeForm = () => {
        setFormOpen(false)
        setEditingMember(undefined)
    }

    const handleRemove = useCallback((member: TeamMemberDetailed) => {
        return deleteTeamMember(member.id).then(() => {
            showToast(`Se quitó a "${member.user.name}" del equipo con éxito.`)
            refreshList()
        }).catch(e => showCommonErrorToast(e))
    }, [refreshList])

    return (
        <Stack spacing={1}>
            <Stack spacing={1} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h3">Miembros del Equipo</Typography>
                <ButtonGroup variant="outlined" sx={{ marginLeft: "auto" }} >
                    <CommonButton actionType="CREATE" onClick={handleAdd} size="small" onlyTooltip>
                        Agregar
                    </CommonButton>
                </ButtonGroup>
            </Stack>
            <OrderSearchMenu searchOptions={SEARCH_NOM_FIELDS} handleSearchChange={handleSearchChange} orderOptions={ORDER_NOM_FIELDS} handleOrderChange={handleOrderChange} />
            <LoadingScreenWrapper loading={loading}>
                {members && members.items?.length > 0 ?
                    <List dense>
                        <Grid container sx={{ alignItems: "stretch" }} >
                            {members.items.map(member =>
                                <Grid size={{ xs: 12, sm: 6 }} key={member.id}>
                                    <ResponsiveListItem disablePadding
                                        actions={[
                                            { actionType: "MODIFY", label: "Modificar rol", onClick: () => handleEdit(member) },
                                            { actionType: "DISABLE", label: "Quitar del equipo", color: "error", onClick: () => setRemovingMember(member) }
                                        ]}
                                        onClick={() => handleEdit(member)}>
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: .5 }}>
                                            <Avatar sx={{ width: 32, height: 32 }}><PersonIcon fontSize="small" /></Avatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" spacing={.5} sx={{ alignItems: "center" }}>
                                                        <Typography sx={{ fontWeight: 500, wordBreak: "break-word" }}>
                                                            {member.user.name} {member.user.last_name}
                                                        </Typography>
                                                        <Chip size="small" label={member.role === "MANAGER" ? "Mánager" : "Agente"}
                                                            color={member.role === "MANAGER" ? "primary" : "default"} />
                                                    </Stack>
                                                }
                                                secondary={member.user.email} />
                                        </Stack>
                                    </ResponsiveListItem>
                                </Grid>
                            )}
                        </Grid>
                    </List>
                    :
                    <NoItemsMessage emptyFetchMessage="Este equipo todavía no tiene miembros..."
                        search={fetchParams.search}>
                        <CommonButton actionType='CREATE' onClick={handleAdd} variant="contained">Agregar</CommonButton>
                    </NoItemsMessage>
                }
                <PaginationComponent {...pageComponentProps} />
            </LoadingScreenWrapper >
            <DisableConfirmDialog entity={removingMember} clearEntity={() => setRemovingMember(null)} idModal='remove-team-member'
                nameField="user.name" onlyDelete
                onConfirm={() => handleRemove(removingMember!)} entityTypeName='al miembro del equipo' />
            <GenericSidebar isSidebarOpen={formOpen} closeSidebar={closeForm}>
                <TeamMemberFormSidebar team={team} existingMember={editingMember} excludedUserIds={excludedUserIds}
                    closeSidebar={closeForm} updateEntityOnList={refreshList} />
            </GenericSidebar>
        </Stack >
    )
}
