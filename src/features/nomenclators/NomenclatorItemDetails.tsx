import { useContext } from "react"
import TitleAndActive from "shared/ui/details/TitleAndActive"
import CommonButton from "shared/ui/buttons/CommonButton"
import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import type { NomenclatorItemDetailed } from "src/types/nomenclators"
import { UserContext } from "src/stores/contexts"
import { ButtonGroup, Divider, Link, Stack, Typography } from "@mui/material"

interface NomenclatorDetailsProps {
    item: NomenclatorItemDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, item: NomenclatorItemDetailed | null) => void,
    handleActive: (item: NomenclatorItemDetailed) => void
}

export const NomenclatorItemDetails = ({ item, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    const { activeOrg } = useContext(UserContext)

    if (item) return (
        <Stack spacing={3} >
            <TitleAndActive active={item.active}>
                <Typography variant="h2">{item.value}</Typography>
            </TitleAndActive>
            <Stack spacing={2} >
                {!item.organization_id && <Typography variant="body1" sx={{ fontStyle: "italic" }} >Nomenclador del Sistema</Typography>}
                <Divider />
                {item.parent_item &&
                    <>
                        <Stack direction="row" spacing={.5} sx={{ alignItems: "center" }}>
                            <Typography variant="body1">Depende del Item de Nomenclador:</Typography>
                            <Link href={`/nomenclators/${item.parent_item.nomenclator_id}?selected=${item.parent_item.id}`}>{item.parent_item.value}</Link>
                        </Stack>
                        <Divider />
                    </>}
                <DetailsMetadata entity={item} />
                <Divider />
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {(item.organization_id || activeOrg?.id === 0) &&
                        <HandleActiveButton active={item.active} handleActive={() => handleActive(item)} />
                    }
                    {(item.organization_id || activeOrg?.id === 0) &&
                        <CommonButton onClick={() => handleSidebar("UPDATE_NOM", item)} actionType="MODIFY" >Modificar</CommonButton>
                    }
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}
