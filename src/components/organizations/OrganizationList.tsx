import { useEffect, useState } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { EnabledIcon } from '../common/lists/Badges'
import { OrganizationFormSidebar } from './OrganizationForm'
import { useSidebar } from '../hooks/useSidebar'
import { useListPagination } from '../hooks/useListPagination'
import type { Paginable } from '../../types/common'
import type { OrganizationDetailed } from '../../types/campaigns'
import { disableOrganization, enableOrganization, getOrganizations } from '../campaigns/campaignServices'
import { Link } from 'react-router-dom'
import { Button, ButtonGroup, Chip, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

export const OrganizationList = () => {
    const [organizations, setOrganizations] = useState<Paginable<OrganizationDetailed> | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<OrganizationDetailed>()

    const { page, pageSize, pageComponentProps } = useListPagination(organizations?.total_pages || 0)

    useEffect(() => {
        getOrganizations({ detailed: true, page_size: pageSize, page: page, only_active: false }).then(setOrganizations)
    }, [page, pageSize])

    const updateEntityOnList = (newOrg: OrganizationDetailed, mode: string) => {
        switch (mode) {
            case "CREATE_ORG": case "DELETE_ORG":
                getOrganizations({ detailed: true, only_active: false, page_size: pageSize, page: organizations?.page ?? 1 })
                    .then(setOrganizations)
                break;
            case "UPDATE_ORG": {
                if (!organizations) break
                const newOrganizationsItems = [...organizations.items]
                const orgIdx = newOrganizationsItems.findIndex(org => org.id === newOrg.id)
                if (orgIdx === -1) break
                newOrganizationsItems[orgIdx] = newOrg
                setOrganizations({ ...organizations, items: [...newOrganizationsItems] })
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
            disableOrganization(org.id).then((res) => {
                console.log(res.action)
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
                    <Typography variant="h1">Lista de Organizaciones</Typography>
                    {organizations && organizations?.items?.length > 0 &&
                        <Button onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained" >Crear Organización</Button>
                    }
                </Grid>
                {
                    organizations && organizations?.items?.length > 0 ?
                        <List>
                            {organizations.items.map(org =>
                                <ListItem key={org.id} disablePadding secondaryAction={
                                    <Grid container spacing={1} alignItems="center">
                                        <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                            <SearchIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="modify" onClick={() => handleSidebar("UPDATE_ORG", org)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label={org.active ? "delete" : "restore"}
                                            onClick={() => handleActive(org)}>
                                            {org.active ?
                                                <DeleteIcon color="error" /> :
                                                <RestoreFromTrashIcon color="success" />
                                            }
                                        </IconButton>
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
                            <Typography variant="h3" color="initial">No se han encontrado organizaciones...</Typography>
                            <Button onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained">Crear Organización</Button>
                        </Grid>
                }
                <PaginationComponent {...pageComponentProps} />
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
            <Button variant="text" component={Link} to={`/workspaces?organization_id=${entity.id}`}>
                Ver Workspaces
            </Button>
            <Divider />
            <span>
                <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                <Typography variant="body1" paddingInlineStart={2}>
                    {entity?.created_at}
                </Typography>
            </span>
            <span>
                <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>
                <Typography variant="body1" paddingInlineStart={2}>
                    {entity?.updated_at}
                </Typography>
            </span>
            <Divider />
            <ButtonGroup variant="contained" >
                <Button onClick={closeSidebar} variant="outlined" fullWidth>Cerrar</Button>
                <Button onClick={() => handleActive(entity)} color="secondary" fullWidth>
                    {entity.active ? "Deshabilitar" : "Habilitar"}
                </Button>
                <Button onClick={() => handleSidebar("UPDATE_ORG", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
        </Stack>
    )
}