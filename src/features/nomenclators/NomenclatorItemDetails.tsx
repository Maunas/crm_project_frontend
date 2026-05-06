import { ButtonGroup, Divider, Grid, Link, Stack, Typography } from "@mui/material"
import dayjs from "dayjs"
import type { NomenclatorItemDetailed } from "../../types/nomenclators"
import { TitleAndActive } from "src/components/ui/details/TitleAndActive"
import CommonButton from "src/components/ui/buttons/CommonButton"
import HandleActiveButton from "src/components/ui/buttons/HandleActiveButton"

interface NomenclatorDetailsProps {
    item: NomenclatorItemDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, item: NomenclatorItemDetailed | null) => void,
    handleActive: (item: NomenclatorItemDetailed) => void
}

export const NomenclatorItemDetails = ({ item, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    if (item) return (
        <Stack spacing={3} >
            <TitleAndActive active={item.active}>
                <Typography variant="h2">{item.value}</Typography>
            </TitleAndActive>
            <Stack spacing={2} >
                {!item.organization_id && <Typography variant="body1" sx={{ fontStyle: "italic" }} >(Nomenclador del Sistema)</Typography>}
                <Divider />
                {item.parent_item &&
                    <>
                        <Stack direction="row" spacing={.5} sx={{ alignItems: "center" }}>
                            <Typography variant="body1">Depende del Item de Nomenclador:</Typography>
                            <Link href={`/nomenclators/${item.parent_item.nomenclator_id}?selected=${item.parent_item.id}`}>{item.parent_item.value}</Link>
                        </Stack>
                        <Divider />
                    </>}
                <Grid container spacing={1} >
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fecha de creación:</Typography>
                        <Typography variant="body1" sx={{ textTransform: "capitalize", pl: 2 }}>
                            {dayjs(item?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fecha de última modificación:</Typography>
                        <Typography variant="body1" sx={{ textTransform: "capitalize", pl: 2 }}>
                            {dayjs(item?.updated_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <ButtonGroup sx={{ marginLeft: "auto" }}>
                    <CommonButton handleClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {item.organization_id &&
                        <HandleActiveButton active={item.active} handleActive={() => handleActive(item)} />
                    }
                    {item.organization_id &&
                        <CommonButton handleClick={() => handleSidebar("UPDATE_NOM", item)} actionType="MODIFY" >Modificar</CommonButton>
                    }
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}
