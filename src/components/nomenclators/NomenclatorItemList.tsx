import { useContext, useEffect, useState } from 'react'
import type { UserContextItems } from '../users/UserProvider'
import { UserContext } from '../common/contexts'
import { useSidebar } from '../hooks/useSidebar'
import { useListPagination } from '../hooks/useListPagination'
import type { Paginable } from '../../types/common'
import { ContainerWithSidebar } from '../common/layout/GenericContainer'
import { ButtonGroup, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { CommonButton } from '../common/details/DetailsCommonButton'
import { PaginationComponent } from '../common/lists/PaginationComponent'
import { disableNomenclatorItem, enableNomenclatorItem, getNomenclator, getNomenclatorItem, getNomenclatorItems } from './nomenclatorService'
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import { NomenclatorItemDetails } from './NomenclatorItemDetails'
import type { NomenclatorDetailed, NomenclatorItemDetailed } from '../../types/nomenclators'
import { NomenclatorItemFormSidebar } from './NomenclatorItemForm'

export const NomenclatorItemList = () => {

    const { nomenclatorId } = useParams()
    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const [nomenclator, setNomenclator] = useState<NomenclatorDetailed | null>(null)

    const [nomenclatorItems, setNomenclatorItems] = useState<Paginable<NomenclatorItemDetailed> | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<NomenclatorItemDetailed>(params, setParams, getNomenclatorItem, "DETAILS_NOM", 'id')

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(nomenclatorItems)

    useEffect(() => {
        getNomenclator(Number(nomenclatorId))
            .then(setNomenclator)
    }, [nomenclatorId])

    useEffect(() => {
        getNomenclatorItems({ only_active: false, detailed: true, page: fetchPage, page_size: pageSize, nomenclator_id: Number(nomenclatorId) })
            .then(setNomenclatorItems)
    }, [fetchPage, pageSize, selectedOrg, nomenclatorId])


    const updateEntityOnList = (
        entity: NomenclatorItemDetailed | null,
        mode: string) => {
        switch (mode) {
            case "CREATE_NOM": {
                getNomenclatorItems({ detailed: true, page_size: pageSize, only_active: false, page: nomenclatorItems?.page, nomenclator_id: Number(nomenclatorId) }).then(setNomenclatorItems)
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
                getNomenclatorItems({ detailed: true, page_size: pageSize, only_active: false, page: nomenclatorItems?.page, nomenclator_id: Number(nomenclatorId) }).then(setNomenclatorItems)
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
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} nomenclator={nomenclator}
                handleActive={handleActive} />
        }>
            <Stack gap={3}>
                <Grid container gap={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="h1">Opciones de {nomenclator?.name}</Typography>
                    <ButtonGroup variant="outlined" sx={{ marginLeft: "auto" }} >
                        <CommonButton actionType='RETURN' variant='outlined' component={RouterLink} to="/nomenclators">Volver</CommonButton>
                        {nomenclatorItems && nomenclatorItems.items?.length > 0 &&
                            <CommonButton actionType="CREATE" handleClick={() => { handleSidebar("CREATE_NOM", null) }}>
                                Crear Opciones
                            </CommonButton>
                        }
                    </ButtonGroup>
                </Grid>
                {
                    nomenclatorItems && nomenclatorItems.items?.length > 0 ?
                        <List>
                            {nomenclatorItems.items.map(nom =>
                                <ListItem key={nom.id} disablePadding secondaryAction={
                                    <Grid container gap={1} alignItems="center">
                                        <IconButton edge="end" aria-label="details" onClick={() => handleSidebar("DETAILS_NOM", nom)}>
                                            <SearchIcon />
                                        </IconButton>
                                        {nom.organization_id && <>
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
                                                <Typography fontWeight="bold">{nom.value}</Typography>
                                            </Stack>
                                        }
                                            secondary={!nom.organization_id && "(Opción del Sistema)"} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>
                        : <Grid container gap={2} justifyContent="center" alignItems="center" direction="column">
                            <Typography variant="h4">No se han encontrado opciones en este nomenclador...</Typography>
                            <CommonButton actionType='CREATE' onClick={() => { handleSidebar("CREATE_NOM", null) }} variant="contained">Crear Opción</CommonButton>
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
    nomenclator: NomenclatorDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: NomenclatorItemDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void,
    handleActive: (entity: NomenclatorItemDetailed) => void
}
export const NomenclatorItemSidebar = ({ mode, entity, nomenclator, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    const [parentItem, setParentItem] = useState<NomenclatorItemDetailed | null>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!entity?.parent_item_id) return setParentItem(null)
        getNomenclatorItem(entity?.parent_item_id).then(setParentItem)
    }, [entity])

    switch (mode) {

        case "CREATE_NOM":
            return <NomenclatorItemFormSidebar closeSidebar={closeSidebar} nomenclator={nomenclator}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_NOM":
            return <NomenclatorItemFormSidebar existingNom={entity as NomenclatorItemDetailed} nomenclator={nomenclator}
                closeSidebar={closeSidebar} updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />

        case "DETAILS_NOM":
            return <NomenclatorItemDetails entity={entity as NomenclatorItemDetailed} parentEntity={parentItem} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }
}