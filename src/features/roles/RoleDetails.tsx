import { SidebarContentWrapper } from "shared/layout/container/GenericSidebar"
import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import { EnabledIcon } from "shared/ui/lists/Icons"
import type { Permission, RoleDetailed } from "src/types/roles"
import { Can } from "src/components/auth/Can"
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonGroup, Divider, Stack, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import CustomChip from "src/components/ui/details/CustomChip"
import { getDictionaries } from "src/services/generalService"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NoItemsMessage } from "src/components/ui/lists/NoItemsMessage"

interface RoleDetailsProps {
    role: RoleDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, role: RoleDetailed | null) => void,
    handleActive: (role: RoleDetailed) => void
}

export const RoleDetails = ({ role, closeSidebar, handleSidebar, handleActive }: RoleDetailsProps) => {

    if (role) return (
        <SidebarContentWrapper title={role.name} icon={<EnabledIcon active={role.active} isAvatar />}
            iconColor={role.active ? "success" : "error"}
            subtitle="Roles y Permisos"
            actions={
                <ButtonGroup>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    <Can permission={role.active ? "role:delete" : "role:update"}>
                        <HandleActiveButton active={role.active} handleActive={() => handleActive(role)} />
                    </Can>
                    <Can permission="role:update">
                        <CommonButton onClick={() => handleSidebar("UPDATE_ROLE", role)} actionType="MODIFY" >Modificar</CommonButton>
                    </Can>
                </ButtonGroup>
            }>
            <Stack spacing={2}>
                <DetailsMetadata entity={role} />
                <Divider />
                <RolePermissionList role={role} />
            </Stack>
        </SidebarContentWrapper>
    )
}

export const RolePermissionList = ({ role }: { role: RoleDetailed }) => {

    const [entities, setEntities] = useState<Record<string, string> | undefined>(undefined)

    useEffect(() => {
        getDictionaries(["entities"])
            .then((dict) => setEntities(dict.entities))
    }, [])

    const permissions = useMemo(() => {
        if (!entities) return []
        const permissionCategories = new Map<string, Permission[]>()
        role.permissions.forEach((permission) => {
            const snakeCaseCategory = permission.codename.split(":")[0]
            const camelCaseCategory = snakeCaseCategory.split("_")
                .reduce((acc, cur) => {
                    const capitalizedCur = cur.charAt(0).toLocaleUpperCase() + cur.slice(1)
                    return `${acc}${capitalizedCur}`
                }, "")
            const category = entities[camelCaseCategory]
            console.log(entities.Lead)
            if (permissionCategories.has(category)) {
                permissionCategories.get(category)?.push(permission)
            } else {
                permissionCategories.set(category, [permission])
            }
        })
        return Array.from(permissionCategories.entries())
    }, [role, entities])

    return (
        <Stack spacing={2}>
            <Typography variant="h3">Lista de Permisos</Typography>
            {role.permissions && role.permissions.length > 0 ? (
                <Box>
                    {permissions.map((cat, idx) => (
                        <Accordion key={cat[0]} defaultExpanded={idx === 0} >
                            <AccordionSummary id={cat[0]} expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat[0]} - <span style={{ fontStyle: "italic", fontWeight: "normal" }}>{cat[1].length} permisos</span></Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                                    {
                                        cat[1].map(perm => {
                                            return <CustomChip key={perm.codename} label={perm.name}
                                                size="small" variant="outlined" chipColor="secondary" />
                                        })
                                    }
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            ) : (
                <NoItemsMessage emptyFetchMessage="No tiene permisos asignados..."  ></NoItemsMessage>
            )}
        </Stack>
    )
}
