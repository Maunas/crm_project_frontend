import { useEffect, useState } from 'react'
import { GenericPaper } from '../common/layout/GenericContainer'
import { OrganizationFormSidebar } from './OrganizationForm'
import type { Paginable } from '../../types/common'
import type { OrganizationDetailed } from '../../types/campaigns'
import { disableOrganization, enableOrganization, getOrganizations } from '../campaigns/campaignServices'
import { Button, ButtonGroup, Chip, Container, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { EnabledIcon } from '../common/lists/Badges'
import { useListPagination } from '../hooks/useListPagination'
import { PaginationComponent } from '../common/lists/PaginationComponent'


export const OrganizationList = () => {
    const [organizations, setOrganizations] = useState<Paginable<OrganizationDetailed> | null>(null)

    const [sidebarMode, setSidebarMode] = useState<string | null>(null)
    const [selectedEntity, setSelectedEntity] =
        useState<OrganizationDetailed | null>(null)


    const { page, pageSize, pageComponentProps } = useListPagination(organizations?.total_pages || 0, 1)


    useEffect(() => {
        getOrganizations({ detailed: true, page_size: pageSize, page: page, only_active: false }).then(setOrganizations)
    }, [page, pageSize])

    const handleSidebar = (mode: string, entity: OrganizationDetailed | null) => {
        setSelectedEntity(entity)
        if (mode === "KEEP") return
        setSidebarMode(mode)
    }
    const closeSidebar = () => {
        setSelectedEntity(null)
        setSidebarMode(null)
    }

    const updateEntityOnList = (newOrg: OrganizationDetailed, mode: string) => {
        switch (mode) {
            case "CREATE_ORG":
                getOrganizations({ detailed: true, page_size: pageSize, page: organizations?.page ?? 1 })
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
        if (org.active) {
            disableOrganization(org.id).then(() => updateActive(org))
        } else {
            enableOrganization(org.id).then(() => updateActive(org))
        }
    }
    return (
        <Container maxWidth={false}>
            <Grid container spacing={2}>
                <Grid size="grow" minWidth="30rem">
                    <GenericPaper>
                        <Stack spacing={2}>
                            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                                <Typography variant="h1">Lista de Organizaciones</Typography>
                                {organizations && organizations?.items?.length > 0 &&
                                    <Button onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained" >Crear Organización</Button>
                                }
                            </Grid>
                            <List>
                                {
                                    (organizations && organizations?.items?.length > 0) ?
                                        organizations.items.map(org =>
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
                                                <ListItemButton onClick={() => handleSidebar("DETAILS_ORG", org)} className="selectable">
                                                    <ListItemText primary={<>
                                                        <Stack spacing={1} direction="row">
                                                            <EnabledIcon active={org.active} />
                                                            <Typography fontWeight="bold">{org.name} </Typography>
                                                        </Stack>
                                                        {org.description && <Typography paddingInlineStart={2}>{org.description} </Typography>}
                                                    </>} />
                                                </ListItemButton>
                                            </ListItem>
                                        )
                                        : <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                                            <Typography variant="h3" color="initial">No se han encontrado organizaciones...</Typography>
                                            <Button onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained">Crear Organización</Button>
                                        </Grid>
                                }

                            </List>
                            <PaginationComponent {...pageComponentProps} />
                        </Stack>
                    </GenericPaper>
                </Grid>
                {sidebarMode &&
                    <Grid size={5} minWidth="22rem">
                        <GenericPaper>
                            <OrganizationSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} />
                        </GenericPaper>
                    </Grid>}
            </Grid>
        </Container>
    )
}

interface SidebarProps {
    mode: string | null,
    entity: OrganizationDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: OrganizationDetailed,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void
}
const OrganizationSidebar = ({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar }
    : SidebarProps) => {
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
                updateEntityOnList={(entity) => updateEntityOnList(entity, "UPDATE_ORG")}
                handleSidebar={handleSidebar} />
    }
}
interface DetailsProps {
    entity: OrganizationDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void,
    updateEntityOnList: (
        entity: OrganizationDetailed,
    ) => void
}
const OrganizationDetails = ({ entity, closeSidebar, handleSidebar, updateEntityOnList }: DetailsProps) => {

    const handleActive = () => {
        if (!entity) return
        const updateActive = (org: OrganizationDetailed) => {
            updateEntityOnList({ ...org, active: !org.active })
            handleSidebar("KEEP", { ...org, active: !org.active })
        }
        if (entity.active) {
            disableOrganization(entity.id).then(() => updateActive(entity))
        } else {
            enableOrganization(entity.id).then(() => updateActive(entity))
        }
    }

    if (entity) return (
        <Stack spacing={2} >
            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2" color="initial">{entity.name}</Typography>
                {entity.active ? <Chip color='success' label="Habilitado" /> :
                    <Chip color='error' label="Deshabilitado" />}
            </Grid>
            {entity.description ? <Typography variant="body1" color="initial">{entity.description}</Typography>
                : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
            }
            <Divider />
            <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
            <Typography variant="body1" paddingInlineStart={2}>
                {entity?.created_at}
            </Typography>
            <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>
            <Typography variant="body1" paddingInlineStart={2}>
                {entity?.updated_at}
            </Typography>
            <Divider />

            <ButtonGroup variant="contained" >
                <Button onClick={closeSidebar} variant="outlined" fullWidth>Cerrar</Button>
                <Button onClick={handleActive} color="secondary" fullWidth>
                    {
                        entity.active ? "Deshabilitar" : "Habilitar"
                    }
                </Button>
                <Button onClick={() => handleSidebar("UPDATE_ORG", entity)} fullWidth>Modificar</Button>
            </ButtonGroup>
        </Stack>
    )
}