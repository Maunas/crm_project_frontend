import { useContext } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { EnabledIcon } from '../common/lists/Badges'
import { OrganizationFormSidebar } from './OrganizationForm'
import { useSidebar } from '../hooks/useSidebar'
import type { OrganizationDetailed } from '../../types/campaigns'
import { disableOrganization, enableOrganization } from '../workspaces/workspaceServices'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Button, ButtonGroup, Chip, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { CommonButton, DisableButton } from '../common/details/DetailsCommonButton'
import { UserContext } from '../common/contexts'
import type { UserContextItems } from '../users/UserProvider'
dayjs.locale('es')

export const OrganizationList = () => {

    const { organizations, selectedOrgId, fetchOrganizations, updateOrganizations } = useContext<UserContextItems>(UserContext)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<OrganizationDetailed>()

    const updateEntityOnList = (newOrg: OrganizationDetailed, mode: string) => {
        switch (mode) {
            case "CREATE_ORG":
                fetchOrganizations()
                break;
            case "UPDATE_ORG": {
                if (!organizations) break
                const newOrganizationsItems = [...organizations]
                const orgIdx = newOrganizationsItems.findIndex(org => org.id === newOrg.id)
                if (orgIdx === -1) break
                newOrganizationsItems[orgIdx] = newOrg
                updateOrganizations(newOrganizationsItems)
                break;
            }
            case "DELETE_ORG": {
                if (selectedOrgId === newOrg.id) break
                if (selectedEntity && newOrg.id === selectedEntity.id) closeSidebar()
                if (!organizations) break
                const newOrganizationsItems = [...organizations]
                const filteredOrganizations = newOrganizationsItems.filter(org => org.id !== newOrg.id)
                updateOrganizations(filteredOrganizations)
                break;
            }
        }
    }

    const handleActive = (org: OrganizationDetailed) => {
        if (!org) return
        const updateActive = (org: OrganizationDetailed) => {
            updateEntityOnList({ ...org, active: !org.active }, "UPDATE_ORG")
            if (selectedEntity?.id === org.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !org.active })
            }
        }
        const deleteOrg = (org: OrganizationDetailed) => {
            updateEntityOnList(org, "DELETE_ORG")
            if (selectedEntity?.id === org.id) {
                closeSidebar()
            }
        }
        if (org.active) {
            if (selectedOrgId === org.id) return
            disableOrganization(org.id).then((res) => {
                if (res.action === "disabled") updateActive(org)
                if (res.action === "deleted") deleteOrg(org)
            })
        } else {
            enableOrganization(org.id).then(() => updateActive(org))
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarComponent={
            <OrganizationSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} handleActive={handleActive} />
        }>
            <Stack spacing={2}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid size="grow" minWidth="15rem">
                        <Typography variant="h1">Lista de Organizaciones</Typography>
                    </Grid>
                    <Grid size="auto" minWidth="15rem">
                        {organizations && organizations?.length > 0 &&
                            <CommonButton actionType="CREATE" handleClick={() => handleSidebar("CREATE_ORG", null)}>Crear Organización</CommonButton>
                        }
                    </Grid>
                </Grid>
                {
                    organizations && organizations?.length > 0 ?
                        <List>
                            {organizations.map(org =>
                                <ListItem key={org.id} disablePadding secondaryAction={
                                    <Grid container spacing={1} alignItems="center">
                                        <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                            <SearchIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="modify" onClick={() => handleSidebar("UPDATE_ORG", org)}>
                                            <EditIcon />
                                        </IconButton>
                                        {selectedOrgId !== org.id &&
                                            <IconButton edge="end" aria-label={org.active ? "delete" : "restore"}
                                                onClick={() => handleActive(org)}>
                                                {org.active ?
                                                    <DeleteIcon color="error" /> :
                                                    <RestoreFromTrashIcon color="success" />
                                                }
                                            </IconButton>
                                        }
                                    </Grid>
                                }>
                                    <ListItemButton onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                        <ListItemText primary={<>
                                            <Stack spacing={1} direction="row">
                                                <EnabledIcon active={org.active} />
                                                <Typography fontWeight="bold">{org.name} </Typography>
                                            </Stack>
                                            {org.description && <Typography paddingInlineStart={2}>{org.description}</Typography>}
                                        </>} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>
                        : <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                            <Typography variant="h4" color="initial">No se han encontrado organizaciones...</Typography>
                            <Button onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained">Crear Organización</Button>
                        </Grid>
                }
            </Stack>
        </ContainerWithSidebar >
    )
}

interface SidebarProps {
    mode: string | null,
    entity: OrganizationDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (entity: OrganizationDetailed, mode: string) => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void,
    handleActive: (org: OrganizationDetailed) => void,
}
const OrganizationSidebar = ({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {
    switch (mode) {
        case "CREATE_ORG":
            return <OrganizationFormSidebar closeSidebar={closeSidebar}
                updateEntityOnList={(entity) => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_ORG":
            return <OrganizationFormSidebar existingOrg={entity as OrganizationDetailed}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar}
                updateEntityOnList={(entity) => updateEntityOnList(entity, mode)} />
        case "DETAILS_ORG":
            return <OrganizationDetails entity={entity} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }
}

interface DetailsProps {
    entity: OrganizationDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void,
    handleActive: (org: OrganizationDetailed) => void
}
const OrganizationDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: DetailsProps) => {
    if (!entity) return

    return (
        <Stack spacing={2} >
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.name}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            {entity.description
                ? <Typography variant="body1" color="initial">{entity.description}</Typography>
                : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
            }
            <Divider />
            <CommonButton actionType="DETAILS" component={Link} to={`/campaigns`} >Ver Workspaces</CommonButton>
            <Divider />
            <Grid container spacing={2} size="grow" minWidth="50 rem">
                <Grid size="grow" minWidth="18rem">
                    <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                    <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                        {dayjs(entity?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                    </Typography>
                </Grid>
                <Grid size="grow" minWidth="18rem">
                    <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>
                    <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                        {dayjs(entity?.updated_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                    </Typography>
                </Grid>
            </Grid>
            <Divider />
            <ButtonGroup>
                <CommonButton handleClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                <DisableButton active={entity.active} handleActive={() => handleActive(entity)} />
                <CommonButton handleClick={() => handleSidebar("UPDATE_ORG", entity)} actionType="MODIFY" >Modificar</CommonButton>
            </ButtonGroup>
        </Stack>
    )
}