import { NomenclatorItemList } from "./NomenclatorItemList"
import { SidebarContentWrapper } from "shared/layout/container/GenericSidebar"
import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import { EnabledIcon } from "shared/ui/lists/Icons"
import type { NomenclatorDetailed } from "src/types/nomenclators"
import { useUserContext } from "src/stores/UserContext"
import { Link as RouterLink } from "react-router-dom"
import { ButtonGroup, Divider, Link, Stack, Typography } from "@mui/material"

interface NomenclatorDetailsProps {
    nomenclator: NomenclatorDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, nomenclator: NomenclatorDetailed | null) => void,
    handleActive: (nomenclator: NomenclatorDetailed) => void
}

export const NomenclatorDetails = ({ nomenclator, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    const { user } = useUserContext()

    if (nomenclator) return (
        <SidebarContentWrapper title={nomenclator.name} icon={<EnabledIcon active={nomenclator.active} isAvatar />}
            iconColor={nomenclator.active ? "success" : "error"}
            subtitle={nomenclator.organization_id === 1 ? "Nomenclador del Sistema" : "Nomenclador"}
            actions={
                <ButtonGroup>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {(nomenclator.organization_id !== 1 || user?.is_superuser) &&
                        <HandleActiveButton active={nomenclator.active} handleActive={() => handleActive(nomenclator)} />
                    }
                    {(nomenclator.organization_id !== 1 || user?.is_superuser) &&
                        <CommonButton onClick={() => handleSidebar("UPDATE_NOM", nomenclator)} actionType="MODIFY" >Modificar</CommonButton>
                    }
                </ButtonGroup>
            }>
            <Stack spacing={2}>
                {nomenclator.parent_nomenclator &&
                    <Stack spacing={1}>
                        <Stack spacing={1} direction="row">
                            <Typography>Depende del nomenclador:</Typography>
                            <Link component={RouterLink} to={`/nomenclators/${nomenclator.parent_nomenclator.id}`}>{nomenclator.parent_nomenclator.name}</Link>
                        </Stack>
                        <Divider />
                    </Stack>
                }
                <DetailsMetadata entity={nomenclator} />
                <Divider />
                <NomenclatorItemList nomenclator={nomenclator} />
            </Stack>
        </SidebarContentWrapper>
    )
}
