import { useContext, useEffect, useState } from 'react'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { NomenclatorFormSidebar } from './NomenclatorForm'
import { NomenclatorDetails } from './NomenclatorDetails'
import { CommonButton } from '../common/details/DetailsCommonButton'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import type { Paginable } from '../../types/common'
import type { NomenclatorDetailed } from '../../types/nomenclators'
import { useSidebar } from '../hooks/useSidebar'
import { useListPagination } from '../hooks/useListPagination'
import { disableNomenclator, enableNomenclator, getNomenclator, getNomenclators } from './nomenclatorService'
import type { UserContextItems } from '../users/UserProvider'
import { UserContext } from '../common/contexts'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Grid, IconButton, Link, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

export const NomenclatorList = () => {

    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const [nomenclators, setNomenclators] = useState<Paginable<NomenclatorDetailed> | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<NomenclatorDetailed>("id", params, setParams, getNomenclator, "DETAILS_NOM")

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(nomenclators)

    useEffect(() => {
        getNomenclators({ only_active: false, detailed: true, page: fetchPage, page_size: pageSize })
            .then(setNomenclators)
    }, [fetchPage, pageSize, selectedOrg])


    const updateEntityOnList = (
        entity: NomenclatorDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_NOM": {
                getNomenclators({ detailed: true, page_size: pageSize, only_active: false, page: nomenclators?.page }).then(setNomenclators)
                break;
            }
            case "UPDATE_NOM": {
                if (!nomenclators) break
                const newNom = entity as NomenclatorDetailed
                const nomenclatorItems = [...nomenclators.items]
                const nomIdx = nomenclatorItems.findIndex(nom => nom.id === newNom.id)
                if (nomIdx === -1) break
                nomenclatorItems[nomIdx] = newNom
                setNomenclators({ ...nomenclators, items: [...nomenclatorItems] })
                break;
            }
            case "DELETE_NOM": {
                if (selectedEntity && entity?.id === selectedEntity.id) closeSidebar()
                getNomenclators({ detailed: true, page_size: pageSize, only_active: false, page: nomenclators?.page }).then(setNomenclators)
                break;
            }
        }
    }

    const handleActive = (nom: NomenclatorDetailed) => {
        if (!nom) return
        const updateActive = (nom: NomenclatorDetailed) => {
            updateEntityOnList({ ...nom, active: !nom.active }, "UPDATE_NOM")
            if (selectedEntity?.id === nom.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !nom.active })
            }
        }
        const deleteWsp = (nom: NomenclatorDetailed) => {
            updateEntityOnList(nom, "DELETE_NOM")
            if (selectedEntity?.id === nom.id) {
                closeSidebar()
            }
        }
        if (nom.active) {
            disableNomenclator(nom.id).then(res => {
                if (res.action === "disabled") updateActive(nom)
                if (res.action === "deleted") deleteWsp(nom)
            })
        } else {
            enableNomenclator(nom.id).then(() => updateActive(nom))
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarComponent={
            <NomenclatorSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                handleActive={handleActive} />
        }>
            <Stack gap={3}>
                <Grid container gap={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="h1">Lista de Nomencladores</Typography>
                    {nomenclators && nomenclators.items?.length > 0 &&
                        <CommonButton actionType="CREATE" handleClick={() => { handleSidebar("CREATE_NOM", null) }}
                            sx={{ marginLeft: "auto" }}>
                            Crear Nomenclador
                        </CommonButton>
                    }
                </Grid>
                <Stack gap={2}>
                    {
                        nomenclators && nomenclators.items?.length > 0 ?
                            <List>
                                {nomenclators.items.map(nom =>
                                    <ListItem key={nom.id} disablePadding secondaryAction={
                                        <Grid container gap={1} alignItems="center">
                                            <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_NOM", nom)}>
                                                <SearchIcon />
                                            </IconButton>
                                            {nom.organization_id &&
                                                <>
                                                    <IconButton edge="end" aria-label="modify" onClick={() => handleSidebar("UPDATE_NOM", nom)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label={nom.active ? "delete" : "restore"}
                                                        onClick={() => handleActive(nom)}>
                                                        {nom.active ?
                                                            <DeleteIcon color="error" /> :
                                                            <RestoreFromTrashIcon color="success" />
                                                        }
                                                    </IconButton>
                                                </>}
                                        </Grid>
                                    }>
                                        <ListItemButton onClick={() => handleSidebar("DETAILS_NOM", nom)} >
                                            <ListItemText primary={
                                                <Stack gap={1} direction="row">
                                                    <Typography fontWeight="bold">{nom.name}</Typography>
                                                    {!nom.organization_id && <Typography fontStyle="italic" >
                                                        (Nomenclador del Sistema)
                                                    </Typography>}
                                                </Stack>
                                            }
                                                secondary={
                                                    nom.campaign_id
                                                        ? <Link component={RouterLink} to={`/campaigns/${nom.campaign_id}`}>
                                                            Perteneciente a la Campaña {nom.campaign_id}
                                                        </Link>
                                                        : "Nomenclador Global"
                                                } />
                                        </ListItemButton>
                                    </ListItem>
                                )}
                            </List>
                            : <Grid container gap={2} justifyContent="center" alignItems="center" direction="column">
                                <Typography variant="h4">No se han encontrado nomencladores...</Typography>
                                <CommonButton actionType="CREATE" onClick={() => { handleSidebar("CREATE_NOM", null) }} variant="contained">
                                    Crear Nomenclador
                                </CommonButton>
                            </Grid>
                    }
                    <PaginationComponent {...pageComponentProps} />
                </Stack>
            </Stack>
        </ContainerWithSidebar >
    )
}

interface SidebarProps {
    mode: string | null,
    entity: NomenclatorDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: NomenclatorDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void,
    handleActive: (entity: NomenclatorDetailed) => void
}
export const NomenclatorSidebar = ({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    switch (mode) {
        case "CREATE_NOM":
            return <NomenclatorFormSidebar closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_NOM":
            return <NomenclatorFormSidebar existingNom={entity as NomenclatorDetailed} closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "DETAILS_NOM":
            return <NomenclatorDetails entity={entity as NomenclatorDetailed} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }

}