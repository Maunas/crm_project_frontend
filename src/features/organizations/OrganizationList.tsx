import { useCallback, useContext } from 'react'
import OrganizationDetails from './OrganizationDetail'
import { OrganizationFormSidebar } from './OrganizationForm'
import { CustomListItem } from '../../components/ui/lists/CustomListItem'
import { EnabledIcon } from '../../components/ui/lists/Icons'
import CommonButton from 'src/components/ui/buttons/CommonButton'
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton'
import ContainerWithSidebar from 'src/components/layout/container/GenericContainer'
import { useSidebar } from 'src/hooks/useSidebar'
import type { OrganizationDetailed } from '../../types/campaigns'
import { disableOrganization, enableOrganization, getOrganization } from './organizationServices'
import { UserContext } from 'src/stores/contexts'
import type { UserContextItems } from 'src/stores/UserProvider'
import { useSearchParams } from 'react-router-dom'
import { List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'

export const OrganizationList = () => {

    const [params, setParams] = useSearchParams()

    const { userOrganizations, activeOrg, setActiveOrg, fetchOrganizations, setOrganizations } = useContext<UserContextItems>(UserContext)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<OrganizationDetailed>("id", params, setParams, getOrganization, "DETAILS_ORG")

    const updateEntityOnList = useCallback((newOrg: OrganizationDetailed, mode: string) => {
        switch (mode) {
            case "CREATE_ORG":
                return fetchOrganizations()
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
                    if (activeOrg?.id === newOrg.id) return prevList
                    if (selectedEntity && newOrg.id === selectedEntity.id) closeSidebar()
                    const newOrganizationsItems = [...prevList]
                    return newOrganizationsItems.filter(org => org.id !== newOrg.id)
                })
            }
        }
    }, [closeSidebar, fetchOrganizations, selectedEntity, activeOrg?.id, setOrganizations])

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
            if (selectedEntity?.id === org.id) closeSidebar()
        }
        if (org.active) {
            if (activeOrg?.id === org.id) return
            disableOrganization(org.id).then((res) => {
                if (res.action === "disabled") updateActive(org)
                if (res.action === "deleted") deleteOrg(org)
            })
        } else {
            enableOrganization(org.id).then(() => updateActive(org))
        }
    }, [closeSidebar, handleSidebar, selectedEntity, activeOrg?.id, updateEntityOnList])

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} sidebarComponent={
            <OrganizationSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} handleActive={handleActive} />
        }>
            <Stack spacing={3}>
                <Stack spacing={2} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h1">Lista de Organizaciones</Typography>
                    {userOrganizations && userOrganizations?.length > 0 &&
                        <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_ORG", null)} sx={{ marginLeft: "auto" }} />
                    }
                </Stack>
                <Stack spacing={2}>
                    {userOrganizations && userOrganizations?.length > 0 ?
                        <List>
                            {userOrganizations.map(org =>
                                <CustomListItem key={org.id} selected={org.id === selectedEntity?.id} disablePadding secondaryAction={
                                    <Stack direction="row" sx={{ alignItems: "center" }}>
                                        <CommonIconButton actionType='DETAILS' title='Detalle' onClick={() => handleSidebar("DETAILS_ORG", org)} tooltipSize="small" size="small" />
                                        <CommonIconButton actionType='MODIFY' title='Modificar' onClick={() => handleSidebar("UPDATE_ORG", org)} tooltipSize="small" size="small" />
                                        {activeOrg?.id !== org.id &&
                                            <>
                                                <CommonIconButton actionType='CHECK' title='Seleccionar Activa' color="info" onClick={() => setActiveOrg(org)} tooltipSize="small" size="small" />
                                                <CommonIconButton actionType={org.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                    title={org.active ? "Deshabilitar" : "Habilitar"}
                                                    onClick={() => handleActive(org)} color={org.active ? "error" : "success"} />
                                            </>
                                        }
                                    </Stack>
                                }>
                                    <ListItemButton onClick={() => handleSidebar("DETAILS_ORG", org)}>
                                        <ListItemText sx={{ mr: 10 }} primary={
                                            <Stack spacing={1} direction="row">
                                                <EnabledIcon active={org.active} />
                                                <Typography color={activeOrg?.id === org.id ? "info" : "textPrimary"}
                                                    sx={{ fontWeight: "bold", textDecoration: activeOrg?.id === org.id ? "underline" : "none" }}>
                                                    {org.name}
                                                </Typography>
                                            </Stack>
                                        }
                                            secondary={org.description} />
                                    </ListItemButton>
                                </CustomListItem>
                            )}
                        </List>
                        : <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <Typography variant="h4">No se han encontrado organizaciones...</Typography>
                            <CommonButton actionType="CREATE" onClick={() => handleSidebar("CREATE_ORG", null)} variant="contained">
                                Agregar
                            </CommonButton>
                        </Stack>
                    }
                </Stack>
            </Stack>
        </ContainerWithSidebar >
    )
}

export default OrganizationList

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