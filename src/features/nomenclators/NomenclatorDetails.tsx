import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import TitleAndActive from "shared/ui/details/TitleAndActive"
import CommonButton from "shared/ui/buttons/CommonButton"
import type { NomenclatorDetailed } from "src/types/nomenclators"
import { useUserContext } from "src/stores/UserContext"
import { Link as RouterLink } from "react-router-dom"
import { ButtonGroup, Divider, Link, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { DisableConfirmDialog } from "src/components/feedback/ConfirmationDialog"

interface NomenclatorDetailsProps {
    entity: NomenclatorDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void,
    handleActive: (entity: NomenclatorDetailed) => Promise<void>
}

export const NomenclatorDetails = ({ entity, closeSidebar, handleSidebar, handleActive }: NomenclatorDetailsProps) => {

    const { activeOrg } = useUserContext()

    const [deletingNom, setDeletingNom] = useState<NomenclatorDetailed | null>(null)

    if (entity) return (
        <Stack spacing={3} >
            <TitleAndActive active={entity.active}>
                <Typography variant="h2">{entity.name}</Typography>
            </TitleAndActive>
            <Stack spacing={2}>
                <Stack spacing={1}>
                    {!entity.organization_id && <Typography variant="body1" sx={{ fontStyle: "italic" }} >Nomenclador del Sistema</Typography>}
                    {entity.parent_nomenclator &&
                        <Stack spacing={.5} direction="row">
                            <Typography>Depende del nomenclador:</Typography>
                            <Link component={RouterLink} to={`/nomenclators/${entity.parent_nomenclator.id}`}>{entity.parent_nomenclator.name}</Link>
                        </Stack>
                    }
                </Stack>
                <Divider />
                <CommonButton actionType="LIST" variant="contained" component={RouterLink} to={`/nomenclators/${entity.id}`} >Ver Items de Nomenclador</CommonButton>
                <Divider />
                <DetailsMetadata entity={entity} />
                <Divider />

                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {(entity.organization_id || activeOrg?.id === 0) &&
                        <HandleActiveButton active={entity.active} handleActive={() => setDeletingNom(entity)} />
                    }
                    {(entity.organization_id || activeOrg?.id === 0) &&
                        <CommonButton onClick={() => handleSidebar("UPDATE_NOM", entity)} actionType="MODIFY" >Modificar</CommonButton>
                    }
                </ButtonGroup>
            </Stack>
            <DisableConfirmDialog entity={deletingNom} clearEntity={() => setDeletingNom(null)} idModal="dis-nom-det"
                onConfirm={() => handleActive(deletingNom!)} entityTypeName='el nomenclador' />
        </Stack>
    )
}
