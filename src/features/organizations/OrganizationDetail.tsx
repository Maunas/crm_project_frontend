import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { OrganizationDetailed } from "src/types/campaigns"
import { useUserContext } from "src/stores/UserContext"
import { Link } from "react-router-dom"
import { ButtonGroup, Divider, Stack, Typography } from "@mui/material"
import { SidebarContentWrapper } from "src/components/layout/container/GenericSidebar"
import ACTION_ICONS from "shared/ui/icons/ActionIcons"
import { EnabledIcon } from "src/components/ui/lists/Icons"
import { Can } from "src/components/auth/Can"

interface DetailsProps {
    entity: OrganizationDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void,
    handleActive: (org: OrganizationDetailed) => void
}
const OrganizationDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: DetailsProps) => {
    const { activeOrg, setActiveOrg } = useUserContext()

    const isOrgActive = activeOrg?.id === entity?.id

    if (!entity) return

    return (
        <SidebarContentWrapper title={entity.name} subtitle="Organización"
            icon={isOrgActive ? ACTION_ICONS.CHECK : <EnabledIcon active={entity.active} isAvatar />}
            iconColor={isOrgActive ? "info" : entity.active ? "success" : "error"}
            actions={
                <ButtonGroup>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {activeOrg?.id !== entity.id &&
                        <Can permission={entity.active ? "organization:delete" : "organization:update"}>
                            <HandleActiveButton active={entity.active} handleActive={() => handleActive(entity)} />
                        </Can>
                    }
                    <Can permission="organization:update">
                        <CommonButton onClick={() => handleSidebar("UPDATE_ORG", entity)} actionType="MODIFY" >Modificar</CommonButton>
                    </Can>
                </ButtonGroup>
            }>

            <Stack spacing={2} >
                {entity.description &&
                    <Typography variant="body1">{entity.description}</Typography>
                }
                <DetailsMetadata entity={entity} />
                <Divider />
                {activeOrg?.id !== entity.id ?
                    <CommonButton actionType="CHECK" color="info" variant='outlined' onClick={() => setActiveOrg(entity)} >Seleccionar como Activo</CommonButton>
                    :
                    <ButtonGroup fullWidth>
                        <CommonButton actionType="PARAMETERS" variant="outlined" component={Link} to={`/campaigns`} >Propiedades</CommonButton>
                        <CommonButton actionType="LIST" variant="outlined" component={Link} to={`/campaigns`} >Espacios de Trabajo</CommonButton>
                    </ButtonGroup>
                }
            </Stack>
        </SidebarContentWrapper>
    )
}

export default OrganizationDetails