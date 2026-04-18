import { useCallback, useContext } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { CommonButton, DisableButton } from '../common/details/DetailsCommonButton'
import { EnabledIcon, ListAction } from '../common/lists/Icons'
import { CustomChip } from '../common/details/StyledDisplayComponents'
import { OrganizationFormSidebar } from './OrganizationForm'
import { useSidebar } from '../hooks/useSidebar'
import type { OrganizationDetailed } from '../../types/campaigns'
import { disableOrganization, enableOrganization, getOrganization } from '../workspaces/workspaceServices'
import { UserContext } from '../common/contexts'
import type { UserContextItems } from '../users/UserProvider'
import { Link, useSearchParams } from 'react-router-dom'
import { ButtonGroup, Divider, Grid, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')

export const OrganizationList = () => {

    const [params, setParams] = useSearchParams()

    const { userOrganizations, selectedOrg, fetchOrganizations, setOrganizations } = useContext<UserContextItems>(UserContext)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<OrganizationDetailed>("id", params, setParams, getOrganization, "DETAILS_ORG")

    const updateEntityOnList = useCallback((newOrg: OrganizationDetailed, mode: string) => {
        switch (mode) {
            case "CREATE_ORG":
                fetchOrganizations()
                break;
            case "UPDATE_ORG": {
                return setOrganizations(prevList => {
                    if (!prevList || prevList.length === 0) return prevList
                    const newOrganizationsItems = [...prevList]
                    const orgIdx = prevList.findIndex(org => org.id === newOrg.id)
                    if (orgIdx === -1) return prevList
                    newOrganizationsItems[orgIdx] = newOrg
                    return newOrganizationsItems
                })
            }
            case "DELETE_ORG": {
                return setOrganizations(prevList => {
                    if (!prevList || prevList.length === 0) return prevList
                    if (selectedOrg?.id === newOrg.id) return prevList
                    if (selectedEntity && newOrg.id === selectedEntity.id) closeSidebar()
                    const newOrganizationsItems = [...prevList]
                    return newOrganizationsItems.filter(org => org.id !== newOrg.id)
                })
            }
        }
    }, [closeSidebar, fetchOrganizations, selectedEntity, selectedOrg?.id, setOrganizations])

    const handleActive = useCallback((org: OrganizationDetailed) => {
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
            if (selectedOrg?.id === org.id) return
            disableOrganization(org.id).then((res) => {
                if (res.action === "disabled") updateActive(org)
                if (res.action === "deleted") deleteOrg(org)
            })
        } else {
            enableOrganization(org.id).then(() => updateActive(org))
        }
    }, [closeSidebar, handleSidebar, selectedEntity, selectedOrg?.id, updateEntityOnList])

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarComponent={
            <OrganizationSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} handleActive={handleActive} />
        }>
            <Stack gap={3}>
                <Grid container gap={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="h1">Lista de Organizaciones</Typography>
                    <Grid size="auto" sx={{ marginLeft: "auto" }}>
                        {userOrganizations && userOrganizations?.length > 0 &&
                            <CommonButton actionType="CREATE" handleClick={() => handleSidebar("CREATE_ORG", null)}>Crear Organización</CommonButton>
                        }
                    </Grid>
                </Grid>
                <Stack gap={2}>
                    {userOrganizations && userOrganizations?.length > 0 ?
                        <List>
                            {userOrganizations.map(org =>
                                <ListItem key={org.id} disablePadding secondaryAction={
                                    <Grid container gap={1} alignItems="center">
                                        <ListAction actionType='DETAILS' title='Detalle' onClick={() => handleSidebar("DETAILS_ORG", org)} tooltipSize="small" />
                                        <ListAction actionType='MODIFY' title='Modificar' onClick={() => handleSidebar("UPDATE_ORG", org)} tooltipSize="small" />
                                        {selectedOrg?.id !== org.id &&
                                            <ListAction actionType={org.active ? "DISABLE" : "ENABLE"} tooltipSize="small"
                                                title={org.active ? "Deshabilitar" : "Habilitar"}
                                                onClick={() => handleActive(org)} color={org.active ? "error" : "success"} />
                                        }
                                    </Grid>
                                }>
                                    <ListItemButton onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                        <ListItemText primary={
                                            <Stack gap={1} direction="row">
                                                <EnabledIcon active={org.active} />
                                                <Typography fontWeight="bold">{org.name}</Typography>
                                            </Stack>
                                        }
                                            secondary={org.description} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>
                        : <Grid container gap={2} justifyContent="center" alignItems="center" direction="column">
                            <Typography variant="h4">No se han encontrado organizaciones...</Typography>
                            <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained">
                                Crear Organización
                            </CommonButton>
                        </Grid>
                    }
                </Stack>
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
    const { selectedOrg, setSelectedOrg } = useContext<UserContextItems>(UserContext)

    if (!entity) return

    return (
        <Stack gap={3} >
            <Grid container gap={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2">{entity.name}</Typography>
                <Stack direction="row" gap={1} sx={{ marginLeft: "auto" }} >
                    {entity.active ? <CustomChip color='success' label="Habilitado" /> :
                        <CustomChip color='error' label="Deshabilitado" />}
                    {selectedOrg?.id === entity.id &&
                        <CustomChip color='info' label="Activa" />}
                </Stack>
            </Grid>
            <Stack gap={2} >
                {entity.description
                    ? <Typography variant="body1">{entity.description}</Typography>
                    : <Typography variant="body1" fontStyle="italic">No tiene descripción.</Typography>
                }
                <Divider />
                <ButtonGroup fullWidth>
                    <CommonButton actionType="SAVE" variant='outlined' onClick={() => setSelectedOrg(entity)} >Seleccionar como Activa</CommonButton>
                    <CommonButton actionType="LIST" component={Link} to={`/campaigns`} >Ver Workspaces</CommonButton>

                </ButtonGroup>
                <Divider />
                <Grid container gap={1} size="grow" minWidth="50 rem">
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
                <ButtonGroup sx={{ marginLeft: "auto" }}>
                    <CommonButton handleClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {selectedOrg?.id !== entity.id &&
                        <DisableButton active={entity.active} handleActive={() => handleActive(entity)} />
                    }
                    <CommonButton handleClick={() => handleSidebar("UPDATE_ORG", entity)} actionType="MODIFY" >Modificar</CommonButton>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}