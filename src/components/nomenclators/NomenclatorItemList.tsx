import { useContext, useEffect, useState } from 'react'
import type { UserContextItems } from '../users/UserProvider'
import { UserContext } from '../common/contexts'
import { useSidebar } from '../hooks/useSidebar'
import type { NomenclatorItemDetailed } from '../../types/leadFields'
import { useListPagination } from '../hooks/useListPagination'
import type { Paginable } from '../../types/common'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { Button, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { CommonButton } from '../common/details/DetailsCommonButton'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { disableNomenclatorItem, enableNomenclatorItem, getNomenclatorItem, getNomenclatorItems } from './nomenclatorService'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { useParams } from 'react-router-dom'
import { NomenclatorItemDetails } from './NomenclatorItemDetails'

export const NomenclatorItemList = () => {

    const { nomenclatorId } = useParams()
    const { selectedOrgId } = useContext<UserContextItems>(UserContext)

    const [nomenclatorItems, setNomenclatorItems] = useState<Paginable<NomenclatorItemDetailed> | null>(null)

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<NomenclatorItemDetailed>()

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(nomenclatorItems)

    useEffect(() => {
        getNomenclatorItems({ only_active: false, detailed: true, page: fetchPage, page_size: pageSize, nomenclator_id: Number(nomenclatorId) })
            .then(setNomenclatorItems)
    }, [fetchPage, pageSize, selectedOrgId, nomenclatorId])


    const updateEntityOnList = (
        entity: NomenclatorItemDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_NOM": {
                getNomenclatorItems({ detailed: true, page_size: pageSize, only_active: false, page: nomenclatorItems?.page }).then(setNomenclatorItems)
                break;
            }
            case "UPDATE_NOM": {
                if (!nomenclatorItems) break
                const newNom = entity as NomenclatorItemDetailed
                const nomenclatorItemsList = [...nomenclatorItems.items]
                const nomIdx = nomenclatorItemsList.findIndex(nom => nom.id === newNom.id)
                if (nomIdx === -1) break
                nomenclatorItemsList[nomIdx] = newNom
                setNomenclatorItems({ ...nomenclatorItems, items: [...nomenclatorItemsList] })
                break;
            }
            case "DELETE_NOM": {
                if (selectedEntity && entity?.id === selectedEntity.id) closeSidebar()
                getNomenclatorItems({ detailed: true, page_size: pageSize, only_active: false, page: nomenclatorItems?.page }).then(setNomenclatorItems)
                break;
            }
        }
    }

    const handleActive = (nom: NomenclatorItemDetailed) => {
        if (!nom) return
        const updateActive = (nom: NomenclatorItemDetailed) => {
            updateEntityOnList({ ...nom, active: !nom.active }, "UPDATE_NOM")
            if (selectedEntity?.id === nom.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !nom.active })
            }
        }
        const deleteWsp = (nom: NomenclatorItemDetailed) => {
            updateEntityOnList(nom, "DELETE_NOM")
            if (selectedEntity?.id === nom.id) {
                closeSidebar()
            }
        }
        if (nom.active) {
            disableNomenclatorItem(nom.id).then(res => {
                if (res.action === "disabled") updateActive(nom)
                if (res.action === "deleted") deleteWsp(nom)
            })
        } else {
            enableNomenclatorItem(nom.id).then(() => updateActive(nom))
        }
    }

    return (
        <ContainerWithSidebar isSidebarOpen={!!sidebarMode} sidebarComponent={
            <NomenclatorItemSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                handleActive={handleActive} />
        }>
            <Stack spacing={2}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid size="grow" minWidth="15rem">
                        <Typography variant="h1">Lista de Nomencladores</Typography>
                    </Grid>
                    <Grid size="auto" minWidth="15rem">
                        {nomenclatorItems && nomenclatorItems.items?.length > 0 &&
                            <CommonButton actionType="CREATE" handleClick={() => { }}>Crear Nomenclador</CommonButton>
                        }
                    </Grid>
                </Grid>
                {
                    nomenclatorItems && nomenclatorItems.items?.length > 0 ?
                        <List>
                            {nomenclatorItems.items.map(nom =>
                                <ListItem key={nom.id} disablePadding secondaryAction={
                                    <Grid container spacing={1} alignItems="center">
                                        <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_NOM", nom)}>
                                            <SearchIcon />
                                        </IconButton>
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
                                    </Grid>
                                }>
                                    <ListItemButton onClick={() => handleSidebar("DETAILS_NOM", nom)} >
                                        <ListItemText primary={<>
                                            <Stack spacing={1} direction="row">
                                                <Typography fontWeight="bold">{nom.code} </Typography>
                                            </Stack>
                                            <Typography >{nom.value} </Typography>

                                        </>} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>
                        : <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                            <Typography variant="h4" color="initial">No se han encontrado nomencladores...</Typography>
                            <Button onClick={() => { }} variant="contained">Crear Nomenclador</Button>
                        </Grid>
                }
            </Stack>
            <PaginationComponent {...pageComponentProps} />
        </ContainerWithSidebar >
    )
}

interface SidebarProps {
    mode: string | null,
    entity: NomenclatorItemDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: NomenclatorItemDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void,
    handleActive: (entity: NomenclatorItemDetailed) => void
}
export const NomenclatorItemSidebar = ({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    const [parentItem, setParentItem] = useState<NomenclatorItemDetailed | null>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!entity?.parent_item_id) return setParentItem(null)
        getNomenclatorItem(entity?.parent_item_id).then(setParentItem)
    }, [entity])

    switch (mode) {
        /*
        case "CREATE_NOM":
            return <NomenclatorFormSidebar closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
                case "UPDATE_NOM":
                    return <NomenclatorFormSidebar existingWsp={entity as WorkspaceDetailed} closeSidebar={closeSidebar}
                    updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                    handleSidebar={handleSidebar} />
                    */
        case "DETAILS_NOM":
            return <NomenclatorItemDetails entity={entity as NomenclatorItemDetailed} parentEntity={parentItem} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }

}