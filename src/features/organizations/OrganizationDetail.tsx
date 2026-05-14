import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import CustomChip from "shared/ui/details/CustomChip"
import type { OrganizationDetailed } from "src/types/campaigns"
import { useUserContext } from "src/stores/UserContext"
import { Link } from "react-router-dom"
import { ButtonGroup, Divider, Stack, Typography } from "@mui/material"

interface DetailsProps {
    entity: OrganizationDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: OrganizationDetailed | null) => void,
    handleActive: (org: OrganizationDetailed) => void
}
const OrganizationDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: DetailsProps) => {
    const { activeOrg, setActiveOrg } = useUserContext()

    if (!entity) return

    return (
        <Stack spacing={3} >
            <Stack direction="row" useFlexGap spacing={2} sx={{ flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h2">{entity.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ marginLeft: "auto" }} >
                    {entity.active ? <CustomChip color='success' label="Habilitado" /> :
                        <CustomChip color='error' label="Deshabilitado" />}
                    {activeOrg?.id === entity.id &&
                        <CustomChip color='info' label="Activo" />}
                </Stack>
            </Stack>
            <Stack spacing={2} sx={{ alignItems: "start" }} >
                {entity.description &&
                    <Typography variant="body1">{entity.description}</Typography>
                }
                <Divider />
                <ButtonGroup fullWidth>
                    {activeOrg?.id !== entity.id &&
                        <CommonButton actionType="CHECK" color="info" variant='outlined' onClick={() => setActiveOrg(entity)} >Seleccionar como Activo</CommonButton>}
                    <CommonButton actionType="LIST" component={Link} to={`/campaigns`} >Ver Espacios de Trabajo</CommonButton>
                </ButtonGroup>
                <Divider />
                <DetailsMetadata entity={entity} />
                <Divider />
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {activeOrg?.id !== entity.id &&
                        <HandleActiveButton active={entity.active} handleActive={() => handleActive(entity)} />
                    }
                    <CommonButton onClick={() => handleSidebar("UPDATE_ORG", entity)} actionType="MODIFY" >Modificar</CommonButton>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}

export default OrganizationDetails